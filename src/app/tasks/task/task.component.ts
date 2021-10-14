import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { cloneDeep } from "lodash";
import { Task } from "./task";
import { Label } from "./label";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";
import { Constant } from "src/app/shared/constants";
import { Status } from "src/app/daily/daily-task/status";
import { TaskOption } from "./taskoptions";
import { TaskChecklist } from "./taskchecklist";
import { MatDialog, MatMenuTrigger } from "@angular/material";
import {
  LabelDialogComponent,
  LabelDialogResult,
} from "src/app/common/label-dialog/label-dialog.component";
import {
  MemberDialogComponent,
  MemberDialogResult,
} from "src/app/common/member-dialog/member-dialog.component";
import {
  ColorDialogComponent,
  ColorDialogResult,
} from "src/app/common/color-dialog/color-dialog.component";
import {
  MoveDialogComponent,
  MoveDialogResult,
} from "src/app/common/move-dialog/move-dialog.component";
import { TaskList } from "../task-list/tasklist";
import { CopyDialogComponent, CopyDialogResult } from "src/app/common/copy-dialog/copy-dialog.component";
import { firestore } from "firebase";
import { CalenderDialogComponent, CalenderDialogResult } from "src/app/common/calender-dialog/calender-dialog.component";

@Component({
  selector: "task",
  templateUrl: "task.component.html",
  styleUrls: ["task.component.scss"],
})
export class TaskComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() labels: Label[] | null = null;
  @Input() boardId: string | null = null;
  @Input() listName: string | null = null;
  @Input() taskLists: TaskList[] | null = null;
  @Input() boardMembers: [] | null = null;
  @Input() options: TaskOption = {
    showTaskPriority: false,
    showTaskStatus: false,
  };
  @Output() edit = new EventEmitter<Task>();
  @Output() priorityChnaged = new EventEmitter();
  @Output() statusChanged = new EventEmitter();

  @ViewChild("taskCard", { static: false }) public taskCardRef: ElementRef;
  menuTopLeftPosition = { x: "0", y: "0" };
  // reference to the MatMenuTrigger in the DOM
  @ViewChild("contextMenuTrigger", { static: false })
  contextMenuTrigger: MatMenuTrigger;

  public showLabelText: boolean = false;
  public overDue: boolean = false;
  public currentState: string = "initial";
  public checklistsLength: number;
  public checklistsCompletedLength: number;
  public textColor: string;
  public priority: string;
  public isPriorityIconSelected: boolean;

  public isStatusIconSelected: boolean;
  public statusOptions: Status[];
  public selectStatusBackgroundColor: string;
  public selectStatusColor: string;
  public localChecklists: TaskChecklist[];

  constructor(
    private boardServiceV2: BoardServiceV2,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.task.priority) {
      this.priority = this.task.priority;
    } else {
      this.priority = "blocker";
    }

    this.statusOptions = Constant.STATUS_OPTIONS;
    if (this.task.status) {
      const currentStatus = this.statusOptions.filter(
        (status) => status.name == this.task.status
      );
      this.selectStatusBackgroundColor = currentStatus[0].backgroundColor;
      this.selectStatusColor = currentStatus[0].color;
    } else {
      this.selectStatusBackgroundColor = "#CFD8DC";
      this.selectStatusColor = "#455A64";
    }

    this.textColor = "#000000";
    this.boardServiceV2.showHidelabel.subscribe((value) => {
      this.showLabelText = value;
    });

    if (this.task.dueDate) {
      if (!this.task.dueDate.completed) {
        this.task.dueDate.completed = false;
      }
    }
    this.checkDueDateStatus();

    this.checklistsLength = 0;
    this.checklistsCompletedLength = 0;
    if (this.task.checklists) {
      this.task.checklists.forEach((tskChecklist) => {
        if (tskChecklist.checklist) {
          this.checklistsLength += tskChecklist.checklist.length;
          this.checklistsCompletedLength += tskChecklist.checklist.filter(
            (chklst) => chklst.done == true
          ).length;
        }
      });
    }

    if (this.task.backgroundColor) {
      this.getTextColor(this.task.backgroundColor);
      // this.textColor = this.setAdaptiveTextColor(this.task.backgroundColor, 2);
    }
    this.localChecklists = this.task.checklists;
    this.isPriorityIconSelected = false;
    this.isStatusIconSelected = false;
  }

  hideLabelName() {
    // this.showLabelText = !this.showLabelText;
    this.boardServiceV2.showHideTaskLabelName(this.showLabelText);
  }

  editTask() {
    if (!this.isStatusIconSelected) {
      this.edit.emit(this.task);
    }
  }

  /**
   * Method called when the user click with the right button
   * @param event MouseEvent, it contains the coordinates
   */
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + "px";
    this.menuTopLeftPosition.y = event.clientY + "px";
    this.contextMenuTrigger.openMenu();
  }

  //TODO: Complete these features
  openTaskLabels() {
    const allLabels = cloneDeep(this.labels);
    const dialogRef = this.dialog.open(LabelDialogComponent, {
      width: "360px",
      data: {
        positionRelativeToElement: this.taskCardRef,
        labels: allLabels,
        enableDelete: false,
        taskId: this.task.id,
        boardId: this.boardId,
        enableEdit: true,
        taskTitle: this.task.title,
        listName: this.listName,
      },
    });
    dialogRef.afterClosed().subscribe((result: LabelDialogResult) => {
      if (!result) {
        return;
      }
      result.labels.forEach((label) => {
        delete label.isSelected;
      });

      if (result.updatedLabelData && result.updatedLabelData.length > 0) {
        this.boardServiceV2.updateLabelBatch(
          this.boardId,
          result.updatedLabelData
        );
      }
      console.log("Updating task");
      this.task.modified = new Date();
      this.boardServiceV2.updateTask(this.boardId, this.task.id, this.task);
    });
  }

  openTaskMembers() {
    const dialogRef = this.dialog.open(MemberDialogComponent, {
      width: "280px",
      data: {
        members: this.boardMembers,
        addedMembers: this.task.members,
      },
    });
    dialogRef.afterClosed().subscribe((result: MemberDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
      if (result.addedMembers && result.addedMembers.length > 0) {
        if (!this.task.members) {
          this.task.members = [];
        }
        result.addedMembers.forEach((member) => {
          delete member.isAdded;
        });
        this.task.members = result.addedMembers;
      }
      this.boardServiceV2.updateTask(this.boardId, this.task.id, this.task);
    });
  }

  chnageTaskColor() {
    const curBgColor = this.task.backgroundColor
      ? this.task.backgroundColor
      : "";

    const dialogRef = this.dialog.open(ColorDialogComponent, {
      width: "500px",
      height: "600px",
      data: {
        color: curBgColor,
      },
    });
    dialogRef.afterClosed().subscribe((result: ColorDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      this.task.backgroundColor = result.color;
      this.boardServiceV2.updateTask(this.boardId, this.task.id, this.task);
    });
  }

  moveTask() {
    const dialogRef = this.dialog.open(MoveDialogComponent, {
      width: "360px",
      data: {
        boardId: this.boardId,
        task: this.task,
        labels: this.labels,
        taskLists: this.taskLists,
      },
    });
    dialogRef.afterClosed().subscribe((result: MoveDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
      if (result.targetListId == null) {
        return;
      }
      this.task.listId = result.targetListId;
    });
  }

  taskCopy() {
    const dialogRef = this.dialog.open(CopyDialogComponent, {
      width: "360px",
      data: {
        boardId: this.boardId,
        taskLists: this.taskLists,
        task: this.task,
        labels: this.labels,
      },
    });
    dialogRef.afterClosed().subscribe((result: CopyDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
    });
  }

  changeTaskDate() {
    let localDate: firestore.Timestamp;
    if (this.task.dueDate && this.task.dueDate.date) {
      localDate = this.task.dueDate.date;
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
      if (this.task.dueDate == undefined) {
        this.task.dueDate = {};
      }
      this.task.dueDate.date = result.date;
      this.boardServiceV2.updateTask(this.boardId, this.task.id, this.task);
    });
  }

  archiveTask() {
    const task: Task = this.task as Task;
    if (task.archived) {
      task.archived = false;
    } else {
      task.archived = true;
    }
    this.boardServiceV2.updateTask(this.boardId, this.task.id, this.task);
  }

  setTaskPriority() {
    console.log("CLICKED ON PRIORITY ICON");
    this.isPriorityIconSelected = true;
  }

  selectedMenu(priority: string) {
    console.log(priority);
    const taskPriority = {
      task: this.task,
      priority: priority,
    };
    this.priorityChnaged.emit(taskPriority);
  }

  priorityMenuClosed() {
    console.log("PRIORITY MENU IS CLOSED.");
    this.isPriorityIconSelected = false;
  }

  onStatusChange(selectedStatus) {
    console.log(selectedStatus);
    const status: Status = this.statusOptions.find(
      (status) => status.id == selectedStatus
    );
    this.statusChanged.emit({ task: this.task, status: status });
  }

  statusIconClicked() {
    console.log("STATUS MENU OPENED.");
    this.isStatusIconSelected = true;
  }

  statusMenuClosed() {
    console.log("STATUS MENU CLOSED.");
    this.isStatusIconSelected = false;
  }

  isStatusSelected(status: Status) {
    if (status.name == this.task.status) {
      return true;
    }
  }

  getTextColor(backgroundColor: string) {
    const c = backgroundColor.substring(1);
    const rgb = parseInt(c, 16); // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff; // extract red
    const g = (rgb >> 8) & 0xff; // extract green
    const b = (rgb >> 0) & 0xff; // extract blue

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    // console.log(`For task ${this.task.title}, Color Brightness found ${luma}`);
    if (luma < 130) {
      // pick a different colour
      this.textColor = "#FFFFFFCC";
    }
  }

  setAdaptiveTextColor(hex: string, lum: number) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    let color = "#",
      c,
      i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
      color += ("00" + c).substr(c.length);
    }
    return color;
  }

  checkDueDateStatus() {
    if (this.task.dueDate && this.task.dueDate.date) {
      const timeNowMilli = new Date().getTime();
      const firebaseTime = Number(this.task.dueDate.date.toDate());
      if (firebaseTime > timeNowMilli) {
        this.overDue = false;
      } else {
        this.overDue = true;
      }
    }
  }
}
