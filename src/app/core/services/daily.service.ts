import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
// import * as firebase from "firebase";
import * as firebase from "firebase/app";
import { Subject, Subscription } from "rxjs";
import { DailyTask } from "src/app/daily/daily-task/dailytask";
import { AuthService } from "./auth.service";

@Injectable()
export class DailyService {
  private dailyCollection: AngularFirestoreCollection<DailyTask>;

  private allDailyTasksData: DailyTask[];

  private dailySubscription: Subscription;

  public dailyTasksChanged = new Subject<DailyTask[]>();

  constructor(
    private _store: AngularFirestore,
    private authService: AuthService
  ) {}

  getDailyTasks(sortField = "index") {
    this.dailyCollection = this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks", (ref) => ref.orderBy(sortField, "asc"));

    this.dailySubscription = this.dailyCollection
      .valueChanges({ idField: "id" })
      .subscribe((dailyList) => {
        this.allDailyTasksData = dailyList;
        this.dailyTasksChanged.next([...this.allDailyTasksData]);
      });
  }

  getDailyTasksForSelectedDays(days: number) {
    let requiredDate = new Date();
    requiredDate = new Date(
      requiredDate.setDate(requiredDate.getDate() - (days + 1))
    );

    // this.dailyCollection = this._store
    //   .collection<DailyTask>("daily")
    //   .doc(this.authService.getUID())
    //   .collection("tasks", (ref) =>
    //     ref.where("created", ">=", requiredDate).orderBy("created", "asc")
    //   );

    // this.dailySubscription = this.dailyCollection
    //   .valueChanges({ idField: "id" })
    //   .subscribe((dailyList) => {
    //     this.allDailyTasksData = dailyList;
    //     this.dailyTasksChanged.next([...this.allDailyTasksData]);
    //   });

    if (days == 100) {
      this.dailyTasksChanged.next([...this.allDailyTasksData]);
    } else {
      const filteredTask = this.allDailyTasksData.filter(
        (task) => task.created
      );
      this.dailyTasksChanged.next([...filteredTask]);
    }
  }

  addDailyTask(task: DailyTask) {
    this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks")
      .add(task);
  }

  updateDailyTask(task: DailyTask) {
    this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks")
      .doc(task.id)
      .set(task, { merge: true });
  }

  updateDailyTaskIndex(tasks: DailyTask[]) {
    this._store.firestore.runTransaction(() => {
      return Promise.all([
        tasks.forEach((task) => {
          this._store
            .collection<DailyTask>("daily")
            .doc(this.authService.getUID())
            .collection("tasks")
            .doc(task.id)
            .set({ index: task.index }, { merge: true });
        }),
      ]);
    });
  }

  updateDailyTaskIndexBatch(tasks: DailyTask[]) {
    const db = firebase.firestore();
    const batch = db.batch();
    const refs = tasks.map((t) =>
      db
        .collection("daily")
        .doc(this.authService.getUID())
        .collection("tasks")
        .doc(t.id)
    );
    // refs.forEach((ref, idx) => batch.update(ref, { index: idx }))
    // batch.commit();
    refs.forEach((ref, idx) => {
      const currentTask = tasks[idx];
      // console.log(ref.id);
      // console.log(currentTask.index);
      batch.update(ref, { index: currentTask.index });
    });
    batch.commit();
  }

  updateDailyTaskField(taskId: string, fieldObject: object) {
    this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks")
      .doc(taskId)
      .set(fieldObject, { merge: true });
  }

  deleteDailyTask(taskId: string) {
    this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks")
      .doc(taskId)
      .delete();
  }

  deleteDailyTaskField(taskId: string, fieldName: string) {
    this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks")
      .doc(taskId)
      .update({ [fieldName]: firebase.firestore.FieldValue.delete() });
  }

  copyTask(task: DailyTask) {
    this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks")
      .add(task);
  }

  setTaskStatus(taskId: string, name: string) {
    this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks")
      .doc(taskId)
      .set({ status: name }, { merge: true });
  }
}
