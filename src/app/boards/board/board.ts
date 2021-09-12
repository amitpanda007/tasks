export interface Board {
  id?: string;
  title: string;
  description: string;
  owner: string;
  shared?: Array<string>;
  sharedUserInfo?: SharedUser[];
  favourite?: Array<string>;
  backgroundUrl?: string;
  backgroundColors?: BGColor;
  settings: Settings;
}

export interface SharedUser {
  id: string;
  name: string;
  isAdded?: boolean;
  permission?: Permission;
  isCurrentUser?: boolean;
}
export interface Permission {
  admin: boolean;
  normal: boolean;
}
export interface BGColor {
  primary?: any;
  secondary?: any;
}

export interface Settings {
  cardCoverEnabled: boolean;
}
