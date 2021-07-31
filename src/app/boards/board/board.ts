export interface Board {
  id?: string;
  title: string;
  description: string;
  owner: string;
  shared?: string[];
  sharedUserInfo?: SharedUser[];
  favourite?: boolean;
}

export interface SharedUser {
  id: string;
  name: string;
  isAdded?: boolean;
}
