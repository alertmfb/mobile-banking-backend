import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { HelperService } from 'src/utils/helper.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly helperService: HelperService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const secret = process.env.TOKEN_USER_SECRET;

      const payload = await this.helperService.verifyUserToken(token, secret);

      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException(
        'Authentification error, please check your token.',
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
