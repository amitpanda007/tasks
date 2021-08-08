import { SharedUser } from "src/app/boards/board/board";
import { DueDate } from "./duedate";
import { TaskChecklist } from "./taskchecklist";
import { TaskLock } from "./tasklock";

export interface Task {
  id?: string;
  index: number;
  listId: string;
  title: string;
  description: string;
  backgroundColor?: string;
  dueDate?: DueDate;
  checklists?: TaskChecklist[];
  members?: SharedUser[];
  message?: string;
  lockStatus?: TaskLock;
  created: Date;
  modified: Date;
}
