import { Task } from '../task/task';

export interface TaskList {
    id?: string;
    name: string;
    list: string;
    tasks: Task[];
  }
  