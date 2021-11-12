import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { User } from "src/app/auth/user";
import {
  UploadDialogComponent,
  UploadDialogResult,
} from "src/app/common/upload-dialog/upload-dialog.component";
import { AccountService } from "src/app/core/services/account.service";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";

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

  constructor(
    private accountService: AccountService,
    private boardServiceV2: BoardServiceV2,
    private dialog: MatDialog
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

  tabClicked(event) {
    console.log(event);
    if (event.index == 1) {
      const userActivity = this.boardServiceV2.gatherUserActivityAcrossBoard(
        this.user.id
      );
    }
  }
}
