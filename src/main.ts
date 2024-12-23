import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from './utils/pipes/validation.pipe';
import { corsOption } from './shared/config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors(corsOption);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The Alert Mobile API description')
    .setVersion('1.0')
    .addTag('alert-mobile')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  Logger.log(
    `Server running on http://localhost:${process.env.PORT ?? 4000}`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger running on http://localhost:${process.env.PORT ?? 4000}/docs`,
    'Bootstrap',
  );

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
