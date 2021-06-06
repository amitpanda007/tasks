import { CheckList } from "./checklist";
import { DueDate } from "./duedate";

export interface Task {
  id?: string;
  listId: string;
  title: string;
  description: string;
  backgroundColor?: string;
  dueDate?: DueDate;
  checklist?: CheckList[];
}
