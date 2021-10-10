import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
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
import { MatDialog, MatSnackBar } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
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
import {
  MemberInfoDialogComponent,
  MemberInfoDialogResult,
} from "src/app/common/member-info/member-info-dialog.component";
import {
  ErrorSnackbar,
  SuccessSnackbar,
} from "src/app/common/snackbar.component";
import {
  ColorDialogComponent,
  ColorDialogResult,
} from "src/app/common/color-dialog/color-dialog.component";
import {
  LabelDialogComponent,
  LabelDialogResult,
} from "src/app/common/label-dialog/label-dialog.component";
import {
  BoardSettingsDialogComponent,
  BoardSettingsDialogResult,
} from "src/app/common/board-settings/board-settings-dialog.component";
import {
  CloseBoardDialogComponent,
  CloseBoardDialogResult,
} from "src/app/common/close-board/close-board-dialog.component";
import {
  CopyBoardDialogComponent,
  CopyBoardDialogResult,
} from "src/app/common/copy-board-dialog/copy-board-dialog.component";
import { Constant } from "src/app/shared/constants";
import {
  BoardTemplateDialogComponent,
  BoardTemplateDialogResult,
} from "src/app/common/board-template-dialog/board-template-dialog.component";
import { LoaderService } from "src/app/core/services/loader.service";
import {
  TaskTemplateDialogComponent,
  TaskTemplateDialogResult,
} from "src/app/common/task-template-dialog/task-template-dialog.component";
import { TaskOption } from "../task/taskoptions";
import { AppNotification } from "src/app/common/notification/notification";
import { NotificationService } from "src/app/core/services/notification.service";
import {
  AutomationDialogComponent,
  AutomationDialogResult,
} from "src/app/common/automation-dialog/automation-dialog.component";

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

  public taskOptions: TaskOption;
  public hasBoardAccess: boolean = false;
  public showInputField: boolean = false;
  public listName: string;
  private backupTaskListName: string;
  public board: Board;
  private backupBoardTitle: string;
  public boardMembers: SharedUser[];
  public boardAdmin: User;
  public allAdmins: any[] = [];
  public menuMember: any;
  public taskList: TaskList[];
  private taskListBackup: TaskList[];
  public tasks: Task[];
  public archivedTasks: Task[];
  public labels: Label[];
  public editingBoardName: boolean;
  public editingListName: boolean;
  public starred: string;
  public sortOrders: any;
  public isShowingSidenav: boolean = false;
  public panelOpenState: boolean = false;
  public isCurrentUser: boolean = false;
  public isFavourite: boolean = false;
  public sliceLimitStart: number;
  public sliceLimitEnd: number;
  public activities: Activity[] = [];
  public isShowingAboutBoard: boolean = false;
  public isShowingChangeBackgroundBoard: boolean = false;
  public isShowingColors: boolean = false;
  public boardBGColorPrimary: string;
  public boardBGColorSecondary: string;
  public selectedPrimaryColor: string;
  public selectedSecondaryColor: string;
  public isShowingPhotos: boolean = false;
  public isSearchingCard: boolean = false;
  public isShowingMore: boolean = false;
  public isShowingMoreSetting: boolean = false;
  public isShowingAllLabels: boolean = false;
  public isShowingArchivedTasks: boolean = false;

  public searchLabels: Label[] = [];
  public searchMembers: SharedUser[] = [];
  public constant = Constant;

  private selectedFilters = {
    labels: [],
    members: [],
    dues: [],
  };

  public removeSearch: boolean = false;
  public searchTaskCount: number = 0;
  public searchCard: string;
  public hasMemberAddAccess: boolean = false;

  // @ViewChild("cardMenuTrigger", { static: false }) cardMenuTrigger: MatMenuTrigger;
  @ViewChild("menuUser", { static: false }) public menuUserRef: ElementRef;
  @ViewChild("commentPermission", { static: false })
  public commentPermissionRef: ElementRef;
  @ViewChild("addRemovePermission", { static: false })
  public addRemovePermissionRef: ElementRef;
  @ViewChild("closeBoardElm", { static: false })
  public closeBoardRef: ElementRef;

  constructor(
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private boardServiceV2: BoardServiceV2,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.boardId = this.route.snapshot.params.boardId;
    console.log(this.boardId);
    this.tasksDataUpdated = new BehaviorSubject(false);

    this.routeQueryParams = this.route.queryParams.subscribe((params) => {
      console.log(params);
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
    // Setup event listeners to detect online/offline state of connecton.
    window.addEventListener("offline", (e) => {
      this.snackBar.openFromComponent(ErrorSnackbar, {
        data: {
          text: "Connection interrupted. retrying...",
          icon: "wifi_off",
        },
        duration: 15000,
      });
    });

    window.addEventListener("online", (e) => {
      this.snackBar.openFromComponent(SuccessSnackbar, {
        data: {
          text: "Connection is back online",
          icon: "wifi",
          close: true,
          reload: true,
        },
        duration: 15000,
      });
    });

    this.taskOptions = {
      showTaskPriority: true,
      showTaskStatus: true,
    };

    this.sortOrders = Constant.SORT_ORDERS;
    this.sliceLimitStart = 0;
    this.sliceLimitEnd = 10;
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
    //TODO: Duplicate boards call. need to fix this for if board data already available get the board else call getBoards()
    this.board = await this.boardServiceV2
      .getBoardWithPromise(this.boardId)
      .then((board) => {
        return board.data() as Board;
      });

    const userUID = this.authService.getUID();
    if (this.board.shared && this.board.shared.includes(userUID)) {
      console.log("User has access.");
      this.hasBoardAccess = true;
      this.boardMembers = this.board.sharedUserInfo;
    } else {
      console.log("You dont have Access to this Board.");
      this.router.navigate(["/boards"]);
      return;
    }

    // if (this.board.owner == userUID) {
    //   this.isCurrentUser = true;
    // }

    console.log("TASK LIST INITIATED");
    this.loaderService.changeLoading(true);
    this.boardServiceV2.getSingleBoard(this.boardId);
    this.boardServiceV2.getTaskList(this.boardId);
    this.boardServiceV2.getTasks(this.boardId);
    this.boardServiceV2.getLabels(this.boardId);
    // this.board = (await this.boardServiceV2.getBoard(this.boardId)) as Board;

    this.boardSubscription = this.boardServiceV2.boardChanged.subscribe(
      (board: Board) => {
        console.log(board);
        //Check Settings for Board
        //TODO: Duplicate code, move to one function
        if (board.settings.addRemovePermission.admin) {
          this.hasMemberAddAccess = this.isCurrentUserAdmin();
        } else if (board.settings.addRemovePermission.allMembers) {
          this.hasMemberAddAccess = true;
        }

        this.selectedPrimaryColor = "";
        if (board.backgroundColors && board.backgroundColors.primary) {
          this.selectedPrimaryColor = board.backgroundColors.primary;
        }

        this.selectedSecondaryColor = "";
        if (board.backgroundColors && board.backgroundColors.secondary) {
          this.selectedSecondaryColor = board.backgroundColors.secondary;
        }

        // Set document background image & design
        if (this.board.backgroundUrl) {
          document.body.style.backgroundImage = `url(${this.board.backgroundUrl})`;
          document.body.style.backgroundPosition = "center center";
          document.body.style.backgroundRepeat = "no-repeat";
          document.body.style.backgroundAttachment = "fixed";
          document.body.style.backgroundSize = "cover";
        } else if (this.board.backgroundColors) {
          // document.body.style.backgroundImage = `linear-gradient(#eb01a5, #d13531)`;
          let primaryColor = "";
          let secondaryColor = "";
          if (this.board.backgroundColors.primary) {
            const p = this.board.backgroundColors.primary;
            primaryColor = `rgb(${p.r},${p.g},${p.b},${p.a})`;
          }
          if (this.board.backgroundColors.secondary) {
            const s = this.board.backgroundColors.secondary;
            secondaryColor = `rgb(${s.r},${s.g},${s.b},${s.a})`;
          }

          console.log(this.board.backgroundColors.primary);
          console.log(this.board.backgroundColors.secondary);
          if (
            (this.board.backgroundColors.primary == "" ||
              this.board.backgroundColors.primary == undefined) &&
            (this.board.backgroundColors.secondary == undefined ||
              this.board.backgroundColors.secondary == "")
          ) {
            document.body.style.backgroundColor = "";
          } else if (
            (this.board.backgroundColors.primary != undefined ||
              this.board.backgroundColors.primary != "") &&
            (this.board.backgroundColors.secondary == undefined ||
              this.board.backgroundColors.secondary == "")
          ) {
            document.body.style.backgroundColor = primaryColor;
            document.body.style.backgroundImage = "";
          } else if (
            (this.board.backgroundColors.primary == undefined ||
              this.board.backgroundColors.primary == "") &&
            (this.board.backgroundColors.secondary != undefined ||
              this.board.backgroundColors.secondary != "")
          ) {
            document.body.style.backgroundColor = secondaryColor;
            document.body.style.backgroundImage = "";
          } else {
            document.body.style.backgroundImage = `linear-gradient(${primaryColor}, ${secondaryColor})`;
          }
          document.body.style.backgroundPosition = "center center";
          document.body.style.backgroundRepeat = "no-repeat";
          document.body.style.backgroundAttachment = "fixed";
          document.body.style.backgroundSize = "cover";
        }

        if (board.favourite) {
          this.isFavourite = board.favourite.includes(
            this.authService.getUID()
          );
        }

        this.boardMembers = board.sharedUserInfo;
        if (this.boardMembers && this.boardMembers.length > 0) {
          this.boardMembers.forEach((boardMember) => {
            if (boardMember.id == this.authService.getUID()) {
              boardMember.isCurrentUser = true;
            }
          });
        }
      }
    );

    this.labelsSubscription = this.boardServiceV2.labelListChanged.subscribe(
      (labels: Label[]) => {
        console.log(labels);
        this.labels = labels;
      }
    );

    //TODO: This is created with observable inside another observable. Better convert this with switchMap or mergeMap
    this.taskListsSubscription = this.boardServiceV2.taskListsChanged.subscribe(
      (lists: TaskList[]) => {
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
          (tasks: Task[]) => {
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
            this.taskListBackup = cloneDeep(this.taskList);
            this.tasksDataUpdated.next(true);

            tasks.forEach((task) => {
              if (task.activities && task.activities.length > 0) {
                let curActivities: Activity[] = [];
                curActivities = curActivities.concat(task.activities);
                curActivities.forEach((activity) => {
                  activity.taskTitle = task.title;
                  activity.taskId = task.id;
                });

                this.activities.push(...curActivities);
              }
            });
            this.activities.sort((a, b) => {
              if (a.dateTime > b.dateTime) return -1;
              else if (a.dateTime < b.dateTime) return 1;
              else return 0;
            });

            // console.log(this.activities);

            this.loaderService.changeLoading(false);
          }
        );
      }
    );

    //FIXME: SOLUTION: combining observables for TaskList & Tasks
    //https://www.youtube.com/watch?v=0EefbG6N3vY : watched video fro some usage

    // const allTasks = combineLatest([
    //   this.boardServiceV2.taskListsChanged,
    //   this.boardServiceV2.tasksChanged
    // ]).pipe(
    //   map(([taskLists, tasks]) => taskLists.map(taskList => ({
    //     ...taskList,
    //     tasks: tasks.filter(task => taskList.id === task.listId)
    //   }) as TaskList))
    // )

    // allTasks.subscribe(data => {
    //   console.log(data);
    // })
  }

  ngOnDestroy() {
    document.body.style.backgroundColor = "";
    document.body.style.backgroundImage = "";
    console.log("TASK LIST DESTROYED");
    this.routeQueryParams.unsubscribe();

    if (this.boardSubscription) {
      this.boardSubscription.unsubscribe();
      this.boardServiceV2.cancelSingleBoardSuscriotion();
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
        if (!task.archived) {
          list.tasks.push(task);
        }
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
    console.log(event);
    // if (event.previousContainer === event.container) {
    //   console.log("Same Container");
    //   return;
    // }
    if (event.previousIndex === event.currentIndex) {
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
    const clonedTaskLists = cloneDeep(this.taskList);

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "768px",
      height: "700px",
      data: {
        task: clonedTask,
        labels: clonedLabels,
        boardId: this.boardId,
        isTemplateBoard: this.board.isTemplate,
        boardMembers: clonedBoardMembers,
        enableDelete: true,
        boardChecklists: clonedAllChecklist,
        taskLists: clonedTaskLists,
        boardSettings: this.board.settings,
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
      } else {
        if (
          result.task.dueDate &&
          result.task.dueDate.date &&
          result.task.dueDate.date.hasOwnProperty("seconds")
        ) {
          if (
            task.dueDate.date.toDate().getDate() !=
              result.task.dueDate.date.toDate().getDate() ||
            task.dueDate.date.toDate().getMonth() !=
              result.task.dueDate.date.toDate().getMonth()
          ) {
            console.log("modified Due date.");
            const activity = this.createNewActivity(`modified Due date.`);
            result.task.activities.push(activity);
          }
        } else {
          if (result.task.dueDate) {
            const changedDate = result.task.dueDate.date as any;
            if (
              task.dueDate.date.toDate().getDate() != changedDate.getDate() ||
              task.dueDate.date.toDate().getMonth() != changedDate.getMonth()
            ) {
              console.log("modified Due date.");
              const activity = this.createNewActivity(`modified Due date.`);
              result.task.activities.push(activity);
            }
          }
        }
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

      // 7. Archived Task
      if (!task.archived && result.task.archived) {
        const activity = this.createNewActivity("archived this card");
        result.task.activities.push(activity);
      } else if (task.archived && !result.task.archived) {
        const activity = this.createNewActivity("send this task back to board");
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
        // FIXME: Label is not updated once task is created and label is added just after that without refresh
        if (result.updatedLabels && result.updatedLabels.length > 0) {
          result.updatedLabels.forEach((label) => {
            console.log("Updating Label with task ID");
            this.boardServiceV2.updateLabel(this.boardId, label.id, label);
          });
        }
        console.log("Updating task");
        this.boardServiceV2.updateTask(
          this.boardId,
          result.task.id,
          result.task
        );
      }
      this.router.navigate(["."], { relativeTo: this.route });
    });
  }

  setTaskPriority(data) {
    const task = data.task;
    task.priority = data.priority;

    this.boardServiceV2.updateTask(this.boardId, task.id, task);
  }

  setTaskStatus(data) {
    const task = data.task;
    task.status = data.status.name;
    this.boardServiceV2.updateTask(this.boardId, task.id, task);
  }

  createNewActivity(action: string): Activity {
    const activity: Activity = {
      id: this.authService.getUID(),
      user: this.authService.getUserDisplayName(),
      action: action,
      dateTime: new Date(),
    };
    return activity;
  }

  createNewTask(taskListId: string, task = {}): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "768px",
      data: {
        task: task,
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

      if (!result.task.activities) {
        result.task.activities = [];
      }
      const activity = this.createNewActivity(`Created this card.`);
      result.task.activities.push(activity);

      this.boardServiceV2.addTask(this.boardId, result.task);
    });
  }

  createTaskFromTemplate(taskListId: string): void {
    console.log(`TaskList ID: ${taskListId}`);

    const tempateTasks = this.tasks.filter(
      (task) => task.isTemplateTask == true
    );
    const dialogRef = this.dialog.open(TaskTemplateDialogComponent, {
      width: "320px",
      data: {
        boardId: this.boardId,
        taskListId: taskListId,
        templateTasks: tempateTasks,
        labels: this.labels,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskTemplateDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }
      if (result.isCreatingTemplate) {
        const task: any = {};
        task.isTemplateTask = true;
        this.createNewTask(taskListId, task);
      }
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

  focusBoardTitle() {
    console.log("focus on Board Title");
    this.backupBoardTitle = cloneDeep(this.board.title);
  }

  focusOutBoardTitle() {
    this.editingBoardName = !this.editingBoardName;
    console.log(`Focus out Board Title ${this.board.title}`);
    if (this.backupBoardTitle !== this.board.title) {
      console.log("Board Title Changed");
      this.boardServiceV2.updateBoard(this.boardId, this.board);
    }
  }

  toggleBoardNameEditing() {
    this.editingBoardName = !this.editingBoardName;
  }

  focusListTitle(taskList: TaskList) {
    console.log("focus on Board Title");
    this.backupTaskListName = cloneDeep(taskList.name);
  }

  focusOutListTitle(taskList: TaskList) {
    taskList.isEditing = !taskList.isEditing;
    if (this.backupTaskListName !== taskList.name) {
      console.log("tasklist name changed");
      this.boardServiceV2.updateTaskList(this.boardId, taskList.id, taskList);
    }
  }

  toggleListNameEditing(taskList: TaskList) {
    taskList.isEditing = !taskList.isEditing;
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
    if (!this.board.favourite) {
      this.board.favourite = [];
    }
    if (!this.isFavourite) {
      this.board.favourite.push(this.authService.getUID());
    } else {
      const index = this.board.favourite.indexOf(this.authService.getUID());
      this.board.favourite.splice(index, 1);
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

  isAdmin(): boolean {
    let isAdmin: boolean = false;
    if (this.board.owner == this.authService.getUID()) {
      isAdmin = true;
    } else {
      this.boardMembers.forEach((membr) => {
        if (membr.permission.admin) {
          isAdmin = true;
        }
      });
    }

    return isAdmin;
  }

  isCurrentUserAdmin(): boolean {
    let isUserAdmin: boolean = false;
    // if (this.board.owner == this.authService.getUID()) {
    //   isUserAdmin = true;
    // } else {
    //   this.boardMembers.forEach((membr) => {
    //     if (membr.id == this.authService.getUID()) {
    //       if (membr.permission.admin) {
    //         isUserAdmin = true;
    //       }
    //     }
    //   });
    // }

    this.boardMembers.forEach((membr) => {
      if (membr.id == this.authService.getUID()) {
        if (membr.permission.admin) {
          isUserAdmin = true;
        }
      }
    });

    return isUserAdmin;
  }

  openAutomation() {
    console.log("Opening Automation dialog");
    const dialogRef = this.dialog.open(AutomationDialogComponent, {
      width: "1200px",
      minHeight: "700px",
      data: {
        board: this.board,
        taskLists: this.taskList,
        labels: this.labels,
      },
    });
    dialogRef.afterClosed().subscribe((result: AutomationDialogResult) => {
      if (!result) {
        return;
      }
    });
  }

  toggleMenuSidenav() {
    this.allAdmins = [];
    this.allAdmins.push(this.boardAdmin);

    if (this.boardMembers && this.boardMembers.length > 0) {
      this.boardMembers.forEach((boardMember) => {
        if (boardMember.permission.admin) {
          this.allAdmins.push(boardMember);
        }
      });
    }

    this.isShowingSidenav = !this.isShowingSidenav;

    this.isShowingAboutBoard = false;
    this.isShowingChangeBackgroundBoard = false;
    this.isShowingColors = false;
    this.boardBGColorPrimary = "";
    this.boardBGColorSecondary = "";
    this.isShowingPhotos = false;
    this.isSearchingCard = false;
    this.isShowingMore = false;
    this.isShowingMoreSetting = false;
    this.isShowingArchivedTasks = false;
  }

  activityToCard(taskId: string) {
    this.router.navigate([], { queryParams: { task: `${taskId}` } });
  }

  viewAllActivity() {
    if (this.sliceLimitEnd < this.activities.length) {
      this.sliceLimitEnd += 10;
    }
  }

  showAboutBoard() {
    this.isShowingAboutBoard = true;
  }

  showChangeBgColor() {
    this.isShowingChangeBackgroundBoard = true;
  }

  showColors() {
    this.boardBGColorPrimary = "";
    this.boardBGColorSecondary = "";
    this.isShowingColors = true;
  }

  showPhotos() {
    this.isShowingPhotos = true;
  }

  showMore() {
    this.isShowingMore = true;
  }

  moreMenuSetting() {
    this.isShowingMore = false;
    this.isShowingAllLabels = false;
    this.isShowingArchivedTasks = false;
    this.isShowingMoreSetting = true;
  }

  allBoardLabels() {
    this.isShowingMore = false;
    this.isShowingMoreSetting = false;
    this.isShowingAllLabels = true;
    this.isShowingArchivedTasks = false;
  }

  cardCoverSetting() {
    const isAdmin = this.isCurrentUserAdmin();

    if (isAdmin) {
      this.board.settings.cardCoverEnabled =
        !this.board.settings.cardCoverEnabled;
      this.boardServiceV2.updateBoardSettings(
        this.boardId,
        this.board.settings
      );
    }
  }

  openLabelDialog() {
    const allLabels = cloneDeep(this.labels);
    const dialogRef = this.dialog.open(LabelDialogComponent, {
      width: "360px",
      data: {
        labels: allLabels,
        enableDelete: false,
        taskId: "",
        boardId: this.boardId,
      },
    });
    dialogRef.afterClosed().subscribe((result: LabelDialogResult) => {
      if (!result) {
        return;
      }
    });
  }

  showMoreLabels() {}

  allArchivedTasks() {
    // Gathering all archived tasks
    this.archivedTasks = [];
    this.tasks.forEach((task) => {
      if (task.archived) {
        this.archivedTasks.push(task);
      }
    });

    this.isShowingMore = false;
    this.isShowingMoreSetting = false;
    this.isShowingAllLabels = false;
    this.isShowingArchivedTasks = true;
  }

  sendTaskToBoard(archivedTask: Task) {
    console.log(archivedTask);
    archivedTask.archived = false;
    this.boardServiceV2.updateTask(this.boardId, archivedTask.id, archivedTask);
  }

  deleteArchivedTask(archivedTask: Task) {
    console.log(archivedTask);
    this.boardServiceV2.deleteTask(this.boardId, archivedTask.id);
  }

  openCommentPermissionModal() {
    const isAdmin = this.isCurrentUserAdmin();

    if (isAdmin) {
      const dialogRef = this.dialog.open(BoardSettingsDialogComponent, {
        width: "280px",
        hasBackdrop: false,
        autoFocus: false,
        data: {
          positionRelativeToElement: this.commentPermissionRef,
          isAddRemovePermission: false,
          isCommentingPermission: true,
          commentingPermission: this.board.settings.commentingPermission,
        },
      });
      dialogRef.afterClosed().subscribe((result: BoardSettingsDialogResult) => {
        console.log(result);
        if (!result) {
          return;
        }

        this.board.settings.commentingPermission = result.commentingPermission;
        this.boardServiceV2.updateBoardSettings(
          this.boardId,
          this.board.settings
        );
      });
    }
  }

  openAddRemovePermissionModal() {
    const isAdmin = this.isCurrentUserAdmin();
    if (isAdmin) {
      const dialogRef = this.dialog.open(BoardSettingsDialogComponent, {
        width: "280px",
        hasBackdrop: false,
        autoFocus: false,
        data: {
          positionRelativeToElement: this.addRemovePermissionRef,
          isAddRemovePermission: true,
          addRemovePermission: this.board.settings.addRemovePermission,
          isCommentingPermission: false,
        },
      });
      dialogRef.afterClosed().subscribe((result: BoardSettingsDialogResult) => {
        console.log(result);
        if (!result) {
          return;
        }

        this.board.settings.addRemovePermission = result.addRemovePermission;
        this.boardServiceV2.updateBoardSettings(
          this.boardId,
          this.board.settings
        );
      });
    }
  }

  // emailToBoard() {
  //   console.log("Currently not supported");
  // }

  watchBoard() {
    console.log("Currently not supported. Need Firebase functions");
  }

  makeBoardTemplate() {
    const isAdmin = this.isCurrentUserAdmin();
    if (isAdmin) {
      const dialogRef = this.dialog.open(BoardTemplateDialogComponent, {
        width: "280px",
        hasBackdrop: true,
        data: {},
      });
      dialogRef
        .afterClosed()
        .subscribe(async (result: BoardTemplateDialogResult) => {
          console.log(result);
          if (!result) {
            return;
          }

          if (result.isTemplate) {
            this.loaderService.changeLoading(true);
            const copiedBoard = await this.boardServiceV2.copyBoardDoc(
              "boards",
              this.boardId,
              this.board.title,
              this.board.description,
              "boards",
              true,
              {},
              true,
              true
            );
            console.log(`BOARD COPY COMPLETE: ${copiedBoard}`);
            this.loaderService.changeLoading(false);

            if (copiedBoard) {
              const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: "240px",
                data: {
                  message: `<span>Navigate to copied Template</span>: <a href="/boards/${copiedBoard}">Copied Board</a>`,
                },
              });
              dialogRef.disableClose = true;
              dialogRef
                .afterClosed()
                .subscribe((result: ConfirmDialogResult) => {
                  if (!result) {
                    return;
                  }
                  console.log(result);
                  if (result.confirm) {
                    this.router
                      .navigateByUrl(`/boards/${copiedBoard}`)
                      .then(() => {
                        window.location.reload();
                      });
                  }
                });
            }
          }
        });
    }
  }

  copyBoardContent() {
    const isAdmin = this.isCurrentUserAdmin();
    if (isAdmin) {
      const dialogRef = this.dialog.open(CopyBoardDialogComponent, {
        width: "280px",
        hasBackdrop: true,
        data: {
          board: this.board,
        },
      });
      dialogRef
        .afterClosed()
        .subscribe(async (result: CopyBoardDialogResult) => {
          console.log(result);
          if (!result) {
            return;
          }

          this.loaderService.changeLoading(true);
          const copiedBoard = await this.boardServiceV2.copyBoardDoc(
            "boards",
            this.boardId,
            result.boardTitle,
            result.boardDescription,
            "boards",
            true,
            {},
            false,
            true
          );
          console.log(`BOARD COPY COMPLETE: ${copiedBoard}`);
          this.loaderService.changeLoading(false);

          if (copiedBoard) {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
              width: "240px",
              data: {
                message: `<span>Navigate to copied board</span>: <a href="/boards/${copiedBoard}">Copied Board</a>`,
              },
            });
            dialogRef.disableClose = true;
            dialogRef.afterClosed().subscribe((result: ConfirmDialogResult) => {
              if (!result) {
                return;
              }
              console.log(result);
              if (result.confirm) {
                this.router.navigateByUrl(`/boards/${copiedBoard}`).then(() => {
                  window.location.reload();
                });
              }
            });
          }
        });
    }
  }

  convertToBoard() {
    this.board.isTemplate = false;
    this.boardServiceV2.updateBoard(this.boardId, this.board);
  }

  printExport() {}

  closeBoard() {
    console.log(this.closeBoardRef);
    const isAdmin = this.isCurrentUserAdmin();
    if (isAdmin) {
      const dialogRef = this.dialog.open(CloseBoardDialogComponent, {
        width: "280px",
        hasBackdrop: false,
        autoFocus: false,
        data: {
          positionRelativeToElement: this.closeBoardRef,
        },
      });
      dialogRef.afterClosed().subscribe((result: CloseBoardDialogResult) => {
        console.log(result);
        if (!result) {
          return;
        }

        if (result.delete) {
          this.board.closed = true;
          this.boardServiceV2.updateBoard(this.boardId, this.board);
        }
      });
    }
  }

  backToMenu() {
    this.isShowingAboutBoard = false;
    this.isShowingChangeBackgroundBoard = false;
    this.isShowingColors = false;
    this.boardBGColorPrimary = "";
    this.boardBGColorSecondary = "";
    this.isShowingPhotos = false;
    this.isSearchingCard = false;

    // this.isShowingMore = false;
    // this.isShowingMoreSetting = false;
    // this.isShowingAllLabels = false;
    // this.isShowingArchivedTasks = false;

    if (this.isShowingMore) {
      this.isShowingMore = false;
    }

    if (this.isShowingAllLabels) {
      this.isShowingMore = true;
      this.isShowingAllLabels = false;
      this.isShowingMoreSetting = false;
      this.isShowingArchivedTasks = false;
    } else {
      this.isShowingAllLabels = false;
    }

    if (this.isShowingMoreSetting) {
      this.isShowingMore = true;
      this.isShowingMoreSetting = false;
      this.isShowingAllLabels = false;
      this.isShowingArchivedTasks = false;
    } else {
      this.isShowingMoreSetting = false;
    }

    if (this.isShowingArchivedTasks) {
      this.isShowingMore = true;
      this.isShowingArchivedTasks = false;
      this.isShowingAllLabels = false;
      this.isShowingMoreSetting = false;
    } else {
      this.isShowingArchivedTasks = false;
    }
  }

  changeBGColorComplete($event: any, type: string) {
    if (type === "primary") {
      this.boardBGColorPrimary = $event.color.rgb;
    } else if (type === "secondary") {
      this.boardBGColorSecondary = $event.color.rgb;
    }
  }

  saveBGColor(type: string) {
    if (!this.board.backgroundColors) {
      this.board.backgroundColors = {};
    }

    if (type === "primary") {
      this.board.backgroundColors.primary = this.boardBGColorPrimary;
    } else if (type === "secondary") {
      this.board.backgroundColors.secondary = this.boardBGColorSecondary;
    }

    console.log(this.board);
    this.boardServiceV2.updateBoard(this.boardId, this.board);
  }

  removeBGColor(type: string) {
    if (type === "primary") {
      this.board.backgroundColors.primary = "";
    } else if (type === "secondary") {
      this.board.backgroundColors.secondary = "";
    }

    console.log(this.board);
    this.boardServiceV2.updateBoard(this.boardId, this.board);
  }

  showSearchCard() {
    this.searchLabels = [];
    this.searchMembers = [];
    // set up labels for search
    const noLabel: Label = {
      id: "1",
      color: "#b3bac5",
      name: "No labels",
      isSelected: false,
    };
    this.searchLabels.push(noLabel);
    const labels = cloneDeep(this.labels);
    this.searchLabels.push(...labels);

    // set up members for search
    const noMember: SharedUser = {
      id: "1",
      name: "No Member",
    };
    this.searchMembers.push(noMember);
    this.searchMembers.push(cloneDeep(this.boardAdmin));
    const boardMembers = cloneDeep(this.boardMembers);
    if (boardMembers && boardMembers.length > 0) {
      this.searchMembers.push(...boardMembers);
    }

    // Check if already selected user & label is there
    if (this.selectedFilters.labels.length > 0) {
      this.searchLabels.forEach((label: any) => {
        if (this.selectedFilters.labels.includes(label.id)) {
          label.selected = true;
        }
      });
    }

    if (this.selectedFilters.members.length > 0) {
      this.searchMembers.forEach((member: any) => {
        if (this.selectedFilters.members.includes(member.id)) {
          member.selected = true;
        }
      });
    }

    if (this.selectedFilters.members.length > 0) {
    }

    this.isSearchingCard = true;
  }

  //TODO: Refactor this code fro better maintainability.
  //FIXME: Not all filter scenarios work properly. mostly removing filter across groups needs attention.
  searchCardFilter(data: any, type: string) {
    console.log(type);
    console.log(data);

    this.removeSearch = true;

    if (type === this.constant.CARD_FILTERS.LABEL) {
      if (data.selected) {
        this.selectedFilters.labels.splice(
          this.selectedFilters.labels.indexOf(data.id),
          1
        );

        if (
          this.selectedFilters.labels.length == 0 &&
          this.selectedFilters.members.length == 0
        ) {
          console.log("All filters exhausted");
          this.taskList = cloneDeep(this.taskListBackup);
        } else {
          this.taskList = cloneDeep(this.taskListBackup);

          // Check if currest filter selected has 'No Label' selected
          if (this.selectedFilters.labels.includes("1")) {
            console.log("Filter has No label");
          }

          this.taskList.forEach((list) => {
            const tasks = [];
            list.tasks.forEach((task) => {
              let taskAdded = false;
              this.labels.forEach((label) => {
                if (this.selectedFilters.labels.includes(label.id)) {
                  if (label.taskIds.includes(task.id)) {
                    tasks.push(task);
                    taskAdded = true;
                  }
                }
              });

              if (!taskAdded && task.members) {
                let taskAlreadyAdded = false;
                task.members.forEach((member) => {
                  if (this.selectedFilters.members.includes(member.id)) {
                    if (!taskAlreadyAdded) {
                      tasks.push(task);
                      taskAlreadyAdded = true;
                    }
                  }
                });
              }
            });
            list.tasks = tasks;
          });
        }

        data.selected = false;
      } else {
        this.selectedFilters.labels.push(data.id);

        //TODO: Check if user selected No Label
        if (data.name == this.constant.LABLE_FILTER_NO_LABEL) {
          const taskWithLabels = new Set();
          this.labels.forEach((label) => {
            label.taskIds.forEach((taskId) => {
              taskWithLabels.add(taskId);
            });
          });

          this.taskList.forEach((list) => {
            const tasks = [];
            list.tasks.forEach((task) => {
              if (!taskWithLabels.has(task.id)) {
                tasks.push(task);
              }
            });
            list.tasks = tasks;
          });
        } else {
          this.taskList.forEach((list) => {
            const tasks = [];
            list.tasks.forEach((task) => {
              if (data.taskIds.includes(task.id)) {
                tasks.push(task);
              }
            });
            list.tasks = tasks;
          });
        }
        data.selected = true;
      }
    } else if (type === this.constant.CARD_FILTERS.MEMBER) {
      if (data.selected) {
        //TODO: Check if user selected No Member
        this.selectedFilters.members.splice(
          this.selectedFilters.members.indexOf(data.id),
          1
        );

        console.log(this.selectedFilters.members);
        if (
          this.selectedFilters.members.length == 0 &&
          this.selectedFilters.labels.length == 0
        ) {
          this.taskList = cloneDeep(this.taskListBackup);
        } else {
          this.taskList = cloneDeep(this.taskListBackup);
          this.taskList.forEach((list) => {
            const tasks = [];
            list.tasks.forEach((task) => {
              let taskAdded: boolean = false;
              if (task.members) {
                task.members.forEach((member) => {
                  let taskAlreadyAdded = false;
                  if (this.selectedFilters.members.includes(member.id)) {
                    if (!taskAlreadyAdded) {
                      tasks.push(task);
                      taskAlreadyAdded = true;
                    }
                    taskAdded = true;
                  }
                });
              }
              if (!taskAdded) {
                this.labels.forEach((label) => {
                  if (this.selectedFilters.labels.includes(label.id)) {
                    if (label.taskIds.includes(task.id)) {
                      tasks.push(task);
                    }
                  }
                });
              }
            });
            list.tasks = tasks;
          });
        }
        data.selected = false;
      } else {
        //TODO: Check if user selected No Member
        this.selectedFilters.members.push(data.id);

        if (data.name == this.constant.LABLE_FILTER_NO_MEMBER) {
          this.taskList.forEach((list) => {
            const tasks = [];
            list.tasks.forEach((task) => {
              if (!task.members) {
                tasks.push(task);
              }
            });
            list.tasks = tasks;
          });
        } else {
          this.taskList.forEach((list) => {
            const tasks = [];
            list.tasks.forEach((task) => {
              if (task.members) {
                task.members.forEach((member) => {
                  if (member.id == data.id) {
                    tasks.push(task);
                  }
                });
              }
            });
            list.tasks = tasks;
          });
        }
        data.selected = true;
      }
    } else if (type === this.constant.CARD_FILTERS.DUE) {
      this.constant.DUE_OPTIONS.forEach((opts) => {
        if (opts.text != data.text) {
          opts.selected = false;
        }
      });

      this.taskList = cloneDeep(this.taskListBackup);
      if (data.selected) {
        data.selected = false;
      } else {
        this.taskList.forEach((list) => {
          const tasks = [];
          list.tasks.forEach((task) => {
            if (data.text == this.constant.DUE_OPTIONS_TEXT.HAS_NO_DUE_DATE) {
              if (!task.dueDate || !task.dueDate.date) {
                tasks.push(task);
              }
            } else if (
              data.text == this.constant.DUE_OPTIONS_TEXT.DUE_NEXT_DAY
            ) {
              if (task.dueDate && task.dueDate.date) {
                const diffDays = this.calculateDays(
                  new Date(),
                  task.dueDate.date.toDate()
                );
                console.log(diffDays);
                if (diffDays >= 0 && diffDays < 2) {
                  tasks.push(task);
                }
              }
            } else if (
              data.text == this.constant.DUE_OPTIONS_TEXT.DUE_NEXT_WEEK
            ) {
              if (task.dueDate && task.dueDate.date) {
                const today = new Date();
                const diffDays = this.calculateDays(
                  today,
                  task.dueDate.date.toDate()
                );
                const d = new Date();
                const nextWeekMonday = new Date(
                  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7))
                );
                const diffDaysForMonday = this.calculateDays(
                  today,
                  nextWeekMonday
                );
                if (
                  diffDays >= diffDaysForMonday - 1 &&
                  diffDays < diffDaysForMonday - 1 + 7
                ) {
                  tasks.push(task);
                }
              }
            } else if (
              data.text == this.constant.DUE_OPTIONS_TEXT.DUE_NEXT_MONTH
            ) {
              if (task.dueDate && task.dueDate.date) {
                const today = new Date();
                const diffDays = this.calculateDays(
                  today,
                  task.dueDate.date.toDate()
                );
                const d = new Date();
                const nextMonthStart = new Date(
                  d.setDate(d.getDate() + ((1 + 30 - d.getMonth()) % 30 || 30))
                );
                const diffDaysForMonthStart = this.calculateDays(
                  today,
                  nextMonthStart
                );
                if (
                  diffDays >= diffDaysForMonthStart - 1 &&
                  diffDays < diffDaysForMonthStart - 1 + 30
                ) {
                  tasks.push(task);
                }
              }
            } else if (data.text == this.constant.DUE_OPTIONS_TEXT.OVERDUE) {
              if (
                task.dueDate &&
                task.dueDate.date &&
                !task.dueDate.completed
              ) {
                const diffDays = this.calculateDays(
                  new Date(),
                  task.dueDate.date.toDate()
                );
                if (diffDays <= 0) {
                  tasks.push(task);
                }
              }
            } else if (
              data.text == this.constant.DUE_OPTIONS_TEXT.DUE_COMPLETED
            ) {
              if (task.dueDate && task.dueDate.date) {
                if (task.dueDate && task.dueDate.completed) {
                  tasks.push(task);
                }
              }
            } else if (
              data.text == this.constant.DUE_OPTIONS_TEXT.DUE_NOT_COMPLETE
            ) {
              if (task.dueDate && task.dueDate.date) {
                if (task.dueDate && !task.dueDate.completed) {
                  tasks.push(task);
                }
              }
            }
          });
          list.tasks = tasks;
        });
        data.selected = true;
      }
    }

    if (
      !(
        this.selectedFilters.dues.length == 0 &&
        this.selectedFilters.labels.length == 0 &&
        this.selectedFilters.members.length == 0
      )
    ) {
      console.log(this.taskList);
      this.searchTaskCount = 0;
      this.taskList.forEach((list) => {
        list.tasks.forEach((task) => {
          this.searchTaskCount += 1;
        });
      });
    } else {
      this.searchTaskCount = 0;
      this.taskList.forEach((list) => {
        list.tasks.forEach((task) => {
          this.searchTaskCount += 1;
        });
      });
    }
  }

  searchCardChanged() {
    console.log(this.searchCard);
  }

  calculateDays(dateOne: any, dateTwo: any) {
    let diffTime = Math.abs(dateTwo - dateOne);
    let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (dateOne > dateTwo) {
      diffDays = diffDays * -1;
    }
    return diffDays;
  }

  removeSearchResults() {
    this.removeSearch = false;
    this.searchTaskCount = 0;
    this.selectedFilters.members = [];
    this.selectedFilters.labels = [];
    this.selectedFilters.dues = [];
    this.searchLabels.forEach((label: any) => {
      label.selected = false;
    });
    this.searchMembers.forEach((member: any) => {
      member.selected = false;
    });
    this.constant.DUE_OPTIONS.forEach((opts) => {
      opts.selected = false;
    });
    this.taskList = cloneDeep(this.taskListBackup);
  }

  saveDescription() {
    this.boardServiceV2.updateBoard(this.boardId, this.board);
  }

  openMemberMenu(member: SharedUser) {
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
    }

    isAdmin = this.isCurrentUserAdmin();

    const tasks = cloneDeep(this.tasks);
    const dialogRef = this.dialog.open(MemberInfoDialogComponent, {
      width: "380px",
      // hasBackdrop: false,
      autoFocus: false,
      data: {
        member: this.menuMember,
        positionRelativeToElement: this.menuUserRef,
        isOwner: isOwner,
        isAdmin: isAdmin,
        tasks: tasks,
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
        const taskChecklist: Task[] = [];

        this.tasks.forEach((task) => {
          if (task.members && task.members.length > 0) {
            task.members.forEach((mbr) => {
              if (mbr.id == result.member.id) {
                tasks.push(task);
              }
            });
          }

          if (task.checklists && task.checklists.length > 0) {
            task.checklists.forEach((checklist) => {
              if (checklist && checklist.checklist.length > 0) {
                checklist.checklist.forEach((chklst) => {
                  if (chklst.members && chklst.members.length > 0) {
                    chklst.members.forEach((mbr) => {
                      if (mbr.id == result.member.id) {
                        taskChecklist.push(task);
                      }
                    });
                  }
                });
              }
            });
          }
        });

        console.log(shared);
        console.log(sharedUserInfo);
        console.log(tasks);
        console.log(taskChecklist);
        this.boardServiceV2.removeUserFromBoard(
          this.boardId,
          shared,
          sharedUserInfo,
          tasks,
          taskChecklist,
          result.member.id
        );

        //FIXME: This should be done through firebase functions
        const curUserName = this.authService.getUserDisplayName();
        const newNotification: AppNotification = {
          text: `<b>${curUserName}</b> removed you from board <b>${this.board.title}</b>`,
          description:
            "You wont be able to access the board. Get in touch with Board owner to get access back.",
          isRead: false,
          created: new Date(),
        };
        this.notificationService.addNotification(
          result.member.id,
          newNotification
        );
      }

      if (result.isMadeAdmin) {
        this.board.sharedUserInfo.forEach((userInfo) => {
          if (result.member.id == userInfo.id) {
            userInfo.permission.admin = true;
          }
        });
        this.boardServiceV2.updateBoard(this.boardId, this.board);

        //FIXME: This should be done through firebase functions
        const curUserName = this.authService.getUserDisplayName();
        const newNotification: AppNotification = {
          text: `<b>${curUserName}</b> made you admin for board <b>${this.board.title}</b>`,
          description:
            "You can view and edit cards, remove members, and change all settings for the board.",
          isRead: false,
          created: new Date(),
        };
        this.notificationService.addNotification(
          result.member.id,
          newNotification
        );
      }

      if (result.isAdminRemoved) {
        this.board.sharedUserInfo.forEach((userInfo) => {
          if (result.member.id == userInfo.id) {
            userInfo.permission.admin = false;
          }
        });
        this.boardServiceV2.updateBoard(this.boardId, this.board);

        const curUserName = this.authService.getUserDisplayName();
        const newNotification: AppNotification = {
          text: `<b>${curUserName}</b> updated your role from admin to normal for board <b>${this.board.title}</b>`,
          description:
            "You can view and edit cards. Can change some board settings.",
          isRead: false,
          created: new Date(),
        };
        this.notificationService.addNotification(
          result.member.id,
          newNotification
        );
      }

      if (result.taskId) {
        this.activityToCard(result.taskId);
      }
    });
  }

  setBackgroundColor(list: TaskList) {
    const curBgColor = list.backgroundColor ? list.backgroundColor : "";

    const dialogRef = this.dialog.open(ColorDialogComponent, {
      width: "500px",
      height: "600px",
      data: {
        color: curBgColor,
      },
    });
    dialogRef.afterClosed().subscribe((result: ColorDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      }

      list.backgroundColor = result.color;
      this.boardServiceV2.updateTaskList(this.boardId, list.id, list);
    });
  }
}
