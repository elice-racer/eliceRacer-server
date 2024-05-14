import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { User, UserRole, UserStatus } from 'src/modules/user/entities';
import * as argon2 from 'argon2';
import { generateToken } from 'src/common/utils/verification-token-genertator';
import { MailService } from 'src/modules/mail/mail.service';
import { VerificationService } from 'src/modules/auth/services/verification.service';
import { AdminRepository } from '../repositories';
import { BusinessException } from 'src/exception';

describe('AdminService', () => {
  let service: AdminService;
  let mailService: jest.Mocked<MailService>;
  let verificationService: jest.Mocked<VerificationService>;
  let adminRepo: jest.Mocked<AdminRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        MailService,
        VerificationService,
        AdminRepository,
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    mailService = module.get(MailService);
    verificationService = module.get(VerificationService);
    adminRepo = module.get(AdminRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyEmail', () => {
    it('유효하지 않은 토큰을 이용해서 이메일 인증을 하면 false를 반환한다', async () => {
      const userId = 'uuid';
      const token = 'invalid-token';

      verificationService.verifyCode.mockResolvedValue(false);
      const result = await service.verifyEmail(userId, token);

      expect(result).toBe(false);
    });
    it('유효한 토큰을 이용해서 이메일 인증에 성공하면 true를 반환한다', async () => {
      const userId = 'uuid';
      const token = 'valid-token';

      verificationService.verifyCode.mockResolvedValue(true);
      const result = await service.verifyEmail(userId, token);

      expect(result).toBe(true);
      expect(adminRepo.updateStatusAfterVerification).toHaveBeenCalledWith(
        userId,
        UserStatus.VERIFIED_AND_REGISTERED,
      );
    });
  });
  describe('signUp', () => {
    it('관리자를 생성하고 이메일 인증 토큰을 이용해 인증 메일을 보낸다', async () => {
      const dto: CreateAdminDto = {
        email: 'admin@elicer.com',
        password: 'password',
        realName: 'New Admin',
      };

      const admin = new User();
      admin.role = UserRole.ADMIN;
      admin.password = 'hashedPassword';

      const verificationToken = 'verification-token';

      (generateToken as jest.Mock).mockReturnValue(verificationToken);
      jest.spyOn(service, 'createAdmin').mockResolvedValue(admin);

      await service.signup(dto);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        admin,
        verificationToken,
        'admins',
      );
    });
  });
  describe('createAdmin', () => {
    it('이미 등록된 이메일 주소로 등록을 시도하면 BusinessException 에러가 발생한다 ', async () => {
      const duplicateUserDto: CreateAdminDto = {
        email: 'test@elicer.com',
        password: 'test',
        realName: 'Test User',
      };

      adminRepo.findAnyAdminByEmail.mockResolvedValue(new User());

      await expect(service.createAdmin(duplicateUserDto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('성공적으로 새로운 유저를 생성한다.', async () => {
      const dto: CreateAdminDto = {
        email: 'test@elicer.com',
        password: 'password',
        realName: 'Test User',
      };

      const newUser = new User();
      newUser.password = 'hashedPassword';
      newUser.role = UserRole.ADMIN;
      newUser.status = 0;

      adminRepo.findAnyAdminByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashedPassword');

      adminRepo.createAdmin.mockResolvedValue(newUser);

      const result = await service.createAdmin(dto);

      expect(result).toEqual(newUser);
    });
  });
});
