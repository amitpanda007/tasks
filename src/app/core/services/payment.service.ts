import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import * as firebase from "firebase";
import { BehaviorSubject, Subject } from "rxjs";
import { PaymentInfo } from "src/app/payment/razorpay-payment/paymentinfo";
import { AuthService } from "./auth.service";

@Injectable()
export class PaymentService {
  public isPaymentSuccess: boolean = false;
  public isPaymentFailure: boolean = false;

  constructor(
    private authService: AuthService,
    private _store: AngularFirestore
  ) {}

  async savePaymentInfo(paymentData: PaymentInfo) {
    const userId = this.authService.getUID();
    this._store.collection("payments").doc(userId).collection("transactions").add(paymentData);
  }

  updatePaymentSuccessStatus(status: boolean) {
    this.isPaymentSuccess = status;
  }

  updatePaymentFailureStatus(status: boolean) {
    this.isPaymentFailure = status;
  }
}
