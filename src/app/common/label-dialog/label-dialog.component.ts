import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Label } from "../../tasks/task/label";
import { ColorEvent } from "ngx-color";
import { BoardService } from "src/app/core/services/board.service";

@Component({
  selector: "app-label-dialog",
  templateUrl: "./label-dialog.component.html",
  styleUrls: ["./label-dialog.component.scss"],
})
export class LabelDialogComponent {
  private backupLabel: Partial<Label[]> = { ...this.data.labels };
  public isAddingLabel: boolean = false;
  public newLabelName: string;
  public newLabelColor: string = "#FFF";

  constructor(
    public dialogRef: MatDialogRef<LabelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LabelDialogData,
    private boardService: BoardService
  ) {}

  cancel(): void {
    // this.data.labels = this.backupLabel;
    this.dialogRef.close();
  }

  toggleLabel() {
    this.isAddingLabel = !this.isAddingLabel;
  }

  handleChange($event: ColorEvent) {
    console.log($event.color.hex);
    this.newLabelColor = $event.color.hex;
  }

  // closeDialog() {
  //   this.dialogRef.close();
  // }

  addLabel() {
    const newLabel: Label = {
      name: this.newLabelName,
      color: this.newLabelColor,
    };
    this.data.labels.push(newLabel);
    this.boardService.addLabel(this.data.boardId, newLabel);
    this.newLabelName = "";
    this.newLabelColor = "";
    this.toggleLabel();
  }

  selectLabel(label: Label) {
    label.isSelected = true;
    this.data.taskLabels.push(label);
  }
}

export interface LabelDialogData {
  taskLabels: Label[];
  labels: Partial<Label[]>;
  enableDelete: boolean;
  boardId: string;
}

export interface LabelDialogResult {
  labels: Label[];
  delete?: boolean;
}
