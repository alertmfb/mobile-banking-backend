import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HelperService {
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
}
