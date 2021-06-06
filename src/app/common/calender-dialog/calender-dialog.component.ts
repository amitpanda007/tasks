import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";

@Component({
  selector: "app-calender-dialog",
  templateUrl: "./calender-dialog.component.html",
  styleUrls: ["./calender-dialog.component.scss"],
})
export class CalenderDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CalenderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CalenderDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.data);
  }

  dueDateChanged($event) {
    // this.data.date = firestore.Timestamp.fromDate($event);
    this.data.date = $event;
  }
}

export interface CalenderDialogData {
  date: firestore.Timestamp;
}

export interface CalenderDialogResult {
  date: firestore.Timestamp;
}
