import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DailyTask } from "src/app/daily/daily-task/dailytask";

@Component({
  selector: "app-daily-task-dialog",
  templateUrl: "./daily-task-dialog.component.html",
  styleUrls: ["./daily-task-dialog.component.scss"],
})
export class DailyTaskDialogComponent implements OnInit {
  private backupTask: Partial<DailyTask> = { ...this.data.dailyTask };

  constructor(
    public dialogRef: MatDialogRef<DailyTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DailyTaskDialogData
  ) {}

  ngOnInit(): void {}

  cancel(): void {
    this.dialogRef.close();
  }
}

export interface DailyTaskDialogData {
  dailyTask: Partial<DailyTask>;
  enableDelete: boolean;
}

export interface DailyTaskDialogResult {
  dailyTask: DailyTask;
  delete?: boolean;
}
