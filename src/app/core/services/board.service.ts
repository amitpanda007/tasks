import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { Subject, BehaviorSubject } from "rxjs";
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

  getTasks(boardId: string) {
    this.tasksCollection = this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("tasks");

    this.tasksCollection
      .valueChanges({ idField: "id" })
      .subscribe((tasks) => {
        this.allTasks = tasks;
        this.tasksChanged.next([...this.allTasks]);
      });
  }

  addTask(boardId: string, task: Task) {
    return this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("tasks")
      .add(task)
      .then((docRef) => {
        return docRef.id;
    });
  }

  updateTask(boardId: string, taskId: string, task: Task) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .set(task, { merge: true });
  }

  deleteTask(boardId: string, taskId: string) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .delete();
  }

  moveTasks(
    boardId: string,
    taskId: string,
    newTaskListId: string
  ) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .set({ listId: newTaskListId }, { merge: true });
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
    return this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("labels")
      .add(label)
      .then((docRef) => {
        return docRef.id;
    });
  }

  updateLabel(boardId: string, labelId: string, label: Label) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("labels")
      .doc(labelId)
      .set(label, { merge: true })
  }

  deleteLabel(boardId: string, labelId: string) {
    this._store
      .collection(this.authService.getUID())
      .doc(boardId)
      .collection("labels")
      .doc(labelId)
      .delete();
  }
}
