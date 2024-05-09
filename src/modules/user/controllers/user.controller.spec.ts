import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('회원가입한다', async () => {
      const reqDto: CreateUserDto = {
        username: 'testId',
        password: 'password',
        realName: 'testname',
        phoneNumber: '01012345678',
      };
      await controller.signup(reqDto);
    });
  });
});
