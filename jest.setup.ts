import {
  ENV_SMS_API_KEY,
  ENV_SMS_API_SECRET_KEY,
  ENV_SMS_FROM_NUMBER_KEY,
} from 'src/common/const';

//라이브러리
jest.mock('argon2');
jest.mock('@nestjs/config');
jest.mock('@nestjs/jwt');

//Servcie
jest.mock('./src/modules/sms/services/sms.service');
jest.mock('./src/modules/user/services/user.service');
jest.mock('./src/modules/auth/services/auth.service');
jest.mock('./src/modules/mail/mail.service');

//Repository
jest.mock('./src/modules/auth/repositories/sms-verification.repository');
jest.mock('./src/modules/user/repositories/user.repository');
jest.mock('./src/modules/auth/repositories/refresh-token.repository');
jest.mock('./src/modules/admin/repositories/verify-email.repository');

//utils
jest.mock('./src/common/utils/verification-number-generator');
jest.mock('./src/common/utils/password-hash');
jest.mock('./src/common/utils/verification-token-genertator');

// configServiceSetup;
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key) => {
      switch (key) {
        case ENV_SMS_API_KEY:
          return 'mock_api_key';
        case ENV_SMS_API_SECRET_KEY:
          return 'mock_secret_key';
        case ENV_SMS_FROM_NUMBER_KEY:
          return 'mock_phone_number';
        default:
          return null;
      }
    }),
  })),
}));
