import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories';
import { CreateUserDto } from '../dto';
import { User } from '../entities';
import { hashPassword } from 'src/common/utils/password-hash';

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

  describe('handleSignUp', () => {
    it('유저가 존재하지 않으면 새롭게 생성한다.', async () => {
      const user = new User();
      const hashedPassword = 'hashedPassword';
      jest.spyOn(service, 'findUserByPhoneNumber').mockResolvedValue(undefined);

      (hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(service, 'createUser').mockResolvedValue(user);

      await service.handleSignUp(createUserDto);

      expect(service.createUser).toHaveBeenCalledWith(
        createUserDto,
        hashedPassword,
      );
    });

    it('유저가 존재하면 업데이트 한다', async () => {
      const user = new User();
      const hashedPassword = 'hashedPassword';
      jest.spyOn(service, 'findUserByPhoneNumber').mockResolvedValue(user);
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

  describe('creatUser', () => {
    it('사용자를 생성한다', async () => {
      const user = new User();
      user.isSigned = true;

      userRepo.createUser.mockResolvedValue(user);
      const result = await service.createUser(createUserDto, 'hashedPassword');

      expect(result).toEqual(user);
      expect(result.isSigned).toBe(true);
    });
  });

  describe('mergeUser', () => {
    it('유저의 정보를 수정한다', async () => {
      const user = new User();
      user.isSigned = true;

      userRepo.mergeUser.mockResolvedValue(user);
      const result = await service.mergeUser(
        user,
        createUserDto,
        'hashedPassword',
      );

      expect(result).toEqual(user);
      expect(result.isSigned).toBe(true);
    });
  });

  describe('findUserByPhoneNumber', () => {
    it('해당 번호를 가진 유저가 존재하면 유저를 반환한다', async () => {
      const user = new User();
      userRepo.findOneBy.mockResolvedValue(user);
      const result = await service.findUserByPhoneNumber('01012345678');

      expect(result).toEqual(user);
    });

    it('해당 번호를 가진 유저가 존재하지 않으면 undefined를 반환한다', async () => {
      userRepo.findOneBy.mockResolvedValue(undefined);
      const result = await service.findUserByPhoneNumber('01012345678');

      expect(result).toBe(undefined);
    });
  });

  describe('findUserByPhoneNumber', () => {
    it('해당 번호를 가진 유저가 존재하면 트랙을 포함해서 유저를 반환한다', async () => {
      const user = new User();
      userRepo.findUserByPhoneNumberWithTrack.mockResolvedValue(user);
      const result =
        await service.findUserByPhoneNumberWithTrack('01012345678');

      expect(result).toEqual(user);
    });

    it('해당 번호를 가진 유저가 존재하지 않으면 undefined를 반환한다', async () => {
      userRepo.findUserByPhoneNumberWithTrack.mockResolvedValue(undefined);
      const result =
        await service.findUserByPhoneNumberWithTrack('01012345678');

      expect(result).toBe(undefined);
    });
  });
});
``;
