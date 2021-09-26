import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogConfig,
  MatDialog,
} from "@angular/material/dialog";

@Component({
  selector: "app-information-board-dialog",
  templateUrl: "./information-dialog.component.html",
  styleUrls: ["./information-dialog.component.scss"],
})
export class InformationDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef =
    this.data.positionRelativeToElement;

  constructor(
    public dialogRef: MatDialogRef<InformationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InformationDialogData
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
}

export interface InformationDialogData {
  positionRelativeToElement: ElementRef;
}

export interface InformationDialogResult {}
