import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Board } from "src/app/boards/board/board";
import { TaskList } from "../../tasks/task-list/tasklist";
import { Label } from "../../tasks/task/label";

@Component({
  selector: "app-automation-dialog",
  templateUrl: "./automation-dialog.component.html",
  styleUrls: ["./automation-dialog.component.scss"],
})
export class AutomationDialogComponent implements OnInit {
  public showRuleSection: boolean;

  constructor(
    public dialogRef: MatDialogRef<AutomationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AutomationDialogData
  ) {}

  ngOnInit(): void {
    this.showRuleSection = false;
  }

  ngOnDestroy(): void {}

  cancel(): void {
    this.dialogRef.close();
  }

  showCreateRule() {
    this.showRuleSection = true;
  }

  addTrigger(one, two) {
    console.log(one, two);
  }
}

export interface AutomationDialogData {
  board: Board;
  taskLists: TaskList[];
  labels: Label[];
}

export interface AutomationDialogResult {}
