import { Day } from './availability.entity';

export interface Slot {
  startTime: string;
  endTime: string;
  maxPatients: number;
}

export interface AvailabilitySlotsResponse {
  availabilityId: number;
  day?: Day;       // for RECURRING
  date?: string;   // for CUSTOM
  slots: Slot[];
}
