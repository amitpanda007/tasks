export interface Activity {
  id: string;
  user: string;
  action: string;
  dateTime: Date;
  taskTitle?: string;
  taskId?: string;
}
