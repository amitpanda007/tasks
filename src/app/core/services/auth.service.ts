import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { customClaims } from "@angular/fire/auth-guard";

import {
  SuccessSnackbar,
  ErrorSnackbar,
} from "../../common/snackbar.component";
import { AngularFireAuth } from "@angular/fire/auth";
import { pipe, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class AuthService {
  constructor(
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _afAuth: AngularFireAuth
  ) {}

  async register(user) {
    const { fullName, email, password } = user;

    try {
      const resp = await this._afAuth.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      await resp.user.updateProfile({ displayName: fullName });

      this._router.navigate([""]);
      this._snackBar.openFromComponent(SuccessSnackbar, {
        data: "User Created Successfully",
        duration: 2000,
      });
    } catch (error) {
      this._snackBar.openFromComponent(ErrorSnackbar, {
        data: "Something went wrong.",
        duration: 2000,
      });
    }
  }

  async login(user) {
    const { email, password } = user;

    try {
      const resp = await this._afAuth.auth.signInWithEmailAndPassword(
        email,
        password
      );
      this._router.navigate([""]);
      this._snackBar.openFromComponent(SuccessSnackbar, {
        data: "Login Successful",
        duration: 2000,
      });
    } catch (error) {
      this._snackBar.openFromComponent(ErrorSnackbar, {
        data: error.message,
        duration: 2000,
      });
    }
  }

  logout() {
    this._afAuth.auth.signOut();
    this._router.navigate(["/login"]);
  }

  isLoggedIn() {
    return !!this._afAuth.auth.currentUser;
  }

  isAdmin() {
    return new Observable((subscriber) => {
      this._afAuth.idTokenResult.subscribe((token) => {
        if (token) {
          if (token.claims.admin) {
            subscriber.next(true);
          } else {
            subscriber.next(false);
          }
        } else {
          subscriber.next(false);
        }
      });
    });
  }
}
