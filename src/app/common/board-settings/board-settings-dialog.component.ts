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
import { MemberActivityDialogComponent } from "../member-activity/member-activity-dialog.component";

@Component({
  selector: "app-board-settings-dialog",
  templateUrl: "./board-settings-dialog.component.html",
  styleUrls: ["./board-settings-dialog.component.scss"],
})
export class BoardSettingsDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef;

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
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

export interface BoardSettingsDialogData {
  positionRelativeToElement?: ElementRef;
  isAddRemovePermission: boolean;
  isCommentingPermission: boolean;
}

export interface BoardSettingsDialogResult {}
