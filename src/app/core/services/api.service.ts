import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import * as firebase from "firebase";
import { AngularFireAuth } from "@angular/fire/auth";

@Injectable()
export class APIService {
  constructor(private http: HttpClient, private _afAuth: AngularFireAuth) {}

  sendBoardInviteEmail(fromUser: string, toEmail: string, inviteUrl: string) {
    const apiUrl = `${environment.apiUrl}email/invite`;
    // ?from=${fromUser}&to${toEmail}&inviteUrl=${inviteUrl}
    return this.http
      .get(apiUrl, {
        params: {
          from: fromUser,
          to: toEmail,
          inviteUrl: inviteUrl,
        },
        observe: "response",
      })
      .toPromise();
  }

  sendAccountCreateEmail(email: string, name: string) {
    const apiUrl = `${environment.apiUrl}email/account/create`;
    return this.http
      .get(apiUrl, {
        params: {
          email: email,
          name: name,
        },
        observe: "response",
      })
      .toPromise();
  }

  async addSubscription() {
    const idToken = await this._afAuth.auth.currentUser.getIdToken();
    console.log(idToken);

    // Make API Call to set the custom claim
    const apiUrl = `${environment.apiUrl}payment/addsubscription`;
    return this.http.post(apiUrl, { idToken: idToken }).toPromise();
  }

  async removeSubscription() {
    const idToken = await firebase.auth().currentUser.getIdToken();
    console.log(idToken);

    // Make API Call to set the custom claim
    const apiUrl = `${environment.apiUrl}payment/removesubscription`;
    return this.http.post(apiUrl, { idToken: idToken }).toPromise();
  }

  async refreshFBToken() {
    await firebase.auth().currentUser.getIdToken(true);
    return true;
  }

  paymentWithRazorPay(paymentData) {
    const apiUrl = `${environment.apiUrl}payment/razorpayorder`;
    return this.http
      .post(apiUrl, {
        amount: paymentData.amount,
      })
      .toPromise();
  }
}
