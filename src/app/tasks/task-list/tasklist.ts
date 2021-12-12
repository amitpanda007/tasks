import { Task } from "../task/task";

export interface TaskList {
  id?: string;
  name: string;
  list: string;
  sortOrder?: string;
  tasks?: Task[];
  index: number;
  isEditing?: boolean;
  backgroundColor?: string;
  created: Date;
  modified: Date;
}
