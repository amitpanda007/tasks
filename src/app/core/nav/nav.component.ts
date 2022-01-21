import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { NavService } from "../services/nav.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { BoardServiceV2 } from "../services/boardv2.service";
import { Board, SharedUser } from "src/app/boards/board/board";
import { Subscription } from "rxjs";
import { MatDialog } from "@angular/material";
import {
  BoardInfoDialogComponent,
  BoardInfoDialogResult,
} from "src/app/common/board-info-dialog/board-info-dialog.component";
import {
  BoardDialogComponent,
  BoardDialogResult,
} from "src/app/common/board-dialog/board-dialog.component";
import {
  CopyBoardDialogComponent,
  CopyBoardDialogResult,
} from "src/app/common/copy-board-dialog/copy-board-dialog.component";
import { LoaderService } from "../services/loader.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogResult,
} from "src/app/common/confirm-dialog/confirm-dialog.component";
import {
  InformationDialogComponent,
  InformationDialogResult,
} from "src/app/common/information/information-dialog.component";
import {
  NotificationDialogComponent,
  NotificationDialogResult,
} from "src/app/common/notification/notification-dialog.component";
import { NotificationService } from "../services/notification.service";
import { AppNotification } from "src/app/common/notification/notification";
import { Information } from "src/app/common/information/information";
import {
  SubscriptionDialogComponent,
  SubscriptionDialogResult,
} from "src/app/common/subscription-dialog/subscription-dialog.component";

@Component({
  moduleId: module.id,
  selector: "nav",
  templateUrl: "nav.component.html",
  styleUrls: ["nav.component.scss"],
})
export class NavComponent implements OnInit {
  // baseClass: string;
  public authenticated: boolean;
  public fullName: string;
  // public isAdminUser;
  public boards: Board[];
  public notifications: AppNotification[];
  public notificationCount: number;
  private informations: Information[];

  private notificationSubscription: Subscription;
  private informationSubscription: Subscription;

  @ViewChild("createBoardElm", { static: false })
  public createBoardRef: ElementRef;
  @ViewChild("showBoardElm", { static: false })
  public showBoardRef: ElementRef;
  @ViewChild("infoElm", { static: false })
  public infoRef: ElementRef;
  @ViewChild("notificationElm", { static: false })
  public notificationRef: ElementRef;

  constructor(
    public auth: AuthService,
    private router: Router,
    private navService: NavService,
    public afAuth: AngularFireAuth,
    private boardServiceV2: BoardServiceV2,
    private dialog: MatDialog,
    private loaderService: LoaderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // this.navService.newClass$.subscribe((className) => {
    //   console.log(className);
    // });

    // this.auth.isAdmin().subscribe((value) => {
    //   this.isAdminUser = value;
    // });

    this.notifications = [];
    this.notificationCount = 0;

    this.auth.authStateChanged().subscribe((loggedIn) => {
      console.log(loggedIn);
      if (loggedIn) {
        this.notificationService.getAllNotificaions();
        this.notificationService.getAllInformation();
      }
    });

    this.notificationSubscription =
      this.notificationService.notificationDataChanged.subscribe(
        (notifications: AppNotification[]) => {
          console.log(notifications);
          this.notifications = [];
          if (notifications) {
            notifications.forEach((notification) => {
              if (!notification.isRead) {
                this.notifications.push(notification);
              }
            });
          }
          // this.notifications = notifications;
          this.notificationCount = this.notifications.length;
        }
      );

    this.informationSubscription =
      this.notificationService.informationDataChanged.subscribe(
        (informations: Information[]) => {
          console.log(informations);
          this.informations = informations;
        }
      );
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }

    if (this.informationSubscription) {
      this.informationSubscription.unsubscribe();
    }
  }

  openLogin() {
    this.router.navigate(["/login"]);
  }

  openRegister() {
    this.router.navigate(["/register"]);
  }

  openBoards() {
    this.router.navigate(["/boards"]);
  }

  openDaily() {
    this.router.navigate(["/daily"]);
  }

  openProject() {
    this.router.navigate(["/projects"]);
  }

  openAccount() {
    this.router.navigate(["/account"]);
  }

  navigateHome() {
    this.router.navigate(["/"]).then((_) => {
      window.location.reload();
    });
  }

  async createBoard() {
    const userTokenResult = await this.auth.getUserToken();

    if (
      (this.boards && this.boards.length < 3) ||
      userTokenResult.claims.subscribedUser
    ) {
      const dialogRef = this.dialog.open(BoardInfoDialogComponent, {
        width: "320px",
        maxHeight: "600px",
        data: {
          positionRelativeToElement: this.createBoardRef,
          isCreate: true,
        },
      });
      dialogRef.afterClosed().subscribe((result: BoardInfoDialogResult) => {
        console.log(result);
        if (!result) {
          return;
        }

        if (result.createBoard) {
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

            const userUID = this.auth.getUID();
            const user: SharedUser = {
              id: userUID,
              name: this.auth.getUserDisplayName(),
              permission: {
                admin: true,
                normal: false,
                owner: true,
              },
            };

            const board: Board = {
              title: result.board.title,
              description: result.board.description,
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
        } else if (result.isInternalTemplateSelected) {
          // Create Board from internal Template
          console.log("Create a board from internal template");
          const selectedBoard = result.board;
          const dialogRef = this.dialog.open(CopyBoardDialogComponent, {
            width: "280px",
            hasBackdrop: true,
            data: {
              board: selectedBoard,
            },
          });
          dialogRef
            .afterClosed()
            .subscribe(async (result: CopyBoardDialogResult) => {
              console.log(result);
              if (!result) {
                return;
              }

              this.loaderService.changeLoading(true);
              const copiedBoard = await this.boardServiceV2.copyBoardDoc(
                "boards",
                selectedBoard.id,
                result.boardTitle,
                result.boardDescription,
                "boards",
                true,
                {},
                false,
                true
              );
              console.log(`BOARD COPY COMPLETE: ${copiedBoard}`);
              this.loaderService.changeLoading(false);

              if (copiedBoard) {
                const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                  width: "240px",
                  data: {
                    message: `<span>Navigate to copied board</span>: <a href="/boards/${copiedBoard}">Copied Board</a>`,
                  },
                });
                dialogRef.disableClose = true;
                dialogRef
                  .afterClosed()
                  .subscribe((result: ConfirmDialogResult) => {
                    if (!result) {
                      return;
                    }
                    console.log(result);
                    if (result.confirm) {
                      this.router
                        .navigateByUrl(`/boards/${copiedBoard}`)
                        .then(() => {
                          window.location.reload();
                        });
                    }
                  });
              }
            });
        } else if (result.isExternalTemplateSelected) {
          // Create Board from external Template
          console.log("Create a board from external template");
        } else if (result.navigateTemplate) {
          this.router.navigate([`templates`], {
            replaceUrl: true,
          });
        }
      });
    } else {
      // Open Paid User POP-UP Modal
      const dialogRef = this.dialog.open(SubscriptionDialogComponent, {
        width: "280px",
        data: {
          header: "Add Unlimited Boards",
          body: "You have reached Board limit on your current plan. Upgrade your Tasks account, so you can utilize the full set of functionalities.",
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

  showAllBoards() {
    const dialogRef = this.dialog.open(BoardInfoDialogComponent, {
      width: "320px",
      data: {
        positionRelativeToElement: this.showBoardRef,
        isCreate: false,
      },
    });
    dialogRef.afterClosed().subscribe((result: BoardInfoDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      if (result.isBoardSelected) {
        this.router.navigate([`boards/${result.boardId}`], {
          replaceUrl: true,
        });
      }
    });
  }

  showInfo() {
    const dialogRef = this.dialog.open(InformationDialogComponent, {
      width: "350px",
      maxHeight: "600px",
      data: {
        positionRelativeToElement: this.infoRef,
        informations: this.informations,
      },
    });
    dialogRef.afterClosed().subscribe((result: InformationDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
    });
  }

  showNotification() {
    const dialogRef = this.dialog.open(NotificationDialogComponent, {
      width: "320px",
      maxHeight: "600px",
      data: {
        positionRelativeToElement: this.notificationRef,
        notifications: this.notifications,
      },
    });
    dialogRef.afterClosed().subscribe((result: NotificationDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
    });
  }
}
