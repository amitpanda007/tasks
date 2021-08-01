import { Component, Input, OnInit } from "@angular/core";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import * as cloneDeep from "lodash/cloneDeep";
import { Task } from "../task/task";
import {
  TaskDialogComponent,
  TaskDialogResult,
} from "src/app/common/task-dialog/task-dialog.component";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
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
  private boardSubscription: Subscription;
  private taskListsSubscription: Subscription;
  private tasksSubscription: Subscription;
  private labelsSubscription: Subscription;
  private routeQueryParams: Subscription;
  private tasksDataUpdated: BehaviorSubject<boolean>;
  private boardId: string;

  public hasBoardAccess: boolean = false;
  public showInputField: boolean = false;
  public isLoading: boolean;
  public listName: string;
  public board: Board;
  public boardMembers: SharedUser[];
  public taskList: TaskList[];
  public tasks: Task[];
  public labels: Label[];
  public editingBoardName: boolean;
  public starred: string;
  public sortOrders: any;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService
  ) {
    this.boardId = this.route.snapshot.params.boardId;
    console.log(this.boardId);
    this.tasksDataUpdated = new BehaviorSubject(false);

    this.routeQueryParams = this.route.queryParams.subscribe((params) => {
      if (params["task"]) {
        if (this.tasks) {
          const task = this.tasks.find((_task) => _task.id == params["task"]);
          this.openTaskDialog(task);
        } else {
          this.tasksDataUpdated.subscribe((isTasks) => {
            if (isTasks) {
              if (this.route.snapshot.queryParams["task"]) {
                const task = this.tasks.find(
                  (_task) => _task.id == params["task"]
                );
                this.openTaskDialog(task);
              }
            }
          });
        }
      }
    });
  }

  async ngOnInit() {
    this.sortOrders = {
      INDEX: "index",
      CREATED: "created",
      MODIFIED: "modified",
      DUEDATE: "duedate",
      CHECKLIST: "checklist",
    };
    this.starred = "#FFC107";
    // this.unstarred = "#FFF";
    this.listName = "";
    this.boardMembers = [];
    this.editingBoardName = false;
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

    this.board = (await this.boardServiceV2.getBoard(this.boardId)) as Board;

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
        this.tasksDataUpdated.next(true);
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
    this.routeQueryParams.unsubscribe();

    if (this.boardSubscription) {
      this.boardSubscription.unsubscribe();
      this.boardServiceV2.cancelBoardSuscriotion();
    }

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

  remainingList(curListId: string) {
    // console.log("FUNCTION containerData getting called");
    const lists = [];
    this.taskList.forEach((list) => {
      if (list.id != curListId) {
        lists.push(list.id);
      }
    });
    return lists;
  }

  //FIXME: This is called from template. which is not a good idea for peformance.
  containerData(curListId: string) {
    // console.log("FUNCTION containerData getting called");
    if (this.tasks) {
      return this.tasks.filter((task) => task.listId === curListId);
    }
  }

  drop(event: CdkDragDrop<Task[] | null>): void {
    console.log(event);
    const taskId = event.previousContainer.data[event.previousIndex].id;
    const newTaskListId = event.container.id;

    if (event.previousContainer === event.container) {
      if (event.currentIndex === event.previousIndex) {
        return;
      }
      // let previousIndex: number =
      //   event.container.data[event.previousIndex].index;
      // let currentIndex: number =
      //   previousIndex + (event.currentIndex - event.previousIndex);

      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const taskTobeUpdated: Task[] = [];
      event.container.data.forEach((task, arrIndex) => {
        if (task.index != arrIndex) {
          task.index = arrIndex;
          taskTobeUpdated.push(task);
        }
      });
      console.log(taskTobeUpdated);
      this.boardServiceV2.moveTaskBatch(
        this.boardId,
        "",
        taskId,
        taskTobeUpdated
      );
    } else {
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
      // console.log(event.previousContainer.data);
      // Fix the index for previous container
      for (
        let i = event.previousIndex;
        i < event.previousContainer.data.length;
        i++
      ) {
        event.previousContainer.data[i].index -= 1;
        taskTobeUpdated.push(event.previousContainer.data[i]);
      }

      // console.log(event.container.data);
      event.container.data[event.currentIndex].index = event.currentIndex;
      taskTobeUpdated.push(event.container.data[event.currentIndex]);
      // Fix the index for current container
      for (
        let i = event.currentIndex + 1;
        i < event.container.data.length;
        i++
      ) {
        event.container.data[i].index += 1;
        taskTobeUpdated.push(event.container.data[i]);
      }

      console.log(taskTobeUpdated);
      this.boardServiceV2.moveTaskBatch(
        this.boardId,
        newTaskListId,
        taskId,
        taskTobeUpdated
      );
    }
  }

  editTask(task: Task) {
    // this.router.navigate([`${task.id}`], { relativeTo: this.route });
    // this.openTaskDialog(task);
    this.router.navigate([], { queryParams: { task: `${task.id}` } });
  }

  openTaskDialog(task: Task): void {
    if (task.lockStatus && task.lockStatus.isLocked) {
      if (this.authService.getUID() != task.lockStatus.lockedByUserId) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: "240px",
          data: {
            message:
              "This task has been locked. You wont be able to open this task until its unlocked.",
          },
        });
        dialogRef.disableClose = true;
        dialogRef.afterClosed().subscribe((result: ConfirmDialogResult) => {
          console.log("EDIT TASK DIALOG CLOSED");
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
      height: "700px",
      data: {
        task: clonedTask,
        labels: clonedLabels,
        boardId: this.boardId,
        boardMembers: clonedBoardMembers,
        enableDelete: true,
      },
    });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      if (!result) {
        this.router.navigate(["."], { relativeTo: this.route });
        return;
      }
      console.log(result);

      result.task.modified = new Date();

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
      this.router.navigate(["."], { relativeTo: this.route });
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
      const tasksUnderList = this.tasks.filter(
        (task) => task.listId == taskListId
      );
      result.task.index = tasksUnderList.length;
      result.task.created = new Date();
      result.task.modified = new Date();
      this.boardServiceV2.addTask(this.boardId, result.task);
    });
  }

  createNewList() {
    console.log(this.listName);
    const newList: TaskList = {
      name: this.listName,
      list: this.listName + "List",
    };
    if (this.listName.trim() === "") {
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
        message:
          "This would delete the List with all tasks inside. Are you sure ?",
      },
    });
    dialogRef.afterClosed().subscribe((result: ConfirmDialogResult) => {
      console.log(result);
      if (result.confirm) {
        // this.boardServiceV2.deleteTaskList(this.boardId, taskListId);
        const tasks = this.tasks.filter((task) => task.listId === taskListId);
        this.boardServiceV2.deleteTaskListBatch(
          this.boardId,
          taskListId,
          tasks
        );
      }
    });
  }

  toggleBoardNameEditing(saveChange: boolean) {
    this.editingBoardName = !this.editingBoardName;
    if (saveChange) {
      this.boardServiceV2.updateBoard(this.boardId, this.board);
    }
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

  markBoardFavourite() {
    if (this.board && this.board.favourite) {
      this.board.favourite = false;
    } else {
      this.board.favourite = true;
    }
    this.boardServiceV2.updateBoard(this.boardId, this.board);
  }

  sortTasks(taskListId: string, sortBy: string) {
    console.log(sortBy);
    return;
    // Update sort order ste for task list
    const curTaskList = this.taskList.find(
      (taskList) => taskList.id === taskListId
    );
    curTaskList.sortOrder = sortBy;
    this.boardServiceV2.updateTaskList(this.boardId, taskListId, curTaskList);

    // sort tasks by given order
    this.sortTaskByOrder(sortBy);
  }

  sortTaskByOrder(sortOrder: string = "index") {}

  openAutomation() {
    console.log("Opening Automation dialog");
  }

  openListMenu() {
    console.log("Opening Menu dialog");
  }
}
