import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";
import { SharedUser } from "src/app/boards/board/board";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "app-message-dialog",
  templateUrl: "./message-dialog.component.html",
  styleUrls: ["./message-dialog.component.scss"],
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    const updatedTask = {
      message: this.data.message,
      delete: false,
    };
    this.dialogRef.close(updatedTask);
  }

  delete() {
    const updatedTask = {
      message: this.data.message,
      delete: true,
    };
    this.dialogRef.close(updatedTask);
  }
}

export interface MessageDialogData {
  message: string;
  enableDelete: boolean;
}

export interface MessageDialogResult {
  message: string;
  delete: boolean;
}
