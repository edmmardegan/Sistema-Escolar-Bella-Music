import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config'; // 👈 Importação necessária

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🚀 Pega o serviço de configuração para ler os arquivos .env corretamente
  const configService = app.get(ConfigService);

  // Ativa a validação de dados automática nos DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      exceptionFactory: (errors) => {
        errors.forEach((err) => {
          //console.log(`Campo: ${err.property}`);
          //console.log(`Erros: ${Object.values(err.constraints || {}).join(', ')}`,);
          //console.log(`Valor recebido:`, err.value);
        });
        return new BadRequestException(errors);
      },
    }),
  );

  // Configuração de CORS aberta para facilitar a demonstração na rede interna
  app.enableCors({
    origin: (origin, callback) => {
      // Permite qualquer origem (inclusive seu IP e localhost) para teste
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 🧐 Agora ele busca 'PORT' do ConfigService (prioridade .env.production)
  // Se não encontrar em lugar nenhum, ele usa 5000 como última opção.
  const port = configService.get<number>('PORT') || 5000;

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Backend rodando em: http://localhost:${port}`);
}
bootstrap();
