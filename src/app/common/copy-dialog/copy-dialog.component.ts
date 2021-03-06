import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Board } from "../../boards/board/board";
import { TaskList } from "../../tasks/task-list/tasklist";
import { Task } from "../../tasks/task/task";
import { Label } from "../../tasks/task/label";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";
import { Activity } from "src/app/tasks/task/activity";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "app-copy-dialog",
  templateUrl: "./copy-dialog.component.html",
  styleUrls: ["./copy-dialog.component.scss"],
})
export class CopyDialogComponent implements OnInit {
  public selectedBoard: Board;
  public selectedList: TaskList;
  public copyBoards: Board[];
  public copyTaskLists: TaskList[];
  public primaryColor: string;
  public titleText: string;

  public keepChecklist: boolean = true;
  public keepLabels: boolean = true;
  public keepDueDate: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<CopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CopyDialogData,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.primaryColor = "primary";
    this.titleText = (' ' + this.data.task.title).slice(1);

    this.copyBoards = [];
    this.boardServiceV2.getBoardsAsync().then((_boards) => {
      console.log(_boards);
      _boards.forEach((board) => {
        const data = board.data() as Board;
        data.id = board.id;
        this.copyBoards.push(data);
      });

      this.selectedBoard = this.copyBoards.filter(
        (board) => board.id == this.data.boardId
      )[0];

      this.copyTaskLists = this.data.taskLists;
      this.selectedList = this.data.taskLists.filter(
        (list) => list.id == this.data.task.listId
      )[0];
    });
  }

  ngOnDestroy(): void {}

  cancel(): void {
    this.dialogRef.close();
  }

  async copy() {
    //FIXME: inxed needs to be determine where the task is getting copied to.
    const newTask: Task = {
      index: 99,
      title: this.titleText,
      description: this.data.task.description ? this.data.task.description : "",
      backgroundColor: this.data.task.backgroundColor
        ? this.data.task.backgroundColor
        : "",
      listId: this.selectedList.id,
      created: new Date(),
      modified: new Date(),
    };

    if (this.keepChecklist) {
      if (this.data.task.checklists && this.data.task.checklists.length > 0) {
        const newCheckList = this.data.task.checklists;
        newTask.checklists = newCheckList;
      }
    }
    if (this.keepDueDate) {
      if (this.data.task.dueDate) {
        const newDueDate = this.data.task.dueDate;
        newTask.dueDate = newDueDate;
      }
    }


    const activity = this.createNewActivity(
      `Copied from task <b>${this.data.task.title}</b>.`
    );
    newTask.activities = [];
    newTask.activities.push(activity);

    let filteredLabels: Label[] = [];
    let updateLabels: Label[] = [];
    let createLabels: Label[] = [];
    let labelsFromNewBoard: Label[] = [];

    if (this.keepLabels) {
      filteredLabels = this.data.labels.filter((label) => {
        if (label.taskIds) {
          return label.taskIds.includes(this.data.task.id);
        }
      });

      if (this.selectedBoard.id == this.data.boardId) {
        // isUpdateLabel = true;
        updateLabels = filteredLabels;
      } else {
        // isCreateLabel = true;
        const labelSnapstot = await this.boardServiceV2.getLabelsSnapshot(
          this.selectedBoard.id
        );
        labelSnapstot.forEach((label) => {
          const newLabel = label.data() as Label;
          newLabel.id = label.id;
          labelsFromNewBoard.push(newLabel);
        });

        console.log(labelsFromNewBoard);
        // Check if filtered labels exist in new board then add them to updateLabels else add them to createLabels
        filteredLabels.forEach((fltrLabel) => {
          let itemFound = false;
          labelsFromNewBoard.forEach((label) => {
            if (fltrLabel.name == label.name) {
              updateLabels.push(label);
              itemFound = true;
            }
          });
          if (!itemFound) {
            createLabels.push(fltrLabel);
          }
        });
      }
    }

    this.boardServiceV2.copyTaskBatch(
      newTask,
      this.selectedBoard.id,
      updateLabels,
      createLabels
    );
    this.dialogRef.close();
  }

  createNewActivity(action: string): Activity {
    const activity: Activity = {
      id: this.authService.getUID(),
      user: this.authService.getUserDisplayName(),
      action: action,
      dateTime: new Date(),
    };
    return activity;
  }

  async boardSelected($event) {
    console.log($event);
    this.selectedBoard = $event.value;
    this.copyTaskLists = [];
    this.boardServiceV2
      .getTaskListAsync(this.selectedBoard.id)
      .then((_tasklist) => {
        _tasklist.forEach((list) => {
          const data = list.data() as TaskList;
          data.id = list.id;
          this.copyTaskLists.push(data);
        });
      });
  }

  async listSelected($event) {
    console.log($event);
    this.selectedList = $event.value;
  }
}

export interface CopyDialogData {
  boardId: string;
  taskLists: TaskList[];
  task: Task;
  labels: Label[];
}

export interface CopyDialogResult {
  name: string;
}
