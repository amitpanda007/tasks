import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogConfig,
} from "@angular/material/dialog";
import { Label } from "../../tasks/task/label";
import { ColorEvent } from "ngx-color";
import { BoardService } from "src/app/core/services/board.service";
import { BoardServiceV2 } from "../../core/services/boardv2.service";

@Component({
  selector: "app-label-dialog",
  templateUrl: "./label-dialog.component.html",
  styleUrls: ["./label-dialog.component.scss"],
})
export class LabelDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef =
    this.data.positionRelativeToElement;

  private backupLabel: Partial<Label[]> = { ...this.data.labels };
  public isAddingLabel: boolean = false;
  public isEditingLabel: boolean = false;
  public newLabelId: string = "";
  public newLabelName: string;
  public newLabelColor: string = "#FFFFFF";
  public newLabelTextColor: string = "#000000";
  public selectedLabels: Label[];

  constructor(
    public dialogRef: MatDialogRef<LabelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LabelDialogData,
    private boardServiceV2: BoardServiceV2
  ) {}

  ngOnInit(): void {
    // const matDialogConfig = new MatDialogConfig();
    // if(this.positionRelativeToElement) {
    //   const rect: DOMRect =
    //   this.positionRelativeToElement.nativeElement.getBoundingClientRect();
    //   matDialogConfig.position = {
    //     top: `${rect.bottom + 2}px`,
    //     left: `${rect.left + 2}px`,
    //   };
    //   this.dialogRef.updatePosition(matDialogConfig.position);
    // }

    this.selectedLabels = [];
    this.data.labels.forEach((label) => {
      if (label.taskIds.includes(this.data.taskId)) {
        console.log(this.data.taskId);
        console.log(label);
        label.isSelected = true;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close({
      labels: this.data.labels,
      updatedLabelData: this.selectedLabels,
    });
  }

  reset() {
    this.newLabelId = "";
    this.newLabelName = "";
    this.newLabelColor = "";
    this.newLabelTextColor = "#000000";
    this.toggleLabel();
    this.toggleEditLabel();
  }

  toggleLabel() {
    this.isAddingLabel = !this.isAddingLabel;
  }

  toggleEditLabel() {
    this.isEditingLabel = !this.isEditingLabel;
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
      created: new Date(),
      modified: new Date(),
    };
    const labelId = await this.boardServiceV2.addLabel(
      this.data.boardId,
      newLabel
    );
    newLabel.id = labelId;
    this.data.labels.push(newLabel);
    this.newLabelName = "";
    this.newLabelColor = "";
    this.toggleLabel();
  }

  editLabel(label: Label) {
    console.log("EDIT LABEL");
    this.newLabelId = label.id;
    this.newLabelName = label.name;
    this.newLabelColor = label.color;
    this.newLabelTextColor = "#FFFFFF";
    this.toggleLabel();
    this.toggleEditLabel();
  }

  updateLabel() {
    const updatedLabel = this.data.labels.filter(
      (label) => label.id == this.newLabelId
    )[0];
    updatedLabel.color = this.newLabelColor;
    updatedLabel.name = this.newLabelName;

    this.boardServiceV2.updateLabel(
      this.data.boardId,
      updatedLabel.id,
      updatedLabel
    );
    const index = this.data.labels.indexOf(updatedLabel);
    this.data.labels[index] = updatedLabel;
    this.reset();
  }

  deleteLabel(label: Label) {
    console.log("DELETE LABEL");
    this.boardServiceV2.deleteLabel(this.data.boardId, label.id);
    this.data.labels.splice(this.data.labels.indexOf(label), 1);
  }

  selectLabel(label: Label) {
    this.selectedLabels.push(label);
    // console.log(this.data.labels);
    const labelIndex = this.data.labels.indexOf(label);
    if (label.isSelected) {
      delete label.isSelected;
      this.data.labels[labelIndex].taskIds.splice(
        this.data.labels[labelIndex].taskIds.indexOf(this.data.taskId),
        1
      );
    } else {
      if (!this.data.labels[labelIndex].taskIds) {
        this.data.labels[labelIndex].taskIds = [];
      }
      label.isSelected = true;
      this.data.labels[labelIndex].taskIds.push(this.data.taskId);
    }
  }
}

export interface LabelDialogData {
  positionRelativeToElement?: ElementRef;
  labels: Partial<Label[]>;
  enableDelete: boolean;
  enableEdit: boolean;
  taskId: string;
  taskTitle?: string;
  listName?: string;
  boardId: string;
}

export interface LabelDialogResult {
  labels: Label[];
  delete?: boolean;
  updatedLabelData?: Label[];
}
