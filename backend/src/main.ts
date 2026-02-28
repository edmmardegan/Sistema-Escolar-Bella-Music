import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa a validação de dados automática nos DTOs
  // Local: src/main.ts

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,

      exceptionFactory: (errors) => {
        // 🚀 ESSE LOG VAI APARECER NO SEU PM2 LOGS
        console.log('--- ERRO DE VALIDAÇÃO DETECTADO ---');
        errors.forEach((err) => {
          console.log(`Campo: ${err.property}`);
          console.log(
            `Erros: ${Object.values(err.constraints || {}).join(', ')}`,
          );
          // Se quiser ver o valor que chegou:
          console.log(`Valor recebido:`, err.value);
        });
        return new BadRequestException(errors);
      },
    }),
  );

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
