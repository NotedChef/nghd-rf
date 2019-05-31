import { Address } from '../address/address';

export interface Patient {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  // dob: Date;
  addresses: Address[];
}
