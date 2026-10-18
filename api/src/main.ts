import { json } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { resolveCorsOrigins } from './config/resolve-cors-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '32mb' }));

  app.enableCors({
    origin: resolveCorsOrigins(process.env),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  // DOTY_HOST=127.0.0.1 (VSCode) keeps the API off the network.
  const host = process.env.DOTY_HOST;
  await (host ? app.listen(port, host) : app.listen(port));
}

bootstrap().catch((err) => console.error(err));
