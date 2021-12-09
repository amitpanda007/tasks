import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogConfig,
  MatDialog,
} from "@angular/material/dialog";
import { User } from "src/app/auth/user";
import { Activity } from "src/app/tasks/task/activity";
import { Task } from "src/app/tasks/task/task";
import {
  MemberActivityDialogComponent,
  MemberActivityDialogResult,
} from "../member-activity/member-activity-dialog.component";

@Component({
  selector: "app-member-info-dialog",
  templateUrl: "./member-info-dialog.component.html",
  styleUrls: ["./member-info-dialog.component.scss"],
})
export class MemberInfoDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef;
  public panelOpenState: boolean = false;
  public accountRoute: string = "/account";

  constructor(
    public dialogRef: MatDialogRef<MemberInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MemberInfoDialogData,
    private dialog: MatDialog
  ) {
    this.positionRelativeToElement = data.positionRelativeToElement;
    console.log(data);
  }

  ngOnInit(): void {
    const matDialogConfig = new MatDialogConfig();
    const rect: DOMRect =
      this.positionRelativeToElement.nativeElement.getBoundingClientRect();

    matDialogConfig.position = { top: `${rect.bottom + 2}px` };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({
      member: this.data.member,
      isUserRemoved: false,
      isMadeAdmin: false,
      isAdminRemoved: false,
    });
  }

  removeUserFromBoard() {
    console.log("Removing user from shared & sharedUserInfo");
    this.dialogRef.close({
      member: this.data.member,
      isUserRemoved: true,
      isMadeAdmin: false,
      isAdminRemoved: false,
    });
  }

  leaveBoard() {
    console.log("Leaving user form the board");
    this.dialogRef.close({
      member: this.data.member,
      isUserRemoved: true,
      isMadeAdmin: false,
      isAdminRemoved: false,
    });
  }

  addAdminPermission() {
    console.log("Adding/Removing ADMIN permission to user");
    if (this.data.member.permission.admin) {
      this.dialogRef.close({
        member: this.data.member,
        isUserRemoved: false,
        isMadeAdmin: false,
        isAdminRemoved: true,
      });
    } else {
      this.dialogRef.close({
        member: this.data.member,
        isUserRemoved: false,
        isMadeAdmin: true,
        isAdminRemoved: false,
      });
    }
  }

  navigateToBoardActivity() {
    console.log("Navigating to User Board Activity");
    const activityList: Activity[] = [];

    this.data.tasks.forEach((task) => {
      if (task.activities && task.activities.length > 0) {
        task.activities.forEach((activity) => {
          if (activity.id == this.data.member.id) {
            activityList.push(activity);
          }
        });
      }
    });

    const dialogRef = this.dialog.open(MemberActivityDialogComponent, {
      width: "420px",
      maxHeight: "600px",
      autoFocus: false,
      data: {
        member: this.data.member,
        activities: activityList,
      },
    });
    dialogRef.afterClosed().subscribe((result: MemberActivityDialogResult) => {
      if (!result) {
        return;
      }

      if (result.openTask) {
        this.dialogRef.close({
          member: this.data.member,
          isUserRemoved: false,
          isMadeAdmin: false,
          isAdminRemoved: false,
          taskId: result.taskId,
        });
      }
    });
  }

  navigatingToAccount() {
    this.dialogRef.close();
  }
}

export interface MemberInfoDialogData {
  member: User;
  positionRelativeToElement?: ElementRef;
  isOwner: boolean;
  isAdmin: boolean;
  tasks: Task[];
  currentUserMember: boolean;
  memberAddRemoveAccess: boolean;
}

export interface MemberInfoDialogResult {
  member: User;
  isUserRemoved: boolean;
  isMadeAdmin: boolean;
  isAdminRemoved: boolean;
  taskId?: string;
}
