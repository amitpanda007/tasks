import { Component, Inject } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from "@angular/material/dialog";
import { User } from "src/app/auth/user";
import { Activity } from "src/app/tasks/task/activity";

@Component({
  selector: "app-member-activity-dialog",
  templateUrl: "./member-activity-dialog.component.html",
  styleUrls: ["./member-activity-dialog.component.scss"],
})
export class MemberActivityDialogComponent{

  constructor(
    public dialogRef: MatDialogRef<MemberActivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MemberActivityDialogData
  ) {}

}

export interface MemberActivityDialogData {
  member: User;
  activities: Activity[];
}

export interface MemberActivityDialogResult {}
