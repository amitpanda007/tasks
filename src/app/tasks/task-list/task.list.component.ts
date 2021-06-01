import { Component, Input, OnInit } from "@angular/core";
import { CdkDragDrop, transferArrayItem } from "@angular/cdk/drag-drop";
import * as cloneDeep from "lodash/cloneDeep";
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
import {
  DeleteConfirmationDialogComponent,
  DeleteConfirmationDialogResult,
} from "src/app/common/delete.dialog.component";
import { Label } from '../task/label';

@Component({
  selector: "task-list",
  templateUrl: "task.list.component.html",
  styleUrls: ["task.list.component.scss"],
})
export class TaskListComponent implements OnInit {
  private taskListsSubscription: Subscription;
  private tasksSubscription: Subscription;
  private labelsSubscription: Subscription;

  private boardId: string;
  public showInputField: boolean = false;
  public isLoading: boolean;
  public listName: string = "";

  public taskList: TaskList[];
  public tasks: Task[];
  public labels: Label[];

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
    this.boardService.getTasks(this.boardId);
    this.boardService.getLabels(this.boardId);

    this.taskListsSubscription = this.boardService.taskListsChanged.subscribe(
      (lists) => {
        console.log(lists);
        this.taskList = lists;
        this.isLoading = false;
      }
    );

    this.tasksSubscription = this.boardService.tasksChanged.subscribe(
      (tasks) => {
        console.log(tasks);
        this.tasks = tasks;
      }
    );

    this.labelsSubscription = this.boardService.labelListChanged.subscribe(
      (labels) => {
        console.log(labels);
        this.labels = labels;
      }
    );
  }

  ngOnDestroy() {
    this.taskListsSubscription.unsubscribe();
    this.tasksSubscription.unsubscribe();
    this.labelsSubscription.unsubscribe();
  }

  remainingList(curList: string) {
    const lists = [];
    this.taskList.forEach((list) => {
      if (list.id != curList) {
        lists.push(list.id);
      }
    });
    return lists;
  }

  drop(event: CdkDragDrop<Task[] | null>): void {
    console.log(event);
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container.data || !event.previousContainer.data) {
      return;
    }

    const taskId = event.container.data[0].id;
    const newTaskListId = event.container.id;
    console.log(taskId, newTaskListId);
    this.boardService.moveTasks(this.boardId, taskId, newTaskListId);

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  editTask(task: Task): void {
    const clonedTask = cloneDeep(task);
    const clonedLabels = cloneDeep(this.labels);
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "768px",
      data: {
        task: clonedTask,
        labels: clonedLabels,
        boardId: this.boardId,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      if (!result) {
        return;
      }
      console.log(result);

      if(result.delete) {
        this.boardService.deleteTask(this.boardId, result.task.id);
      } else {
        // this.boardService.updateTask(this.boardId, result.task.id, result.task);
        if(result.updatedLabels && result.updatedLabels.length > 0) {
          result.updatedLabels.forEach((label: Label) => {
            this.boardService.updateLabel(this.boardId, label.id, label);
          });
        }
      }

    });
  }

  createNewTask(taskListId: string): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "768px",
      data: {
        task: {},
        boardId: this.boardId,
        enableDelete: false,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
      result.task.listId = taskListId;
      this.boardService.addTask(this.boardId, result.task);
    });
  }

  createNewList() {
    console.log(this.listName);
    const newList: TaskList = {
      name: this.listName,
      list: this.listName + "List"
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
