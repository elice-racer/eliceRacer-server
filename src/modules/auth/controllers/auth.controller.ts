import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { VerifyCodeReqDto } from '../dto/verify-code-req.dto';
import { VerifyCodeResDto } from '../dto';
import { LoginReqDto } from '../dto/login-req.dto';
import { JwtAuthGuard } from 'src/common/guards';
import { ResponseInterceptor, Serialize } from 'src/interceptors';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@UseInterceptors(ResponseInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/send-verification')
  async sendVerificationCode(@Body('phoneNumber') phoneNumber: string) {
    return await this.authService.handlePhoneVerification(phoneNumber);
  }

  @Post('/verify-code')
  @Serialize(VerifyCodeResDto)
  async verifyAuthCode(
    @Body() dto: VerifyCodeReqDto,
  ): Promise<VerifyCodeResDto> {
    return await this.authService.handleCodeVerification(
      dto.phoneNumber,
      dto.realName,
      dto.authCode,
    );
  }

  @Post('/login')
  async login(@Res() res: Response, @Body() loginReqDto: LoginReqDto) {
    const { accessToken, refreshToken } = await this.authService.login(
      loginReqDto.identifier,
      loginReqDto.password,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      domain: 'elicerracer.com',
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.header('Authorization', `Bearer ${accessToken}`);
    return res.status(200).json({ message: '로그인 성공', statusCode: 200 });
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    console.log('request header!!!!!!!!', req.header);
    console.log('?????????????request headers!', req.headers);
    const refreshToken = req.cookies['refreshToken'];
    console.log('!!!!!!!!!!!!!!', refreshToken);

    const accessToken = await this.authService.refresh(refreshToken);
    res.header('Authorization', `Bearer ${accessToken}`);

    return res
      .status(200)
      .json({ message: '토큰이 갱신되었습니다', statusCode: 200 });
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const refreshToken = req.cookies['refreshToken'];
    res.clearCookie('refreshToken', { path: '/' });
    await this.authService.logout(refreshToken);

    res.status(200).json({ message: '로그아웃 성공', statusCode: 200 });
  }
}
