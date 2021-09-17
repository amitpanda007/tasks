import { AddRemovePermission, CommentingPermission } from "src/app/common/board-settings/board-settings-dialog.component";

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
  closed?: boolean;
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
  commentingPermission: CommentingPermission;
  addRemovePermission: AddRemovePermission;
}
