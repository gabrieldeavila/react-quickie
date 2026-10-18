import { spawn, type ChildProcess } from 'child_process';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { buildApiEnv, type DotySettings } from './domain/build-api-env';
import { planRestart } from './domain/plan-restart';
import { findFreePort } from './find-free-port';
import { waitForHealth } from './wait-for-health';

const STARTUP_TIMEOUT_MS = 30_000;
const STOP_TIMEOUT_MS = 3_000;

export type ApiStatus =
  | { state: 'starting' }
  | { state: 'ready'; apiUrl: string; token: string }
  | { state: 'failed'; message: string };

export type ApiRuntimeInput = {
  workspaceRoots: string[];
  providerKeys: Record<string, string | undefined>;
  settings: DotySettings;
};

type ApiProcessOptions = {
  /** Bundled `dist/api/main.js`. */
  entry: string;
  apiBaseDir: string;
  dataDir: string;
  readRuntimeInput: () => Promise<ApiRuntimeInput>;
  log: vscode.OutputChannel;
};

/**
 * The Doty API as a child process on VSCode's own Node
 * (`ELECTRON_RUN_AS_NODE`). Port and token stay the same across restarts,
 * so an open webview keeps working after a crash.
 */
export class ApiProcess implements vscode.Disposable {
  private readonly token = randomBytes(32).toString('hex');
  private readonly statusEmitter = new vscode.EventEmitter<ApiStatus>();
  readonly onDidChangeStatus = this.statusEmitter.event;

  private child: ChildProcess | undefined;
  private port: number | undefined;
  private startedAt = 0;
  private attempts = 0;
  private restartTimer: NodeJS.Timeout | undefined;
  private currentStatus: ApiStatus = { state: 'starting' };

  constructor(private readonly options: ApiProcessOptions) {}

  get status(): ApiStatus {
    return this.currentStatus;
  }

  async start(): Promise<void> {
    this.setStatus({ state: 'starting' });
    try {
      await this.spawnAndWait();
    } catch (error) {
      this.fail(error instanceof Error ? error.message : String(error));
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    this.attempts = 0;
    await this.start();
  }

  async stop(): Promise<void> {
    clearTimeout(this.restartTimer);
    const child = this.child;
    this.child = undefined;
    if (!child || child.exitCode !== null) return;

    const exited = new Promise<void>((resolve) => child.once('exit', () => resolve()));
    child.kill('SIGTERM');
    const timer = setTimeout(() => child.kill('SIGKILL'), STOP_TIMEOUT_MS);
    await exited;
    clearTimeout(timer);
  }

  dispose(): void {
    void this.stop();
    this.statusEmitter.dispose();
  }

  private async spawnAndWait(): Promise<void> {
    const { entry, apiBaseDir, dataDir, log } = this.options;
    if (!fs.existsSync(entry)) throw new Error(`API bundle not found: ${entry}`);

    const runtime = await this.options.readRuntimeInput();
    this.port ??= await findFreePort();
    fs.mkdirSync(dataDir, { recursive: true });

    const env = buildApiEnv({
      ...runtime,
      baseEnv: process.env,
      port: this.port,
      token: this.token,
      dataDir,
      apiBaseDir,
    });

    log.appendLine(`[doty] starting API on 127.0.0.1:${this.port}`);
    // cwd = data dir, so a `.env` in the user's project is never loaded.
    const child = spawn(process.execPath, [entry], { env, cwd: dataDir });
    this.child = child;
    this.startedAt = Date.now();
    child.stdout?.on('data', (chunk: Buffer) => log.append(chunk.toString()));
    child.stderr?.on('data', (chunk: Buffer) => log.append(chunk.toString()));
    child.on('exit', (code, signal) => this.handleExit(child, code, signal));

    const apiUrl = `http://127.0.0.1:${this.port}`;
    const healthy = await waitForHealth(apiUrl, this.token, {
      timeoutMs: STARTUP_TIMEOUT_MS,
      isAlive: () => this.child === child && child.exitCode === null,
    });

    if (this.child !== child) return;
    if (healthy) {
      this.setStatus({ state: 'ready', apiUrl, token: this.token });
      return;
    }
    if (child.exitCode === null) {
      log.appendLine('[doty] API did not answer in time; stopping it');
      await this.stop();
      this.fail('The Doty API did not respond in time. See the "Doty" output channel.');
    }
  }

  private handleExit(
    child: ChildProcess,
    code: number | null,
    signal: NodeJS.Signals | null,
  ): void {
    this.options.log.appendLine(`[doty] API exited (code ${code}, signal ${signal})`);
    // Exits we caused (stop/restart) are not crashes.
    if (this.child !== child) return;
    this.child = undefined;

    const plan = planRestart(this.attempts, Date.now() - this.startedAt);
    if (!plan) {
      this.fail('The Doty API stopped several times. Check the logs, then run "Doty: Restart API".');
      return;
    }

    this.attempts = plan.attempt;
    this.setStatus({ state: 'starting' });
    this.options.log.appendLine(`[doty] restarting in ${plan.delayMs}ms (attempt ${plan.attempt})`);
    this.restartTimer = setTimeout(() => void this.start(), plan.delayMs);
  }

  private fail(message: string): void {
    this.options.log.appendLine(`[doty] ${message}`);
    this.setStatus({ state: 'failed', message });
  }

  private setStatus(status: ApiStatus): void {
    this.currentStatus = status;
    this.statusEmitter.fire(status);
  }
}
