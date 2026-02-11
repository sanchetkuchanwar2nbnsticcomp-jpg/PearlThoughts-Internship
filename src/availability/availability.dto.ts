import { IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { Day } from './availability.entity';

export class CreateAvailabilityDto {
  @IsEnum(Day)
  day: Day;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;
}
