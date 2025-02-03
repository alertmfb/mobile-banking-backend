import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FromAndToDto } from './dtos/from-and-to.dto';

@Injectable()
export class MetricService {
  constructor(private readonly prismaService: PrismaService) {}

  async activeUsers(query: FromAndToDto) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const from = query.from || sevenDaysAgo;
    const to = query.to || now;

    // Count users within the date range
    return this.prismaService.user.count({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });
  }

  async userChartOverview(query: FromAndToDto) {
    const { from, to } = query;
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const startDate = from || defaultFrom;
    const endDate = to || now;
    const usersPerMonth = await this.prismaService.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        _all: true,
      },
    });
    const result = usersPerMonth.map((userGroup) => {
      const date = new Date(userGroup.createdAt);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      return {
        month: `${month} ${year}`,
        count: userGroup._count._all,
      };
    });

    return result;
  }

  async transactionSum(query: FromAndToDto) {
    const now = new Date(); // Current date and time
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const from = query.from || sevenDaysAgo;
    const to = query.to || now;
    const result = await this.prismaService.transaction.aggregate({
      where: {
        status: 'SUCCESS',
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  }
}
