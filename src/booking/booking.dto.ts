import {
  IsDateString,
  Matches,
  IsNumber,
} from 'class-validator';

export class CreateBookingDto {

  @IsNumber()
  doctorId: number;


  @IsNumber()
  patientId: number;


  @IsDateString()
  date: string;


  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;


  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;
}
