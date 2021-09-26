import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { Subject, Subscription } from "rxjs";
import { AppNotification } from "src/app/common/notification/notification";
import { AuthService } from "./auth.service";

@Injectable()
export class NotificationService {
  private allNotifications: AppNotification[];
  private notificationCollection: AngularFirestoreCollection<AppNotification>;
  private notificationSubscription: Subscription;
  public notificationDataChanged = new Subject<AppNotification[]>();

  constructor(
    private _store: AngularFirestore,
    private authService: AuthService
  ) {}

  getAllNotificaions() {
    this.notificationCollection = this._store
      .collection<AppNotification>("users")
      .doc(this.authService.getUID())
      .collection("notifications");

    this.notificationSubscription = this.notificationCollection
      .valueChanges({ idField: "id" })
      .subscribe((notifications) => {
        this.allNotifications = notifications;
        this.notificationDataChanged.next([...this.allNotifications]);
      });
  }
}
