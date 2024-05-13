import {
  ExecutionContext,
  ForbiddenException,
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
      // 역할 확인 조건을 문자열로 명확하게 비교
      return true;
    }

    throw new ForbiddenException('접근 권한이 없습니다');
  }
}
