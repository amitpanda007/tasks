import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { BoardService } from "src/app/core/services/board.service";
import { CheckList } from "src/app/tasks/task/checklist";
import { Label } from "src/app/tasks/task/label";
import { Task } from "src/app/tasks/task/task";
import {
  DeleteConfirmationDialogComponent,
  DeleteConfirmationDialogResult,
} from "../delete.dialog.component";
import {
  LabelDialogComponent,
  LabelDialogResult,
} from "../label-dialog/label-dialog.component";

@Component({
  selector: "app-task-dialog",
  templateUrl: "./task-dialog.component.html",
  styleUrls: ["./task-dialog.component.scss"],
})
export class TaskDialogComponent implements OnInit {
  private labelListsSubscription: Subscription;
  private backupTask: Partial<Task> = { ...this.data.task };
  private labels: Label[] = { ...this.data.labels };
  public isEditing = false;
  public checklistText: string;
  public checklistCompleted: number;
  private totalChecklist: number;
  private doneChecklist: number;

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData,
    private dialog: MatDialog,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.calculateChecklistCompleted();
  }

  calculateChecklistCompleted() {
    this.checklistCompleted = 0;
    this.doneChecklist = 0;
    if (this.data.task.checklist && this.data.task.checklist.length > 0) {
      this.totalChecklist = this.data.task.checklist.length;
      this.data.task.checklist.forEach((checklist) => {
        if (checklist.done) {
          this.doneChecklist += 1;
        }
      });
      this.checklistCompleted = Math.floor(
        (this.doneChecklist / this.totalChecklist) * 100
      );
    }
  }

  checklistClicked(checklist: CheckList) {
    if (checklist.done) {
      this.doneChecklist -= 1;
    } else {
      this.doneChecklist += 1;
    }
    this.checklistCompleted = Math.floor(
      (this.doneChecklist / this.totalChecklist) * 100
    );
  }

  save(): void {
    if (this.data.task.checklist && this.data.task.checklist.length > 0) {
      this.data.task.checklist.forEach((checklist) => {
        delete checklist.isEditing;
        delete checklist.unsaved;
      });
    }

    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.data.task.title = this.backupTask.title;
    this.data.task.description = this.backupTask.description;
    this.data.task.checklist = this.backupTask.checklist;
    // this.data.cancel = true;
    this.dialogRef.close();
  }

  delete() {
    const delDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: "240px",
      disableClose: true,
    });

    delDialogRef
      .afterClosed()
      .subscribe((result: DeleteConfirmationDialogResult) => {
        if (result.delete) {
          this.dialogRef.close({ task: this.data.task, delete: true });
        }
      });
  }

  toggleChecklistEditing(checklist: CheckList) {
    checklist.isEditing = !checklist.isEditing;
  }

  updateChecklist() {
    const newCheckList: CheckList = {
      text: this.checklistText,
      done: false,
      unsaved: true,
      isEditing: false,
    };
    if (!this.data.task.checklist) {
      this.data.task.checklist = [];
    }
    this.data.task.checklist.push(newCheckList);
    this.checklistText = "";
  }

  openLabelDialog() {
    const allLabels = [...this.data.labels];
    const dialogRef = this.dialog.open(LabelDialogComponent, {
      width: "360px",
      data: {
        labels: allLabels,
        enableDelete: false,
        taskId: this.data.task.id,
        boardId: this.data.boardId,
      },
    });
    dialogRef.afterClosed().subscribe((result: LabelDialogResult) => {
      if (!result) {
        return;
      }

      console.log(result);

      result.labels.forEach((label) => {
        delete label.isSelected;
      });

      this.data.labels = result.labels;
      this.data.updatedLabels = result.updatedLabels;
    });
  }

  isAddLabelDisabled() {
    return !this.data.task.id;
  }
}

export interface TaskDialogData {
  task: Partial<Task>;
  labels: Label[];
  updatedLabels?: string[];
  boardId: string;
  enableDelete: boolean;
}

export interface TaskDialogResult {
  task: Task;
  delete?: boolean;
  labels?: Label[];
  updatedLabels?: Label[];
}
