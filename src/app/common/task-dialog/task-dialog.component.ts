import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CheckList } from "src/app/tasks/task/checklist";
import { Task } from "src/app/tasks/task/task";

@Component({
  selector: "app-task-dialog",
  templateUrl: "./task-dialog.component.html",
  styleUrls: ["./task-dialog.component.scss"],
})
export class TaskDialogComponent {
  private backupTask: Partial<Task> = { ...this.data.task };
  public isEditing = false;
  public checklistText: string;

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {}

  save(): void {
    this.data.task.checklist.forEach(checklist => {
        delete checklist.isEditing;
        delete checklist.unsaved;
    });

    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.data.task.title = this.backupTask.title;
    this.data.task.description = this.backupTask.description;
    this.data.task.checklist = this.backupTask.checklist;
    // this.data.cancel = true;
    this.dialogRef.close();
  }

  toggleChecklistEditing(checklist) {
    checklist.isEditing = !checklist.isEditing;
  }

  // editCheckList() {
  //   this.isEditing = true;
  // }

  // doneEditing() {
  //   this.isEditing = false;
  // }

  updateChecklist() {
    const newCheckList: CheckList = {
      text: this.checklistText,
      done: false,
      unsaved: true,
      isEditing: false
    };
    this.data.task.checklist.push(newCheckList);
    this.checklistText = "";
  }
}

export interface TaskDialogData {
  task: Partial<Task>;
  enableDelete: boolean;
}

export interface TaskDialogResult {
  task: Task;
  delete?: boolean;
}
