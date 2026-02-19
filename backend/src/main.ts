import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa a validação de dados automática nos DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Configuração de CORS aberta para facilitar a demonstração na rede interna
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const port = process.env.PORT || 5000;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend rodando em: http://localhost:${port}`);
}
bootstrap();
