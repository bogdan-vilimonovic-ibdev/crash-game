import { Test, TestingModule } from '@nestjs/testing';
import { FrontendCommunicationGateway } from './frontend-communication.gateway';

describe('FrontendCommunicationGateway', () => {
  let gateway: FrontendCommunicationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrontendCommunicationGateway],
    }).compile();

    gateway = module.get<FrontendCommunicationGateway>(FrontendCommunicationGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
