import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Board } from "src/app/boards/board/board";

@Component({
  selector: "app-board-template-dialog",
  templateUrl: "./board-template-dialog.component.html",
  styleUrls: ["./board-template-dialog.component.scss"],
})
export class BoardTemplateDialogComponent implements OnInit {
  public accentColor: string;

  constructor(
    public dialogRef: MatDialogRef<BoardTemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardTemplateDialogData
  ) {}

  ngOnInit(): void {
    this.accentColor = "accent";
  }

  makeTemplate() {
    this.dialogRef.close({ isTemplate: true });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

export interface BoardTemplateDialogData {}

export interface BoardTemplateDialogResult {
  isTemplate: boolean;
}
