import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { VerifyCodeReqDto } from '../dto/verify-code-req.dto';
import {
  LoginResDto,
  LogoutReqDto,
  RefreshReqDto,
  RefreshResDto,
  VerifyCodeResDto,
} from '../dto';
import { LoginReqDto } from '../dto/login-req.dto';
import { JwtAuthGuard } from 'src/common/guards';
import { ResponseInterceptor } from 'src/interceptors';

@UseInterceptors(ResponseInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/send-verification')
  async sendVerificationCode(@Body('phoneNumber') phoneNumber: string) {
    return await this.authService.handlePhoneVerification(phoneNumber);
  }

  @Post('/verify-code')
  async verifyAuthCode(
    @Body() verifyCodeReqDto: VerifyCodeReqDto,
  ): Promise<VerifyCodeResDto> {
    return await this.authService.handleCodeVerification(
      verifyCodeReqDto.phoneNumber,
      verifyCodeReqDto.authCode,
    );
  }

  @Post('/login')
  async login(@Body() loginReqDto: LoginReqDto): Promise<LoginResDto> {
    return await this.authService.login(
      loginReqDto.identifier,
      loginReqDto.password,
    );
  }

  @Post('/refresh')
  async refresh(@Body() refreshReqDto: RefreshReqDto): Promise<RefreshResDto> {
    return await this.authService.refresh(refreshReqDto.refreshToken);
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() logoutReqDto: LogoutReqDto): Promise<void> {
    await this.authService.logout(logoutReqDto.refreshToken);
  }
}
