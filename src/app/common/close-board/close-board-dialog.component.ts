import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogConfig,
  MatDialog,
} from "@angular/material/dialog";

@Component({
  selector: "app-close-board-dialog",
  templateUrl: "./close-board-dialog.component.html",
  styleUrls: ["./close-board-dialog.component.scss"],
})
export class CloseBoardDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef = this.data.positionRelativeToElement;

  constructor(
    public dialogRef: MatDialogRef<CloseBoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CloseBoardDialogData,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const matDialogConfig = new MatDialogConfig();
    const rect: DOMRect =
      this.positionRelativeToElement.nativeElement.getBoundingClientRect();

    matDialogConfig.position = {
      top: `${rect.bottom + 2}px`,
      left: `${rect.left + 2}px`,
    };
    this.dialogRef.updatePosition(matDialogConfig.position);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  deleteBoard() {
    this.dialogRef.close({delete: true});
  }
}

export interface CloseBoardDialogData {
  positionRelativeToElement: ElementRef;
}

export interface CloseBoardDialogResult {
  delete?: boolean;
}