import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { Subject } from "rxjs";
import { Board } from "src/app/boards/board/board";
import { Task } from "src/app/tasks/task/task";
import { AuthService } from "./auth.service";
import { TaskList } from "../../tasks/task-list/tasklist";
import { Label } from "src/app/tasks/task/label";

@Injectable()
export class BoardService {
  private boardsCollection: AngularFirestoreCollection<Board>;
  private taskListsCollection: AngularFirestoreCollection<TaskList>;
  private tasksCollection: AngularFirestoreCollection<Task>;
  private labelsCollection: AngularFirestoreCollection<Label>;

  private allBoards: Board[];
  private allTaskLists: TaskList[];
  private allTasks: Task[];
  private allLabelList: Label[];

  public boardsChanged = new Subject<Board[]>();
  public taskListsChanged = new Subject<TaskList[]>();
  public tasksChanged = new Subject<Task[]>();
  public labelListChanged = new Subject<Label[]>();

  constructor(
    private _store: AngularFirestore,
    private authService: AuthService
  ) {}

  getBoards() {
    this.boardsCollection = this._store.collection<Board>(
      this.authService.getUID()
    );

    this.boardsCollection
      .valueChanges({ idField: "id" })
      .subscribe((boards) => {
        this.allBoards = boards;
        this.boardsChanged.next([...this.allBoards]);
      });
  }

  addBoard(board: Board) {
    return this._store.firestore.runTransaction(async () => {
      const docInfo = await this._store
        .collection(this.authService.getUID())
        .add(board);
    });
  }

  getTaskList(boardId: string) {
    this.taskListsCollection = this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("taskLists");

    this.taskListsCollection
      .valueChanges({ idField: "id" })
      .subscribe((taskList) => {
        this.allTaskLists = taskList;
        this.taskListsChanged.next([...this.allTaskLists]);
      });
  }

  addTaskList(boardId: string, data: TaskList) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("taskLists")
      .add(data);
  }

  addTask(boardId: string, taskGroupId: string, tasks: Task[]) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("taskLists")
      .doc(taskGroupId)
      .set({ tasks: tasks }, { merge: true });
  }

  updateTask(boardId: string, taskGroupId: string, tasks: Task[]) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("taskLists")
      .doc(taskGroupId)
      .set({ tasks: tasks }, { merge: true });
  }

  moveTasks(
    boardId: string,
    oldTaskGroupId: string,
    oldTasks: Task[],
    newTaskGroupId: string,
    newTasks: Task[]
  ) {
    this._store.firestore.runTransaction(() => {
      return Promise.all([
        this._store
          .collection(this.authService.getUID())
          .doc(boardId)
          .collection("taskLists")
          .doc(oldTaskGroupId)
          .set({ tasks: oldTasks }, { merge: true }),
        this._store
          .collection(this.authService.getUID())
          .doc(boardId)
          .collection("taskLists")
          .doc(newTaskGroupId)
          .set({ tasks: newTasks }, { merge: true }),
      ]);
    });
  }

  getLabels(boardId: string) {
    this.labelsCollection = this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("labels");

    this.labelsCollection
      .valueChanges({ idField: "id" })
      .subscribe((labels) => {
        this.allLabelList = labels;
        this.labelListChanged.next([...this.allLabelList]);
      });
  }

  addLabel(boardId: string, label: Label) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("labels")
      .add(label);
  }

  addLabelToTask(boardId: string, taskGroupId: string, tasks: Task[]) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("taskLists")
      .doc(taskGroupId)
      .set({ tasks: tasks }, { merge: true });
  }
}
