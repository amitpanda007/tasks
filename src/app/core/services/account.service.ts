import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import * as firebase from "firebase";
import { Subject, Subscription } from "rxjs";
import { map } from "rxjs/operators";
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
    private authService: AuthService,
    private storage: AngularFireStorage
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

  async getUserById(userId: string): Promise<User> {
    const db = firebase.firestore();
    const userSnapshot = await db.collection("users").doc(userId).get();
    return userSnapshot.data() as User;
  }

  getAvatarImage(imageReference: string) {
    const ref = this.storage.ref(imageReference);
    return ref.getDownloadURL();
  }

  async getAvatarImageForUser(userId: string) {
    const db = firebase.firestore();
    const userSnapshot = await db.collection("users").doc(userId).get();
    const user = userSnapshot.data() as User;
    if (user.avatarImg) {
      const imageReference = `avatar\/${user.avatarImg}`;
      const ref = this.storage.ref(imageReference);
      const downloadRef = ref.getDownloadURL().toPromise();
      return downloadRef;
    } else {
      return null;
    }
  }

  //https://blog.angular.io/file-uploads-come-to-angularfire-6842352b3b47
  uploadAvatarImage(fileName: string, file: File) {
    const uploadProgress = this.storage
      .upload(`/avatar/${fileName}`, file)
      .snapshotChanges()
      .pipe(map((s) => (s.bytesTransferred / s.totalBytes) * 100));
    return uploadProgress;
  }

  updateAvatarImageForUser(userId: string, fileName: string) {
    const db = firebase.firestore();
    db.collection("users")
      .doc(userId)
      .set({ avatarImg: fileName }, { merge: true });

    //FIXME: Not updating storage metadata referrence
    const newMetadata = {
      cacheControl: "max-age=86400",
    };
    const imageReference = `avatar\/${fileName}`;
    this.storage
      .ref(imageReference)
      .updateMetadata(newMetadata)
      .toPromise()
      .then((metadata) => {
        console.log(`Updated metadata for image ${fileName}`);
        console.log(metadata);
      })
      .catch((error) => {
        console.log(`Error updating metadata for image ${fileName}`);
      });
  }

  uploadBackgroundImage(fileName: string, file: File) {
    const uploadProgress = this.storage
      .upload(`/backgroundImages/${fileName}`, file)
      .snapshotChanges()
      .pipe(map((s) => (s.bytesTransferred / s.totalBytes) * 100));
    return uploadProgress;
  }
}
