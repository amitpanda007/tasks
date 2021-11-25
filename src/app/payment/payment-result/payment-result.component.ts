import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { PaymentService } from "src/app/core/services/payment.service";

declare var Razorpay: any;

@Component({
  selector: "payment-result",
  templateUrl: "payment-result.component.html",
  styleUrls: ["payment-result.component.scss"],
})
export class PaymentResultComponent implements OnInit {
  public isPaymentSuccessful: boolean;
  public isPaymentFailed: boolean;
  public subscriptionId: string = "Ia562514AuydA11";

  constructor(private router: Router, private paymentService: PaymentService) {}

  ngOnInit(): void {
    console.log("Payment Result Page Created");
    this.isPaymentSuccessful = this.paymentService.isPaymentSuccess;
    console.log(`Payment Successful: ${this.isPaymentSuccessful}`);
    this.isPaymentFailed = this.paymentService.isPaymentFailure;
    console.log(`Payment Failed: ${this.isPaymentFailed}`);

    if (!this.isPaymentSuccessful && !this.isPaymentFailed) {
      this.navigatePayments();
    }
  }

  ngOnDestroy(): void {}

  navigateAccount() {
    this.router.navigate(["account"]);
  }

  navigateBoards() {
    this.router.navigate(["boards"]);
  }

  navigatePayments() {
    this.router.navigate(["payments"]);
  }
}
