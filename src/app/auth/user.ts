export interface User {
  id: string;
  name: string;
  email: string;
  creationDate: Date;
  modifiedDate?: Date;
  permission?: Permission;
  avatarImg?: string;
}

export interface Permission {
  admin: boolean;
  normal: boolean;
  owner: boolean;
}
