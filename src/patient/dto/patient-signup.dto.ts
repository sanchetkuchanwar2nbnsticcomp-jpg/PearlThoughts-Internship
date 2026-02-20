import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class PatientSignupDto {

  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
