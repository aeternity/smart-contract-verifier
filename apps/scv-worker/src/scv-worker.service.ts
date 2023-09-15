import { Injectable } from '@nestjs/common';

@Injectable()
export class ScvWorkerService {
  getHello(): string {
    return 'Hello World!';
  }
}
