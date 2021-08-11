import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Task } from "./task";
import { Label } from "./label";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";

@Component({
  selector: "task",
  templateUrl: "task.component.html",
  styleUrls: ["task.component.scss"],
})
export class TaskComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() labels: Label[] | null = null;
  @Output() edit = new EventEmitter<Task>();
  public showLabelText: boolean = false;
  public overDue: boolean = false;
  public currentState: string = "initial";
  public checklistsLength: number;
  public textColor: string;

  constructor(private boardServiceV2: BoardServiceV2) {}

  ngOnInit(): void {
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
    if (this.task.checklists) {
      this.task.checklists.forEach((tskChecklist) => {
        if (tskChecklist.checklist) {
          this.checklistsLength += tskChecklist.checklist.length;
        }
      });
    }

    if(this.task.backgroundColor) {
      this.getTextColor(this.task.backgroundColor);
      // this.textColor = this.setAdaptiveTextColor(this.task.backgroundColor, 2);
    }
  }

  hideLabelName() {
    // this.showLabelText = !this.showLabelText;
    this.boardServiceV2.showHideTaskLabelName(this.showLabelText);
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
