import {
  IsEnum,
  IsOptional,
  Matches,
  IsInt,
  Min,
  Max,
} from 'class-validator';

import { Day } from './availability.entity';
import {
  SchedulingType,
  AvailabilityType,
} from './availability.enum';

export class CreateAvailabilityDto {

  @IsEnum(AvailabilityType)
  availabilityType: AvailabilityType;

  @IsOptional()
  @IsEnum(Day)
  day?: Day;

  @IsOptional()
  date?: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;

  @IsEnum(SchedulingType)
  schedulingType: SchedulingType;

  // WAVE only
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(240)
  slotDuration?: number;

  // STREAM & WAVE both use this now
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxPatientsPerSlot?: number;
}
