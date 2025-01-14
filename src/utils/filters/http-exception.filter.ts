import 'dotenv/config';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import * as chalk from 'chalk';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    let status: number;

    try {
      status = exception.getStatus
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    } catch (e) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Extract error data for Axios errors
    let errorResponseData: any = null;
    if (exception instanceof AxiosError) {
      errorResponseData = exception.response?.data || null;
      status = exception.response?.status || status;
    }

    const devErrorResponse: any = {
      success: 'error',
      error: {
        code: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        responseMessage: exception.message,
        requestData: errorResponseData,
      },
    };

    const prodErrorResponse: any = {
      status: 'error',
      message: exception.message,
      data: errorResponseData,
    };

    // Pretty console logs
    const logMessage = `
${chalk.red.bold('Exception:')} ${exception.name || 'Unknown Exception'}
${chalk.yellow.bold('Status Code:')} ${status}
${chalk.cyan.bold('Method:')} ${request.method}
${chalk.green.bold('Path:')} ${request.url}
${chalk.magenta.bold('Timestamp:')} ${new Date().toISOString()}
${chalk.blue.bold('Error Message:')} ${exception.message}
${chalk.white.bold('Error Data:')} ${JSON.stringify(errorResponseData, null, 2)}
    `;

    Logger.error(logMessage, '', 'HttpErrorFilter');

    response.status(status).json(prodErrorResponse);
  }
}
