import { Component, Input, OnInit } from "@angular/core";
import { Board } from "../board/board";
import { MatDialog } from "@angular/material";
import {
  BoardDialogComponent,
  BoardDialogResult,
} from "src/app/common/board-dialog/board-dialog.component";

@Component({
  selector: "board-list",
  templateUrl: "board.list.component.html",
  styleUrls: ["board.list.component.scss"],
})
export class BaordListComponent implements OnInit {
  boards: Board[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  newBoard(): void {
    const dialogRef = this.dialog.open(BoardDialogComponent, {
      width: "270px",
      data: {
        board: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: BoardDialogResult) => this.boards.push(result.board));
  }

  editBoard(board: Board): void {
    const dialogRef = this.dialog.open(BoardDialogComponent, {
      width: "270px",
      data: {
        board,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: BoardDialogResult) => {
      if (!result) {
        return;
      }

      const boardIndex = this.boards.indexOf(board);
      if (result.delete) {
        this.boards.splice(boardIndex, 1);
      } else {
        this.boards[boardIndex] = board;
      }
    });
  }
}
