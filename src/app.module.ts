import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '@#sanchet',
      database: 'hello_nest_db',

      // automatically load entities from modules
      autoLoadEntities: true,

      // auto create tables (ONLY for development)
      synchronize: true,

      // optional but recommended
      logging: true,
    }),

    AuthModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
