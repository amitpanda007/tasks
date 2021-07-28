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
import { Subscription } from "rxjs";
import { Invitation } from "../../common/invite-dialog/invitation";
import { firestore } from "firebase/app";
import * as firebase from "firebase/app";

@Injectable()
export class BoardServiceV2 {
  private boardsCollection: AngularFirestoreCollection<Board>;
  private sharedBoardsCollection: AngularFirestoreCollection<Board>;
  private taskListsCollection: AngularFirestoreCollection<TaskList>;
  private tasksCollection: AngularFirestoreCollection<Task>;
  private labelsCollection: AngularFirestoreCollection<Label>;

  private allBoards: Board[];
  private allSharedBoards: Board[];
  private allTaskLists: TaskList[];
  private allTasks: Task[];
  private allLabelList: Label[];

  private boardsSubscription: Subscription;
  private sharedBoardsSubscription: Subscription;
  private taskListsSubscription: Subscription;
  private tasksSubscription: Subscription;
  private labelsSubscription: Subscription;

  public boardsChanged = new Subject<Board[]>();
  public sharedBoardsChanged = new Subject<Board[]>();
  public taskListsChanged = new Subject<TaskList[]>();
  public tasksChanged = new Subject<Task[]>();
  public labelListChanged = new Subject<Label[]>();

  constructor(
    private _store: AngularFirestore,
    private authService: AuthService
  ) {}

  /**
   * Boards API Call section
   **/

  getBoards() {
    this.boardsCollection = this._store.collection<Board>("boards", (ref) =>
      ref.where("owner", "==", this.authService.getUID())
    );

    this.boardsSubscription = this.boardsCollection
      .valueChanges({ idField: "id" })
      .subscribe((boards) => {
        this.allBoards = boards;
        this.boardsChanged.next([...this.allBoards]);
      });
  }

  cancelBoardSuscriotion() {
    this.boardsSubscription.unsubscribe();
  }

  getSharedBoards() {
    this.sharedBoardsCollection = this._store.collection<Board>(
      "boards",
      (ref) =>
        ref.where("shared", "array-contains-any", [this.authService.getUID()])
    );

    this.sharedBoardsSubscription = this.sharedBoardsCollection
      .valueChanges({ idField: "id" })
      .subscribe((sharedBoards) => {
        this.allSharedBoards = sharedBoards;
        this.sharedBoardsChanged.next([...this.allSharedBoards]);
      });
  }

  cancelSharedBoardSuscriotion() {
    this.sharedBoardsSubscription.unsubscribe();
  }

  getBoardsWithoutObserver() {
    return this._store.collection<Board>("boards", (ref) =>
      ref.where("owner", "==", this.authService.getUID())
    );
  }

  addBoard(board: Board) {
    return this._store.firestore.runTransaction(async () => {
      const docInfo = await this._store.collection("boards").add(board);
    });
  }

  getBoard(boardId: string) {
    return this._store.collection<Board>("boards").doc(boardId);
  }

  getBoardWithPromise(boardId: string) {
    return this._store
      .collection<Board>("boards")
      .doc(boardId)
      .get()
      .toPromise();
  }

  getBoardInvitation(boardId: string, invitationId: string) {
    return this._store
      .collection<Board>("boards")
      .doc(boardId)
      .collection("invitations")
      .doc(invitationId);
  }

  createInvitation(boardId: string, invitation: Invitation) {
    return this._store
      .collection("boards")
      .doc(boardId)
      .collection("invitations")
      .add(invitation)
      .then((docRef) => {
        return docRef.id;
      });
  }

  acceptInvitation(boardId: string, invitationId: string) {
    const userInfo = {
      id: this.authService.getUID(),
      name: this.authService.getUserDisplayName(),
    };
    this._store.firestore.runTransaction(() => {
      return Promise.all([
        this._store
          .collection("boards")
          .doc(boardId)
          .collection("invitations")
          .doc(invitationId)
          .set({ accepted: true }, { merge: true }),
        this._store
          .collection("boards")
          .doc(boardId)
          .update({
            shared: firestore.FieldValue.arrayUnion(this.authService.getUID()),
            sharedUserInfo: firestore.FieldValue.arrayUnion(userInfo),
          }),
      ]);
    });
  }

  /**
  / TaskLists API Call section
  **/

  getTaskList(boardId: string) {
    this.taskListsCollection = this._store
      .collection("boards")
      .doc(boardId)
      .collection("taskLists");

    this.taskListsSubscription = this.taskListsCollection
      .valueChanges({ idField: "id" })
      .subscribe((taskList) => {
        this.allTaskLists = taskList;
        this.taskListsChanged.next([...this.allTaskLists]);
      });
  }

  cancelTaskListsSubscription() {
    this.taskListsSubscription.unsubscribe();
  }

  getTaskListWithoutSubscription(boardId: string) {
    return this._store
      .collection<Board>("boards")
      .doc(boardId)
      .collection<TaskList>("taskLists")
      .valueChanges({ idField: "id" });
  }

  addTaskList(boardId: string, data: TaskList) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("taskLists")
      .add(data);
  }

  deleteTaskList(boardId: string, taskListId: string) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("taskLists")
      .doc(taskListId)
      .delete();
  }

  deleteTaskListBatch(boardId: string, taskListId: string, tasks: Task[]) {
    const db = firebase.firestore();
    const batch = db.batch();

    // Update Task List ref for delete
    const taskListRef = db
      .collection("boards")
      .doc(boardId)
      .collection("taskLists")
      .doc(taskListId);
    batch.delete(taskListRef);

    // Update tasks ref for delete
    const taskRefs = tasks.map((t) =>
      db.collection("boards").doc(boardId).collection("tasks").doc(t.id)
    );
    taskRefs.forEach((ref) => {
      batch.delete(ref);
    });

    batch.commit();
  }

  /**
  / Tasks API Call section
  **/

  getTasks(boardId: string, sortField = "index") {
    this.tasksCollection = this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks", (ref) => ref.orderBy(sortField, "asc"));

    this.tasksSubscription = this.tasksCollection
      .valueChanges({ idField: "id" })
      .subscribe((tasks) => {
        this.allTasks = tasks;
        this.tasksChanged.next([...this.allTasks]);
      });
  }

  cancelTasksSubscription() {
    this.tasksSubscription.unsubscribe();
  }

  getTasksWithoutSubscription(boardId: string) {
    return this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .valueChanges({ idField: "id" });
  }

  async getTask(boardId: string, taskId: string) {
    const db = firebase.firestore();
    const taskSnapshot = await db.collection("boards").doc(boardId).collection("tasks").doc(taskId).get();
    return taskSnapshot.data();
  }

  addTask(boardId: string, task: Task) {
    return this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .add(task)
      .then((docRef) => {
        return docRef.id;
      });
  }

  updateTask(boardId: string, taskId: string, task: Task) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .set(task, { merge: true });
  }

  deleteTask(boardId: string, taskId: string) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .delete();
  }

  // moveTaskToList(boardId: string, taskId: string, newTaskListId: string) {
  //   this._store
  //     .collection("boards")
  //     .doc(boardId)
  //     .collection("tasks")
  //     .doc(taskId)
  //     .set({ listId: newTaskListId }, { merge: true });
  // }

  // updateTaskIndex(boardId: string, taskId: string, newIndex: number) {
  //   this._store
  //     .collection("boards")
  //     .doc(boardId)
  //     .collection("tasks")
  //     .doc(taskId)
  //     .set({ index: newIndex }, { merge: true });
  // }

  moveTaskBatch(
    boardId: string,
    taskListId: string,
    taskId: string,
    tasks: Task[]
  ) {
    const db = firebase.firestore();
    const batch = db.batch();

    // Update task index in the batch
    const taskRefs = tasks.map((t) =>
      db.collection("boards").doc(boardId).collection("tasks").doc(t.id)
    );
    taskRefs.forEach((ref, idx) => {
      const currentTask = tasks[idx];
      batch.update(ref, { index: currentTask.index });
    });

    // Update list id for the task in the batch
    if (taskListId) {
      const taskListUpdateRefs = db
        .collection("boards")
        .doc(boardId)
        .collection("tasks")
        .doc(taskId);
      batch.update(taskListUpdateRefs, { listId: taskListId });
    }

    batch.commit();
  }

  /*
  / Labels API Call section
  */

  getLabels(boardId: string) {
    this.labelsCollection = this._store
      .collection("boards")
      .doc(boardId)
      .collection("labels");

    this.labelsSubscription = this.labelsCollection
      .valueChanges({ idField: "id" })
      .subscribe((labels) => {
        this.allLabelList = labels;
        this.labelListChanged.next([...this.allLabelList]);
      });
  }

  cancelLabelSubscription() {
    this.labelsSubscription.unsubscribe();
  }

  findLabel(boardId: string, label: Label) {
    return this._store
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .doc(label.id);
  }

  async findLabelPromise(boardId: string, label: Label) {
    return new Promise((resolve, reject) => {
      this._store
        .collection("boards")
        .doc(boardId)
        .collection("labels")
        .doc(label.id)
        .valueChanges()
        .subscribe((label) => {
          resolve(label);
        });
    });
  }

  async findLabelWithId(boardId: string, label: Label) {
    let _label = undefined;
    return new Promise((resolve, reject) => {
      this._store
        .collection("boards")
        .doc(boardId)
        .collection("labels", (ref) => ref.where("id", "==", label.id))
        .valueChanges()
        .subscribe((label) => {
          _label = label;
          resolve(_label);
        });
    });
  }

  async findLabelWithName(boardId: string, label: Label) {
    let _label = undefined;
    let promise = new Promise((resolve, reject) => {
      this._store
        .collection("boards")
        .doc(boardId)
        .collection("labels", (ref) =>
          ref.where("name", "==", label.name).limit(1)
        )
        .valueChanges()
        .subscribe((label) => {
          _label = label;
          resolve(_label);
        });
      // return _label;
    });
  }

  addLabel(boardId: string, label: Label) {
    return this._store
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .add(label)
      .then((docRef) => {
        return docRef.id;
      });
  }

  addLabelWithGivenId(boardId: string, labelId: string, label: Label) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .doc(labelId)
      .set(label);
  }

  updateLabel(boardId: string, labelId: string, label: Label) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .doc(labelId)
      .set(label, { merge: true });
  }

  deleteLabel(boardId: string, labelId: string) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .doc(labelId)
      .delete();
  }
}
