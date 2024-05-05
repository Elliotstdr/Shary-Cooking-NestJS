import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class NotGuestGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    return req.user.email !== 'test@test.com';
  }
}
