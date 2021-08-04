import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import * as firebase from "firebase";
import { Subject, Subscription } from "rxjs";
import { User } from "src/app/auth/user";
import { AuthService } from "./auth.service";

@Injectable()
export class AccountService {
  // private userCollection: AngularFirestoreCollection<User>;
  private userDocument: AngularFirestoreDocument<User>;

  private userData: User;

  private userSubscription: Subscription;

  public userDataChanged = new Subject<User>();

  constructor(
    private _store: AngularFirestore,
    private authService: AuthService
  ) {}

  getUserInfo() {
    console.log("CALLING USER");
    console.log(this.authService.getUID());
    this.userDocument = this._store
      .collection<User>("users")
      .doc(this.authService.getUID());

    this.userSubscription = this.userDocument
      .valueChanges()
      .subscribe((user) => {
        console.log(user);
        this.userData = user;
        this.userDataChanged.next(this.userData);
      });
  }

  saveUser(user: User) {
    this._store
      .collection<User>("users")
      .doc(this.authService.getUID())
      .set(user, { merge: true });
  }

  async getUserById(userId: string) {
    const db = firebase.firestore();
    const userSnapshot = await db.collection("users").doc(userId).get();
    return userSnapshot.data();
  }
}
