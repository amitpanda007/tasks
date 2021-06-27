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
      .collection("tasks");

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
}
