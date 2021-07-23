import { Component, Input, OnInit } from "@angular/core";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import * as cloneDeep from "lodash/cloneDeep";
import { Task } from "../task/task";
import {
  TaskDialogComponent,
  TaskDialogResult,
} from "src/app/common/task-dialog/task-dialog.component";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { BoardService } from "../../core/services/board.service";
import { TaskList } from "./tasklist";
import {
  DeleteConfirmationDialogComponent,
  DeleteConfirmationDialogResult,
} from "src/app/common/delete.dialog.component";
import { Label } from "../task/label";
import {
  InviteDialogComponent,
  InviteDialogResult,
} from "src/app/common/invite-dialog/invite-dialog.component";
import { BoardServiceV2 } from "../../core/services/boardv2.service";
import { AuthService } from "../../core/services/auth.service";
import { Board, SharedUser } from "../../boards/board/board";
import {
  ConfirmDialogComponent,
  ConfirmDialogResult,
} from "src/app/common/confirm-dialog/confirm-dialog.component";

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

  public hasBoardAccess: boolean = false;
  public showInputField: boolean = false;
  public isLoading: boolean;
  public listName: string;
  public boardMembers: SharedUser[];
  public taskList: TaskList[];
  public tasks: Task[];
  public labels: Label[];

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService
  ) {
    this.boardId = this.route.snapshot.params.boardId;
    console.log(this.boardId);
  }

  async ngOnInit() {
    this.listName = "";
    this.boardMembers = [];
    // Check if user has access to this board
    const board: Board = await this.boardServiceV2
      .getBoardWithPromise(this.boardId)
      .then((board) => {
        return board.data() as Board;
      });
    const userUID = this.authService.getUID();
    if (
      board.owner == userUID ||
      (board.shared && board.shared.includes(this.authService.getUID()))
    ) {
      console.log("User has access.");
      this.hasBoardAccess = true;
      this.boardMembers = board.sharedUserInfo;
    } else {
      console.log("You dont have Access to this Board.");
      this.router.navigate(["/boards"]);
      return;
    }

    console.log("TASK LIST INITIATED");
    this.isLoading = true;
    this.boardServiceV2.getTaskList(this.boardId);
    this.boardServiceV2.getTasks(this.boardId);
    this.boardServiceV2.getLabels(this.boardId);

    this.taskListsSubscription = this.boardServiceV2.taskListsChanged.subscribe(
      (lists) => {
        console.log(lists);
        this.taskList = lists;
        this.isLoading = false;
      }
    );

    this.tasksSubscription = this.boardServiceV2.tasksChanged.subscribe(
      (tasks) => {
        console.log(tasks);
        this.tasks = tasks;
      }
    );

    this.labelsSubscription = this.boardServiceV2.labelListChanged.subscribe(
      (labels) => {
        console.log(labels);
        this.labels = labels;
      }
    );
  }

  ngOnDestroy() {
    console.log("TASK LIST DESTROYED");
    if (this.taskListsSubscription) {
      this.taskListsSubscription.unsubscribe();
      this.boardServiceV2.cancelTaskListsSubscription();
    }

    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
      this.boardServiceV2.cancelTasksSubscription();
    }

    if (this.labelsSubscription) {
      this.labelsSubscription.unsubscribe();
      this.boardServiceV2.cancelLabelSubscription();
    }
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
    // const taskId = event.container.data[0].id;
    const newTaskListId = event.container.id;
    // console.log(taskId, newTaskListId);

    if (event.previousContainer === event.container) {
      if(event.currentIndex === event.previousIndex) {
        return;
      }
      // const taskListId = event.container.id;
      let previousIndex: number = event.container.data[0].index;
      let currentIndex: number = previousIndex + (event.currentIndex - event.previousIndex);
      console.log(`${previousIndex}:${currentIndex}`);
      moveItemInArray(this.tasks, previousIndex, currentIndex);

      const taskTobeUpdated: Task[] = [];
      this.tasks.forEach((task, arrIndex) => {
        if (task.index != arrIndex) {
          task.index = arrIndex;
          taskTobeUpdated.push(task);
        }
      });
      console.log(taskTobeUpdated);
      
      // this.boardServiceV2.moveTaskBatch(this.boardId, "", taskId, taskTobeUpdated);
    }else {
      if (!event.container.data || !event.previousContainer.data) {
        return;
      }
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const taskTobeUpdated: Task[] = [];
      this.tasks.forEach((task, arrIndex) => {
        if (task.index != arrIndex) {
          task.index = arrIndex;
          taskTobeUpdated.push(task);
        }
      });
      console.log(taskTobeUpdated);
      // this.boardServiceV2.moveTaskBatch(this.boardId, newTaskListId, taskId, taskTobeUpdated);
    }
  }

  editTask(task: Task): void {
    if (task.lockStatus && task.lockStatus.isLocked) {
      if (this.authService.getUID() != task.lockStatus.lockedByUserId) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: "240px",
          data: {
            message:
              "This task has been locked. You wont be able to open this task until its unlocked.",
          },
        });
        dialogRef.afterClosed().subscribe((result: ConfirmDialogResult) => {
          if (!result) {
            return;
          }
          console.log(result);
          return;
        });
        return;
      }
    }

    const clonedTask = cloneDeep(task);
    const clonedLabels = cloneDeep(this.labels);
    const clonedBoardMembers = cloneDeep(this.boardMembers);
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "768px",
      data: {
        task: clonedTask,
        labels: clonedLabels,
        boardId: this.boardId,
        boardMembers: clonedBoardMembers,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      if (!result) {
        return;
      }
      console.log(result);

      if (result.delete) {
        this.labels.forEach((label: Label) => {
          if (label.taskIds && label.taskIds.includes(result.task.id)) {
            label.taskIds.splice(label.taskIds.indexOf(result.task.id), 1);
            this.boardServiceV2.updateLabel(this.boardId, label.id, label);
          }
        });
        this.boardServiceV2.deleteTask(this.boardId, result.task.id);
      } else {
        this.boardServiceV2.updateTask(
          this.boardId,
          result.task.id,
          result.task
        );
        if (result.updatedLabels && result.updatedLabels.length > 0) {
          result.updatedLabels.forEach((label) => {
            this.boardServiceV2.updateLabel(this.boardId, label.id, label);
          });
        }
        // if (result.labels && result.labels.length > 0) {
        //   result.labels.forEach((label: Label) => {
        //     this.boardServiceV2.updateLabel(this.boardId, label.id, label);
        //   });
        // }
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
      const tasksUnderList = this.tasks.filter(task => task.listId == taskListId);
      result.task.index = tasksUnderList.length;
      this.boardServiceV2.addTask(this.boardId, result.task);
    });
  }

  createNewList() {
    console.log(this.listName);
    const newList: TaskList = {
      name: this.listName,
      list: this.listName + "List",
    };
    if(this.listName.trim() === "") {
      return;
    }
    this.boardServiceV2.addTaskList(this.boardId, newList);
    this.listName = "";
    this.hideInput();
  }

  deleteTaskList(taskListId: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "360px",
      data: {
        message: "This would delete the List with all tasks inside. Are you sure ?"
      },
    });
    dialogRef.afterClosed().subscribe((result: ConfirmDialogResult) => {
      console.log(result);
      if(result.confirm) {
        // this.boardServiceV2.deleteTaskList(this.boardId, taskListId);
        const tasks = this.tasks.filter(task => task.listId === taskListId);
        this.boardServiceV2.deleteTaskListBatch(this.boardId, taskListId, tasks);
      }
    });
  }

  showInput() {
    this.showInputField = true;
  }

  hideInput() {
    this.showInputField = false;
  }

  inviteMembers() {
    console.log("Initiating Invite Member");
    const dialogRef = this.dialog.open(InviteDialogComponent, {
      width: "360px",
      data: {
        boardId: this.boardId,
        email: "",
      },
    });
    dialogRef.afterClosed().subscribe((result: InviteDialogResult) => {
      console.log(result);
    });
  }
}
