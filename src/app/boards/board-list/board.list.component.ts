import { Component, Input, OnInit } from "@angular/core";
import { Board, SharedUser } from "../board/board";
import { MatDialog } from "@angular/material";
import {
  BoardDialogComponent,
  BoardDialogResult,
} from "src/app/common/board-dialog/board-dialog.component";
import { Subscription } from "rxjs";
import { BoardServiceV2 } from "../../core/services/boardv2.service";
import { AuthService } from "../../core/services/auth.service";
import {
  ClosedBoardContentDialogComponent,
  ClosedBoardContentDialogResult,
} from "src/app/common/closed-board-content/closed-board-content-dialog.component";
import { Router } from "@angular/router";
import { APIService } from "src/app/core/services/api.service";
import {
  SubscriptionDialogComponent,
  SubscriptionDialogResult,
} from "src/app/common/subscription-dialog/subscription-dialog.component";

@Component({
  selector: "board-list",
  templateUrl: "board.list.component.html",
  styleUrls: ["board.list.component.scss"],
})
export class BaordListComponent implements OnInit {
  public boards: Board[];
  public closedBoards: Board[];
  public sharedBoards: Board[];
  private boardSubscription: Subscription;
  public isLoading: boolean;

  constructor(
    private dialog: MatDialog,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService,
    private apiService: APIService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log("BOARDLIST IS INITIATED");
    this.isLoading = true;
    let apiCalled = false;
    // this.boardServiceV2.getBoards();
    this.boardServiceV2.getBoards();
    this.boardSubscription = this.boardServiceV2.boardsChanged.subscribe(
      (boards) => {
        if (boards && boards.length == 0 && !apiCalled) {
          console.log("SHOULD BE CALLED ONCE");
          this.boardServiceV2.getBoards();
          apiCalled = true;
        }
        this.boards = [];
        this.closedBoards = [];
        boards.forEach((board) => {
          if (!board.closed) {
            this.boards.push(board);
          } else {
            this.closedBoards.push(board);
          }
        });
        // this.boards = boards;
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
    if (this.boardSubscription) {
      this.boardSubscription.unsubscribe();
      this.boardServiceV2.cancelBoardSuscriotion();
    }
  }

  async newBoard() {
    const userTokenResult = await this.authService.getUserToken();
    console.log(userTokenResult);
    console.log(this.boards.length);

    if (
      (this.boards && this.boards.length < 3) ||
      userTokenResult.claims.subscribedUser
    ) {
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

        const userUID = this.authService.getUID();
        const user: SharedUser = {
          id: userUID,
          name: this.authService.getUserDisplayName(),
          permission: {
            admin: true,
            normal: false,
            owner: true,
          },
        };

        const board: Board = {
          title: result.board.title,
          description: result.board.description ? result.board.description : "",
          owner: userUID,
          settings: {
            cardCoverEnabled: false,
            addRemovePermission: {
              admin: true,
              allMembers: false,
            },
            commentingPermission: {
              disabled: true,
              members: false,
              membersAndObservers: false,
              AllBoardMembers: false,
              anyUser: false,
            },
          },
          shared: [userUID],
          sharedUserInfo: [user],
          created: new Date(),
          modified: new Date(),
        };
        this.boardServiceV2.addBoard(board);
      });
    } else {
      // Open Paid User POP-UP Modal
      const dialogRef = this.dialog.open(SubscriptionDialogComponent, {
        width: "280px",
        data: {
          header: "Add Unlimited Boards",
          body: "Upgrade your Tasks account to a Paid user, so you can utilize the full set of functionalities.",
        },
      });
      dialogRef.afterClosed().subscribe((result: SubscriptionDialogResult) => {
        if (!result) {
          return;
        }
        if (result.paid) {
          this.router.navigate(["/payments"]);
        }
      });
    }
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
      console.log(result);
      if (!result) {
        return;
      }

      const boardIndex = this.boards.indexOf(board);
      if (result.delete) {
        // this.boards.splice(boardIndex, 1);
        this.boardServiceV2.deleteBoard(board.id);
      } else {
        this.boardServiceV2.updateBoard(board.id, result.board);
        // this.boards[boardIndex] = board;
      }
    });
  }

  openBoard(boardId: string) {
    this.router.navigate([`boards/${boardId}`], { replaceUrl: true });
  }

  showClosedBoards() {
    const dialogRef = this.dialog.open(ClosedBoardContentDialogComponent, {
      width: "540px",
      data: {
        closedBoards: this.closedBoards,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: ClosedBoardContentDialogResult) => {
        if (!result) {
          return;
        }
      });
  }
}
