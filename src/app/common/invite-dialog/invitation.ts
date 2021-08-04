export interface Invitation {
    id?: string;
    creator: string;
    acceptedUser?: string;
    accepted: boolean;
    created: Date;
    modified?: Date;
  }
  