import { Component, Input, OnInit } from "@angular/core";
import { CdkDragDrop, transferArrayItem } from "@angular/cdk/drag-drop";
import { Task } from "../task/task";
import {
  TaskDialogComponent,
  TaskDialogResult,
} from "src/app/common/task-dialog/task-dialog.component";
import { MatDialog } from "@angular/material";

@Component({
  selector: "task-list",
  templateUrl: "task.list.component.html",
  styleUrls: ["task.list.component.scss"],
})
export class TaskListComponent implements OnInit {
  todo: Task[] = [
    {
      title: "Buy milk",
      description: "Go to the store and buy milk",
    },
    {
      title: "Create a Kanban app",
      description: "Using Firebase and Angular create a Kanban app!",
    },
  ];

  inProgress: Task[] = [];
  done: Task[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  editTask(list: string, task: Task): void {}

  drop(event: CdkDragDrop<Task[] | null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container.data || !event.previousContainer.data) {
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "270px",
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult) => this.todo.push(result.task));
  }
}
