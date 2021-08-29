import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogConfig,
} from "@angular/material/dialog";
import { ColorEvent } from "ngx-color";
import { User } from "src/app/auth/user";

@Component({
  selector: "app-member-info-dialog",
  templateUrl: "./member-info-dialog.component.html",
  styleUrls: ["./member-info-dialog.component.scss"],
})
export class MemberInfoDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef;
  public panelOpenState: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<MemberInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MemberInfoDialogData
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
    this.dialogRef.close({ member: this.data.member, isUserRemoved: false });
  }

  //TODO: Implement this feature
  removeUserFromBoard() {
    console.log("Removing user from shared & sharedUserInfo");
    this.dialogRef.close({ member: this.data.member, isUserRemoved: true });
  }

  leaveBoard() {
    console.log("Leaving user form the board");
    this.dialogRef.close({ member: this.data.member, isUserRemoved: true });
  }

  addAdminPermission() {
    console.log("Addming ADMIN permission to user");
  }

  navigateToBoardActivity() {
    console.log("Navigating to User Board Activity");
  }
}

export interface MemberInfoDialogData {
  member: User;
  positionRelativeToElement?: ElementRef;
  isOwner: boolean;
  isAdmin: boolean;
  currentUserMember: boolean;
}

export interface MemberInfoDialogResult {
  member: User;
  isUserRemoved: boolean;
}
