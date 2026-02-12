export interface Slot {
  startTime: string;
  endTime: string;
  maxPatients: number;
}

export interface AvailabilitySlotsResponse {
  availabilityId: number;
  day: string;
  slots: Slot[];
}
