import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";

@Component({
  selector: "app-copy-dialog",
  templateUrl: "./copy-dialog.component.html",
  styleUrls: ["./copy-dialog.component.scss"],
})
export class CopyDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CopyDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.data);
  }
}

export interface CopyDialogData {
  name: string;
}

export interface CopyDialogResult {
  name: string;
}
