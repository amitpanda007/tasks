import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-subscription-dialog",
  templateUrl: "./subscription-dialog.component.html",
  styleUrls: ["./subscription-dialog.component.scss"],
})
export class SubscriptionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SubscriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubscriptionDialogData
  ) {}

  pay(): void {
    this.dialogRef.close({ paid: true });
  }
}

export interface SubscriptionDialogData {
  header: string;
  body: string;
}

export interface SubscriptionDialogResult {
  paid: boolean;
}
