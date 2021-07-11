import { firestore } from "firebase";
import { CheckList } from "../../tasks/task/checklist";
import { DueDate } from "../../tasks/task/duedate";

export interface DailyTask {
  id?: string;
  index: number;
  title: string;
  description?: string;
  isComplete: boolean;
  created: any;
  modified: any;
  checklist?: CheckList[];
  dueDate?: DueDate;
  backgroundColor?: string;
  estimatedTime?: string;
  elapsedTime?: string;
  reminder?: Date;
  status?: string;
  priority?: string;
  message?: string;
}
