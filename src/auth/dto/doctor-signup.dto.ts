import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class DoctorSignupDto {
  @IsString()
  token: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsInt()
  @Min(0)
  experience: number;

  @IsString()
  level: string;

  @IsInt()
  @Min(0)
  consultationFee: number;
}
