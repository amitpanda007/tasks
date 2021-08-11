import { CheckList } from "./checklist";

export interface BoardChecklist {
    name: string;
    disabled?: boolean;
    checklists: CheckListOption[];
}

export interface CheckListOption {
    value: number;
    viewValue: string;
    checklist: CheckList[];
}