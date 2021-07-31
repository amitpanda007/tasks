import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { DailyTask } from "src/app/daily/daily-task/dailytask";
import { CheckList } from "../../tasks/task/checklist";
import { firestore } from "firebase";
import * as cloneDeep from "lodash/cloneDeep";
import {
  CalenderDialogComponent,
  CalenderDialogResult,
} from "../calender-dialog/calender-dialog.component";
import {
  DeleteConfirmationDialogComponent,
  DeleteConfirmationDialogResult,
} from "../delete.dialog.component";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  ColorDialogComponent,
  ColorDialogResult,
} from "../color-dialog/color-dialog.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogResult,
} from "../confirm-dialog/confirm-dialog.component";
import { DailyService } from "src/app/core/services/daily.service";

@Component({
  selector: "app-daily-task-dialog",
  templateUrl: "./daily-task-dialog.component.html",
  styleUrls: ["./daily-task-dialog.component.scss"],
})
export class DailyTaskDialogComponent implements OnInit {
  private backupTask: Partial<DailyTask> = { ...this.data.dailyTask };
  private totalChecklist: number;
  public doneChecklist: number;

  public filteredChecklist: CheckList[];
  public isEditing = false;
  public checklistText: string;
  public checklistCompleted: number;
  public showChecklists: boolean;
  public showHideCompletedTask: boolean;
  public tooltipPosition: string;

  constructor(
    public dialogRef: MatDialogRef<DailyTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DailyTaskDialogData,
    private dialog: MatDialog,
    private dialyService: DailyService
  ) {}

  ngOnInit(): void {
    this.showChecklists = false;
    this.showHideCompletedTask = false;
    this.checklistText = "";
    this.tooltipPosition = "right";
    // this.filteredChecklist = this.data.dailyTask.checklist;
    if (this.data.dailyTask.checklist) {
      this.filteredChecklist = cloneDeep(this.data.dailyTask.checklist);
    }
    this.calculateChecklistCompleted();
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.filteredChecklist) {
      this.data.dailyTask.checklist = cloneDeep(this.filteredChecklist);
    }

    if (
      this.data.dailyTask.checklist &&
      this.data.dailyTask.checklist.length > 0
    ) {
      this.data.dailyTask.checklist.forEach((checklist) => {
        delete checklist.isEditing;
        delete checklist.unsaved;
      });
    }

    this.dialogRef.close(this.data);
  }

  delete() {
    const delDialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: "240px",
      disableClose: true,
    });

    delDialogRef
      .afterClosed()
      .subscribe((result: DeleteConfirmationDialogResult) => {
        if (result.delete) {
          this.dialogRef.close({
            dailyTask: this.data.dailyTask,
            delete: true,
          });
        }
      });
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log(event);
    moveItemInArray(
      this.filteredChecklist,
      event.previousIndex,
      event.currentIndex
    );
  }

  showChecklistSection() {
    this.showChecklists = true;
  }

  showHideCompletedChecklist() {
    console.info("Hiding completed checklist items.");
    this.showHideCompletedTask = !this.showHideCompletedTask;
    if (this.showHideCompletedTask) {
      this.filteredChecklist = this.data.dailyTask.checklist.filter(
        (checklist: CheckList) => {
          return checklist.done != true;
        }
      );
    } else {
      this.filteredChecklist = cloneDeep(this.data.dailyTask.checklist);
    }
  }

  calculateChecklistCompleted() {
    this.checklistCompleted = 0;
    this.doneChecklist = 0;
    if (
      this.data.dailyTask.checklist &&
      this.data.dailyTask.checklist.length > 0
    ) {
      this.totalChecklist = this.data.dailyTask.checklist.length;
      this.data.dailyTask.checklist.forEach((checklist) => {
        if (checklist.done) {
          this.doneChecklist += 1;
        }
      });
      this.checklistCompleted = Math.floor(
        (this.doneChecklist / this.totalChecklist) * 100
      );
    }
  }

  updateChecklist() {
    if (this.checklistText.trim()) {
      const checklistArr = this.checklistText.trim().split("\n");
      console.log(checklistArr);

      if (checklistArr.length > 1) {
        let newCheckListArr: CheckList[] = [];
        checklistArr.forEach((chklst) => {
          const newCheckList: CheckList = {
            text: chklst,
            done: false,
            unsaved: true,
            isEditing: false,
          };
          newCheckListArr.push(newCheckList);
        });
        console.log(newCheckListArr);
        if (!this.data.dailyTask.checklist) {
          this.data.dailyTask.checklist = [];
          this.filteredChecklist = [];
        }
        this.data.dailyTask.checklist.push(...newCheckListArr);
        this.filteredChecklist.push(...newCheckListArr);
      } else {
        const newCheckList: CheckList = {
          text: this.checklistText,
          done: false,
          unsaved: true,
          isEditing: false,
        };

        if (!this.data.dailyTask.checklist) {
          this.data.dailyTask.checklist = [];
          this.filteredChecklist = [];
        }
        this.data.dailyTask.checklist.push(newCheckList);
        this.filteredChecklist.push(newCheckList);
      }
    }
    this.checklistText = "";
    this.calculateChecklistCompleted();
  }

  deleteAllChecklist() {
    console.info("Delete all checklist items.");
    this.data.dailyTask.checklist = [];
    this.filteredChecklist = [];
    this.calculateChecklistCompleted();
  }

  markCompleteAllChecklist() {
    this.filteredChecklist.forEach((checklist: CheckList) => {
      if (!checklist.done) {
        checklist.done = true;
      }
    });
    this.data.dailyTask.checklist.forEach((checklist: CheckList) => {
      if (!checklist.done) {
        checklist.done = true;
      }
    });
    this.calculateChecklistCompleted();
  }

  deleteChecklist(checklist: CheckList) {
    this.data.dailyTask.checklist.splice(
      this.data.dailyTask.checklist.indexOf(checklist),
      1
    );
    this.filteredChecklist.splice(this.filteredChecklist.indexOf(checklist), 1);
    this.calculateChecklistCompleted();
  }

  setDueDateChecklist(checklist: CheckList) {
    // const index = this.data.task.checklist.indexOf($event);
    // console.log($event);
    let localDate: firestore.Timestamp;
    if (checklist.dueDate && checklist.dueDate.date) {
      localDate = checklist.dueDate.date;
    }
    const dialogRef = this.dialog.open(CalenderDialogComponent, {
      width: "360px",
      data: {
        date: localDate,
        enableCalender: true,
        enableTime: false,
      },
    });
    dialogRef.afterClosed().subscribe((result: CalenderDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      //Check if dueDate is empty & initialize to empty object
      if (checklist.dueDate == undefined) {
        checklist.dueDate = {};
      }

      checklist.dueDate.date = result.date;
    });
  }

  checklistClicked(checklist: CheckList) {
    console.log(checklist);
    if (checklist.done) {
      this.doneChecklist -= 1;
    } else {
      this.doneChecklist += 1;
    }
    this.checklistCompleted = Math.floor(
      (this.doneChecklist / this.totalChecklist) * 100
    );
  }

  openColorDialog() {
    const dialogRef = this.dialog.open(ColorDialogComponent, {
      width: "500px",
      height: "600px",
      data: {
        color: "",
      },
    });
    dialogRef.afterClosed().subscribe((result: ColorDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      this.data.dailyTask.backgroundColor = result.color;
    });
  }

  openLabelDialog() {
    // const allLabels = [...this.data.labels];
    // const dialogRef = this.dialog.open(LabelDialogComponent, {
    //   width: "360px",
    //   data: {
    //     labels: allLabels,
    //     enableDelete: false,
    //     taskId: this.data.task.id,
    //     boardId: this.data.boardId,
    //   },
    // });
    // dialogRef.afterClosed().subscribe((result: LabelDialogResult) => {
    //   if (!result) {
    //     return;
    //   }
    //   result.labels.forEach((label) => {
    //     delete label.isSelected;
    //   });
    //   this.data.labels = result.labels;
    //   this.data.updatedLabels = result.updatedLabelData;
    // });
  }

  isAddLabelDisabled() {
    return !this.data.dailyTask.id;
  }

  openCopyDialog() {
    const msg = "Are you sure you want to copy this task?";
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "240px",
      data: {
        message: msg,
      },
    });
    dialogRef.afterClosed().subscribe((result: ConfirmDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      if (result.confirm) {
        let copyTask: DailyTask = this.data.dailyTask as DailyTask;
        copyTask.created = new Date();
        copyTask.modified = new Date();
        this.dialyService.copyTask(copyTask);
      }
    });
  }
}

export interface DailyTaskDialogData {
  dailyTask: Partial<DailyTask>;
  enableDelete: boolean;
}

export interface DailyTaskDialogResult {
  dailyTask: DailyTask;
  delete?: boolean;
}
