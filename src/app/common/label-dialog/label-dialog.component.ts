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
  public updatedLabels: Label[];

  constructor(
    public dialogRef: MatDialogRef<LabelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LabelDialogData,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    // console.log(this.data.labels);
    this.updatedLabels = [];
  }

  cancel(): void {
    // this.data.labels = this.backupLabel;
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({labels: this.data.labels, updatedLabels: this.updatedLabels});
  }

  toggleLabel() {
    this.isAddingLabel = !this.isAddingLabel;
  }

  handleChange($event: ColorEvent) {
    console.log($event.color.hex);
    this.newLabelColor = $event.color.hex;
    this.newLabelTextColor = "#FFFFFF";
  }

  async addLabel() {
    const newLabel: Label = {
      name: this.newLabelName,
      color: this.newLabelColor,
    };
    const labelId = await this.boardService.addLabel(this.data.boardId, newLabel);
    newLabel.id = labelId;
    this.data.labels.push(newLabel);
    this.newLabelName = "";
    this.newLabelColor = "";
    this.toggleLabel();
  }

  editLabel(label: Label) {
    console.log("EDIT LABEL");
  }

  deleteLabel(label: Label) {
    console.log("DELETE LABEL");
    this.boardService.deleteLabel(this.data.boardId, label.id);
    this.data.labels.splice(this.data.labels.indexOf(label), 1);
  }

  selectLabel(label: Label) {    
    console.log(this.data.labels);
    const labelIndex = this.data.labels.indexOf(label);
    if (label.isSelected) {
      delete label.isSelected;
      this.data.labels[labelIndex].taskIds.splice(this.data.labels[labelIndex].taskIds.indexOf(this.data.taskId), 1);
      this.updatedLabels.splice(this.updatedLabels.indexOf(this.data.labels[labelIndex], 1));
    } else {
      if(!this.data.labels[labelIndex].taskIds) {
        this.data.labels[labelIndex].taskIds = [];
      }
      label.isSelected = true;
      this.data.labels[labelIndex].taskIds.push(this.data.taskId);
      this.updatedLabels.push(this.data.labels[labelIndex]);
    }
    console.log(this.data.labels);
  }
}

export interface LabelDialogData {
  labels: Partial<Label[]>;
  enableDelete: boolean;
  taskId: string;
  boardId: string;
}

export interface LabelDialogResult {
  labels: Label[];
  delete?: boolean;
  updatedLabels?: string[];
}
