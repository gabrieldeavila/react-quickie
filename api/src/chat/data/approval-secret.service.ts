import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAppPaths } from 'src/config/app-paths';
import { loadApprovalSecret } from './load-approval-secret';

@Injectable()
export class ApprovalSecretService {
  private secret?: Promise<string>;

  constructor(private readonly configService: ConfigService) {}

  get(): Promise<string> {
    this.secret ??= loadApprovalSecret({
      envSecret: this.configService.get<string>('DOTY_APPROVAL_SECRET'),
      storageDir: getAppPaths().storageDir,
    }).catch((error: unknown) => {
      this.secret = undefined;
      throw error;
    });
    return this.secret;
  }
}
