import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Board } from "src/app/boards/board/board";
import { TaskList } from "../../tasks/task-list/tasklist";
import { Label } from "../../tasks/task/label";
import { Action } from "./action";
import { Trigger } from "./trigger";

@Component({
  selector: "app-automation-dialog",
  templateUrl: "./automation-dialog.component.html",
  styleUrls: ["./automation-dialog.component.scss"],
})
export class AutomationDialogComponent implements OnInit {
  public showRuleSection: boolean;
  public isShowingTriggerSection: boolean;
  public isShowingActionSection: boolean;
  public isSaveEnabled: boolean;

  // Trigger & Action Data
  public newTrigger: Trigger = {};
  public newAction: Action = {};

  // Trigger
  public move_trigger_1_type: string = "added to";
  public move_trigger_1_assign: string = "by me";

  // Action
  public move_action_1_type: string = "copy";
  public move_action_1_location: string = "the top of list";
  public move_action_list_name: string;
  public move_action_2_location: string = "the top of the list";
  public move_action_3_type: string = "arcive";

  constructor(
    public dialogRef: MatDialogRef<AutomationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AutomationDialogData
  ) {}

  ngOnInit(): void {
    this.showRuleSection = false;
    this.isShowingTriggerSection = false;
    this.isShowingActionSection = false;
    this.isSaveEnabled = false;
  }

  ngOnDestroy(): void {}

  cancel(): void {
    this.dialogRef.close();
  }

  showCreateRule() {
    this.showRuleSection = true;
  }

  showTriggers() {
    this.isShowingTriggerSection = true;
  }

  addTrigger(triggerOne: string, triggerTwo: string) {
    console.log(triggerOne, triggerTwo);

    if (triggerOne && triggerTwo) {
      switch (triggerOne) {
        case "added to":
          break;
        case "created in":
          break;
        case "emailed into":
          break;
        case "moved into":
          break;
        case "moved out of":
          break;
      }
    }

    // this.newTrigger = {
    //   triggerId: triggerId,
    //   triggerText: "",
    //   triggerOptions: [],
    // };
    this.showActions();
  }

  showActions() {
    this.isShowingActionSection = true;
  }

  addAction(actionOne, actionTwo, actionThree) {
    console.log(actionOne, actionTwo, actionThree);
    this.isSaveEnabled = true;
  }

  saveRule() {}

  cancelRule() {
    this.showRuleSection = false;
    this.isShowingTriggerSection = false;
  }
}

export interface AutomationDialogData {
  board: Board;
  taskLists: TaskList[];
  labels: Label[];
}

export interface AutomationDialogResult {}
