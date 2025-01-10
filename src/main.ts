import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { ValidationFilter } from './exception/validation-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProd = process.env.NODE_ENV === 'production';

  console.log(isProd, ' ENV');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization,Custom-Header',
  });

  app.setGlobalPrefix('api');
  // app.use('/api/', express.static(join(__dirname, 'uploads')));

  // Environment-specific static file handling
  // app.use('/api', express.static(join(__dirname, 'upload')));
  // app.use('/api/images', express.static(join(__dirname, 'public', 'upload')));
  app.use('/api/public/', express.static(join(__dirname, 'public')));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      skipMissingProperties: false,
      skipNullProperties: true,
      exceptionFactory: ValidationFilter,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Online Job Portal API Documentation')
    .setDescription('The onlinejobportal API')
    .setVersion('1.0')
    .addBearerAuth()
    // .addTag('Online Job Portal')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/api/swagger', app, document, {
    customSiteTitle: 'onlinejobportal',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
