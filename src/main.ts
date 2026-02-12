import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

console.log('CWD:', process.cwd());
console.log('RAW ENV:', process.env.OPENAI_API_KEY);


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
