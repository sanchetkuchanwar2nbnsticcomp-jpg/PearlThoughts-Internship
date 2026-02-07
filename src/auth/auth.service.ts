import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';

@Injectable()
export class AuthService {

  private client: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {

    this.client = new OAuth2Client(
      '193101481819-jgiqaai8hnm6q01fd79taadar9881elq.apps.googleusercontent.com'
    );

  }

  // ✅ Google Login
  async googleLogin(token: string) {

    try {

      // Verify Google token
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: '193101481819-jgiqaai8hnm6q01fd79taadar9881elq.apps.googleusercontent.com',
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      // Find user in DB
      let user = await this.userRepository.findOne({
        where: { email: payload.email },
      });

      // Create user if not exists
      if (!user) {

        user = this.userRepository.create({
          email: payload.email,
          name: payload.name || '',
          picture: payload.picture || '',
        });

        await this.userRepository.save(user);

        console.log("New user created:", user.email);

      } else {

        console.log("Existing user login:", user.email);

      }

      // Generate JWT
      const jwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const access_token = this.jwtService.sign(jwtPayload);

      return {
        message: "Login successful",
        access_token,
        user,
      };

    } catch (error) {

      console.error("Google auth error:", error);

      throw new UnauthorizedException("Google authentication failed");

    }

  }

  // ✅ Get all users (for browser)
  async getAllUsers() {

    try {

      const users = await this.userRepository.find();

      return {
        count: users.length,
        users,
      };

    } catch (error) {

      throw new InternalServerErrorException("Failed to fetch users");

    }

  }

  // ✅ Get user by ID
  async getUserById(id: number) {

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;

  }

}
