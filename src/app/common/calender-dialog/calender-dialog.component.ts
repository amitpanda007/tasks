import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";

@Component({
  selector: "app-calender-dialog",
  templateUrl: "./calender-dialog.component.html",
  styleUrls: ["./calender-dialog.component.scss"],
})
export class CalenderDialogComponent implements OnInit {
  public currentDate: Date;
  constructor(
    public dialogRef: MatDialogRef<CalenderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CalenderDialogData
  ) {}

  ngOnInit(): void {
    if(this.data.date) {
      this.currentDate = this.data.date.toDate();
    }else {
      this.currentDate = new Date();
    }
  }

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
  time: string;
  enableCalender: boolean;
  enableTime: boolean;
}

export interface CalenderDialogResult {
  date: firestore.Timestamp;
  time: string;
}
