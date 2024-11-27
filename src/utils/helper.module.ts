import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [],
  providers: [HelperService],
  exports: [HelperService],
})
export class HelperModule {}
