import { Test, TestingModule } from '@nestjs/testing';
import { ScvWorkerController } from './scv-worker.controller';
import { ScvWorkerService } from './scv-worker.service';

describe('ScvWorkerController', () => {
  let scvWorkerController: ScvWorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ScvWorkerController],
      providers: [ScvWorkerService],
    }).compile();

    scvWorkerController = app.get<ScvWorkerController>(ScvWorkerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(scvWorkerController.getHello()).toBe('Hello World!');
    });
  });
});
