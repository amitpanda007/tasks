import { Component, Input, OnInit } from "@angular/core";
import { Board } from "../board/board";
import { MatDialog } from "@angular/material";
import {
  BoardDialogComponent,
  BoardDialogResult,
} from "src/app/common/board-dialog/board-dialog.component";
import { Subscription } from "rxjs";
import { BoardService } from "src/app/core/services/board.service";

@Component({
  selector: "board-list",
  templateUrl: "board.list.component.html",
  styleUrls: ["board.list.component.scss"],
})
export class BaordListComponent implements OnInit {
  public boards: Board[];
  private boardSubscription: Subscription;
  public isLoading: boolean;

  constructor(private dialog: MatDialog, private boardService: BoardService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.boardService.getBoards();
    this.boardSubscription = this.boardService.boardsChanged.subscribe(
      (boards) => {
        this.boards = boards;
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    this.boardSubscription.unsubscribe();
  }

  newBoard(): void {
    const dialogRef = this.dialog.open(BoardDialogComponent, {
      width: "270px",
      data: {
        board: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: BoardDialogResult) =>
        this.boardService.addBoard(result.board)
      );
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
