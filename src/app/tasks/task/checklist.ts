import { DueDate } from "./duedate";

export interface CheckList {
  id?: string;
  text: string;
  done: boolean;
  unsaved?: boolean;
  isEditing?: boolean;
  dueDate?: DueDate;
}
