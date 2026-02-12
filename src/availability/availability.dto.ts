import {
  IsEnum,
  IsNotEmpty,
  Matches,
  IsInt,
  Min,
  Max,
} from 'class-validator';
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

  @IsInt()
  @Min(5)
  @Max(240)
  slotDuration: number;

  @IsInt()
  @Min(1)
  @Max(50)
  maxPatientsPerSlot: number;
}
