import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import * as cloneDeep from "lodash/cloneDeep";
import {
  DailyTaskDialogComponent,
  DailyTaskDialogResult,
} from "src/app/common/daily-task-dialog/daily-task-dialog.component";
import { DailyService } from "src/app/core/services/daily.service";
import { DailyTask } from "../daily-task/dailytask";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { ENETUNREACH } from "constants";

@Component({
  selector: "daily-list",
  templateUrl: "daily-list.component.html",
  styleUrls: ["daily-list.component.scss"],
})
export class DailyListComponent implements OnInit {
  private dailyTasksSubscription = new Subscription();

  public dailyTasks: DailyTask[];
  public dailyTasksFilterd: DailyTask[];
  public dailyTasksDateView;

  public newDailyTaskTitle: string;
  public allTaskViewChecked: boolean;
  public dateTaskViewChecked: boolean;
  public viewType: string;
  public showTodayTask: boolean;
  public showHideCompletedTask: boolean;
  public todayIcon: string;
  public pendingTaskIcon: string;
  public taskShownForDays: any;

  constructor(private dailyService: DailyService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.newDailyTaskTitle = "";
    this.allTaskViewChecked = true;
    this.dateTaskViewChecked = false;
    this.viewType = "ALL";
    this.dailyTasksDateView = [];
    this.showTodayTask = false;
    this.showHideCompletedTask = false;
    this.todayIcon = "calendar_today";
    this.pendingTaskIcon = "check_box";

    this.taskShownForDays = [
      { name: "3 Days", value: 3 },
      { name: "7 Days", value: 7 },
      { name: "15 Days", value: 15 },
      { name: "All", value: 100 },
    ];

    this.dailyService.getDailyTasks();
    this.dailyTasksSubscription = this.dailyService.dailyTasksChanged.subscribe(
      (tasks: DailyTask[]) => {
        this.dailyTasks = tasks;
        this.dailyTasksFilterd = tasks;
        console.log(this.dailyTasks);
      }
    );
  }

  ngOnDestroy(): void {
    this.dailyTasksSubscription.unsubscribe();
  }

  createNewDailyTask() {
    console.log("Creating new Task!!!");
    const dialogRef = this.dialog.open(DailyTaskDialogComponent, {
      width: "560px",
      data: {
        dailyTask: {},
        enableDelete: false,
      },
    });
    dialogRef.afterClosed().subscribe((result: DailyTaskDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      // Change newly added task properties
      result.dailyTask.isComplete = false;
      result.dailyTask.created = new Date();
      result.dailyTask.modified = new Date();
      this.dailyService.addDailyTask(result.dailyTask);
    });
  }

  createNewDailyTaskQuick() {
    if (this.newDailyTaskTitle.trim() == "") {
      return;
    }
    const newTask: DailyTask = {
      title: this.newDailyTaskTitle,
      isComplete: false,
      created: new Date(),
      modified: new Date(),
    };
    console.log(newTask);
    this.dailyService.addDailyTask(newTask);
    this.newDailyTaskTitle = "";
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dailyTasks, event.previousIndex, event.currentIndex);
  }

  dropDateView(event: CdkDragDrop<string[]>) {
    console.log(event);
  }

  doneTask(task: DailyTask) {
    if (task.isComplete) {
      task.isComplete = false;
      task.modified = new Date();
    } else {
      task.isComplete = true;
      task.modified = new Date();
    }
    this.dailyService.updateDailyTask(task);
  }

  editTask(task: DailyTask) {
    const clonedDailyTask = cloneDeep(task);
    const dialogRef = this.dialog.open(DailyTaskDialogComponent, {
      width: "600px",
      data: {
        dailyTask: clonedDailyTask,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: DailyTaskDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      if (result.delete) {
        this.dailyService.deleteDailyTask(result.dailyTask.id);
      } else {
        result.dailyTask.modified = new Date();
        this.dailyService.updateDailyTask(result.dailyTask);
      }
    });
  }

  deleteTask(task: DailyTask) {
    this.dailyService.deleteDailyTask(task.id);
  }

  toggleShowHideCompletedTask() {
    console.log(this.showHideCompletedTask);
    if (this.showHideCompletedTask) {
      this.pendingTaskIcon = "check_box_outline_blank";
      this.dailyTasksFilterd = this.dailyTasks.filter(
        (tasks) => tasks.isComplete == false
      );
    } else {
      this.pendingTaskIcon = "check_box";
      this.dailyTasksFilterd = this.dailyTasks;
    }
  }

  toggleShowTodayTask() {
    console.log(this.showTodayTask);
    if (this.showTodayTask) {
      this.todayIcon = "today";
      this.dailyTasksFilterd = this.dailyTasks.filter((task) => {
        const days = this.calculateDays(new Date(), task.created.toDate());
        console.log(days);
        if (days == 0) {
          return task;
        }
      });
    } else {
      this.todayIcon = "calendar_today";
      this.dailyTasksFilterd = this.dailyTasks;
    }
  }

  daysSelected(data) {
    console.log(data);
    this.dailyService.getDailyTasksForSelectedDays(data.value);
  }

  calculateDays(dateOne, dateTwo) {
    let diffTime = Math.abs(dateTwo - dateOne);
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (dateOne > dateTwo) {
      diffDays = diffDays * -1;
    }
    return diffDays;
  }

  //TODO: This needs to be implemented
  showAllTaskAtOnceView() {
    this.viewType = "ALL";
    console.log(
      "Show all task at once with date created & if it was created in past"
    );
    console.log(
      "This should have option to Show only open tasks. This should have how far in days you would like to see your tasks"
    );
    console.log("Options to turn on focus mode for today's only task");
  }

  showTaskByDateView() {
    console.log(
      "Show all task sorted by date and the last one should have Today/Last date when task was created"
    );
    // Setting up UI to handle view change
    this.dailyTasksDateView = [];
    this.viewType = "DATE";
    const taskByDates = {};
    this.dailyTasks.forEach((task) => {
      const date = new Date(task.created.toDate());
      const formatDate =
        date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();

      if (taskByDates[formatDate]) {
        taskByDates[formatDate].push(task);
      } else {
        taskByDates[formatDate] = [];
        taskByDates[formatDate].push(task);
      }
    });
    console.log(taskByDates);

    for (let dateKey in taskByDates) {
      const tempObj = {
        date: dateKey,
        tasks: taskByDates[dateKey],
      };
      this.dailyTasksDateView.push(tempObj);
    }

    console.log(this.dailyTasksDateView);
  }
}
