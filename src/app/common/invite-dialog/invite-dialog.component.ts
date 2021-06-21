import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";

@Component({
  selector: "app-invite-dialog",
  templateUrl: "./invite-dialog.component.html",
  styleUrls: ["./invite-dialog.component.scss"],
})
export class InviteDialogComponent {
  public inviteEmail: string;

  constructor(
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InviteDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  sendInvitation() {
    console.log("Invitation Sent");
    //TODO: Add Email functionality to send invitation
  }
}

export interface InviteDialogData {
  email: string;
}

export interface InviteDialogResult {
  email: string;
}
