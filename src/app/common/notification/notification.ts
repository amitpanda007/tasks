export interface AppNotification {
  id?: string;
  text: string;
  description?: string;
  isRead: boolean;
  created: Date;
  modified?: Date;
}
