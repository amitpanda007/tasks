import { Component, Input, OnInit } from "@angular/core";
import { CdkDragDrop, transferArrayItem } from "@angular/cdk/drag-drop";
import { Task } from "../task/task";
import {
  TaskDialogComponent,
  TaskDialogResult,
} from "src/app/common/task-dialog/task-dialog.component";
import { MatDialog } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from 'rxjs';
import { BoardService } from '../../core/services/board.service';
import { TaskList } from './tasklist';

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
  public cards: TaskList[];
  private tasksList: Task[];

  // cards = [];
  // cards = [
  //   {
  //     name: "ToDo",
  //     list: "todoList",
  //     tasks: [
  //       {
  //         title: "New Task",
  //         description: "testing desc.",
  //       },
  //       {
  //         title: "Sample Task",
  //         description: "sample task description",
  //       },
  //     ],
  //   },
  //   {
  //     name: "InProgress",
  //     list: "inProgressList",
  //     tasks: [],
  //   },
  //   {
  //     name: "Done",
  //     list: "doneList",
  //     tasks: [],
  //   },
  // ];

  // todo: Task[] = [];
  // inProgress: Task[] = [];
  // done: Task[] = [];

  constructor(private dialog: MatDialog, private route: ActivatedRoute, private boardService: BoardService) {
    this.boardId = this.route.snapshot.params.boardId;
    console.log(this.boardId);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.boardService.getTaskList(this.boardId);
    this.taskListsSubscription = this.boardService.taskListsChanged.subscribe(
      (lists) => {
        console.log(lists);
        this.cards = lists;
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    this.taskListsSubscription.unsubscribe();
  }

  remainingList(curList: string) {
    const lists = [];
    this.cards.forEach((card) => {
      if (card.name != curList) {
        lists.push(card.name);
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

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  editTask(dataList: Task[], task: Task): void {
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
      
      const taskIndex = dataList.indexOf(task);
      if (result.delete) {
        dataList.splice(taskIndex, 1);
      } else {
        dataList[taskIndex] = task;
      }
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
      this.boardService.addTask(this.boardId, taskList.id, taskList.tasks)
    });
  }

  createNewList() {
    console.log(this.listName);
    const newList = {
      name: this.listName,
      list: this.listName + "List",
      tasks: [],
    }
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
