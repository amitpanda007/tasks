import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Task } from "src/app/tasks/task/task";

@Component({
  selector: "app-task-edit-dialog",
  templateUrl: "./task-edit-dialog.component.html",
  styleUrls: ["./task-edit-dialog.component.scss"],
})
export class TaskEditDialogComponent {
  private backupTask: Partial<Task> = { ...this.data.task };

  constructor(
    public dialogRef: MatDialogRef<TaskEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskEditDialogData
  ) {}

  cancel(): void {
    this.data.task.title = this.backupTask.title;
    this.data.task.description = this.backupTask.description;
    this.dialogRef.close(this.data);
  }
}

export interface TaskEditDialogData {
  task: Partial<Task>;
  enableDelete: boolean;
}

export interface TaskEditDialogResult {
  task: Task;
  delete?: boolean;
}
