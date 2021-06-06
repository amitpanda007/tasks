import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";

@Component({
  selector: "app-member-dialog",
  templateUrl: "./member-dialog.component.html",
  styleUrls: ["./member-dialog.component.scss"],
})
export class MemberDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MemberDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.data);
  }
}

export interface MemberDialogData {
  name: string;
}

export interface MemberDialogResult {
  name: string;
}
