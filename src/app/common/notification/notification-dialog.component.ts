import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogConfig,
} from "@angular/material/dialog";
import { AppNotification } from "./notification";

@Component({
  selector: "app-notification-dialog",
  templateUrl: "./notification-dialog.component.html",
  styleUrls: ["./notification-dialog.component.scss"],
})
export class NotificationDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef =
    this.data.positionRelativeToElement;

  constructor(
    public dialogRef: MatDialogRef<NotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotificationDialogData
  ) {}

  ngOnInit(): void {
    const matDialogConfig = new MatDialogConfig();
    const rect: DOMRect =
      this.positionRelativeToElement.nativeElement.getBoundingClientRect();

    matDialogConfig.position = {
      top: `${rect.bottom + 14}px`,
      left: `${rect.left - 284}px`,
    };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  chageNotificationFreq() {
    console.log("Currently not supported");
  }

  showDesktopNotification() {
    console.log("Currently not supported");
  }
}

export interface NotificationDialogData {
  positionRelativeToElement: ElementRef;
  notifications: AppNotification[];
}

export interface NotificationDialogResult {}
