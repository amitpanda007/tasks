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
  public isEditing = false;
  public checklistText: string;
  public labels: Label[];

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData,
    private dialog: MatDialog,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    this.boardService.getLabels(this.data.boardId);
    this.labelListsSubscription = this.boardService.labelListChanged.subscribe(
      (labels) => {
        console.log(labels);
        this.labels = labels;
      }
    );
  }

  ngOnDestroy() {
    this.labelListsSubscription.unsubscribe();
  }

  save(): void {
    this.data.task.checklist.forEach((checklist) => {
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
    this.data.task.checklist.push(newCheckList);
    this.checklistText = "";
  }

  openLabelDialog() {
    let currentTaskLabels = [];
    if (this.data.task.labels) {
      currentTaskLabels = this.data.task.labels;
    }
    const dialogRef = this.dialog.open(LabelDialogComponent, {
      width: "360px",
      data: {
        taskLabels: currentTaskLabels,
        labels: this.labels,
        enableDelete: false,
        boardId: this.data.boardId,
      },
    });
    dialogRef.afterClosed().subscribe((result: LabelDialogResult) => {
      console.log(result);

      if (!result) {
        return;
      }

      this.data.task.labels = result.labels;
    });
  }
}

export interface TaskDialogData {
  task: Partial<Task>;
  boardId: string;
  enableDelete: boolean;
}

export interface TaskDialogResult {
  task: Task;
  delete?: boolean;
}
