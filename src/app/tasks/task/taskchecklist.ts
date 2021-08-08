import { CheckList } from "./checklist";

export interface TaskChecklist {
  checklistName: string;
  checklist: CheckList[];
  showHideCompletedTask?: boolean;
  checklistText?: string;
  checklistCompleted?: number;
  doneChecklist?: number;
  totalChecklist?: number;
}
