import { Task } from "../task/task";

export interface TaskList {
  id?: string;
  name: string;
  list: string;
  sortOrder?: string;
  tasks?: Task[];
}
