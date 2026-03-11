import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Use the express adapter default and allow Nest to bind to all interfaces
  const app = await NestFactory.create(AppModule);

  // Enable CORS. When CORS_ORIGIN is not set, allow all origins (true).
  // In some hosting environments (e.g. Railway/Vercel), passing an empty string can break CORS config,
  // so default to true to allow requests from the frontend unless explicitly restricted.
  const origin = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '' ? process.env.CORS_ORIGIN : true;
  app.enableCors({ origin });

  // Respect PORT env var provided by platforms. Fallback to 3000 locally.
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}
bootstrap();
