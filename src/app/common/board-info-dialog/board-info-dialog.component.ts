import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogConfig,
  MatDialog,
} from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { Board } from "src/app/boards/board/board";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";

@Component({
  selector: "app-board-info-dialog",
  templateUrl: "./board-info-dialog.component.html",
  styleUrls: ["./board-info-dialog.component.scss"],
})
export class BoardInfoDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef =
    this.data.positionRelativeToElement;
  private boardSubscription: Subscription;
  public boards: Board[] = [];
  public sharedBoards: Board[] = [];
  public templateBoards: Board[] = [];
  public sharedTemplateBoards: Board[] = [];
  public topTemplateBoards: Board[] = [];
  public isShowingTemplateBoard: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<BoardInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardInfoDialogData,
    private dialog: MatDialog,
    private boardServiceV2: BoardServiceV2
  ) {}

  ngOnInit(): void {
    const matDialogConfig = new MatDialogConfig();
    const rect: DOMRect =
      this.positionRelativeToElement.nativeElement.getBoundingClientRect();

    if (this.data.isCreate) {
      matDialogConfig.position = {
        top: `${rect.bottom + 14}px`,
        left: `${rect.left - 284}px`,
      };
    } else {
      matDialogConfig.position = {
        top: `${rect.bottom + 2}px`,
        left: `${rect.left + 2}px`,
      };
    }
    this.dialogRef.updatePosition(matDialogConfig.position);

    let apiCalled: boolean = false;
    this.boardSubscription = this.boardServiceV2.boardsChanged.subscribe(
      (boards: Board[]) => {
        this.boards = [];
        console.log(boards);
        // this.boards = boards;
        if (boards) {
          boards.forEach((board) => {
            if (!board.isTemplate) {
              this.boards.push(board);
            } else {
              this.templateBoards.push(board);
            }
          });
        }
        if (boards && boards.length == 0 && !apiCalled) {
          this.boardServiceV2.getBoards();
          apiCalled = true;
        }
      }
    );

    let sharedApiCalled: boolean = false;
    this.boardSubscription = this.boardServiceV2.sharedBoardsChanged.subscribe(
      (sharedBoards: Board[]) => {
        this.sharedBoards = [];
        console.log(sharedBoards);
        if (sharedBoards) {
          sharedBoards.forEach((sharedBoard) => {
            if (!sharedBoard.isTemplate) {
              this.sharedBoards.push(sharedBoard);
            } else {
              this.sharedTemplateBoards.push(sharedBoard);
            }
          });
        }
        if (sharedBoards && sharedBoards.length == 0 && !sharedApiCalled) {
          this.boardServiceV2.getSharedBoards();
          sharedApiCalled = true;
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.boardSubscription) {
      this.boardSubscription.unsubscribe();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  openBoard(boardId: string) {
    this.dialogRef.close({
      isBoardSelected: true,
      boardId: boardId,
    });
  }

  createFromTemplateBoard(board: Board) {
    this.dialogRef.close({
      isInternalTemplateSelected: true,
      board: board,
    });
  }

  createFromExternalTemplateBoard(board: Board) {
    this.dialogRef.close({
      isExternalTemplateSelected: true,
      board: board,
    });
  }

  createNewBoard() {
    console.log("Creating New Board");
    this.dialogRef.close({ createBoard: true });
  }

  createNewTemplateBoard() {
    console.log("Creating New Board from Template");
    this.isShowingTemplateBoard = true;
  }

  exploreTemplates() {
    console.log("Exploring Templates");
    this.dialogRef.close({ navigateTemplate: true });
  }
}

export interface BoardInfoDialogData {
  positionRelativeToElement: ElementRef;
  isCreate?: boolean;
}

export interface BoardInfoDialogResult {
  isBoardSelected?: boolean;
  boardId?: string;
  board?: Board;
  createBoard?: boolean;
  navigateTemplate?: boolean;
  isInternalTemplateSelected?: boolean;
  isExternalTemplateSelected?: boolean;
}
