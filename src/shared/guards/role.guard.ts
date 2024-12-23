import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Retrieve roles from route metadata
    const requiredRoles = this.reflector.get<string[] | null>(
      ROLES_KEY,
      context.getHandler(),
    );

    // If roles are not specified, allow access
    if (!requiredRoles) {
      return true;
    }

    // Extract user from the request
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // If user doesn't have roles or no matching roles, deny access
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
