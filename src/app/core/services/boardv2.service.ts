import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
  DocumentData,
  QuerySnapshot,
} from "@angular/fire/firestore";
import { Subject, BehaviorSubject } from "rxjs";
import { Board, SharedUser } from "src/app/boards/board/board";
import { Task } from "src/app/tasks/task/task";
import { AuthService } from "./auth.service";
import { TaskList } from "../../tasks/task-list/tasklist";
import { Label } from "src/app/tasks/task/label";
import { Subscription } from "rxjs";
import { Invitation } from "../../common/invite-dialog/invitation";
import { firestore } from "firebase/app";
import * as firebase from "firebase/app";
import { TaskComment } from "src/app/tasks/task/taskcomment";
import { Trigger } from "src/app/common/automation-dialog/trigger";
import { Action } from "src/app/common/automation-dialog/action";
import { Activity } from "src/app/tasks/task/activity";
import { AngularFireStorage } from "@angular/fire/storage";

@Injectable()
export class BoardServiceV2 {
  private boardDocument: AngularFirestoreDocument<Board>;
  private boardsCollection: AngularFirestoreCollection<Board>;
  private sharedBoardsCollection: AngularFirestoreCollection<Board>;
  private taskListsCollection: AngularFirestoreCollection<TaskList>;
  private tasksCollection: AngularFirestoreCollection<Task>;
  private labelsCollection: AngularFirestoreCollection<Label>;
  private taskCommentCollection: AngularFirestoreCollection<TaskComment>;
  private userActivityCollection: AngularFirestoreCollection<Activity>;

  private singleBoard: Board;
  private allBoards: Board[];
  private allSharedBoards: Board[];
  private allTaskLists: TaskList[];
  private allTasks: Task[];
  private allLabelList: Label[];
  private allComments: TaskComment[];
  private userActivities: Activity[];

  private boardSubscription: Subscription;
  private boardsSubscription: Subscription;
  private sharedBoardsSubscription: Subscription;
  private taskListsSubscription: Subscription;
  private tasksSubscription: Subscription;
  private labelsSubscription: Subscription;
  private taskCommentSubscription: Subscription;
  private userActivitySubscription: Subscription;

  public boardChanged = new Subject<Board>();
  // public boardsChanged = new Subject<Board[]>();
  public boardsChanged = new BehaviorSubject<Board[]>([]);
  // public sharedBoardsChanged = new Subject<Board[]>();
  public sharedBoardsChanged = new BehaviorSubject<Board[]>([]);
  public taskListsChanged = new Subject<TaskList[]>();
  public tasksChanged = new Subject<Task[]>();
  public labelListChanged = new Subject<Label[]>();
  public showHidelabel = new BehaviorSubject<boolean>(false);
  public showUserTask = new BehaviorSubject<boolean>(false);
  public hideTaskDesc = new BehaviorSubject<boolean>(false);
  public commentsChanged = new Subject<TaskComment[]>();
  public userActivityChanged = new Subject<Activity[]>();

  constructor(
    private _store: AngularFirestore,
    private authService: AuthService,
    private storage: AngularFireStorage
  ) {}

  /**
   * Boards API Call section
   **/

  getBoards() {
    this.boardsCollection = this._store.collection<Board>(
      "boards",
      (ref) => ref.where("owner", "==", this.authService.getUID())
      .orderBy("modified", "desc")
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
        ref
          .where("shared", "array-contains-any", [this.authService.getUID()])
          .where("owner", "!=", this.authService.getUID())
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
    return this._store
      .collection<Board>("boards", (ref) =>
        ref.where("owner", "==", this.authService.getUID())
      )
      .valueChanges({ idField: "id" });
  }

  async getBoardsAsync() {
    const db = firebase.firestore();
    const boardSnapshot = await db
      .collection("boards")
      .where("owner", "==", this.authService.getUID())
      .get();
    return boardSnapshot.docs;
  }

  addBoard(board: Board) {
    return this._store.firestore.runTransaction(async () => {
      const docInfo = await this._store.collection("boards").add(board);
    });
  }

  getSingleBoard(boardId: string) {
    console.log(`Getting board ${boardId}`);
    this.boardDocument = this._store.collection<Board>("boards").doc(boardId);

    this.boardSubscription = this.boardDocument
      .valueChanges()
      .subscribe((board) => {
        this.singleBoard = board;
        this.boardChanged.next(this.singleBoard);
      });
  }

  cancelSingleBoardSuscriotion() {
    this.boardSubscription.unsubscribe();
  }

  async getBoard(boardId: string) {
    const db = firebase.firestore();
    const boardSnapshot = await db.collection("boards").doc(boardId).get();
    return boardSnapshot.data();
  }

  getBoardWithPromise(boardId: string) {
    return this._store
      .collection<Board>("boards")
      .doc(boardId)
      .get()
      .toPromise();
  }

  updateBoard(boardId: string, board: Board) {
    board.modified = new Date();
    console.log(board);
    // Remove unwanted properties from board object
    if (board.sharedUserInfo && board.sharedUserInfo.length > 0) {
      board.sharedUserInfo.forEach((userInfo) => {
        delete userInfo.isCurrentUser;
        delete userInfo.image;
      });
    }
    this._store.collection("boards").doc(boardId).set(board, { merge: true });
  }

  updateBoardSettings(boardId: string, settings: Object) {
    this._store
      .collection("boards")
      .doc(boardId)
      .set({ settings: settings }, { merge: true });
  }

  getBoardInvitation(boardId: string, invitationId: string) {
    return this._store
      .collection<Board>("boards")
      .doc(boardId)
      .collection("invitations")
      .doc(invitationId);
  }

  async createInvitation(boardId: string, invitation: Invitation) {
    const docRef = await this._store
      .collection("boards")
      .doc(boardId)
      .collection("invitations")
      .add(invitation);
    return docRef.id;
  }

  acceptInvitation(boardId: string, invitationId: string) {
    const userInfo = {
      id: this.authService.getUID(),
      name: this.authService.getUserDisplayName(),
      permission: {
        admin: false,
        normal: true,
        owner: false,
      },
    };
    this._store.firestore.runTransaction(() => {
      return Promise.all([
        this._store
          .collection("boards")
          .doc(boardId)
          .collection("invitations")
          .doc(invitationId)
          .set(
            {
              accepted: true,
              acceptedUser: this.authService.getUID(),
              modified: new Date(),
            },
            { merge: true }
          ),
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

  removeUserFromBoard(
    boardId: string,
    shared: Array<string>,
    sharedUserInfo: Array<SharedUser>,
    tasks: Task[],
    taskChecklist: Task[],
    removedUserId: string
  ) {
    const db = firebase.firestore();
    const batch = db.batch();
    const boardRef = db.collection("boards").doc(boardId);
    // Update board with removed user
    batch.update(boardRef, { shared: shared, sharedUserInfo: sharedUserInfo });
    // Remove user from all tasks
    const taskRefs = tasks.map((t) =>
      db.collection("boards").doc(boardId).collection("tasks").doc(t.id)
    );
    taskRefs.forEach((ref, idx1) => {
      const task = tasks[idx1];
      task.members.forEach((mbrs, idx2) => {
        if (mbrs.id == removedUserId) {
          task.members.splice(idx2, 1);
          // delete task.members[idx2];
        }
      });
      batch.update(ref, { members: task.members });
    });
    // Remove user from all tasks
    const taskChklstRefs = taskChecklist.map((t) =>
      db.collection("boards").doc(boardId).collection("tasks").doc(t.id)
    );
    taskChklstRefs.forEach((ref, idx1) => {
      const task = taskChecklist[idx1];
      task.checklists.forEach((chklst, idx) => {
        if (chklst.checklist && chklst.checklist.length > 0) {
          chklst.checklist.forEach((chk) => {
            if (chk.members && chk.members.length > 0) {
              chk.members.forEach((mbr, idx2) => {
                if (mbr.id == removedUserId) {
                  chk.members.splice(idx2, 1);
                }
              });
            }
          });
        }
      });
      batch.update(ref, { checklists: task.checklists });
    });

    // Remove user from all checklist under task
    batch.commit();
  }

  // Referrence from https://leechy.dev/firestore-move
  public newDocId: any;
  /**
   * @deprecated The method should not be used
   */
  async copyBoardDoc(
    collectionFrom: string,
    docId: string,
    boardTitle: string = "",
    boardDescription: string = "",
    collectionTo: string,
    create: boolean,
    addData: any = {},
    isTemplate: boolean = false,
    recursive: boolean = false
  ): Promise<boolean> {
    const db = firebase.firestore();
    // document reference
    const docRef = db.collection(collectionFrom).doc(docId);

    // copy the document
    const docData = await docRef
      .get()
      .then((doc) => doc.exists && doc.data())
      .catch((error) => {
        console.error(
          "Error reading document",
          `${collectionFrom}/${docId}`,
          JSON.stringify(error)
        );
      });

    if (docData) {
      // document exists, create the new item
      try {
        if (create) {
          docData.title = boardTitle;
          docData.description = boardDescription;
          if (docData.isTemplate) {
            docData.isTemplate = false;
          }
          if (isTemplate) {
            docData.isTemplate = true;
          }
          this.newDocId = await db
            .collection(collectionTo)
            .add({ ...docData, ...addData });
        } else {
          await db
            .collection(collectionTo)
            .doc(docId)
            .set({ ...docData, ...addData });
        }
      } catch (error) {
        console.error(
          "Error creating document",
          `${collectionTo}/${docId}`,
          JSON.stringify(error)
        );
      }
      console.log(this.newDocId.id);

      // if copying of the subcollections is needed
      if (recursive) {
        // subcollections
        const labelCollection = docRef.collection("labels");
        const taskListsCollection = docRef.collection("taskLists");
        const tasksCollection = docRef.collection("tasks");
        // const subcollections = await docRef.listCollections();
        const subcollections = [
          labelCollection,
          taskListsCollection,
          tasksCollection,
        ];

        for await (const subcollectionRef of subcollections) {
          const subcollectionPath = `${collectionFrom}/${docId}/${subcollectionRef.id}`;

          console.log(subcollectionPath);
          // get all the documents in the collection
          await subcollectionRef
            .get()
            .then(async (snapshot) => {
              const docs = snapshot.docs;
              for await (const doc of docs) {
                console.log(doc);
                await this.copyBoardDoc(
                  subcollectionPath,
                  doc.id,
                  "",
                  "",
                  `${collectionTo}/${this.newDocId.id}/${subcollectionRef.id}`,
                  false,
                  {},
                  false,
                  true
                );
              }
              return true;
            })
            .catch((error) => {
              console.error(
                "Error reading subcollection",
                subcollectionPath,
                error
              );
            });
        }
      }
      return this.newDocId.id;
    }
    return this.newDocId.id;
  }

  async copyBoardBatch(boardId: string, extraData: any = {}): Promise<string> {
    const db = firebase.firestore();
    let batch = db.batch();

    // Create a new board document
    const newBoardRef = db.collection("boards").doc();

    // Get board document & set it for new board
    const boardDoc = await db.collection("boards").doc(boardId).get();
    const newBoardData: Board = boardDoc.data() as Board;
    if (extraData.boardTitle) {
      newBoardData.title = extraData.boardTitle;
    }
    if (extraData.boardDescription) {
      newBoardData.description = extraData.boardDescription;
    }

    batch.set(newBoardRef, newBoardData);

    // Get label collection
    const labelDocs = await db
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .get();
    const newBoardLabelRef = newBoardRef.collection("labels");
    labelDocs.forEach((labelDoc) => {
      batch.set(newBoardLabelRef.doc(labelDoc.id), labelDoc.data());
    });

    // Get taskLists collection
    const taskListsDocs = await db
      .collection("boards")
      .doc(boardId)
      .collection("taskLists")
      .get();
    const newBoardTaskListsRef = newBoardRef.collection("taskLists");
    taskListsDocs.forEach((tasklistDoc) => {
      batch.set(newBoardTaskListsRef.doc(tasklistDoc.id), tasklistDoc.data());
    });

    // Get tasks collection
    const tasksDocs = await db
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .get();
    const newBoardTasksRef = newBoardRef.collection("tasks");
    tasksDocs.forEach((taskDoc) => {
      batch.set(newBoardTasksRef.doc(taskDoc.id), taskDoc.data());
    });

    // Commit the change
    batch.commit();
    return newBoardRef.id;
  }

  deleteBoard(boardId: string) {
    this._store.collection("boards").doc(boardId).delete();
  }

  /**
  / TaskLists API Call section
  **/

  getTaskList(boardId: string) {
    console.log(`Getting TaskList for Board ${boardId}`);
    this.taskListsCollection = this._store
      .collection("boards")
      .doc(boardId)
      .collection("taskLists", (ref) => ref.orderBy("index", "asc"));

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

  async getTaskListAsync(boardId: string) {
    const db = firebase.firestore();
    const boardSnapshot = await db
      .collection("boards")
      .doc(boardId)
      .collection("taskLists")
      .get();
    return boardSnapshot.docs;
  }

  addTaskList(boardId: string, taskList: TaskList) {
    delete taskList.tasks;
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("taskLists")
      .add(taskList);
  }

  updateTaskList(boardId: string, taskListId: string, taskList: TaskList) {
    delete taskList.tasks;
    delete taskList.isEditing;
    taskList.modified = new Date();

    this._store
      .collection("boards")
      .doc(boardId)
      .collection("taskLists")
      .doc(taskListId)
      .set(taskList, { merge: true });
  }

  deleteTaskList(boardId: string, taskListId: string) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("taskLists")
      .doc(taskListId)
      .delete();
  }

  moveTaskListBatch(boardId: string, taskLists: TaskList[]) {
    const db = firebase.firestore();
    const batch = db.batch();

    // Update task index in the batch
    const taskRefs = taskLists.map((t) =>
      db.collection("boards").doc(boardId).collection("taskLists").doc(t.id)
    );
    taskRefs.forEach((ref, idx) => {
      batch.update(ref, { index: taskLists[idx].index });
    });
    batch.commit();
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
    console.log(`Getting Tasks for Board ${boardId}`);
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
    const taskSnapshot = await db
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .get();
    return taskSnapshot.data();
  }

  async addTask(boardId: string, task: Task) {
    const docRef = await this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .add(task);
    return docRef.id;
  }

  updateTask(boardId: string, taskId: string, task: Task) {
    // Delete images referrence from members
    if (task.members && task.members.length > 0) {
      task.members.forEach((member) => {
        delete member.image;
      });
    }

    // Delete images referrence from activities
    if (task.activities && task.activities.length > 0) {
      task.activities.forEach((activity) => {
        delete activity.userImage;
      });
    }

    console.log(task);
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

  deleteTaskBatch(boardId: string, taskId: string, labels: Label[]) {
    const db = firebase.firestore();
    const batch = db.batch();

    const labelRefs = labels.map((l) =>
      db.collection("boards").doc(boardId).collection("labels").doc(l.id)
    );
    labelRefs.forEach((ref, idx) => {
      const currentLabel = labels[idx];
      delete currentLabel.isSelected;
      batch.update(ref, currentLabel);
    });

    const taskRef = db
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc(taskId);
    batch.delete(taskRef);

    batch.commit();
  }

  getTaskComments(boardId: string, taskId: string, sortField = "created") {
    this.taskCommentCollection = this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .collection("comments", (ref) => ref.orderBy(sortField, "asc"));

    this.taskCommentSubscription = this.taskCommentCollection
      .valueChanges({ idField: "id" })
      .subscribe((comments) => {
        this.allComments = comments;
        this.commentsChanged.next([...this.allComments]);
      });
  }

  addTaskComment(boardId: string, taskId: string, comment: TaskComment) {
    delete comment.isEditing;
    delete comment.timePassed;

    this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .collection("comments")
      .add(comment);
  }

  updateTaskComment(boardId: string, taskId: string, comment: TaskComment) {
    delete comment.isEditing;
    delete comment.timePassed;

    this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .collection("comments")
      .doc(comment.id)
      .set(comment, { merge: true });
  }

  deleteTaskComment(boardId: string, taskId: string, commentId: string) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc(taskId)
      .collection("comments")
      .doc(commentId)
      .delete();
  }

  showHideTaskLabelName(labelStatus: boolean) {
    this.showHidelabel.next(!labelStatus);
  }

  showCurrentUserTask(status: boolean) {
    this.showUserTask.next(status);
  }

  hideTaskDescrption(status: boolean) {
    this.hideTaskDesc.next(status);
  }

  convertChecklistToCard(boardId: string, oldTask: Task, newTask: Task) {
    const db = firebase.firestore();
    const batch = db.batch();

    // Update Task by removing current checklist item
    const oldTaskRef = db
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc(oldTask.id);
    batch.update(oldTaskRef, oldTask);
    // Add Task from current checklist item
    const newTaskRef = db
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc();
    batch.set(newTaskRef, newTask);

    batch.commit();
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

  copyTaskBatch(
    task: Task,
    boardId: string,
    updateLabels: Label[],
    createLabels: Label[]
  ) {
    const db = firebase.firestore();
    const batch = db.batch();

    //Task Ref: Add new task
    const taskRef = db
      .collection("boards")
      .doc(boardId)
      .collection("tasks")
      .doc();

    batch.set(taskRef, task);
    // Label Ref: Update or Create Label
    // If copying into same board no need to create new labels. just need to add the taskId into the label

    // If copying into new board
    //1. Check if Label already exist in new board, If label exist just update the task id in label
    //2. If Label doesnt exist in new board. Add the label with task id updated
    if (updateLabels && updateLabels.length > 0) {
      const updateLabelRefs = updateLabels.map((l) =>
        db.collection("boards").doc(boardId).collection("labels").doc(l.id)
      );
      updateLabelRefs.forEach((ref, idx) => {
        const currentLabel: Label = updateLabels[idx];
        currentLabel.taskIds.push(taskRef.id);
        batch.update(ref, currentLabel);
      });
    }

    if (createLabels && createLabels.length > 0) {
      createLabels.map((l) => {
        const ref = db
          .collection("boards")
          .doc(boardId)
          .collection("labels")
          .doc();
        l.taskIds = [];
        l.taskIds.push(taskRef.id);
        batch.set(ref, l);
      });
    }

    batch.commit();
  }

  moveBoardTaskBatch(
    task: Task,
    currentBoardId: string,
    newBoardId: string,
    updateLabels: Label[],
    createLabels: Label[],
    isDeleteTaskFromCurrentBoard: boolean
  ) {
    const db = firebase.firestore();
    const batch = db.batch();

    //Task Ref: Add new task
    const taskRef = db
      .collection("boards")
      .doc(newBoardId)
      .collection("tasks")
      .doc(task.id);

    batch.set(taskRef, task);
    // Label Ref: Update or Create Label
    // If copying into new board
    //1. Check if Label already exist in new board, If label exist just update the task id in label
    //2. If Label doesnt exist in new board. Add the label with task id updated
    if (updateLabels && updateLabels.length > 0) {
      const updateLabelRefs = updateLabels.map((l) =>
        db.collection("boards").doc(newBoardId).collection("labels").doc(l.id)
      );
      updateLabelRefs.forEach((ref, idx) => {
        const currentLabel: Label = updateLabels[idx];
        currentLabel.taskIds.push(taskRef.id);
        batch.update(ref, currentLabel);
      });
    }

    if (createLabels && createLabels.length > 0) {
      createLabels.map((l) => {
        const ref = db
          .collection("boards")
          .doc(newBoardId)
          .collection("labels")
          .doc();
        l.taskIds = [];
        l.taskIds.push(taskRef.id);
        batch.set(ref, l);
      });
    }

    if (isDeleteTaskFromCurrentBoard) {
      const curTaskRef = db
        .collection("boards")
        .doc(currentBoardId)
        .collection("tasks")
        .doc(task.id);

      batch.delete(curTaskRef);
    }

    batch.commit();
  }

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

  /**
  /* Labels API section
  /* All label relared methods on label collection available under each board collection
  **/

  getLabels(boardId: string) {
    console.log(`Getting Labels for Board ${boardId}`);
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

  async getLabelsSnapshot(boardId: string) {
    const db = firebase.firestore();
    const boardSnapshot = await db
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .get();
    return boardSnapshot.docs;
  }

  async getLabelAsync(boardId: string) {
    const db = firebase.firestore();
    const labelsRef = db.collection("boards").doc(boardId).collection("labels");
    const labelSnapshot = await labelsRef.get();
    const boardLabels = [];
    labelSnapshot.forEach((labelDoc) => {
      const label = labelDoc.data();
      boardLabels.push(label);
    });
    return boardLabels;
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

  async addLabel(boardId: string, label: Label) {
    delete label.isSelected;
    const docRef = await this._store
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .add(label);
    return docRef.id;
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
    delete label.isSelected;
    label.modified = new Date();

    this._store
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .doc(labelId)
      .set(label, { merge: true });
  }

  updateLabelBatch(boardId: string, labels: Label[]) {
    const db = firebase.firestore();
    const batch = db.batch();

    const labelRefs = labels.map((l) =>
      db.collection("boards").doc(boardId).collection("labels").doc(l.id)
    );
    labelRefs.forEach((ref, idx) => {
      const currentLabel = labels[idx];
      delete currentLabel.isSelected;
      batch.update(ref, currentLabel);
    });

    batch.commit();
  }

  deleteLabel(boardId: string, labelId: string) {
    this._store
      .collection("boards")
      .doc(boardId)
      .collection("labels")
      .doc(labelId)
      .delete();
  }

  /**
  /* Automation collection
  /* all trigger and associated action created by user for the board
  /* is stored and accessed fromt his collection.
  **/

  addAutomation(boardId: string, trigger: Trigger, action: Action) {
    const data = {
      boardId: boardId,
      trigger: trigger,
      action: action,
    };

    this._store.collection("automation").doc(boardId).set(data);
  }

  /**
  /* General methods
  **/

  private allUserTasks = [];
  private allTaskActivity: Activity[] = [];
  private allTasksFromBoard: Task[] = [];

  async gatherUserActivityAcrossBoard(
    userId: string,
    type: string
  ): Promise<Activity[] | Task[]> {
    if (
      type === "activity" &&
      this.allTaskActivity &&
      this.allTaskActivity.length > 0
    ) {
      return this.allTaskActivity;
    } else if (
      type === "task" &&
      this.allTasksFromBoard &&
      this.allTasksFromBoard.length > 0
    ) {
      return this.allTasksFromBoard;
    }

    if (this.allUserTasks && this.allUserTasks.length == 0) {
      const boardWithUser = [];
      console.log("Called for first time...gathering data...");
      const db = firebase.firestore();
      const userDocuments = db
        .collection("boards")
        .where("shared", "array-contains", userId)
        .get();

      await userDocuments
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const board = doc.data();
            board.id = doc.id;
            boardWithUser.push(board);
          });
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });

      //Gather all task documents
      for (let i = 0; i < boardWithUser.length; i++) {
        console.log(boardWithUser[i]);
        const boardTaskRef = db
          .collection("boards")
          .doc(boardWithUser[i].id)
          .collection("tasks");
        const taskSnapshot = await boardTaskRef.get();
        taskSnapshot.forEach((taskDoc) => {
          const task = taskDoc.data();
          task.id = taskDoc.id;
          task.taskOnBoard = boardWithUser[i].title;
          task.boardId = boardWithUser[i].id;
          this.allUserTasks.push(task);
        });
      }
    }

    //Find current user activity from all boards

    if (type === "activity") {
      this.allUserTasks.forEach((task) => {
        const curActivities = task.activities;
        if (curActivities) {
          curActivities.forEach((activity: Activity) => {
            if (activity.id == userId) {
              activity.taskOnBoard = task.taskOnBoard;
              this.allTaskActivity.push(activity);
            }
          });
        }
      });
      console.log("Activity gather Complete...");
      return this.allTaskActivity;
    } else if (type === "task") {
      this.allUserTasks.forEach((task) => {
        if (task.members) {
          task.members.forEach((member) => {
            if (member.id == userId) {
              this.allTasksFromBoard.push(task);
            }
          });
        }
      });
      console.log("Task gather Complete...");
      return this.allTasksFromBoard;
    }
  }

  async gatherBackgroundImages() {
    var storageRef = firebase.storage().ref("backgroundImages");
    const allImagesRef = await storageRef.listAll();
    const allImageDownloadUrl = [];
    for (let i = 0; i < allImagesRef.items.length; i++) {
      const imageRef = allImagesRef.items[i];
      const imageUrl = await imageRef.getDownloadURL();
      const imageData = {
        name: imageRef.name,
        url: imageUrl,
      };
      allImageDownloadUrl.push(imageData);
    }
    return allImageDownloadUrl;
  }

  getBackgroundImage(imageReference) {
    const ref = this.storage.ref(imageReference);
    return ref.getDownloadURL();
  }
}
