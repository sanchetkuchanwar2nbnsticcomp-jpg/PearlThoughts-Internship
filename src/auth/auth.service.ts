import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { Doctor } from '../doctor/doctor.entity';
import { DoctorSignupDto } from './dto/doctor-signup.dto';
import { Patient } from '../patient/patient.entity';
import { PatientSignupDto } from '../patient/dto/patient-signup.dto';
import { MailService } from './mail.service';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UpdatePatientDto } from '../patient/dto/update-patient.dto.ts';

@Injectable()
export class AuthService {
  doctorSignup(token: string, dto: DoctorSignupDto) {
    throw new Error('Method not implemented.');
  }
 
  
  patientRepo: any;
  private client: OAuth2Client;
  doctorRepo: any;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    private readonly jwtService: JwtService,

    private readonly mailService: MailService,
  ) {
    this.client = new OAuth2Client(
      '193101481819-jgiqaai8hnm6q01fd79taadar9881elq.apps.googleusercontent.com',
    );
  }

  // ======================
  // USER SIGNUP (EMAIL + PASSWORD)
  // ======================
  async userSignup(data: {
    email: string;
    name: string;
    password: string;
    role: UserRole;
  }) {
    const { email, name, password, role } = data;

    // Check if user exists
    let user = await this.userRepository.findOne({ where: { email } });
    if (user) throw new BadRequestException('Email already registered');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    user = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      role,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
    });

    await this.userRepository.save(user);

    // Send verification email
    await this.mailService.sendVerificationEmail(email, verificationToken);

    return {
      message:
        'Signup successful! Please check your email to verify your account.',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

// ======================
// GOOGLE LOGIN (EMAIL VERIFIED)
// ======================
async googleLogin(token: string, role: UserRole) {

  const payload = await this.verifyGoogleToken(token);

  if (!payload?.email)
    throw new BadRequestException('Invalid Google token');

  let user = await this.userRepository.findOne({
    where: { email: payload.email },
    relations: ['doctor', 'patient'],
  });

  if (!user) {

    const verificationToken = crypto.randomBytes(32).toString('hex');

    user = this.userRepository.create({
      email: payload.email,
      name: payload.name,
      role,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
    });

    await this.userRepository.save(user);

    await this.mailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    throw new BadRequestException(
      'Account created. Please verify your email before login.',
    );
  }

  if (!user.isEmailVerified)
    throw new UnauthorizedException(
      'Please verify your email before login.',
    );

  if (user.role !== role)
    throw new BadRequestException(
      `This email is registered as ${user.role}. Please login as ${user.role}.`,
    );


  if (role === UserRole.DOCTOR && !user.doctor) {

    const doctor = this.doctorRepository.create({ user });

    await this.doctorRepository.save(doctor);

  }


  if (role === UserRole.PATIENT && !user.patient) {

    const patient = this.patientRepository.create({ user });

    await this.patientRepository.save(patient);

  }


  return this.signToken(user);

}




  // ======================
  // UPDATE DOCTOR PROFILE
  // ======================

 async updateDoctorProfile(userId: number, updateData: any) {

  const doctor = await this.doctorRepository.findOne({
    where: {
      user: { id: userId }
    },
    relations: ['user'],
  });

  if (!doctor) {
    throw new NotFoundException('Doctor profile not found');
  }

  Object.assign(doctor, updateData);

  await this.doctorRepository.save(doctor);

  return {
    message: 'Doctor profile updated successfully',
    doctor,
  };
}


  // ======================
  // DELETE DOCTOR PROFILE
  // ======================

async deleteDoctorProfile(userId: number) {

  const doctor = await this.doctorRepository.findOne({
    where: {
      user: { id: userId }
    },
    relations: ['user'],
  });

  if (!doctor) {
    throw new NotFoundException('Doctor profile not found');
  }

  await this.doctorRepository.remove(doctor);

  return {
    message: 'Doctor profile deleted successfully',
  };
}



  // ======================
  // PATIENT SIGNUP AFTER EMAIL VERIFIED
  // ======================
  async patientSignup(token: string, dto: PatientSignupDto) {
    const payload = await this.verifyGoogleToken(token);

    const user = await this.userRepository.findOne({
      where: { email: payload.email },
      relations: ['patient'],
    });

    if (!user) throw new NotFoundException('User not found. Please login first.');
    if (!user.isEmailVerified)
      throw new BadRequestException(
        'Please verify your email before registering as patient.',
      );
    if (user.patient) throw new BadRequestException('Patient already registered.');

    user.role = UserRole.PATIENT;
    await this.userRepository.save(user);

const patient = this.patientRepository.create({
  name : dto.name,
  phone: dto.phone,
  gender: dto.gender,
  dateOfBirth: dto.dateOfBirth,
  user,
});


    await this.patientRepository.save(patient);

    return { message: 'Patient registered successfully.', patient };
  }

  // ======================
// UPDATE PATIENT PROFILE
// ======================
async updatePatientProfile(userId: number, updateData: any) {

  const patient = await this.patientRepository.findOne({
    where: {
      user: { id: userId }
    },
    relations: ['user'],
  });

  if (!patient) {
    throw new NotFoundException('Patient profile not found');
  }

  Object.assign(patient, updateData);

  await this.patientRepository.save(patient);

  return {
    message: 'Patient profile updated successfully',
    patient,
  };
}



    // ======================
  // DELETE PATIENT PROFILE
  // ======================

 async deletePatientProfile(userId: number) {

  const patient = await this.patientRepository.findOne({
    where: {
      user: { id: userId }
    },
    relations: ['user'],
  });

  if (!patient) {
    throw new NotFoundException('Patient profile not found');
  }

  await this.patientRepository.remove(patient);

  return {
    message: 'Patient profile deleted successfully'
  };
}



  // ======================
  // VERIFY EMAIL
  // ======================
  async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });
    if (!user) throw new BadRequestException('Invalid or expired verification token');

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.userRepository.save(user);

    return { message: 'Email verified successfully.' };
  }

  // ======================
  // GET USERS
  // ======================
  async getAllUsers() {
    return this.userRepository.find({ relations: ['doctor', 'patient'] });
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ======================
  // HELPERS
  // ======================
  private async verifyGoogleToken(token: string) {
    if (!token) throw new BadRequestException('Google token required');

    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience:
        '193101481819-jgiqaai8hnm6q01fd79taadar9881elq.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new UnauthorizedException('Invalid Google token');
    return payload;
  }

  private signToken(user: User) {
    const access_token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { access_token, user };
  }
}
