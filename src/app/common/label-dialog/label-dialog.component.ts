import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Label } from "../../tasks/task/label";
import { ColorEvent } from "ngx-color";
import { BoardService } from "src/app/core/services/board.service";

@Component({
  selector: "app-label-dialog",
  templateUrl: "./label-dialog.component.html",
  styleUrls: ["./label-dialog.component.scss"],
})
export class LabelDialogComponent implements OnInit {
  private backupLabel: Partial<Label[]> = { ...this.data.labels };
  public isAddingLabel: boolean = false;
  public newLabelName: string;
  public newLabelColor: string = "#FFFFFF";
  public newLabelTextColor: string = "#000000";
  public localLabels: Label[];

  constructor(
    public dialogRef: MatDialogRef<LabelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LabelDialogData,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.localLabels = [...this.data.labels];
    this.localLabels.forEach((label) => {
      this.data.taskLabels.forEach((taskLabel) => {
        if (label.name.localeCompare(taskLabel.name) == 0) {
          label.isSelected = true;
        }
      });
    });
  }

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
    this.newLabelTextColor = "#FFFFFF";
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
    if (label.isSelected) {
      delete label.isSelected;
      const labelIndex = this.data.taskLabels.indexOf(label);
      this.data.taskLabels.splice(labelIndex, 1);
    } else {
      label.isSelected = true;
      this.data.taskLabels.push(label);
    }
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
