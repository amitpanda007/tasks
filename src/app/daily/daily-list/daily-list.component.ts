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

@Component({
  selector: "daily-list",
  templateUrl: "daily-list.component.html",
  styleUrls: ["daily-list.component.scss"],
})
export class DailyListComponent implements OnInit {
  public dailyTasks: DailyTask[];
  private dailyTasksSubscription = new Subscription();

  constructor(private dailyService: DailyService, private dialog: MatDialog) {}

  ngOnInit(): void {
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

  editTask($event) {
    console.log($event);
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

      this.dailyService.addDailyTask(result.dailyTask);
    });
  }

  drop($event) {
    console.log($event);
  }
}
