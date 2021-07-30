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
  public currentState: string = 'initial';

  constructor(private boardServiceV2: BoardServiceV2) {}

  ngOnInit(): void {
    this.boardServiceV2.showHidelabel.subscribe(value => {
      this.showLabelText = value;
    });

    if(this.task.dueDate) {
      if(!this.task.dueDate.completed) {
        this.task.dueDate.completed = false;
      }
    }
    this.checkDueDateStatus();
  }

  hideLabelName() {
    // this.showLabelText = !this.showLabelText;
    this.boardServiceV2.showHideTaskLabelName(this.showLabelText);
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
