import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import * as cloneDeep from "lodash/cloneDeep";
import xor from "lodash/xor";
import { Task } from "../task/task";
import {
  TaskDialogComponent,
  TaskDialogResult,
} from "src/app/common/task-dialog/task-dialog.component";
import { MatDialog, MatMenuTrigger, MatSidenav } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, pipe, Subscription } from "rxjs";
import { TaskList } from "./tasklist";
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
import { BoardChecklist, CheckListOption } from "../task/boardchecklist";
import { Activity } from "../task/activity";
import { User } from "src/app/auth/user";
import { AccountService } from "src/app/core/services/account.service";
import {
  MemberInfoDialogComponent,
  MemberInfoDialogResult,
} from "src/app/common/member-info/member-info-dialog.component";
import { filter } from "rxjs/operators";

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
  private tasklistCopy: TaskList[];

  public hasBoardAccess: boolean = false;
  public showInputField: boolean = false;
  public isLoading: boolean;
  public listName: string;
  public board: Board;
  public boardMembers: SharedUser[];
  public boardAdmin: User;
  public menuMember: any;
  public taskList: TaskList[];
  public tasks: Task[];
  public labels: Label[];
  public editingBoardName: boolean;
  public editingListName: boolean;
  public starred: string;
  public sortOrders: any;
  public isShowingSidenav: boolean = false;
  public panelOpenState: boolean = false;

  // @ViewChild("cardMenuTrigger", { static: false }) cardMenuTrigger: MatMenuTrigger;
  @ViewChild("menuUser", { static: false }) public menuUserRef: ElementRef;

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService,
    private accountService: AccountService
  ) {
    this.boardId = this.route.snapshot.params.boardId;
    console.log(this.boardId);
    this.tasksDataUpdated = new BehaviorSubject(false);

    this.routeQueryParams = this.route.queryParams.subscribe((params) => {
      if (params["task"]) {
        if (this.tasks && this.tasks.length > 0) {
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
      DUEDATE: "dueDate",
      CHECKLIST: "checklist",
    };
    this.starred = "#FFC107";
    this.listName = "";
    this.boardMembers = [];
    this.editingBoardName = false;
    this.editingListName = false;
    this.menuMember = {
      name: null,
      permission: {},
    };

    // Check if user has access to this board
    this.board = await this.boardServiceV2
      .getBoardWithPromise(this.boardId)
      .then((board) => {
        return board.data() as Board;
      });

    this.boardAdmin = (await this.accountService.getUserById(
      this.board.owner
    )) as User;
    console.log(this.boardAdmin);

    const userUID = this.authService.getUID();
    if (
      this.board.owner == userUID ||
      (this.board.shared &&
        this.board.shared.includes(this.authService.getUID()))
    ) {
      console.log("User has access.");
      this.hasBoardAccess = true;
      this.boardMembers = this.board.sharedUserInfo;
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
    // this.board = (await this.boardServiceV2.getBoard(this.boardId)) as Board;

    //TODO: This is created with observable inside another observable. Better convert this with switchMap or mergeMap
    this.taskListsSubscription = this.boardServiceV2.taskListsChanged.subscribe(
      (lists) => {
        console.log(lists);
        this.taskList = lists;
        this.taskList.forEach((list) => {
          list.isEditing = false;
        });
        this.tasklistCopy = cloneDeep(this.taskList);
        // If tasklist chnaged , but tasks didnt change
        if (this.tasks && this.tasks.length > 0) {
          this.taskList.forEach((_list) => {
            this.addTasksToList(_list);
            if (_list.sortOrder) {
              this.sortTaskByOrder(_list, _list.sortOrder);
            }
          });
        }

        this.tasksSubscription = this.boardServiceV2.tasksChanged.subscribe(
          (tasks) => {
            console.log(tasks);
            this.tasks = tasks;
            //FIXME: Hacky way to fix the Drag & Drop problem. Once task is moved from one list to another.
            // A dummy copy of data stays on previous task list .
            this.taskList = [];
            this.taskList = cloneDeep(this.tasklistCopy);
            this.taskList.forEach((_list) => {
              this.addTasksToList(_list);
              if (_list.sortOrder) {
                this.sortTaskByOrder(_list, _list.sortOrder);
              }
            });
            console.log(this.taskList);
            this.tasksDataUpdated.next(true);
          }
        );
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

  addTasksToList(list: TaskList) {
    list.tasks = [];
    this.tasks.forEach((task) => {
      if (list.id == task.listId) {
        list.tasks.push(task);
      }
    });
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

  dropList(event: CdkDragDrop<TaskList[] | null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    moveItemInArray(this.taskList, event.previousIndex, event.currentIndex);
    const listTobeUpdated: TaskList[] = [];
    this.taskList.forEach((list, arrIndex) => {
      if (list.index != arrIndex) {
        list.index = arrIndex;
        listTobeUpdated.push(list);
      }
    });
    console.log(listTobeUpdated);
    this.boardServiceV2.moveTaskListBatch(this.boardId, listTobeUpdated);
  }

  drop(event: CdkDragDrop<Task[] | null>): void {
    console.log(event);
    const taskId = event.previousContainer.data[event.previousIndex].id;
    const newTaskListId = event.container.id;

    if (event.previousContainer === event.container) {
      //FIXME: if previous & current index are same the card is moved to back of list.
      if (event.currentIndex === event.previousIndex) {
        return;
      }

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

    // Find all checklist from all task in the current board
    const allChecklists: BoardChecklist[] = [];
    this.tasks.forEach((task) => {
      if (task.checklists) {
        const checklistData: CheckListOption[] = [];
        task.checklists.forEach((chklst, idx) => {
          if (chklst.checklist && chklst.checklist.length > 0) {
            const checklistOption: CheckListOption = {
              value: idx,
              viewValue: chklst.checklistName,
              checklist: chklst.checklist,
            };
            checklistData.push(checklistOption);
          }
        });
        const newBoardChecklist: BoardChecklist = {
          name: task.title,
          checklists: checklistData,
        };
        if (
          newBoardChecklist.checklists &&
          newBoardChecklist.checklists.length > 0
        ) {
          allChecklists.push(newBoardChecklist);
        }
      }
    });

    const clonedTask = cloneDeep(task);
    const clonedLabels = cloneDeep(this.labels);
    const clonedBoardMembers = cloneDeep(this.boardMembers);
    const clonedAllChecklist = cloneDeep(allChecklists);

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "768px",
      height: "700px",
      data: {
        task: clonedTask,
        labels: clonedLabels,
        boardId: this.boardId,
        boardMembers: clonedBoardMembers,
        enableDelete: true,
        boardChecklists: clonedAllChecklist,
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

      /*
        Activity details would be evaluated here &
        should be addedto the task activities list.
        Activities:
        1. Title/Descriptionm changed
        2. Checklist Added/Removed
        3. Labels Added/Removed
        4. Users Added/Removed
        5. Duedate added/removed/updated
        6. Background color changed
        7. Card copied (this is applicable to the copied card)        
      */

      if (!result.task.activities) {
        result.task.activities = [];
      }

      // 1. Title/Descriptionm changed
      if (
        task.title != result.task.title ||
        task.description != result.task.description
      ) {
        const activity = this.createNewActivity(
          "modified title/description for the task."
        );
        result.task.activities.push(activity);
      }

      // 2. Checklist Added/Removed
      if (!task.checklists && result.task.checklists) {
        result.task.checklists.forEach((chklst) => {
          const activity = this.createNewActivity(
            `added checklist ${chklst.checklistName}.`
          );
          result.task.activities.push(activity);
        });
      }

      if (task.checklists && !result.task.checklists) {
        task.checklists.forEach((chklst) => {
          const activity = this.createNewActivity(
            `removed checklist ${chklst.checklistName}.`
          );
          result.task.activities.push(activity);
        });
      }

      if (
        task.checklists &&
        result.task.checklists &&
        (task.checklists.length > result.task.checklists.length ||
          task.checklists.length < result.task.checklists.length)
      ) {
        const taskChecklist = [];
        task.checklists.forEach((chklst) => {
          taskChecklist.push(chklst.checklistName);
        });

        const resultChecklist = [];
        result.task.checklists.forEach((chklst) => {
          resultChecklist.push(chklst.checklistName);
        });

        // FIXME:  this doesnt capture when user created multiple checklist with same name
        if (taskChecklist.length > resultChecklist.length) {
          const diffChklst: Array<string> = xor(taskChecklist, resultChecklist);
          // console.log(diffChklst);
          diffChklst.forEach((name) => {
            const activity = this.createNewActivity(
              `removed checklist ${name}.`
            );
            result.task.activities.push(activity);
          });
        } else {
          const diffChklst: Array<string> = xor(resultChecklist, taskChecklist);
          // console.log(diffChklst);
          diffChklst.forEach((name) => {
            const activity = this.createNewActivity(`added checklist ${name}.`);
            result.task.activities.push(activity);
          });
        }
      }

      // 3. Labels Added/Removed
      if (result.updatedLabels) {
        result.updatedLabels.forEach((label) => {
          if (label.taskIds.includes(task.id)) {
            const activity = this.createNewActivity(
              `added label ${label.name}.`
            );
            result.task.activities.push(activity);
          } else {
            const activity = this.createNewActivity(
              `removed label ${label.name}.`
            );
            result.task.activities.push(activity);
          }
        });
      }

      // 4. Users Added/Removed
      if (!task.members && result.task.members) {
        result.task.members.forEach((member) => {
          const activity = this.createNewActivity(`User ${member.name} added.`);
          result.task.activities.push(activity);
        });
      }

      if (task.members && !result.task.members) {
        task.members.forEach((member) => {
          const activity = this.createNewActivity(
            `User ${member.name} removed.`
          );
          result.task.activities.push(activity);
        });
      }

      if (
        task.members &&
        result.task.members &&
        (task.members.length > result.task.members.length ||
          task.members.length < result.task.members.length)
      ) {
        const taskMembers = [];
        task.members.forEach((member) => {
          taskMembers.push(member.name);
        });

        const resultMembers = [];
        result.task.members.forEach((member) => {
          resultMembers.push(member.name);
        });

        if (taskMembers.length > resultMembers.length) {
          const diffChklst: Array<string> = xor(taskMembers, resultMembers);
          diffChklst.forEach((name) => {
            const activity = this.createNewActivity(`removed user ${name}.`);
            result.task.activities.push(activity);
          });
        } else {
          const diffChklst: Array<string> = xor(taskMembers, resultMembers);
          diffChklst.forEach((name) => {
            const activity = this.createNewActivity(`added user ${name}.`);
            result.task.activities.push(activity);
          });
        }
      }

      // 5. Due date added/removed/updated
      if (!task.dueDate && result.task.dueDate) {
        const activity = this.createNewActivity(`added Due date.`);
        result.task.activities.push(activity);
      } else if (task.dueDate != result.task.dueDate) {
        const activity = this.createNewActivity(`modified Due date.`);
        result.task.activities.push(activity);
      }

      if (task.dueDate && !result.task.dueDate) {
        const activity = this.createNewActivity(`removed Due date.`);
        result.task.activities.push(activity);
      }

      // 6. Background color changed
      if (!task.backgroundColor && result.task.backgroundColor) {
        const activity = this.createNewActivity("added background color.");
        result.task.activities.push(activity);
      } else if (task.backgroundColor && !result.task.backgroundColor) {
        const activity = this.createNewActivity("removed background color.");
        result.task.activities.push(activity);
      } else if (task.backgroundColor !== result.task.backgroundColor) {
        const activity = this.createNewActivity("updated background color.");
        result.task.activities.push(activity);
      }

      /*
        Result Delete/Save section.
        Check if result is set for delete or save the updated result
        Once result is saved close the task modal pop up
      */
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
      }
      this.router.navigate(["."], { relativeTo: this.route });
    });
  }

  createNewActivity(action: string): Activity {
    const activity: Activity = {
      user: this.authService.getUserDisplayName(),
      action: action,
      dateTime: new Date(),
    };
    return activity;
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
      index: this.taskList ? this.taskList.length : 0,
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

  toggleListNameEditing(saveChange: boolean, taskList: TaskList) {
    taskList.isEditing = !taskList.isEditing;
    if (saveChange) {
      this.boardServiceV2.updateTaskList(this.boardId, taskList.id, taskList);
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
      width: "280px",
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

    const curTaskList = this.taskList.find(
      (taskList) => taskList.id === taskListId
    );

    if (curTaskList.sortOrder && curTaskList.sortOrder === sortBy) {
      // return;
    }
    this.sortTaskByOrder(curTaskList, sortBy);

    curTaskList.sortOrder = sortBy;
    this.boardServiceV2.updateTaskList(this.boardId, taskListId, curTaskList);
  }

  sortTaskByOrder(taskList: TaskList, sortOrder: string = "index") {
    taskList.tasks.sort((task1: Task, task2: Task) => {
      if (
        sortOrder == this.sortOrders.INDEX ||
        sortOrder == this.sortOrders.CREATED ||
        sortOrder == this.sortOrders.MODIFIED
      ) {
        if (task1[sortOrder] < task2[sortOrder]) {
          return -1;
        }
        if (task1[sortOrder] > task2[sortOrder]) {
          return 1;
        }
        return 0;
      } else if (sortOrder == this.sortOrders.DUEDATE) {
        if (
          task1[sortOrder] &&
          task1[sortOrder].date &&
          task2[sortOrder] &&
          task2[sortOrder].date
        ) {
          if (task1[sortOrder].date < task2[sortOrder].date) {
            return -1;
          }
          if (task1[sortOrder].date > task2[sortOrder].date) {
            return 1;
          }
          return 0;
        }
        if (task1[sortOrder] && task1[sortOrder].date) {
          return -1;
        } else if (task2[sortOrder] && task2[sortOrder].date) {
          return 1;
        }
      } else if (sortOrder == this.sortOrders.CHECKLIST) {
        if (task1[sortOrder] && task2[sortOrder]) {
          if (task1[sortOrder].length < task2[sortOrder].length) {
            return -1;
          }
          if (task1[sortOrder].length > task2[sortOrder].length) {
            return 1;
          }
          return 0;
        }
        if (task1[sortOrder] && task1[sortOrder].length > 0) {
          return -1;
        } else if (task2[sortOrder] && task2[sortOrder].length > 0) {
          return 1;
        }
      }
    });
  }

  openAutomation() {
    console.log("Opening Automation dialog");
  }

  toggleMenuSidenav() {
    this.isShowingSidenav = !this.isShowingSidenav;
  }

  openMemberMenu(member: User) {
    this.menuMember = {
      id: member.id ? member.id : "",
      name: null,
      permission: {},
    };
    console.log(member);

    let isOwner: boolean = false;
    let isAdmin: boolean = false;
    let currentUserMember: boolean = false;

    if (member.id == this.board.owner) {
      this.menuMember.name = member.name;
      this.menuMember.permission.admin = true;
      this.menuMember.permission.normal = true;
      isOwner = true;
    } else {
      this.menuMember.name = member.name;
      this.menuMember.permission.admin = member.permission.admin;
      this.menuMember.permission.normal = member.permission.normal;
    }

    if (member.id == this.authService.getUID()) {
      currentUserMember = true;
      isAdmin = true;
    }

    if (this.board.owner == this.authService.getUID()) {
      isAdmin = true;
    } else {
      this.boardMembers.forEach((membr) => {
        if (membr.id == this.authService.getUID()) {
          if (membr.permission.admin) {
            isAdmin: true;
          }
        }
      });
    }

    const dialogRef = this.dialog.open(MemberInfoDialogComponent, {
      width: "380px",
      // hasBackdrop: false,
      autoFocus: false,
      data: {
        member: this.menuMember,
        positionRelativeToElement: this.menuUserRef,
        isOwner: isOwner,
        isAdmin: isAdmin,
        currentUserMember: currentUserMember,
      },
    });
    dialogRef.afterClosed().subscribe((result: MemberInfoDialogResult) => {
      if (!result) {
        return;
      }
      console.log(result);

      if (result.isUserRemoved) {
        // Remove user from shared & sharedUserInfo
        const shared: Array<string> = cloneDeep(this.board.shared);
        const index = this.board.shared.indexOf(result.member.id);
        shared.splice(index, 1);

        const sharedUserInfo: SharedUser[] = cloneDeep(
          this.board.sharedUserInfo
        );
        sharedUserInfo.forEach((usrInfo, idx) => {
          if (usrInfo.id == result.member.id) {
            sharedUserInfo.splice(idx, 1);
          }
        });

        const tasks: Task[] = [];

        this.tasks.forEach((task) => {
          if (task.members && task.members.length > 0) {
            task.members.forEach((mbr) => {
              if (mbr.id == result.member.id) {
                tasks.push(task);
              }
            });
          }
        });

        console.log(shared);
        console.log(sharedUserInfo);
        console.log(tasks);
        this.boardServiceV2.removeUserFromBoard(
          this.boardId,
          shared,
          sharedUserInfo,
          tasks,
          result.member.id
        );
      }
    });
  }
}
