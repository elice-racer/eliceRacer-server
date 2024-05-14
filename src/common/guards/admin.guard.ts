import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/modules/user/entities';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hasAccess = (await super.canActivate(context)) as boolean; // JWT 검증이 완료될 때까지 기다립니다.
    if (!hasAccess) {
      return false;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role === UserRole.ADMIN) {
      return true;
    }

    throw new HttpException('접근 권한이 없습니다', HttpStatus.FORBIDDEN);
  }
}
