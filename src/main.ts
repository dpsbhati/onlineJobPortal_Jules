import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { ValidationFilter } from './exception/validation-exception.filter';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // const isProd = process.env.NODE_ENV === 'production';


  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Content-Type, Authorization,Custom-Header',
  }); 
 
  app.setGlobalPrefix('api');
  app.use('/api/', express.static(join(__dirname, 'uploads')));

   const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The onlinejobportal API description')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

     //use validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      skipMissingProperties: false,
      skipNullProperties: true,
      exceptionFactory: ValidationFilter,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI
  SwaggerModule.setup('/api/swagger', app, document, {
    customSiteTitle: 'onlinejobportal',
  });


  // Start the server
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
