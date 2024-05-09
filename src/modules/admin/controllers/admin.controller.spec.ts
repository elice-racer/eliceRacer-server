import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from '../services/admin.service';
import { MailService } from 'src/modules/mail/mail.service';
import { VerifyEmailRepository } from '../repositories/verify-email.repository';
import { UserService } from 'src/modules/user/services/user.service';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        AdminService,
        VerifyEmailRepository,
        UserService,
        MailService,
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
