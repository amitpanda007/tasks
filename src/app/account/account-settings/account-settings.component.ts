import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { User } from "src/app/auth/user";
import {
  UploadDialogComponent,
  UploadDialogResult,
} from "src/app/common/upload-dialog/upload-dialog.component";
import { AccountService } from "src/app/core/services/account.service";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";
import { Activity } from "src/app/tasks/task/activity";
import { Task } from "src/app/tasks/task/task";
import { TaskOption } from "src/app/tasks/task/taskoptions";

@Component({
  moduleId: module.id,
  selector: "account-settings",
  templateUrl: "account-settings.component.html",
  styleUrls: ["account-settings.compoennt.scss"],
})
export class AccountSettingsComponent implements OnInit {
  private userSubscription: Subscription;
  public user: User;
  public avatarImageUrl: string;
  public avatarImgStyle: string;
  public userActivities: Activity[] | Task[];
  public userTasks: Activity[] | Task[];
  public taskOptions: TaskOption;
  public userTasksOnBoard = [];

  constructor(
    private accountService: AccountService,
    private boardServiceV2: BoardServiceV2,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.accountService.getUserInfo();
    this.userSubscription = this.accountService.userDataChanged.subscribe(
      (userData: User) => {
        this.user = userData;
        console.log(this.user);
        if (!userData.avatarImg) {
          this.user.avatarImg = "default.png";
        }
        this.accountService
          .getAvatarImage(`avatar\/${this.user.avatarImg}`)
          .subscribe((imageUrl) => {
            console.log(imageUrl);
            this.avatarImageUrl = imageUrl;
          });
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  uploadFileLocal() {
    const dialogRef = this.dialog.open(UploadDialogComponent, {
      width: "360px",
      data: {
        userId: this.user.id,
        uploadLocation: "avatar",
      },
    });
    dialogRef.afterClosed().subscribe((result: UploadDialogResult) => {
      if (!result) {
        return;
      }
      if (result.confirm) {
        this.accountService.updateAvatarImageForUser(
          this.user.id,
          result.fileName
        );
      }
    });
  }

  saveUserInformation(user: User) {
    this.accountService.saveUser(user);
  }

  async tabClicked(event) {
    console.log(event);
    if (event.index == 1) {
      this.userActivities =
        await this.boardServiceV2.gatherUserActivityAcrossBoard(
          this.user.id,
          "activity"
        );
      console.log(this.userActivities);
    } else if (event.index == 2) {
      this.userTasks = await this.boardServiceV2.gatherUserActivityAcrossBoard(
        this.user.id,
        "task"
      );

      this.userTasks.forEach((task) => {
        let boardFoundForTask = false;
        if (this.userTasksOnBoard && this.userTasksOnBoard.length > 0) {
          this.userTasksOnBoard.forEach((board) => {
            if (board.boardId == task.boardId) {
              boardFoundForTask = true;
              board.tasks.push(task);
            }
          });
        }
        if (!boardFoundForTask) {
          const boardData = {
            boardId: task.boardId,
            boardName: task.taskOnBoard,
            tasks: [],
          };
          boardData.tasks.push(task);
          this.userTasksOnBoard.push(boardData);
        }
      });

      this.taskOptions = {
        showTaskPriority: true,
        showTaskStatus: true,
      };

      for (let i = 0; i < this.userTasksOnBoard.length; i++) {
        const board = this.userTasksOnBoard[i];
        const boardLabels = await this.boardServiceV2.getLabelAsync(
          board.boardId
        );
        this.userTasksOnBoard[i].labels = boardLabels;
      }

      // console.log(this.userTasks);
      console.log(this.userTasksOnBoard);
    }
  }

  editTask(event) {
    const boardId = event.boardId;
    const taskId = event.id;
    this.router.navigateByUrl(`boards/${boardId}?task=${taskId}`);
  }

  activityToCard(taskId: string) {
    console.log(taskId);
  }

  activityToBoard(taskId: string) {
    console.log(taskId);
  }
}
