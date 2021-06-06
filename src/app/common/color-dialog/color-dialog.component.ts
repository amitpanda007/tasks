import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ColorEvent } from "ngx-color";

@Component({
  selector: "app-color-dialog",
  templateUrl: "./color-dialog.component.html",
  styleUrls: ["./color-dialog.component.scss"],
})
export class ColorDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ColorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ColorDialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({ color: this.data.color });
  }

  handleChange($event: ColorEvent) {
    console.log;
    this.data.color = $event.color.hex;
  }
}

export interface ColorDialogData {
  color?: string;
}

export interface ColorDialogResult {
  color?: string;
}
