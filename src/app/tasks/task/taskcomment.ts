export interface TaskComment {
  id?: string;
  userName: string;
  userId: string;
  text: string;
  created: Date;
  modified: Date;
  isEditing?: boolean;
  timePassed?: string;
}
