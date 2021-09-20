import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatDialog } from "@angular/material";
import { Task } from "../../tasks/task/task";
import { Label } from "../../tasks/task/label";
import { ConfirmDialogComponent, ConfirmDialogResult } from "../confirm-dialog/confirm-dialog.component";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";
import { Router } from "@angular/router";
import * as cloneDeep from "lodash/cloneDeep";
import { LoaderService } from "src/app/core/services/loader.service";

@Component({
  selector: "app-task-template-dialog",
  templateUrl: "./task-template-dialog.component.html",
  styleUrls: ["./task-template-dialog.component.scss"],
})
export class TaskTemplateDialogComponent implements OnInit {
  public isEditTemplate: boolean = false;
  public isCreatingCard: boolean = false;
  public primaryColor: string;
  public keepChecklist: boolean = true;
  public keepLabels: boolean = true;
  public curTask: Task;

  constructor(
    public dialogRef: MatDialogRef<TaskTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskTemplateDialogData,
    private dialog: MatDialog,
    private router: Router,
    private boardServiceV2: BoardServiceV2,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.primaryColor = "primary";
  }

  ngOnDestroy(): void {}

  cancel(): void {
    this.dialogRef.close();
  }

  back() {
    this.isCreatingCard = false;
  }

  selectTemplate(task: Task) {
    console.log(task);
    this.isCreatingCard = !this.isCreatingCard;
    this.curTask = cloneDeep(task);
  }

  enableEditTemplate() {
    this.isEditTemplate = !this.isEditTemplate;
  }

  editTemplate(task: Task) {
    console.log(task);
    this.router.navigate([], { queryParams: { task: `${task.id}` } });
  }

  deleteTemplate(task: Task) {
    console.log(task);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "240px",
      data: {
        message: "Delete this Template card ?"
      },
    });
    dialogRef.afterClosed().subscribe((result: ConfirmDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
      if(result.confirm) {
        this.boardServiceV2.deleteTask(this.data.boardId, task.id);
      }
    });
  }

  createTemplate() {
    console.log("Creating new template task");
    this.dialogRef.close({isCreatingTemplate: true});
  }

  async createCard() {
    this.loaderService.changeLoading(true);
    let newDueDate = null;
    let newCheckList = [];

    if (this.keepChecklist) {
      if (this.curTask.checklists && this.curTask.checklists.length > 0) {
        newCheckList = this.curTask.checklists;
      }
    }

    if(this.curTask.dueDate) {
      newDueDate = this.curTask.dueDate;
    }

    const newTask: Task = {
      index: 0,
      title: this.curTask.title,
      description: this.curTask.description,
      backgroundColor: this.curTask.backgroundColor,
      listId: this.data.taskListId,
      dueDate: newDueDate,
      checklists: newCheckList,
      created: new Date(),
      modified: new Date()
    };
    console.log(newTask);
    const taskId = await this.boardServiceV2.addTask(
      this.data.boardId,
      newTask
    );

    if (this.keepLabels) {
      const filteredLabels = this.data.labels.filter((label) => {
        if (label.taskIds) {
          return label.taskIds.includes(this.curTask.id);
        }
      });
      console.log(filteredLabels);
      filteredLabels.forEach(async (label) => {
        label.taskIds.push(taskId);
        this.boardServiceV2.updateLabel(this.data.boardId, label.id, label);
      
      });
    }

    this.loaderService.changeLoading(false);
    this.dialogRef.close();
  }

  editSelectedTemplate() {
    this.dialogRef.close();
    this.router.navigate([], { queryParams: { task: `${this.curTask.id}` } });
  }
}

export interface TaskTemplateDialogData {
  boardId: string;
  taskListId: string;
  templateTasks: Task[];
  labels: Label[];
}

export interface TaskTemplateDialogResult {
  isCreatingTemplate: boolean;
}
