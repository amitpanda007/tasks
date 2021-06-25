import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";
import { BoardServiceV2 } from '../../core/services/boardv2.service';
import { Invitation } from './invitation';
import { AuthService } from '../../core/services/auth.service';
import { copySync } from 'fs-extra';

@Component({
  selector: "app-invite-dialog",
  templateUrl: "./invite-dialog.component.html",
  styleUrls: ["./invite-dialog.component.scss"],
})
export class InviteDialogComponent {
  public inviteEmail: string;
  public invitationLink: string;

  constructor(
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InviteDialogData,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  sendInvitation() {
    console.log("Invitation Sent");
    //TODO: Add Email functionality to send invitation
  }

  async createInvitation() {
    const newInvite: Invitation = {
      creator: this.authService.getUID(),
      accepted: false,
      created: new Date()
    }
    const invitationId = await this.boardServiceV2.createInvitation(this.data.boardId, newInvite);
    console.log(`Invitation ID: ${invitationId}`);

    const baseUrl = window.location.origin;
    this.invitationLink = `${baseUrl}/share/board/${this.data.boardId}/${invitationId}`;
  }
}

export interface InviteDialogData {
  boardId: string;
  email: string;
}

export interface InviteDialogResult {
  email: string;
}
