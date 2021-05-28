import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Board } from "src/app/boards/board/board";
import { Label } from '../../tasks/task/label';

@Component({
  selector: "app-label-dialog",
  templateUrl: "./label-dialog.component.html",
  styleUrls: ["./label-dialog.component.scss"],
})
export class LabelDialogComponent {
  private backupTask: Partial<Label> = { ...this.data.label };

  constructor(
    public dialogRef: MatDialogRef<LabelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LabelDialogData
  ) {}

  cancel(): void {
    this.data.label.name = this.backupTask.name;
    this.data.label.color = this.backupTask.color;
    this.dialogRef.close();
  }
}

export interface LabelDialogData {
  label: Partial<Label>;
  enableDelete: boolean;
}

export interface LabelDialogResult {
  label: Label;
  delete?: boolean;
}
