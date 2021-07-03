import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { DailyTask } from "./dailytask";
import { Status } from "./status";

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
  @Output() statusChanged = new EventEmitter();

  public taskElapsedDays: any;
  public totalChecklist: number;
  public completedChecklist: number;
  public statusOptions: Status[];
  public selectStatusBackgroundColor: string;
  public selectStatusColor: string;

  constructor() {}

  ngOnInit(): void {
    this.statusOptions = [
      {
        id: 1,
        name: "ToDo",
        backgroundColor: "#CFD8DC",
        color: "#455A64",
      },
      {
        id: 2,
        name: "Open",
        backgroundColor: "#0048b0",
        color: "#ffffff",
      },
      {
        id: 3,
        name: "Inprogress",
        backgroundColor: "#BBDEFB",
        color: "#0D47A1",
      },
      {
        id: 4,
        name: "Done",
        backgroundColor: "#B9F6CA",
        color: "#2E7D32",
      },
      {
        id: 5,
        name: "Blocked",
        backgroundColor: "#FF9E80",
        color: "#D84315",
      },
    ];

    if (this.dailyTask.status) {
      const currentStatus = this.statusOptions.filter(
        (status) => status.name == this.dailyTask.status
      );
      this.selectStatusBackgroundColor = currentStatus[0].backgroundColor;
      this.selectStatusColor = currentStatus[0].color;
    } else {
      this.selectStatusBackgroundColor = "#CFD8DC";
      this.selectStatusColor = "#455A64";
    }

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

  onChange(selectedStatus) {
    console.log(selectedStatus);
    const status: Status[] = this.statusOptions.filter(
      (status) => status.id == selectedStatus
    );
    this.statusChanged.emit({ task: this.dailyTask, status: status });
  }

  isStatusSelected(status: Status) {
    if (status.name == this.dailyTask.status) {
      return true;
    }
  }
}
