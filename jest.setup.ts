import {
  ENV_SMS_API_KEY,
  ENV_SMS_API_SECRET_KEY,
  ENV_SMS_FROM_NUMBER_KEY,
} from 'src/common/const';

//sms.service
jest.mock('./src/modules/sms/services/sms.service');

// configServiceSetup;
jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key) => {
      switch (key) {
        case ENV_SMS_API_KEY:
          return 'mock_api_key'; // 가짜 API 키
        case ENV_SMS_API_SECRET_KEY:
          return 'mock_secret_key'; // 가짜 비밀 키
        case ENV_SMS_FROM_NUMBER_KEY:
          return 'mock_phone_number'; // 가짜 전화번호
        default:
          return null;
      }
    }),
  })),
}));
