import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { HelperModule } from 'src/utils/helper.module';
import { EmailModule } from 'src/common/email/mailer.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    PrismaModule,
    HelperModule,
    EmailModule,
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_USER_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
  ],
})
export class UserModule {}
