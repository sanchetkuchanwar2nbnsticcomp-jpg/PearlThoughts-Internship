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
  @IsEnum(Day, { message: `day must be one of: ${Object.values(Day).join(', ')}` })
  day: Day;

  @IsNotEmpty({ message: 'startTime is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:MM format' })
  startTime: string;

  @IsNotEmpty({ message: 'endTime is required' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:MM format' })
  endTime: string;

  @IsInt({ message: 'slotDuration must be an integer' })
  @Min(5, { message: 'slotDuration cannot be less than 5 minutes' })
  @Max(240, { message: 'slotDuration cannot be more than 240 minutes' })
  slotDuration: number;

  @IsInt({ message: 'maxPatientsPerSlot must be an integer' })
  @Min(1, { message: 'maxPatientsPerSlot cannot be less than 1' })
  @Max(50, { message: 'maxPatientsPerSlot cannot be more than 50' })
  maxPatientsPerSlot: number;

 
}
