import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import { Subject, Subscription } from "rxjs";
import { AppNotification } from "src/app/common/notification/notification";
import { AuthService } from "./auth.service";

@Injectable()
export class NotificationService {
  private allNotifications: AppNotification[];
  private notificationCollection: AngularFirestoreCollection<AppNotification>;
  private notificationSubscription: Subscription;
  public notificationDataChanged = new Subject<AppNotification[]>();

  private allInformation: AppNotification[];
  private informationCollection: AngularFirestoreCollection<AppNotification>;
  private informationSubscription: Subscription;
  public informationDataChanged = new Subject<AppNotification[]>();

  public imageDataChanged = new Subject<string>();

  constructor(
    private _store: AngularFirestore,
    private storage: AngularFireStorage,
    private authService: AuthService
  ) {}

  getAllInformation() {
    this.informationCollection =
      this._store.collection<AppNotification>("informations");

    this.informationSubscription = this.informationCollection
      .valueChanges({ idField: "id" })
      .subscribe((informations) => {
        this.allInformation = informations;
        this.informationDataChanged.next([...this.allInformation]);
      });
  }

  //https://github.com/angular/angularfire/blob/master/docs/storage/storage.md
  getInformationImage(imageReference: string) {
    // const ref = this.storage.ref('information/info-img-1.png');
    const ref = this.storage.ref(imageReference);
    return ref.getDownloadURL();
  }

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

  addNotification(userID: string, appNotification: AppNotification) : void {
    this._store
      .collection<AppNotification>("users")
      .doc(userID)
      .collection("notifications")
      .add(appNotification);
  }

  updateNotification(notificationId: string) {
    this._store
      .collection<AppNotification>("users")
      .doc(this.authService.getUID())
      .collection("notifications")
      .doc(notificationId)
      .set({ isRead: true, modified: new Date() }, { merge: true });
  }
}
