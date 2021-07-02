import { firestore } from 'firebase';
import { CheckList } from '../../tasks/task/checklist';
import { DueDate } from '../../tasks/task/duedate';

export interface DailyTask {
  id?: string;
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
}
