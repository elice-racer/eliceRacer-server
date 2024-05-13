import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from '../services/admin.service';
import { MailService } from 'src/modules/mail/mail.service';
import { UserService } from 'src/modules/user/services/user.service';
import { VerificationService } from 'src/modules/auth/services/verification.service';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [AdminService, UserService, MailService, VerificationService],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
