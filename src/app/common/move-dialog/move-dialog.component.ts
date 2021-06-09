import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";
import { Subscribable, Subscription } from 'rxjs';
import { BoardService } from '../../core/services/board.service';
import { Board } from '../../boards/board/board';
import { TaskList } from '../../tasks/task-list/tasklist';

@Component({
  selector: "app-move-dialog",
  templateUrl: "./move-dialog.component.html",
  styleUrls: ["./move-dialog.component.scss"],
})
export class MoveDialogComponent implements OnInit{
  private boardListSubscription: Subscription;
  private taskListSubscription: Subscription;
  public selectedBoard: Board;
  public selectedList: TaskList;
  public boards: Board[];
  public taskLists: TaskList[];

  constructor(
    public dialogRef: MatDialogRef<MoveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoveDialogData,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.boardService.getBoards();
    this.boardListSubscription = this.boardService.boardsChanged.subscribe(_boards => {
      console.log(_boards);
      this.boards = _boards;
    });
  }

  ngOnDestroy(): void {
    this.boardListSubscription.unsubscribe();
    this.taskListSubscription.unsubscribe();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  move() {
    if(this.selectedBoard && this.selectedList) {
      // console.log(this.selectedBoard.id, this.data.taskId, this.selectedList.id);
      this.boardService.moveTasks(this.selectedBoard.id, this.data.taskId, this.selectedList.id);
    }
    this.dialogRef.close();
  }

  async boardSelected($event) {
    // console.log($event);
    this.selectedBoard = $event.value;
    this.boardService.getTaskList(this.selectedBoard.id);
    this.taskListSubscription = this.boardService.taskListsChanged.subscribe(_tasklist => {
      // console.log(_tasklist);
      this.taskLists = _tasklist;
    });
  }

  async listSelected($event) {
    // console.log($event);
    this.selectedList = $event.value;
  }
}

export interface MoveDialogData {
  taskId: string;
}

export interface MoveDialogResult {
  name: string;
}
