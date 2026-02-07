import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  // ✅ Browser test route
  @Get()
  testAuth() {
    return {
      status: true,
      message: "Auth server is running",
      endpoints: {
        googleLogin: "POST /auth/google",
        getUsers: "GET /auth/users",
        getUserById: "GET /auth/users/:id",
      },
    };
  }


  // ✅ Google Login
  @Post('google')
  async googleLogin(@Body('token') token: string) {

    if (!token) {
      throw new BadRequestException('Google token is required');
    }

    try {

      console.log("Received Google token");

      const result = await this.authService.googleLogin(token);

      return {
        status: true,
        message: result.message,
        access_token: result.access_token,
        user: result.user,
      };

    } catch (error) {

      console.error("Google login failed:", error.message);

      throw new HttpException(
        {
          status: false,
          message: "Google authentication failed",
        },
        HttpStatus.UNAUTHORIZED,
      );

    }

  }


  // ✅ Get all users (OPEN IN BROWSER)
  @Get('users')
  async getUsers() {

    try {

      return await this.authService.getAllUsers();

    } catch (error) {

      throw new HttpException(
        "Failed to fetch users",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    }

  }


  // ✅ Get user by ID (OPEN IN BROWSER)
  @Get('users/:id')
  async getUser(@Param('id') id: number) {

    try {

      const user = await this.authService.getUserById(id);

      return {
        status: true,
        user,
      };

    } catch (error) {

      throw new HttpException(
        "User not found",
        HttpStatus.NOT_FOUND,
      );

    }

  }

}
