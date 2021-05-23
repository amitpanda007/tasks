import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Board } from "src/app/boards/board/board";

@Component({
  selector: "app-board-dialog",
  templateUrl: "./board-dialog.component.html",
  styleUrls: ["./board-dialog.component.scss"],
})
export class BoardDialogComponent {
  private backupTask: Partial<Board> = { ...this.data.board };

  constructor(
    public dialogRef: MatDialogRef<BoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardDialogData
  ) {}

  cancel(): void {
    this.data.board.title = this.backupTask.title;
    this.data.board.description = this.backupTask.description;
    this.dialogRef.close(this.data);
  }
}

export interface BoardDialogData {
  board: Partial<Board>;
  enableDelete: boolean;
}

export interface BoardDialogResult {
  board: Board;
  delete?: boolean;
}
