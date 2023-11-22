import { Test, TestingModule } from '@nestjs/testing';
import { FrontendCommunicationService } from './frontend-communication.service';

describe('FrontendCommunicationService', () => {
  let service: FrontendCommunicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrontendCommunicationService],
    }).compile();

    service = module.get<FrontendCommunicationService>(FrontendCommunicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
