import { SharedUser } from "src/app/boards/board/board";
import { DueDate } from "./duedate";

export interface CheckList {
  id?: string;
  text: string;
  done: boolean;
  unsaved?: boolean;
  isEditing?: boolean;
  dueDate?: DueDate;
  members?: SharedUser[];
  hide?: boolean;
}
