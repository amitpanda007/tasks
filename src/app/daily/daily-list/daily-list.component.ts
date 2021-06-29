import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import {
  DailyTaskDialogComponent,
  DailyTaskDialogResult,
} from "src/app/common/daily-task-dialog/daily-task-dialog.component";
import { DailyService } from "src/app/core/services/daily.service";
import { DailyTask } from "../daily-task/dailytask";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ENETUNREACH } from 'constants';

@Component({
  selector: "daily-list",
  templateUrl: "daily-list.component.html",
  styleUrls: ["daily-list.component.scss"],
})
export class DailyListComponent implements OnInit {
  private dailyTasksSubscription = new Subscription();
  
  public dailyTasks: DailyTask[];
  public newDailyTaskTitle: string;

  constructor(private dailyService: DailyService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.newDailyTaskTitle = "";

    this.dailyService.getDailyTasks();
    this.dailyTasksSubscription = this.dailyService.dailyTasksChanged.subscribe(
      (tasks: DailyTask[]) => {
        this.dailyTasks = tasks;
      }
    );
    console.log(this.dailyTasks);
  }

  ngOnDestroy(): void {
    this.dailyTasksSubscription.unsubscribe();
  }

  createNewDailyTask() {
    console.log("Creating new Task!!!");
    const dialogRef = this.dialog.open(DailyTaskDialogComponent, {
      width: "360px",
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
    if(this.newDailyTaskTitle.trim() == "") {
      return;
    }
    const newTask: DailyTask = {
      title: this.newDailyTaskTitle,
      isComplete: false,
      created: new Date(),
      modified: new Date(),
    }
    console.log(newTask);
    this.dailyService.addDailyTask(newTask);
    this.newDailyTaskTitle = "";
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.dailyTasks, event.previousIndex, event.currentIndex);
  }

  doneTask(task: DailyTask) {
    if(task.isComplete) {
      task.isComplete = false;
      task.modified = new Date();
    }else {
      task.isComplete = true;
      task.modified = new Date();
    }
    this.dailyService.updateDailyTask(task);
  }

  editTask(task: DailyTask) {
    const dialogRef = this.dialog.open(DailyTaskDialogComponent, {
      width: "360px",
      data: {
        dailyTask: task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: DailyTaskDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      if(result.delete) {
        this.dailyService.deleteDailyTask(result.dailyTask.id);
      }else {
        result.dailyTask.modified = new Date();
        this.dailyService.updateDailyTask(result.dailyTask);
      }
    });
  }

  deleteTask(task: DailyTask) {
    this.dailyService.deleteDailyTask(task.id);
  }
}
