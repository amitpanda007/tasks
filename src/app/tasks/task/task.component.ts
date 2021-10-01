import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Task } from "./task";
import { Label } from "./label";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";
import { Constant } from "src/app/shared/constants";
import { Status } from "src/app/daily/daily-task/status";
import { TaskOption } from "./taskoptions";
import { TaskChecklist } from "./taskchecklist";

@Component({
  selector: "task",
  templateUrl: "task.component.html",
  styleUrls: ["task.component.scss"],
})
export class TaskComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() labels: Label[] | null = null;
  @Input() options: TaskOption = {
    showTaskPriority: false,
    showTaskStatus: false
  };
  @Output() edit = new EventEmitter<Task>();
  @Output() priorityChnaged = new EventEmitter();
  @Output() statusChanged = new EventEmitter();

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

  constructor(private boardServiceV2: BoardServiceV2) {}

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
          this.checklistsCompletedLength += tskChecklist.checklist.filter(chklst => chklst.done == true).length;
        }
      });
    }

    if(this.task.backgroundColor) {
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
    if(!this.isStatusIconSelected) {
      this.edit.emit(this.task);
    }
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
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    let color = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i*2,2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      color += ("00"+c).substr(c.length);
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
