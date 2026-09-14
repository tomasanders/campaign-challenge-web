export interface Participant {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  country_code: string;
  marketing_opt_in: boolean;
}

export interface CreateParticipantPayload {
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  country_code: string;
  marketing_opt_in: boolean;
}

export interface SignupResponse {
  participant: Participant;
  message: string;
}

export interface RailsValidationErrors {
  errors: Record<string, string[]>;
}
