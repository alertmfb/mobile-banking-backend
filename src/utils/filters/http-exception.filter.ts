import 'dotenv/config';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';

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

    const errorRequestData = exception?.response?.data || null;

    const devErrorResponse: any = {
      success: 'error',
      error: {
        code: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        responseMessage: exception.message || exception.message,
        requestData: errorRequestData,
      },
    };

    const prodErrorResponse: any = {
      status: 'error',
      message: exception.message || exception.message,
      data: errorRequestData || null,
    };

    Logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(devErrorResponse, null, 2),
      'ExceptionFilter',
    );

    response.status(status).json(prodErrorResponse);
  }
}
