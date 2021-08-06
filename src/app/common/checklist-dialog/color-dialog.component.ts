import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ColorEvent } from "ngx-color";
import { CheckList } from "src/app/tasks/task/checklist";
import { TaskChecklist } from "src/app/tasks/task/taskchecklist";

@Component({
  selector: "app-color-dialog",
  templateUrl: "./color-dialog.component.html",
  styleUrls: ["./color-dialog.component.scss"],
})
export class ChecklistDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ChecklistDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChecklistDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({  });
  }
}

export interface ChecklistDialogData {
  boardChecklists?: TaskChecklist[];
}

export interface ChecklistDialogResult {
  checklistName: string;
  checklistData?: string;
}
