import type { Tool, ToolExecutionOptions } from 'ai';
import { z } from 'zod/v4';
import { withSuccessCallback } from './with-success-callback';

const options: ToolExecutionOptions<unknown> = {
  toolCallId: 'c1',
  messages: [],
  context: undefined,
};

const toolWith = (execute: () => Promise<unknown>): Tool => ({
  inputSchema: z.object({}),
  execute,
});

const run = (tool: Tool) => tool.execute?.({}, options) as Promise<unknown>;

describe('withSuccessCallback', () => {
  it('calls back after a successful result and returns it unchanged', async () => {
    const onSuccess = jest.fn();
    const result = { content: [{ type: 'text', text: 'ok' }] };
    const wrapped = withSuccessCallback(
      toolWith(() => Promise.resolve(result)),
      onSuccess,
    );

    expect(await run(wrapped)).toBe(result);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('stays quiet after an error result or a throw', async () => {
    const onSuccess = jest.fn();
    await run(
      withSuccessCallback(
        toolWith(() => Promise.resolve({ isError: true, content: [] })),
        onSuccess,
      ),
    );
    await expect(
      run(
        withSuccessCallback(
          toolWith(() => Promise.reject(new Error('boom'))),
          onSuccess,
        ),
      ),
    ).rejects.toThrow('boom');

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
