import { Component, Input, OnInit } from "@angular/core";
import { CdkDragDrop, transferArrayItem } from "@angular/cdk/drag-drop";
import { Task } from "../task/task";
import {
  TaskDialogComponent,
  TaskDialogResult,
} from "src/app/common/task-dialog/task-dialog.component";
import { MatDialog } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { BoardService } from "../../core/services/board.service";
import { TaskList } from "./tasklist";
import { TaskEditDialogComponent, TaskEditDialogResult } from '../../common/task-edit-dialog/task-edit-dialog.component';

@Component({
  selector: "task-list",
  templateUrl: "task.list.component.html",
  styleUrls: ["task.list.component.scss"],
})
export class TaskListComponent implements OnInit {
  private taskListsSubscription: Subscription;
  private boardId: string;
  public showInputField: boolean = false;
  public isLoading: boolean;
  public listName: string = "";
  public taskList: TaskList[];

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private boardService: BoardService
  ) {
    this.boardId = this.route.snapshot.params.boardId;
    console.log(this.boardId);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.boardService.getTaskList(this.boardId);
    this.taskListsSubscription = this.boardService.taskListsChanged.subscribe(
      (lists) => {
        console.log(lists);
        this.taskList = lists;
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    this.taskListsSubscription.unsubscribe();
  }

  remainingList(curList: string) {
    const lists = [];
    this.taskList.forEach((list) => {
      if (list.name != curList) {
        lists.push(list.name);
      }
    });
    return lists;
  }

  drop(event: CdkDragDrop<Task[] | null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container.data || !event.previousContainer.data) {
      return;
    }
    // const item = event.previousContainer.data[event.previousIndex];
    const prevContainerName = event.previousContainer.id;
    const newContainerName = event.container.id;
    const prevContainer = this.taskList.filter(
      (list) => prevContainerName == list.name
    );
    const newContainer = this.taskList.filter(
      (list) => newContainerName == list.name
    );
    this.boardService.moveTasks(
      this.boardId,
      prevContainer[0].id,
      event.previousContainer.data,
      newContainer[0].id,
      event.container.data
    );

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  editTask(dataList: TaskList, task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "270px",
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      if (!result) {
        return;
      }

      const taskIndex = dataList.tasks.indexOf(task);
      if (result.delete) {
        dataList.tasks.splice(taskIndex, 1);
        this.boardService.updateTask(this.boardId, dataList.id, dataList.tasks);
      } else {
        this.boardService.updateTask(this.boardId, dataList.id, dataList.tasks);
      }
    });
  }

  fullEditTask(dataList: TaskList, task: Task): void {
    const dialogRef = this.dialog.open(TaskEditDialogComponent, {
      width: "270px",
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskEditDialogResult) => {
      if (!result) {
        return;
      }

      // const taskIndex = dataList.tasks.indexOf(task);
      // if (result.delete) {
      //   dataList.tasks.splice(taskIndex, 1);
      //   this.boardService.updateTask(this.boardId, dataList.id, dataList.tasks);
      // } else {
      //   this.boardService.updateTask(this.boardId, dataList.id, dataList.tasks);
      // }
    });
  }

  createNewTask(taskList: TaskList): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "270px",
      data: {
        task: {},
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      console.log(result);
      if (!result.task.title) {
        return;
      }
      // this.todo.push(result.task);
      // this.tasksList.push(result.task);
      taskList.tasks.push(result.task);
      console.log(taskList);
      this.boardService.addTask(this.boardId, taskList.id, taskList.tasks);
    });
  }

  createNewList() {
    console.log(this.listName);
    const newList = {
      name: this.listName,
      list: this.listName + "List",
      tasks: [],
    };
    // this.cards.push(newList);
    this.boardService.addTaskList(this.boardId, newList);

    this.listName = "";
    this.hideInput();
  }

  showInput() {
    this.showInputField = true;
  }

  hideInput() {
    this.showInputField = false;
  }
}
