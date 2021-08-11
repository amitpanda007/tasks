import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BoardChecklist, CheckListOption } from "src/app/tasks/task/boardchecklist";
import { CheckList } from "src/app/tasks/task/checklist";
import { TaskChecklist } from "src/app/tasks/task/taskchecklist";

@Component({
  selector: "app-checklist-dialog",
  templateUrl: "./checklist-dialog.component.html",
  styleUrls: ["./checklist-dialog.component.scss"],
})
export class ChecklistDialogComponent {
  public checklistName: string;
  private copyChecklistData: CheckList[];

  constructor(
    public dialogRef: MatDialogRef<ChecklistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChecklistDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    const data = [];
    this.dialogRef.close({
      checklistName: this.checklistName.trim(),
      checklistData: this.copyChecklistData && this.copyChecklistData.length > 0 ? this.copyChecklistData : [],
    });
  }

  optionsSelectionChange(event, checklistOption: CheckListOption){
    if(event.isUserInput) {
      console.log(checklistOption);
      this.copyChecklistData = checklistOption.checklist;
    }
  }
}

export interface ChecklistDialogData {
  boardChecklists?: BoardChecklist[];
}

export interface ChecklistDialogResult {
  checklistName: string;
  checklistData?: CheckList[];
}
