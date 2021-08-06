import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { firestore } from "firebase";
import * as cloneDeep from "lodash/cloneDeep";
import { CheckList } from "src/app/tasks/task/checklist";
import { Label } from "src/app/tasks/task/label";
import { Task } from "src/app/tasks/task/task";
import {
  CalenderDialogComponent,
  CalenderDialogResult,
} from "../calender-dialog/calender-dialog.component";
import {
  ColorDialogComponent,
  ColorDialogResult,
} from "../color-dialog/color-dialog.component";
import {
  DeleteConfirmationDialogComponent,
  DeleteConfirmationDialogResult,
} from "../delete.dialog.component";
import {
  LabelDialogComponent,
  LabelDialogResult,
} from "../label-dialog/label-dialog.component";
import {
  MemberDialogComponent,
  MemberDialogResult,
} from "../member-dialog/member-dialog.component";
import {
  MoveDialogComponent,
  MoveDialogResult,
} from "../move-dialog/move-dialog.component";
import {
  CopyDialogComponent,
  CopyDialogResult,
} from "../copy-dialog/copy-dialog.component";
import { ErrorSnackbar, SuccessSnackbar } from "../snackbar.component";
import { MatSnackBar } from "@angular/material";
import { SharedUser } from "src/app/boards/board/board";
import {
  MessageDialogComponent,
  MessageDialogResult,
} from "../message-dialog/message-dialog.component";
import { TaskLock } from "src/app/tasks/task/tasklock";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "app-task-dialog",
  templateUrl: "./task-dialog.component.html",
  styleUrls: ["./task-dialog.component.scss"],
})
export class TaskDialogComponent implements OnInit {
  private backupTask: Partial<Task> = { ...this.data.task };
  private labels: Label[] = { ...this.data.labels };
  private totalChecklist: number;
  public doneChecklist: number;

  public filteredChecklist: CheckList[];
  public isEditing = false;
  public checklistText: string;
  public checklistCompleted: number;
  public selectedDate: string;
  public overDue: boolean;
  public tooltipPosition: string;
  public showHideCompletedTask: boolean;

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log(this.data.task.id);
    this.tooltipPosition = "right";
    this.showHideCompletedTask = false;
    // this.filteredChecklist = this.data.task.checklist;
    if (this.data.task.checklist) {
      this.filteredChecklist = cloneDeep(this.data.task.checklist);
    }
    console.log(this.filteredChecklist);
    this.calculateChecklistCompleted();
    this.checkDueDateStatus();
  }

  calculateChecklistCompleted() {
    this.checklistCompleted = 0;
    this.doneChecklist = 0;
    if (this.data.task.checklist && this.data.task.checklist.length > 0) {
      this.totalChecklist = this.data.task.checklist.length;
      this.data.task.checklist.forEach((checklist) => {
        if (checklist.done) {
          this.doneChecklist += 1;
        }
      });
      this.checklistCompleted = Math.floor(
        (this.doneChecklist / this.totalChecklist) * 100
      );
    }
  }

  checkDueDateStatus() {
    if (this.data.task.dueDate && this.data.task.dueDate.date) {
      const timeNowMilli = new Date().getTime();
      const firebaseTime = Number(this.data.task.dueDate.date.toDate());
      if (firebaseTime > timeNowMilli) {
        this.overDue = false;
      } else {
        this.overDue = true;
      }
    }
  }

  checklistClicked($event: CheckList) {
    console.log($event);
    if ($event.done) {
      this.doneChecklist -= 1;
    } else {
      this.doneChecklist += 1;
    }
    this.checklistCompleted = Math.floor(
      (this.doneChecklist / this.totalChecklist) * 100
    );
  }

  save(): void {
    if (this.filteredChecklist) {
      this.data.task.checklist = cloneDeep(this.filteredChecklist);
    }

    if (this.data.task.checklist && this.data.task.checklist.length > 0) {
      this.data.task.checklist.forEach((checklist) => {
        delete checklist.isEditing;
        delete checklist.unsaved;
      });
    }

    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.data.task.title = this.backupTask.title;
    this.data.task.description = this.backupTask.description;
    this.data.task.checklist = this.backupTask.checklist;
    this.dialogRef.close();
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
          this.dialogRef.close({ task: this.data.task, delete: true });
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

  // updateChecklist() {
  //   const newCheckList: CheckList = {
  //     text: this.checklistText,
  //     done: false,
  //     unsaved: true,
  //     isEditing: false,
  //   };
  //   if (!this.data.task.checklist) {
  //     this.data.task.checklist = [];
  //     this.filteredChecklist = [];
  //   }
  //   this.data.task.checklist.push(newCheckList);
  //   this.filteredChecklist.push(newCheckList);
  //   this.checklistText = "";
  //   this.calculateChecklistCompleted();
  //   console.log(this.data.task);
  // }

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
        if (!this.data.task.checklist) {
          this.data.task.checklist = [];
          this.filteredChecklist = [];
        }
        this.data.task.checklist.push(...newCheckListArr);
        this.filteredChecklist.push(...newCheckListArr);
      } else {
        const newCheckList: CheckList = {
          text: this.checklistText,
          done: false,
          unsaved: true,
          isEditing: false,
        };

        if (!this.data.task.checklist) {
          this.data.task.checklist = [];
          this.filteredChecklist = [];
        }
        this.data.task.checklist.push(newCheckList);
        this.filteredChecklist.push(newCheckList);
      }
    }
    this.checklistText = "";
    this.calculateChecklistCompleted();
  }

  setDueDateChecklist($event: CheckList) {
    // const index = this.data.task.checklist.indexOf($event);
    // console.log($event);
    let localDate: firestore.Timestamp;
    if ($event.dueDate && $event.dueDate.date) {
      localDate = $event.dueDate.date;
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
      if ($event.dueDate == undefined) {
        $event.dueDate = {};
      }

      $event.dueDate.date = result.date;
    });
  }

  assignChecklist($event: CheckList) {
    const index = this.data.task.checklist.indexOf($event);
    console.log(index);

    const curChecklist = this.data.task.checklist[index];

    const dialogRef = this.dialog.open(MemberDialogComponent, {
      width: "360px",
      data: {
        members: this.data.boardMembers,
        addedMembers: curChecklist.members,
      },
    });
    dialogRef.afterClosed().subscribe((result: MemberDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
      if (result.addedMembers && result.addedMembers.length > 0) {
        if (!$event.members) {
          $event.members = [];
        }
        result.addedMembers.forEach((member) => {
          delete member.isAdded;
        });
        $event.members = result.addedMembers;
      }
    });
  }

  deleteChecklist(checklist: CheckList) {
    this.data.task.checklist.splice(
      this.data.task.checklist.indexOf(checklist),
      1
    );
    this.filteredChecklist.splice(this.filteredChecklist.indexOf(checklist), 1);
    this.calculateChecklistCompleted();
  }

  showHideCompletedChecklist() {
    console.info("Hiding completed checklist items.");
    this.showHideCompletedTask = !this.showHideCompletedTask;
    if (this.showHideCompletedTask) {
      this.filteredChecklist = this.data.task.checklist.filter(
        (checklist: CheckList) => {
          return checklist.done != true;
        }
      );
    } else {
      this.filteredChecklist = cloneDeep(this.data.task.checklist);
    }
  }

  deleteAllChecklist() {
    console.info("Delete all checklist items.");
    this.data.task.checklist = [];
    this.filteredChecklist = [];
    this.calculateChecklistCompleted();
  }

  openLabelDialog() {
    const allLabels = [...this.data.labels];
    const dialogRef = this.dialog.open(LabelDialogComponent, {
      width: "360px",
      data: {
        labels: allLabels,
        enableDelete: false,
        taskId: this.data.task.id,
        boardId: this.data.boardId,
      },
    });
    dialogRef.afterClosed().subscribe((result: LabelDialogResult) => {
      if (!result) {
        return;
      }
      result.labels.forEach((label) => {
        delete label.isSelected;
      });

      this.data.labels = result.labels;
      this.data.updatedLabels = result.updatedLabelData;
    });
  }

  isAddLabelDisabled() {
    return !this.data.task.id;
  }

  openCalenderDialog() {
    let localDate: firestore.Timestamp;
    if (this.data.task.dueDate && this.data.task.dueDate.date) {
      localDate = this.data.task.dueDate.date;
    }
    const dialogRef = this.dialog.open(CalenderDialogComponent, {
      width: "360px",
      data: {
        date: localDate,
        enableCalender: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: CalenderDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      //Check if dueDate is empty & initialize to empty object
      if (this.data.task.dueDate == undefined) {
        this.data.task.dueDate = {};
      }

      this.data.task.dueDate.date = result.date;
    });
  }

  openCreateChecklistDialog() {
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

      this.data.task.backgroundColor = result.color;
    }); 
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

      this.data.task.backgroundColor = result.color;
    });
  }

  openMemberDialog() {
    const dialogRef = this.dialog.open(MemberDialogComponent, {
      width: "280px",
      data: {
        members: this.data.boardMembers,
        addedMembers: this.data.task.members,
      },
    });
    dialogRef.afterClosed().subscribe((result: MemberDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
      if (result.addedMembers && result.addedMembers.length > 0) {
        if (!this.data.task.members) {
          this.data.task.members = [];
        }
        result.addedMembers.forEach((member) => {
          delete member.isAdded;
        });
        this.data.task.members = result.addedMembers;
      }
    });
  }

  openMoveDialog() {
    const dialogRef = this.dialog.open(MoveDialogComponent, {
      width: "360px",
      data: {
        boardId: this.data.boardId,
        task: this.data.task,
        labels: this.data.labels,
      },
    });
    dialogRef.afterClosed().subscribe((result: MoveDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
      if (result.targetListId == null) {
        this.cancel();
      }
      this.data.task.listId = result.targetListId;
    });
  }

  openCopyDialog() {
    const dialogRef = this.dialog.open(CopyDialogComponent, {
      width: "360px",
      data: {
        boardId: this.data.boardId,
        task: this.data.task,
        labels: this.data.labels,
      },
    });
    dialogRef.afterClosed().subscribe((result: CopyDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
    });
  }

  async shareBoard() {
    let angularNavigator: any;
    angularNavigator = window.navigator;

    const baseUrl = window.location.origin;
    const shareData = {
      title: "Interview URL",
      text: "click on URL to navigate to an Interview",
      url: `${baseUrl}/boards/${this.data.boardId}`,
    };

    if (angularNavigator && angularNavigator.share) {
      await angularNavigator.share(shareData).then((_) => {
        console.log("Share Complete");
      });
    }
  }

  addMessage() {
    console.log("Adding message to Task");
    let isMessageAdded: boolean = false;
    if (this.data.task.message) {
      isMessageAdded = true;
    }
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: "340px",
      data: {
        message: this.data.task.message,
        enableDelete: isMessageAdded,
      },
    });
    dialogRef.afterClosed().subscribe((result: MessageDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      if (result.message) {
        this.data.task.message = result.message;
      }
    });
  }

  lockTask() {
    let status: boolean;
    if (this.data.task.lockStatus && this.data.task.lockStatus.isLocked) {
      status = !this.data.task.lockStatus.isLocked;
    } else {
      status = true;
    }

    const lockTask: TaskLock = {
      isLocked: status,
      lockedByUserId: this.authService.getUID(),
    };
    this.data.task.lockStatus = lockTask;
  }
}

export interface TaskDialogData {
  task: Partial<Task>;
  labels: Label[];
  updatedLabels?: Label[];
  boardId: string;
  boardMembers: SharedUser[];
  enableDelete: boolean;
}

export interface TaskDialogResult {
  task: Task;
  delete?: boolean;
  labels?: Label[];
  updatedLabels?: Label[];
}
