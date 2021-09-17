import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogConfig,
  MatDialog,
} from "@angular/material/dialog";

@Component({
  selector: "app-board-settings-dialog",
  templateUrl: "./board-settings-dialog.component.html",
  styleUrls: ["./board-settings-dialog.component.scss"],
})
export class BoardSettingsDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef;
  public commentingPermission: CommentingPermission;
  public addRemovePermission: AddRemovePermission;

  constructor(
    public dialogRef: MatDialogRef<BoardSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardSettingsDialogData,
    private dialog: MatDialog
  ) {
    this.positionRelativeToElement = data.positionRelativeToElement;
    console.log(data);
  }

  ngOnInit(): void {
    const matDialogConfig = new MatDialogConfig();
    const rect: DOMRect =
      this.positionRelativeToElement.nativeElement.getBoundingClientRect();

    matDialogConfig.position = {
      top: `${rect.bottom + 2}px`,
      left: `${rect.left + 2}px`,
    };
    this.dialogRef.updatePosition(matDialogConfig.position);

    if (this.data.isAddRemovePermission) {
      this.addRemovePermission = this.data.addRemovePermission;
    }
    if (this.data.isCommentingPermission) {
      this.commentingPermission = this.data.commentingPermission;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  changePermission(type: string, permission: string): void {
    if (type === "AddRemovePermission") {
      Object.keys(this.addRemovePermission).map((key) => {
        if (key == permission) {
          this.addRemovePermission[key] = true;
        } else {
          this.addRemovePermission[key] = false;
        }
      });
      this.dialogRef.close({
        isAddRemovePermission: true,
        isCommentingPermission: false,
        addRemovePermission: this.addRemovePermission,
      });
    } else if (type === "CommentingPermission") {
      Object.keys(this.commentingPermission).map((key) => {
        if (key == permission) {
          this.commentingPermission[key] = true;
        } else {
          this.commentingPermission[key] = false;
        }
      });
      this.dialogRef.close({
        isAddRemovePermission: false,
        isCommentingPermission: true,
        commentingPermission: this.commentingPermission,
      });
    }
  }
}

export interface BoardSettingsDialogData {
  positionRelativeToElement?: ElementRef;
  isAddRemovePermission?: boolean;
  addRemovePermission?: AddRemovePermission;
  isCommentingPermission?: boolean;
  commentingPermission?: CommentingPermission;
}

export interface BoardSettingsDialogResult {
  isAddRemovePermission?: boolean;
  addRemovePermission?: AddRemovePermission;
  isCommentingPermission?: boolean;
  commentingPermission?: CommentingPermission;
}

export interface AddRemovePermission {
  admin: boolean;
  allMembers: boolean;
}

export interface CommentingPermission {
  disabled: boolean;
  members: boolean;
  membersAndObservers: boolean;
  AllBoardMembers: boolean;
  anyUser: boolean;
}
