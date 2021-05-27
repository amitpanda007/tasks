import { Label } from './label';
import { CheckList } from './checklist';

export interface Task {
  id?: string;
  title: string;
  description: string;
  labels?: Label[];
  dueDate?: string;
  checklist?: CheckList[];
}
