import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../repositories';
import { CreateUserDto, updateReqDto } from '../dto';
import { User, UserRole, UserStatus } from '../entities';
import { hashPassword } from 'src/common/utils';
import { BusinessException } from 'src/exception';
import { TrackRepository } from 'src/modules/track/repositories';
import { Track } from 'src/modules/track/entities';
import { TrackDto } from 'src/modules/track/dto';

jest.unmock('./user.service');

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<UserRepository>;
  let trackRepo: jest.Mocked<TrackRepository>;

  const createUserDto: CreateUserDto = {
    username: 'testId',
    password: 'password',
    realName: 'New User',
    phoneNumber: '01012345678',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UserRepository, TrackRepository],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(UserRepository);
    trackRepo = module.get(TrackRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    it('유저가 존재하지 않으면 BusinessException을 던진다', async () => {
      const userId = 'uuid';

      userRepo.findUserByIdWithDetail.mockResolvedValue(undefined);
      await expect(service.getUser(userId)).rejects.toThrow(BusinessException);
    });

    it('유저의 정보를 반환한다', async () => {
      const userId = 'uuid';
      const user = new User();

      userRepo.findUserByIdWithDetail.mockResolvedValue(user);

      const result = await service.getUser(userId);

      expect(result).toEqual(user);
    });
  });

  describe('updateUserRole', () => {
    it('유저가 존재하지 않으면 BusinessException을 던진다', async () => {
      const role: UserRole = 'COACH' as UserRole;
      userRepo.findOneBy.mockResolvedValueOnce(undefined);

      await expect(service.updateUserRole('uuid', role)).rejects.toThrow(
        BusinessException,
      );
    });

    it('유저가 존재하면 이름 유저의 역할을 변경한다', async () => {
      const user = new User();
      const role: UserRole = 'COACH' as UserRole;

      userRepo.findOneBy.mockResolvedValue(user);
      user.role = role;
      userRepo.save.mockResolvedValue(user);

      const result = await service.updateUserRole('uuid', role);

      expect(result).toEqual(user);
    });
  });

  describe('getAllUsers', () => {
    it('유저가 존재하지 않으면 BusinessException을 던진다', async () => {
      const users = [];
      userRepo.findAllUsers.mockResolvedValueOnce([users, 0]);

      await expect(service.getAllUsers(1, 10)).rejects.toThrow(
        BusinessException,
      );
    });

    it('유저가 존재하면 이름 오름차순으로 유저를 반환한다', async () => {
      const users: User[] = [{ username: 'user1' } as User];
      userRepo.findAllUsers.mockResolvedValue([users, 10]);

      const result = await service.getAllUsers(1, 10);

      expect(result).toEqual(users);
    });
  });

  describe('getAllUsersByTrack', () => {
    const dto: TrackDto = {
      trackName: 'trackName',
      cardinalNo: 1,
    };
    const page = 1;
    const pageSize = 10;
    it('트랙이 없으면 BusinessException을 던진다', async () => {
      trackRepo.findOne.mockResolvedValue(undefined);

      await expect(
        service.getAllUsersByTrack(dto, page, pageSize),
      ).rejects.toThrow(BusinessException);
    });

    it('트랙에 등록된 멤버가 없으면 등록된 레이서가 없다는 안내를 반환한다', async () => {
      const track = new Track();
      const user = [];

      trackRepo.findOne.mockResolvedValue(track);
      userRepo.findUsersByTrack.mockResolvedValueOnce([user, 0]);

      await expect(
        service.getAllUsersByTrack(dto, page, pageSize),
      ).rejects.toThrow(BusinessException);
    });

    it('트랙이 존재하고 멤버가 존재하면 레이서들을 반환한다', async () => {
      const users: User[] = [{ username: 'user1' } as User];
      const track: Track = { ...dto } as Track;

      trackRepo.findOne.mockResolvedValue(track);
      userRepo.findUsersByTrack.mockResolvedValueOnce([users, 1]);

      const result = await service.getAllUsersByTrack(dto, page, pageSize);

      expect(result).toEqual(users);
    });
  });

  describe('updateMyPage', () => {
    const dto: updateReqDto = {
      realName: 'name',
      position: 'backend',
      github: 'gihub-address',
    };

    it('사용자가 존재하지 않으면 BusinessException을 던진다', async () => {
      userRepo.findUserByIdWithTracks.mockResolvedValueOnce(undefined);

      await expect(service.updateMypage('uuid', dto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('유저의 정보를 업데이트 한다', async () => {
      const user = new User();
      user.realName = dto.realName;
      user.position = dto.position;
      user.github = dto.github;

      userRepo.findUserByIdWithTracks.mockResolvedValueOnce(user);
      userRepo.save.mockResolvedValue(user);

      const result = await service.updateMypage('uuid', dto);

      expect(result).toEqual(user);
    });
  });

  describe('updateUserTracks', () => {
    const userId = 'uuid';
    const trackDto: TrackDto = {
      trackName: 'trackName',
      cardinalNo: 1,
    };
    it('사용자가 존재하지 않으면 BusinessException을 던진다', async () => {
      jest.spyOn(service, 'findUserById').mockResolvedValue(undefined);

      await expect(service.updateUserTracks(userId, trackDto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('트랙이 존재하지 않으면 BusinessException을 던진다', async () => {
      const user = new User();
      userRepo.findUserByIdWithTracks.mockResolvedValue(user);
      trackRepo.find.mockResolvedValue([]);

      await expect(service.updateUserTracks(userId, trackDto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('사용자가 레이서가 아니라면 BusinessException을 던진다', async () => {
      const user = new User();
      const track = new Track();
      user.role = UserRole.COACH;

      userRepo.findUserByIdWithTracks.mockResolvedValueOnce(user);
      trackRepo.findOne.mockResolvedValueOnce(track);
      userRepo.save.mockResolvedValueOnce(user);

      await expect(service.updateUserTracks(userId, trackDto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('사용자가 레이서라면 트랙을 업데이트 한다', async () => {
      const user = new User();
      const track = new Track();
      track.trackName = 'Track';
      track.cardinalNo = 1;
      user.track = null;
      user.role = UserRole.RACER;

      userRepo.findUserByIdWithTracks.mockResolvedValueOnce(user);
      trackRepo.findOne.mockResolvedValueOnce(track);
      userRepo.save.mockResolvedValueOnce(user);

      const result = await service.updateUserTracks(userId, trackDto);
      expect(result).toEqual(user);
      expect(user.track).toEqual(track);
    });
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

      await expect(service.validate(userId)).rejects.toThrow(BusinessException);
    });
  });

  describe('handleSignUp', () => {
    it('동일한 아이디로 회원가입한 유저가 존재하면 ConfliectException을 반환한다', async () => {
      const user = new User();
      user.username = createUserDto.username;
      user.status = UserStatus.VERIFIED_AND_REGISTERED;
      jest.spyOn(service, 'findAnyUserByPhone').mockResolvedValue(user);

      await expect(service.handleSignUp(createUserDto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('번호 인증을 하지 않은 유저는 BusinessException을 던진다', async () => {
      const user = new User();
      user.status = 0;
      user.username = createUserDto.username;
      jest.spyOn(service, 'findAnyUserByPhone').mockResolvedValue(user);

      await expect(service.handleSignUp(createUserDto)).rejects.toThrow(
        BusinessException,
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
