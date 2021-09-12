import { Component, Input, OnInit } from "@angular/core";
import { Board } from "../board/board";
import { MatDialog } from "@angular/material";
import {
  BoardDialogComponent,
  BoardDialogResult,
} from "src/app/common/board-dialog/board-dialog.component";
import { Subscription } from "rxjs";
import { BoardService } from "src/app/core/services/board.service";
import { BoardServiceV2 } from "../../core/services/boardv2.service";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "board-list",
  templateUrl: "board.list.component.html",
  styleUrls: ["board.list.component.scss"],
})
export class BaordListComponent implements OnInit {
  public boards: Board[];
  public sharedBoards: Board[];
  private boardSubscription: Subscription;
  public isLoading: boolean;

  constructor(
    private dialog: MatDialog,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log("BOARDLIST IS INITIATED");
    this.isLoading = true;
    this.boardServiceV2.getBoards();
    this.boardSubscription = this.boardServiceV2.boardsChanged.subscribe(
      (boards) => {
        this.boards = boards;
        this.isLoading = false;
      }
    );

    this.boardServiceV2.getSharedBoards();
    this.boardSubscription = this.boardServiceV2.sharedBoardsChanged.subscribe(
      (shareBoards) => {
        this.sharedBoards = shareBoards;
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    console.log("BOARDLIST IS DESTROYED");
    this.boardSubscription.unsubscribe();
  }

  newBoard(): void {
    const dialogRef = this.dialog.open(BoardDialogComponent, {
      width: "360px",
      data: {
        board: {},
      },
    });
    dialogRef.afterClosed().subscribe((result: BoardDialogResult) => {
      if (!result) {
        return;
      }

      const board: Board = {
        title: result.board.title,
        description: result.board.description,
        owner: this.authService.getUID(),
        settings: {
          cardCoverEnabled: false,
        },
      };
      this.boardServiceV2.addBoard(board);
    });
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
