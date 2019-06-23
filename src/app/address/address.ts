export interface Address {
  addressType: AddressType;
  isPrimary: boolean;
  street: string;
  city: string;
  postcode: number;
  state: State;
  country: string;
}

export enum AddressType {
  Postal = 'Postal',
  Residential = 'Residential'
}

export enum State {
  ACT = 'ACT',
  NSW = 'NSW',
  NT = 'NT',
  QLD = 'QLD',
  SA = 'SA',
  TAS = 'TAS',
  VIC = 'VIC',
  WA = 'WA'
}
