import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CheckList } from "src/app/tasks/task/checklist";
import { TaskChecklist } from "src/app/tasks/task/taskchecklist";

@Component({
  selector: "app-checklist-dialog",
  templateUrl: "./checklist-dialog.component.html",
  styleUrls: ["./checklist-dialog.component.scss"],
})
export class ChecklistDialogComponent {
  public checklistName: string;

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
      checklistData: data,
    });
  }

  checklistSelectionCHanged(selected: any) {
    console.log(selected);
  }
}

export interface ChecklistDialogData {
  boardChecklists?: TaskChecklist[];
}

export interface ChecklistDialogResult {
  checklistName: string;
  checklistData?: CheckList[];
}
