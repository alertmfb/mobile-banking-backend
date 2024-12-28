import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createSecurityQuestions(data: Prisma.SecurityQuestionCreateInput) {
    return this.prismaService.securityQuestion.create({ data });
  }

  async updateSecurityQuestion(
    id: string,
    data: Prisma.SecurityQuestionUpdateInput,
  ) {
    return this.prismaService.securityQuestion.update({
      where: {
        id,
      },
      data,
    });
  }

  async findAllByUserId(userId: string) {
    return await this.prismaService.securityQuestion.findMany({
      where: {
        userId,
      },
      orderBy: {
        number: 'asc',
      },
    });
  }

  async findOneByQuery(query: Partial<Prisma.SecurityQuestionWhereInput>) {
    return this.prismaService.securityQuestion.findFirst({
      where: query as Prisma.SecurityQuestionWhereInput,
    });
  }
}
