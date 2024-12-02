import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class HelperService {
  constructor(private jwtService: JwtService) {}

  generateOtp = (): string => {
    let code = '';
    let schema = '0123456789';

    for (let i = 0; i < 6; i++) {
      code += schema.charAt(Math.floor(Math.random() * schema.length));
    }

    return code;
  };

  hasher = async (value: any, salt: number): Promise<string> => {
    return await bcrypt.hash(value, salt);
  };

  async matchChecker(value: any, dbValue: any) {
    let compare = bcrypt.compare(value, dbValue);
    return compare;
  }

  generateToken = async (payload: any): Promise<string> => {
    return await this.jwtService.signAsync(payload);
  };

  verifyUserToken = async (token: string, secret: string) => {
    try {
      const result = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });
      return result;
    } catch (err) {
      throw new UnauthorizedException(
        'Authentification error, please check your token.',
      );
    }
  };
}
