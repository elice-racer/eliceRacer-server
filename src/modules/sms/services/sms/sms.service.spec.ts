import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { ConfigService } from '@nestjs/config';

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsService, ConfigService],
    }).compile();

    service = module.get<SmsService>(SmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationCode', () => {
    it('인증 문자 전송에 성공한다', async () => {
      const mockSendOne = jest.fn().mockResolvedValue({ statusCode: '2000' });
      service['messageService'] = { sendOne: mockSendOne };

      const result = await service.sendVerificationCode(
        '01012345678',
        '123456',
      );

      expect(result).toBe('Success');
    });
  });
});
