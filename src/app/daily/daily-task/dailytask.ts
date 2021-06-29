export interface DailyTask {
  id?: string;
  title: string;
  description?: string;
  isComplete: boolean;
  created: Date;
  modified: Date;
}
