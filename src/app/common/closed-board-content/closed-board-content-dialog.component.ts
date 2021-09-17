import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { Board } from "src/app/boards/board/board";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";

@Component({
  selector: "app-closed-board-content-dialog",
  templateUrl: "./closed-board-content-dialog.component.html",
  styleUrls: ["./closed-board-content-dialog.component.scss"],
})
export class ClosedBoardContentDialogComponent{

  constructor(
    public dialogRef: MatDialogRef<ClosedBoardContentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClosedBoardContentDialogData,
    private dialog: MatDialog,
    private boardServiceV2: BoardServiceV2
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  deletePermanently(board: Board) {
    this.boardServiceV2.deleteBoard(board.id);
    const index = this.data.closedBoards.indexOf(board);
    this.data.closedBoards.splice(index, 1);
  }

  reopenBoard(board: Board) {
    board.closed = false;
    this.boardServiceV2.updateBoard(board.id, board);
    const index = this.data.closedBoards.indexOf(board);
    this.data.closedBoards.splice(index, 1);
  }
}

export interface ClosedBoardContentDialogData {
  closedBoards: Board[];
}

export interface ClosedBoardContentDialogResult {
  delete?: boolean;
}