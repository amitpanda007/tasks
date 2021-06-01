import { Label } from './label';
import { CheckList } from './checklist';

export interface Task {
  id?: string;
  listId: string;
  title: string;
  description: string;
  dueDate?: string;
  checklist?: CheckList[];
}
