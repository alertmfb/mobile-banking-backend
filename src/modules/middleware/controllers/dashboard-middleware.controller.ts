import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FromAndToDto } from 'src/modules/metric/dtos/from-and-to.dto';
import { MetricService } from 'src/modules/metric/metric.service';
import { SuccessResponseDto } from 'src/shared/dtos/success-response.dto';
import { SuccessMessage } from 'src/shared/enums/success-message.enum';

@ApiTags('Middleware Consumer Banking Metric')
@Controller('middleware/consumer')
export class DashboardMiddlewareController {
  constructor(private readonly metricService: MetricService) {}

  @Get('metric/active-users')
  async getDashboardMetrics(@Query() query: FromAndToDto) {
    try {
      const response = await this.metricService.activeUsers(query);
      return new SuccessResponseDto(SuccessMessage.ACTIVE_USERS, response);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('metric/user-chart-overview')
  async getUserChartOverview(@Query() query: FromAndToDto) {
    try {
      const response = await this.metricService.userChartOverview(query);
      return new SuccessResponseDto(SuccessMessage.USERS_RETRIEVED, response);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('metric/transaction-sum')
  async getTransactionSum(@Query() query: FromAndToDto) {
    try {
      const response = await this.metricService.transactionSum(query);
      return new SuccessResponseDto(
        SuccessMessage.TRANSACTION_RETRIEVED,
        response,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
