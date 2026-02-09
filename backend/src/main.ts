import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Altere a configuração do CORS para isso:
  app.enableCors({
    origin: '*', // Isso libera o acesso de qualquer IP (perfeito para sua rede interna)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
