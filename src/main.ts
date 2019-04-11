import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  process.env.TZ = 'US/Hawaii';
  process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
  process.env.EXPITARION = process.env.EXPITARION || '12h';
  process.env.SEED = process.env.SEED || 'chucho';
  process.env.kwhV = process.env.kwhV || '217.53';
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 3000);

  console.log(process.env.urlDB);
}

bootstrap();
