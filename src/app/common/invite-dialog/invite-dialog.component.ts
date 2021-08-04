import { Component, Inject, Input } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";
import { BoardServiceV2 } from "../../core/services/boardv2.service";
import { Invitation } from "./invitation";
import { AuthService } from "../../core/services/auth.service";
import { copySync } from "fs-extra";
import { APIService } from "src/app/core/services/api.service";

@Component({
  selector: "app-invite-dialog",
  templateUrl: "./invite-dialog.component.html",
  styleUrls: ["./invite-dialog.component.scss"],
})
export class InviteDialogComponent {
  public inviteEmail: string;
  public invitationLink: string;
  public isEmailValid: boolean;

  constructor(
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InviteDialogData,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService,
    private apiService: APIService
  ) {
    this.isEmailValid = false;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  async sendInvitation() {
    if(this.isEmailValid) {
      const linkCreated = await this.createInvitation();
      if(linkCreated) {
        console.log(this.authService.getUserDisplayName(), this.inviteEmail, this.invitationLink);
        const resp = await this.apiService.sendBoardInviteEmail(this.authService.getUserDisplayName(), this.inviteEmail, this.invitationLink);
        console.log(resp);
      }
    }
    console.log("Invitation Sent");
    this.inviteEmail = "";
    this.isEmailValid = false;
  }

  emailInputChanged() {
    this.isEmailValid = this.validateEmail(this.inviteEmail);
  }

  validateEmail(email: string) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  async createInvitation(): Promise<boolean> {
    const newInvite: Invitation = {
      creator: this.authService.getUID(),
      accepted: false,
      created: new Date(),
    };
    const invitationId = await this.boardServiceV2.createInvitation(
      this.data.boardId,
      newInvite
    );
    console.log(`Invitation ID: ${invitationId}`);

    const baseUrl = window.location.origin;
    this.invitationLink = `${baseUrl}/share/board/${this.data.boardId}/${invitationId}`;
    return true;
  }

  copyInviteLinkURL() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.invitationLink;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  downloadQRImage() {

  }
}

export interface InviteDialogData {
  boardId: string;
  email: string;
}

export interface InviteDialogResult {
  email: string;
}
