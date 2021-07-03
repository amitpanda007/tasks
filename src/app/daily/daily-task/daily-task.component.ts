import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DailyTask } from "./dailytask";

@Component({
  selector: "daily-task",
  templateUrl: "daily-task.component.html",
  styleUrls: ["daily-task.component.scss"],
})
export class DailyTaskComponent implements OnInit {
  @Input() dailyTask: DailyTask;
  @Output() edit = new EventEmitter<DailyTask>();
  @Output() done = new EventEmitter<DailyTask>();
  @Output() delete = new EventEmitter<DailyTask>();

  public taskElapsedDays: any;
  public totalChecklist: number;
  public completedChecklist: number;

  constructor() {}

  ngOnInit(): void {
    // Calculated number of days before which task was creaed
    const days = this.calculateDays(
      new Date(),
      this.dailyTask.created.toDate()
    );
    if (days < 0) {
      this.taskElapsedDays = days * -1 + " days old";
    } else if (days == 0) {
      this.taskElapsedDays = "Today";
    } else {
      this.taskElapsedDays = "After " + days + " days";
    }

    // Calculated number checklist
    if (this.dailyTask.checklist) {
      this.totalChecklist = this.dailyTask.checklist.length;
      const completedChecklistData = this.dailyTask.checklist.filter(
        (checklist) => checklist.done == true
      );
      if (completedChecklistData) {
        this.completedChecklist = completedChecklistData.length;
      } else {
        this.completedChecklist = 0;
      }
    }
  }

  calculateDays(dateOne, dateTwo) {
    let diffTime = Math.abs(dateTwo - dateOne);
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (dateOne > dateTwo) {
      diffDays = diffDays * -1;
    }
    return diffDays;
  }

  onChange(deviceValue) {
    console.log(this.dailyTask);
    console.log(deviceValue);
  }
}
