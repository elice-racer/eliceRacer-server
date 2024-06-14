import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { VerifyCodeReqDto } from '../dto/verify-code-req.dto';
import { PasswordResetReqDto, VerifyCodeResDto } from '../dto';
import { LoginReqDto } from '../dto/login-req.dto';
import { JwtAuthGuard } from 'src/common/guards';
import { ResponseInterceptor, Serialize } from 'src/interceptors';
import { Request, Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerifyPasswordResetReqDto } from '../dto/verify-password-reset-req.dto';
import { updatePasswordReqDto } from '../dto/update-password-req.dto';

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
      // domain: 'elicerracer.store',
      // secure: true,
      // sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.header('Authorization', `Bearer ${accessToken}`);
    return res.status(200).json({ message: '로그인 성공', statusCode: 200 });
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

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

  //아이디찾기
  @ApiOperation({ summary: '아이디 찾기 요청 번호만 입력하면 반환' })
  @Post('/identifiers')
  async getIdentifier(@Body('phonenNumber') phoneNumber: string) {
    //userId값을 반환할거
    const user = await this.authService.getIdentifier(phoneNumber);

    return { email: user.email, username: user.username };
  }

  //비밀번호 바꾸기
  //1인증문자 보내기 2 번호 체크하기 3.새 비번받고 업데이트하기
  @ApiOperation({ summary: '비밀번호 업데이트 전 인증문자를 보내기 요청' })
  @Post('/passwords/phones')
  async sendPwCode(@Body() dto: PasswordResetReqDto) {
    //userId값을 반환할거
    const userId = await this.authService.handlePasswordResetVerification(dto);
    return { userId };
  }

  @ApiOperation({ summary: '인증 번호 검증 요청' })
  @Post('/passwords/verify-code')
  async verifyPwAuthCode(@Body() dto: VerifyPasswordResetReqDto) {
    return await this.authService.handlePasswordResetCode(
      dto.phoneNumber,
      dto.authCode,
    );
  }

  @ApiOperation({
    summary:
      '인증번호가 검증된 후 비밀번호 업데이트 요청, *인증문자 보낼때 반환값인 userId값을 꼭 보내야 함',
  })
  @Patch('/password')
  async updatePassword(@Body() dto: updatePasswordReqDto) {
    await this.authService.handleUpdatePassword(dto);
  }
}
