import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  root() {
    return {
      message: 'NestJS API is running',
    };
  }

  @Get('hello')
  getHello() {
    return {
      message: 'Hello from NestJS 🚀',
    };
  }
}
