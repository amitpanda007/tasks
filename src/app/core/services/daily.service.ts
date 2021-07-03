import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
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

  getDailyTasks() {
    this.dailyCollection = this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks", (ref) => ref.orderBy("created", "asc"));

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
    // console.log(requiredDate);

    this.dailyCollection = this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks", (ref) =>
        ref.where("created", ">=", requiredDate).orderBy("created", "asc")
      );

    this.dailySubscription = this.dailyCollection
      .valueChanges({ idField: "id" })
      .subscribe((dailyList) => {
        this.allDailyTasksData = dailyList;
        this.dailyTasksChanged.next([...this.allDailyTasksData]);
      });
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

  deleteDailyTask(taskId: string) {
    this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks")
      .doc(taskId)
      .delete();
  }

  copyTask(task: DailyTask) {
    this._store
      .collection<DailyTask>("daily")
      .doc(this.authService.getUID())
      .collection("tasks")
      .add(task);
  }
}
