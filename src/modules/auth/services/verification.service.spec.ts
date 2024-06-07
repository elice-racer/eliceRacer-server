import { Test, TestingModule } from '@nestjs/testing';
import { VerificationService } from './verification.service';
import { VerificationRepository } from '../repositories';

jest.unmock('./verification.service');

describe('VerificationService', () => {
  let service: VerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificationService, VerificationRepository],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyCode', () => {
    it('유효시간이 지난 인증번호를 입력하면 false을 반환한다', async () => {
      const phoneNumber = '01012345678';
      const inputCode = '123450';
      jest.spyOn(service, 'getVerificationCode').mockResolvedValue(null);

      const result = await service.verifyCode(phoneNumber, inputCode);

      expect(result).toBe(false);
    });

    it('유효하지 않은 인증번호를 입력하면 false를 반환한다', async () => {
      const phoneNumber = '01012345678';
      const inputCode = '123450';
      const storedCode = '123456';

      jest.spyOn(service, 'getVerificationCode').mockResolvedValue(storedCode);

      const result = await service.verifyCode(phoneNumber, inputCode);

      expect(result).toBe(false);
    });

    it('유효시간 내에 올바른 인증번호를 입력하면 true를 반환한다 ', async () => {
      const phoneNumber = '01012345678';
      const inputCode = '123456';
      const storedCode = '123456';

      jest.spyOn(service, 'getVerificationCode').mockResolvedValue(storedCode);
      const result = await service.verifyCode(phoneNumber, inputCode);

      expect(result).toBe(true);
    });
  });
});
