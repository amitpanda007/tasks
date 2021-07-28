import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Task } from "./task";
import { Label } from "./label";

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

  constructor() {}

  ngOnInit(): void {
    if(this.task.dueDate) {
      if(!this.task.dueDate.completed) {
        this.task.dueDate.completed = false;
      }
    }
    this.checkDueDateStatus();
  }

  hideLabelName() {
    this.showLabelText = !this.showLabelText;
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
