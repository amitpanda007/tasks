import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { Board } from "../../boards/board/board";
import { TaskList } from "../../tasks/task-list/tasklist";
import { Label } from "src/app/tasks/task/label";
import { Task } from "src/app/tasks/task/task";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";
import * as cloneDeep from "lodash/cloneDeep";
import { Activity } from "src/app/tasks/task/activity";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "app-move-dialog",
  templateUrl: "./move-dialog.component.html",
  styleUrls: ["./move-dialog.component.scss"],
})
export class MoveDialogComponent implements OnInit {
  private boardListSubscription: Subscription;
  private taskListSubscription: Subscription;
  public selectedBoard: Board;
  public selectedList: TaskList;
  public currentList: TaskList;
  public moveBoards: Board[];
  public moveTaskLists: TaskList[];

  constructor(
    public dialogRef: MatDialogRef<MoveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoveDialogData,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.moveBoards = [];
    this.boardServiceV2.getBoardsAsync().then((_boards) => {
      console.log(_boards);
      _boards.forEach((board) => {
        const data = board.data() as Board;
        data.id = board.id;
        this.moveBoards.push(data);
      });

      this.selectedBoard = this.moveBoards.filter(
        (board) => board.id == this.data.boardId
      )[0];

      this.moveTaskLists = this.data.taskLists;
      this.selectedList = this.data.taskLists.filter(
        (list) => list.id == this.data.task.listId
      )[0];

      this.currentList = cloneDeep(this.selectedList);
    });
  }

  ngOnDestroy(): void {}

  cancel(): void {
    this.dialogRef.close();
  }

  async move() {
    if (this.selectedBoard && this.selectedList) {
      const newTask: Task = cloneDeep(this.data.task);
      
      const activity = this.createNewActivity(
        `Moved this task from <b>${this.currentList.name}</b> to <b>${this.selectedList.name}</b>.`
      );

      if(!newTask.activities) {
        newTask.activities = [];
      }
      newTask.activities.push(activity);


      if (this.selectedBoard.id == this.data.boardId) {
        if (this.selectedList.id == newTask.listId) {
          return;
        }

        newTask.listId = this.selectedList.id;
        this.boardServiceV2.updateTask(
          this.selectedBoard.id,
          newTask.id,
          newTask
        );
      } else {
        delete newTask.members;
        newTask.listId = this.selectedList.id;

        let filteredLabels: Label[] = [];
        let updateLabels: Label[] = [];
        let createLabels: Label[] = [];
        let labelsFromNewBoard: Label[] = [];

        filteredLabels = this.data.labels.filter((label) => {
          if (label.taskIds) {
            return label.taskIds.includes(this.data.task.id);
          }
        });

        const labelSnapstot = await this.boardServiceV2.getLabelsSnapshot(
          this.selectedBoard.id
        );
        labelSnapstot.forEach((label) => {
          const newLabel = label.data() as Label;
          newLabel.id = label.id;
          labelsFromNewBoard.push(newLabel);
        });

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

        this.boardServiceV2.moveBoardTaskBatch(
          newTask,
          this.data.boardId,
          this.selectedBoard.id,
          updateLabels,
          createLabels,
          true
        );
      }
    }
    this.dialogRef.close();
  }

  async boardSelected($event) {
    this.selectedBoard = $event.value;
    this.moveTaskLists = [];
    this.boardServiceV2
      .getTaskListAsync(this.selectedBoard.id)
      .then((_tasklist) => {
        _tasklist.forEach((list) => {
          const data = list.data() as TaskList;
          data.id = list.id;
          this.moveTaskLists.push(data);
        });
      });
  }

  async listSelected($event) {
    this.selectedList = $event.value;
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
}

export interface MoveDialogData {
  task: Task;
  boardId: string;
  labels: Label[];
  taskLists: TaskList[];
}

export interface MoveDialogResult {
  targetListId: string;
}
