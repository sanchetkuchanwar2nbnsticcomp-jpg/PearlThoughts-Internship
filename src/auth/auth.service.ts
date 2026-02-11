import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './user.entity';
import { Doctor } from '../doctor/doctor.entity';
import { DoctorSignupDto } from './dto/doctor-signup.dto';
import * as crypto from 'crypto';
import { MailService } from './mail.service';



@Injectable()
export class AuthService {
  getAllUsers() {
    throw new Error('Method not implemented.');
  }
  getUserById(arg0: number) {
    throw new Error('Method not implemented.');
  }
  private client: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,

    private readonly jwtService: JwtService,

    private readonly mailService: MailService,
  ) {
    this.client = new OAuth2Client(
      '193101481819-jgiqaai8hnm6q01fd79taadar9881elq.apps.googleusercontent.com',
    );
  }

  // =========================
  // GOOGLE LOGIN (USER / DOCTOR)
  // =========================
  async googleLogin(token: string, DOCTOR: UserRole) {
    const payload = await this.verifyGoogleToken(token);

    let user = await this.userRepository.findOne({
      where: { email: payload.email },
      relations: ['doctor'],
    });

    if (!user) {
      user = this.userRepository.create({
        email: payload.email,
        name: payload.name || '',
        picture: payload.picture || '',
        role: UserRole.USER,
      });

      await this.userRepository.save(user);
    }

    return this.signToken(user);
  }

  // =========================
  // DOCTOR SIGNUP (Google)
  // =========================
 async doctorSignup(token: string, dto: DoctorSignupDto) {
  const payload = await this.verifyGoogleToken(token);

  let user = await this.userRepository.findOne({
    where: { email: payload.email },
    relations: ['doctor'],
  });

  if (user?.doctor) {
    throw new BadRequestException('Doctor already registered');
  }

  // 🔥 Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  if (!user) {
    user = this.userRepository.create({
      email: payload.email,
      name: payload.name || 'Doctor',
      picture: payload.picture || '',
      role: UserRole.DOCTOR,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
    });
  } else {
    user.role = UserRole.DOCTOR;
    user.isEmailVerified = false;
    user.emailVerificationToken = verificationToken;
  }

  await this.userRepository.save(user);

  const doctor = this.doctorRepository.create({
    name: user.name,
    specialization: dto.specialization ?? '',
    experience: dto.experience,
    level: dto.level,
    consultationFee: dto.consultationFee,
    user,
  });

  await this.doctorRepository.save(doctor);
  
  await this.mailService.sendVerificationEmail(
  user.email,
  verificationToken,
);


  return {
    message: 'Doctor registered. Please verify email.',
    verificationToken, // remove in production

    
  };
}

  

 
  // =========================
  // HELPERS
  // =========================
  private async verifyGoogleToken(token: string) {
    if (!token) throw new BadRequestException('Google token required');

    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience:
        '193101481819-jgiqaai8hnm6q01fd79taadar9881elq.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return payload;
  }

  private async signToken(user: User) {
    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token,
      user,
    };
  }
}
