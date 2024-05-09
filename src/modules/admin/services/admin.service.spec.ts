import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { User, UserRole } from 'src/modules/user/entities';
import { UserService } from 'src/modules/user/services/user.service';
import { ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { generateToken } from 'src/common/utils/verification-token-genertator';
import { MailService } from 'src/modules/mail/mail.service';
import { VerifyEmailRepository } from '../repositories/verify-email.repository';

describe('AdminService', () => {
  let service: AdminService;
  let userService: jest.Mocked<UserService>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        UserService,
        MailService,
        VerifyEmailRepository,
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userService = module.get(UserService);
    mailService = module.get(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
    it('이미 등록된 이메일 주소로 등록을 시도하면 ConflictException 에러가 발생한다 ', async () => {
      const duplicateUserDto: CreateAdminDto = {
        email: 'test@elicer.com',
        password: 'test',
        realName: 'Test User',
      };

      userService.findUserByEmailOrUsername.mockResolvedValue(new User());

      await expect(service.createAdmin(duplicateUserDto)).rejects.toThrow(
        ConflictException,
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

      userService.findUserByEmailOrUsername.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue('hashedPassword');

      userService.createAdmin.mockResolvedValue(newUser);

      const result = await service.createAdmin(dto);

      expect(userService.findUserByEmailOrUsername).toHaveBeenCalledWith(
        dto.email,
      );
      expect(argon2.hash).toHaveBeenCalledWith(dto.password);

      expect(result).toEqual(newUser);
    });
  });
});