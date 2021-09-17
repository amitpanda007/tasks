import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Board } from "src/app/boards/board/board";

@Component({
  selector: "app-copy-board-dialog",
  templateUrl: "./copy-board-dialog.component.html",
  styleUrls: ["./copy-board-dialog.component.scss"],
})
export class CopyBoardDialogComponent implements OnInit {
  public boardTitleText: string;
  public boardDescriptionText: string;
  public primaryColor: string;

  public keepLabels: boolean = true;
  public keepTaskLists: boolean = true;
  public keepTasks: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<CopyBoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CopyBoardDialogData
  ) {}

  ngOnInit(): void {
    this.primaryColor = "primary";
    this.boardTitleText = this.data.board.title;
    this.boardDescriptionText = this.data.board.description;
  }

  copy() {
    this.dialogRef.close({boardTitle: this.boardTitleText, boardDescription: this.boardDescriptionText});
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

export interface CopyBoardDialogData {
  board: Board;
}

export interface CopyBoardDialogResult {
  boardTitle: string;
  boardDescription: string;
}
