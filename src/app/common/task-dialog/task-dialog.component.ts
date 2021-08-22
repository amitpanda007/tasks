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
import { SharedUser } from "src/app/boards/board/board";
import {
  MessageDialogComponent,
  MessageDialogResult,
} from "../message-dialog/message-dialog.component";
import { TaskLock } from "src/app/tasks/task/tasklock";
import { AuthService } from "src/app/core/services/auth.service";
import {
  ChecklistDialogComponent,
  ChecklistDialogResult,
} from "../checklist-dialog/checklist-dialog.component";
import { TaskChecklist } from "src/app/tasks/task/taskchecklist";
import { Subscription } from "rxjs";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";

@Component({
  selector: "app-task-dialog",
  templateUrl: "./task-dialog.component.html",
  styleUrls: ["./task-dialog.component.scss"],
})
export class TaskDialogComponent implements OnInit {
  private backupTask: Partial<Task> = { ...this.data.task };
  private labels: Label[] = { ...this.data.labels };
  private labelsSubscription: Subscription;
  private totalChecklist: number;
  public doneChecklist: number;

  public localChecklists: TaskChecklist[];
  public filteredChecklist: CheckList[];
  public isEditing = false;
  public checklistText: string;
  public checklistCompleted: number;
  public selectedDate: string;
  public overDue: boolean;
  public tooltipPosition: string;
  public showHideCompletedTask: boolean;
  public showHideActivities: boolean;

  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData,
    private dialog: MatDialog,
    private authService: AuthService,
    private boardServiceV2: BoardServiceV2
  ) {}

  ngOnInit(): void {
    console.log(this.data.task.id);
    this.tooltipPosition = "right";
    this.showHideActivities = false;
    // this.showHideCompletedTask = false;
    if (this.data.task.checklists) {
      this.localChecklists = cloneDeep(this.data.task.checklists);
    }

    //Setup extra flags on local checklist
    if (this.localChecklists) {
      this.addPropertyToCkecklist(this.localChecklists);
    }

    //Check if labels exist ? else subscribe
    if (!this.data.labels) {
      this.labelsSubscription = this.boardServiceV2.labelListChanged.subscribe(
        (labels) => {
          console.log(labels);
          this.data.labels = labels;
        }
      );
    }

    this.calculateChecklistCompleted();
    this.checkDueDateStatus();
  }

  ngOnDestroy() {
    if (this.labelsSubscription) {
      this.labelsSubscription.unsubscribe();
      this.boardServiceV2.cancelLabelSubscription();
    }
  }

  save(): void {
    if (this.localChecklists) {
      this.data.task.checklists = cloneDeep(this.localChecklists);
    }

    // Clean up checklist properties before saving.
    if (this.data.task.checklists && this.data.task.checklists.length > 0) {
      this.data.task.checklists.forEach((curChecklist) => {
        delete curChecklist.showHideCompletedTask;
        delete curChecklist.checklistText;
        delete curChecklist.checklistCompleted;
        delete curChecklist.doneChecklist;
        delete curChecklist.totalChecklist;

        if (curChecklist.checklist && curChecklist.checklist.length > 0) {
          curChecklist.checklist.forEach((chklst) => {
            delete chklst.isEditing;
            delete chklst.unsaved;
          });
        }
      });
    }

    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.data.task.title = this.backupTask.title;
    this.data.task.description = this.backupTask.description;
    this.data.task.checklists = this.backupTask.checklists;
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

  addPropertyToCkecklist(localChecklists: TaskChecklist[]) {
    localChecklists.forEach((localList) => {
      localList.showHideCompletedTask = false;
      localList.checklistText = "";
      this.resetChecklistCalc(localList);
    });
  }

  resetChecklistCalc(tskChecklist: TaskChecklist) {
    // tskChecklist.showHideCompletedTask = false;
    // tskChecklist.checklistText = "";
    tskChecklist.checklistCompleted = 0;
    tskChecklist.doneChecklist = 0;
    tskChecklist.totalChecklist = 0;
  }

  calculateChecklistCompleted() {
    if (this.data.task.checklists && this.data.task.checklists.length > 0) {
      this.localChecklists.forEach((localList) => {
        this.resetChecklistCalc(localList);
        if (localList.checklist && localList.checklist.length > 0) {
          localList.totalChecklist = localList.checklist.length;
          localList.checklist.forEach((chklst) => {
            if (chklst.done) {
              localList.doneChecklist += 1;
            }
          });
          localList.checklistCompleted = Math.floor(
            (localList.doneChecklist / localList.totalChecklist) * 100
          );
        }
      });
    }
  }

  checklistClicked($event: CheckList, index: number) {
    console.log($event);
    if ($event.done) {
      this.localChecklists[index].doneChecklist -= 1;
    } else {
      this.localChecklists[index].doneChecklist += 1;
    }
    this.localChecklists[index].checklistCompleted = Math.floor(
      (this.localChecklists[index].doneChecklist /
        this.localChecklists[index].totalChecklist) *
        100
    );
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

  drop(event: CdkDragDrop<string[]>) {
    console.log(event);
    moveItemInArray(
      this.filteredChecklist,
      event.previousIndex,
      event.currentIndex
    );
  }

  updateChecklist(checklist: CheckList[], index: number) {
    if (this.localChecklists[index].checklistText.trim()) {
      const checklistArr = this.localChecklists[index].checklistText
        .trim()
        .split("\n");

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
        checklist.push(...newCheckListArr);
      } else {
        const newCheckList: CheckList = {
          text: this.localChecklists[index].checklistText.trim(),
          done: false,
          unsaved: true,
          isEditing: false,
        };
        checklist.push(newCheckList);
      }
      this.data.task.checklists[index].checklist = checklist;
    }
    this.localChecklists[index].checklistText = "";
    this.calculateChecklistCompleted();
  }

  setDueDateChecklist(
    $event: CheckList,
    checklistIndex: number,
    taskChecklistsIndex: number
  ) {
    const curChecklist =
      this.data.task.checklists[taskChecklistsIndex].checklist[checklistIndex];
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
      curChecklist.dueDate.date = result.date;
    });
  }

  assignChecklist(
    $event: CheckList,
    checklistIndex: number,
    taskChecklistsIndex: number
  ) {
    console.log($event);
    console.log(checklistIndex);
    console.log(taskChecklistsIndex);

    const curChecklist =
      this.data.task.checklists[taskChecklistsIndex].checklist[checklistIndex];
    console.log(curChecklist);

    const dialogRef = this.dialog.open(MemberDialogComponent, {
      width: "280px",
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
        curChecklist.members = result.addedMembers;
      }
    });
  }

  deleteChecklist(
    checklist: CheckList,
    checklists: CheckList[],
    taskChecklistsIndex: number
  ) {
    console.log(taskChecklistsIndex);
    checklists.splice(checklists.indexOf(checklist), 1);
    this.data.task.checklists[taskChecklistsIndex].checklist.splice(
      checklists.indexOf(checklist),
      1
    );
    this.calculateChecklistCompleted();
  }

  showHideCompletedChecklist(index: number) {
    this.localChecklists[index].showHideCompletedTask =
      !this.localChecklists[index].showHideCompletedTask;
    if (this.localChecklists[index].showHideCompletedTask) {
      this.localChecklists[index].checklist = this.localChecklists[
        index
      ].checklist.filter((checklist) => {
        return checklist.done != true;
      });
    } else {
      this.localChecklists[index] = cloneDeep(this.data.task.checklists[index]);
      this.calculateChecklistCompleted();
    }
  }

  deleteAllChecklist(index: number) {
    console.info("Delete all checklist items.");
    this.data.task.checklists.splice(index, 1);
    this.localChecklists.splice(index, 1);
    this.calculateChecklistCompleted();
  }

  showHideActivity() {
    this.showHideActivities = !this.showHideActivities;
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
    console.log(this.data.boardChecklists);
    const dialogRef = this.dialog.open(ChecklistDialogComponent, {
      width: "280px",
      data: {
        boardChecklists: this.data.boardChecklists,
      },
    });
    dialogRef.afterClosed().subscribe((result: ChecklistDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      if (result.checklistName) {
        const newChecklist: TaskChecklist = {
          checklistName: result.checklistName,
          checklist: result.checklistData,
        };
        if (!this.data.task.checklists) {
          this.data.task.checklists = [];
          this.localChecklists = [];
        }
        const newChecklistLocal = cloneDeep(newChecklist);
        const newChecklistLocalAll = cloneDeep(newChecklist);
        this.data.task.checklists.push(newChecklistLocalAll);
        this.localChecklists.push(newChecklistLocal);
        this.addPropertyToCkecklist(this.localChecklists);
        this.calculateChecklistCompleted();
      }
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
  boardChecklists?: TaskChecklist[];
}

export interface TaskDialogResult {
  task: Task;
  delete?: boolean;
  labels?: Label[];
  updatedLabels?: Label[];
}
