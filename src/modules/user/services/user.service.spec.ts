import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories';
import { CreateUserDto } from '../dto';
import { User, UserStatus } from '../entities';
import { hashPassword } from 'src/common/utils/password-hash';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

jest.unmock('./user.service');

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<UserRepository>;

  const createUserDto: CreateUserDto = {
    username: 'testId',
    password: 'password',
    realName: 'New User',
    phoneNumber: '01012345678',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UserRepository],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    it('해당 userId로 회원가입 한 유저가 존재하면 유저를 반환한다', async () => {
      const userId = 'uuid';
      const user = new User();

      user.id = userId;
      user.status = UserStatus.VERIFIED_AND_REGISTERED;

      jest.spyOn(service, 'findUserById').mockResolvedValue(user);
      const result = await service.validate(userId);

      expect(result).toEqual(user);
    });

    it('해당 userId로 회원가입 한 유저가 존재하지 않으면 NotFoundException을 반환한다', async () => {
      const userId = 'uuid';
      jest.spyOn(service, 'findUserById').mockResolvedValue(undefined);

      await expect(service.validate(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleSignUp', () => {
    it('동일한 아이디로 회원가입한 유저가 존재하면 ConfliectException을 반환한다', async () => {
      const user = new User();
      user.username = createUserDto.username;
      user.status = UserStatus.VERIFIED_AND_REGISTERED;
      jest.spyOn(service, 'findAnyUserByPhone').mockResolvedValue(user);

      await expect(service.handleSignUp(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('번호 인증을 하지 않은 유저는 UnauthorizedException을 반환한다', async () => {
      const user = new User();
      user.status = 0;
      user.username = createUserDto.username;
      jest.spyOn(service, 'findAnyUserByPhone').mockResolvedValue(user);

      await expect(service.handleSignUp(createUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
    it('번호 인증 완료된 유저는 업데이트 한다', async () => {
      const user = new User();
      const hashedPassword = 'hashedPassword';
      user.status = UserStatus.VERIFIED;
      jest.spyOn(service, 'findAnyUserByPhone').mockResolvedValue(user);
      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(service, 'mergeUser').mockResolvedValue(user);

      await service.handleSignUp(createUserDto);

      expect(service.mergeUser).toHaveBeenCalledWith(
        user,
        createUserDto,
        hashedPassword,
      );
    });
  });

  describe('mergeUser', () => {
    it('유저의 정보를 수정한다', async () => {
      const user = new User();
      user.status = UserStatus.VERIFIED_AND_REGISTERED;

      userRepo.mergeUser.mockResolvedValue(user);
      const result = await service.mergeUser(
        user,
        createUserDto,
        'hashedPassword',
      );

      expect(result).toEqual(user);
      expect(result.status).toBe(2);
    });
  });

  describe('findAnyUserById', () => {
    it('userId에 해당하는 유저가 존재하면 회원가입 하지 않은 유저까지 반환한다', async () => {
      const user = new User();
      const userId = 'uuid';
      userRepo.findOneBy.mockResolvedValue(user);
      const result = await service.findAnyUserById(userId);

      expect(result).toEqual(user);
    });
  });
  describe('findUserById', () => {
    it('userId에 해당하는 유저가 존재하면 유저를 반환한다', async () => {
      const user = new User();
      const userId = 'uuid';
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.findUserById(userId);

      expect(result).toEqual(user);
    });
  });

  describe('findAnyUserByPhone', () => {
    it('핸드폰 번호에 해당하는 유저가 존재하면 회원가입 하지 않은 유저를 포함해 반환한다', async () => {
      const user = new User();
      const userId = 'uuid';
      userRepo.findOneBy.mockResolvedValue(user);

      const result = await service.findAnyUserByPhone(userId);

      expect(result).toEqual(user);
    });
  });
});
