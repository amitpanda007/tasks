import { Component, Input, OnInit, Output, EventEmitter, HostListener, ElementRef } from "@angular/core";
import { MatDialog } from "@angular/material";
import * as firebase from "firebase";
import { firestore } from "firebase";
import {
  CalenderDialogComponent,
  CalenderDialogResult,
} from "src/app/common/calender-dialog/calender-dialog.component";
import {
  MessageDialogComponent,
  MessageDialogResult,
} from "src/app/common/message-dialog/message-dialog.component";
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
  @Output() addMessage = new EventEmitter();
  @Output() delete = new EventEmitter<DailyTask>();
  @Output() moveToday = new EventEmitter<DailyTask>();
  @Output() reminder = new EventEmitter();
  @Output() statusChanged = new EventEmitter();
  @Output() priorityChnaged = new EventEmitter();

  private reminderTime: any;
  public taskElapsedDays: any;
  public totalChecklist: number;
  public completedChecklist: number;
  public statusOptions: Status[];
  public selectStatusBackgroundColor: string;
  public selectStatusColor: string;
  public isStatusIconSelected: boolean;
  public priority: string;
  public isPriorityIconSelected: boolean;
  public msgTooltip: string;
  public reminderTooltip: string;
  public showReminder: boolean;


  constructor(private eRef: ElementRef, private dialog: MatDialog) {}

  ngOnInit(): void {
    if (this.dailyTask.priority) {
      this.priority = this.dailyTask.priority;
    } else {
      this.priority = "blocker";
    }

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
      this.taskElapsedDays = "-" + days * -1 + " DAY";
    } else if (days == 0) {
      this.taskElapsedDays = "Today";
    } else {
      this.taskElapsedDays = "+" + days + " DAY";
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

    if (!this.dailyTask.message) {
      this.msgTooltip = "Add special msg";
    } else {
      this.msgTooltip = this.dailyTask.message;
    }

    if(!this.dailyTask.reminder) {
      this.reminderTooltip = "Add reminder for task";
    }else {
      const remDate = this.dailyTask.reminder as any;
      const convrtDate = new Date(remDate.toDate());
      const finalDate = convrtDate.toDateString() + " " +convrtDate.toLocaleTimeString();
      this.reminderTooltip = `Reminder set for: ${finalDate}`;
    }

    this.checkReminderStatus();
    this.isPriorityIconSelected = false;
    this.isStatusIconSelected = false;
  }

  ngOnDestroy(): void {
    window.clearTimeout(this.reminderTime);
  }

  //TODO: Complete reminder countdown. 
  //Make sure to keep starting reminder when 1hr left.
  checkReminderStatus() {
    if (this.dailyTask.reminder) {
      const reminder = this.dailyTask.reminder as any;
      if (new Date() > reminder.toDate()) {
        this.showReminder = true;
      } else {
        console.log(`REMINDER DATE IN FUTURE FOR TASK: ${this.dailyTask.title}`);
        const timeDiff = this.calculateTimeDiff(new Date(), reminder.toDate());
        console.log(timeDiff);

        const ONE_HOUR = 60 * 60 * 1000;
        if (timeDiff < ONE_HOUR) {
          console.log(`Starting timer as reminder is less than ${ONE_HOUR / (60* 60 * 1000)} hour away.`);
          this.reminderTime = setTimeout(() => {
            this.showReminder = true;
          }, timeDiff);
        } else {
          console.log(`Counter not started as time till reminder is greater than ${ONE_HOUR / (60* 60 * 1000)} hour.`);
          this.showReminder = false;
        }
      }
    } else {
      this.showReminder = false;
    }
  }

  calculateTimeDiff(dateTimeOne, dateTimeTwo) {
    let diffTime = Math.abs(dateTimeOne - dateTimeTwo);
    return diffTime;
  }

  calculateDays(dateOne, dateTwo) {
    let diffTime = Math.abs(dateTwo - dateOne);
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (dateOne > dateTwo) {
      diffDays = diffDays * -1;
    }
    return diffDays;
  }

  onStatusChange(selectedStatus) {
    console.log(selectedStatus);
    const status: Status = this.statusOptions.find(
      (status) => status.id == selectedStatus
    );
    this.statusChanged.emit({ task: this.dailyTask, status: status });
  }

  statusIconClicked() {
    console.log("STATUS MENU OPENED.");
    this.isPriorityIconSelected = true;
  }

  statusMenuClosed() {
    console.log("STATUS MENU CLOSED.");
    this.isPriorityIconSelected = false;
  }

  isStatusSelected(status: Status) {
    if (status.name == this.dailyTask.status) {
      return true;
    }
  }

  selectedMenu(priority: string) {
    console.log(priority);
    const taskPriority = {
      taskId: this.dailyTask.id,
      priority: priority,
    };
    this.priorityChnaged.emit(taskPriority);
  }

  priorityIconClicked() {
    console.log("CLICKED ON PRIORITY ICON");
    this.isPriorityIconSelected = true;
  }

  //FIXME: This event is getting triggered for all the components and might cause performance issues.
  // We can use Menu closed event to target the hide of icon.

  /* @HostListener('document:click', ['$event'])
  clickout(event) {
    if(this.eRef.nativeElement.contains(event.target)) {
      console.log("CLICKED INSIDE");
    } else {
      this.isPriorityIconSelected = false;
      console.log("CLICKED OUTSIDE");
    }
  } */

  priorityMenuClosed() {
    console.log("PRIORITY MENU IS CLOSED.");
    this.isPriorityIconSelected = false;
  }

  setMessage() {
    let isMessageAdded: boolean = false;
    if (this.dailyTask.message) {
      isMessageAdded = true;
    }
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: "340px",
      data: {
        message: this.dailyTask.message,
        enableDelete: isMessageAdded,
      },
    });
    dialogRef.afterClosed().subscribe((result: MessageDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      if (result.message) {
        this.dailyTask.message = result.message;
      }

      const updatedTask = {
        task: this.dailyTask,
        delete: result.delete,
      };
      this.addMessage.emit(updatedTask);
    });
  }

  setReminder(deleteReminder: boolean = false) {
    if (deleteReminder) {
      console.log("Deleting reminder");
      const updatedDate = {
        task: this.dailyTask,
        delete: deleteReminder,
      };
      this.reminder.emit(updatedDate);
      return;
    }
    let localDate: Date;
    if (this.dailyTask.reminder) {
      localDate = this.dailyTask.reminder;
    }
    const dialogRef = this.dialog.open(CalenderDialogComponent, {
      width: "360px",
      data: {
        date: localDate,
        enableCalender: true,
        enableTime: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: CalenderDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      let timestamp: Date;
      const newDate = new Date(result.date as any);
      if (result.time) {
        timestamp = new Date(
          newDate.toDateString().substr(0, 15) + " " + result.time
        );
        this.dailyTask.reminder = timestamp;
      } else {
        timestamp = result.date as any;
        this.dailyTask.reminder = timestamp;
      }
      const updatedDate = {
        task: this.dailyTask,
        delete: deleteReminder,
      };
      this.reminder.emit(updatedDate);
    });
  }

  // number coming from component is in minutes.
  snoozeReminder(time: number) {
    console.log(`Snoozing reminder for ${time} mins`);
    const curDate = new Date();
    const newDate = new Date(curDate.setMinutes((curDate.getMinutes() + time)));

    this.dailyTask.reminder = newDate;
    const updatedDate = {
      task: this.dailyTask,
      delete: false,
    };
    this.reminder.emit(updatedDate);
  }
}
