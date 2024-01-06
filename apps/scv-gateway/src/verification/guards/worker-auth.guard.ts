import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WorkerAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers['x-api-signature'];

    if (!signature) {
      console.warn(
        'Somebody tried to access worker endpoint without signature.',
      );
      return false;
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(JSON.stringify(request.body));
    const isSignatureValid = verifier.verify(
      this.configService.get('app').workerPubKey,
      signature,
      'base64',
    );

    if (isSignatureValid) {
      return true;
    }

    console.warn(
      'Somebody tried to access worker endpoint with invalid signature.',
    );
    return false;
  }
}
