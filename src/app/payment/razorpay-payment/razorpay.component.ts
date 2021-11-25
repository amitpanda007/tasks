import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { PaymentResultDialogComponent, PaymentResultDialogResult } from "src/app/common/payment-result-dialog/payment-result-dialog.component";
import { APIService } from "src/app/core/services/api.service";
import { PaymentService } from "src/app/core/services/payment.service";
import { PaymentInfo } from "./paymentinfo";

declare var Razorpay: any;

@Component({
  selector: "razorpay-component",
  templateUrl: "razorpay.component.html",
  styleUrls: ["razorpay.component.scss"],
})
export class RazorPayComponent implements OnInit {
  public isPaymentSuccessful: boolean;
  public isPaymentFailed: boolean;
  private failedPaymentData: any;
  private successPaymentData: any;
  private orderId: string;
  private razorPayOptions = {
    key: "",
    amount: "",
    currency: "INR",
    name: "",
    description: "Tasks payment",
    order_id: "",
    handler: (res) => {
      console.log(res);
    },
    prefill: {
      name: "Amit Panda",
      email: "amitpanda007@gmail.com",
      contact: "8939560975",
    },
    notes: {
      address: "Tasks India",
    },
    theme: {
      color: "#3399cc",
    },
  };

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: APIService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  async buyWithRazorPay() {
    const paymentData = {
      name: "Amit P",
      amount: 100,
    };
    const orderDetails = await this.apiService.paymentWithRazorPay(paymentData);
    console.log(orderDetails);
    this.orderId = orderDetails["value"]["id"];
    this.razorPayOptions.key = orderDetails["key"];
    this.razorPayOptions.amount = orderDetails["value"]["amount"];
    this.razorPayOptions.name = paymentData["name"];
    this.razorPayOptions.order_id = orderDetails["value"]["id"];
    this.razorPayOptions.handler = (response) => {
      this.razorPayResponseHandler(response);
    };
    let rzp1 = new Razorpay(this.razorPayOptions);
    rzp1.open();
    rzp1.on("payment.failed", (response) => {
      console.log("Payment failed");
      console.log(response);
      this.failedPaymentData = response;

      const paymentData: PaymentInfo = {
        paymentDone: false,
        paymentStatus: "failure",
        paymentFailure: {
          code: this.failedPaymentData.error.code,
          paymentId: this.failedPaymentData.error.metadata.payment_id,
          orderId: this.failedPaymentData.error.metadata.order_id,
          description: this.failedPaymentData.error.description,
          source: this.failedPaymentData.error.source,
          step: this.failedPaymentData.error.step,
          reason: this.failedPaymentData.error.reason,
        },
      };
      this.paymentService.savePaymentInfo(paymentData);
      this.paymentService.updatePaymentFailureStatus(true);
      this.router.navigate(['order/failure']);
    });
    console.log("RazorPay Payment Modal Opened");
  }

  // FIXME: Add routes or functionality once payment succeed or failed
  razorPayResponseHandler(response) {
    console.log(response);
    this.successPaymentData = response;
    const orderData = {
      orderId: this.orderId,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
    };
    console.log(orderData);
    this.apiService.verifyPaymentRazorPay(orderData).then((res: any) => {
      console.log(res);
      if (res.success) {
        console.log("Order created successfully");
        this.apiService.addSubscription().then((response: any) => {
          console.log(response);
          if (response.status === "success") {
            this.apiService.refreshFBToken();
          }
        });
        const paymentData: PaymentInfo = {
          paymentDone: true,
          paymentStatus: "success",
          paymentSuccess: {
            orderId: this.successPaymentData.razorpay_order_id,
            paymentId: this.successPaymentData.razorpay_payment_id,
            signature: this.successPaymentData.razorpay_signature,
          },
        };
        this.paymentService.savePaymentInfo(paymentData).then(() => {
          // this.paymentService.updatePaymentSuccessStatus(true);
          // this.router.navigate(['order/success']);
          
          const dialogRef = this.dialog.open(PaymentResultDialogComponent, {
            width: "540px",
            data: {
              isPaymentSuccess: true,
              isPaymentFailed: false,
              subscriptionId: this.successPaymentData.razorpay_order_id
            },
          });
          dialogRef.afterClosed().subscribe((result: PaymentResultDialogResult) => {
            console.log(result);
            if (!result) {
              return;
            }
          });
        });
      } else {
        console.log("Unable to verify the Payment at the moment");
        const paymentData: PaymentInfo = {
          paymentDone: false,
          paymentStatus: "failure",
          paymentFailure: {
            code: this.failedPaymentData.error.code,
            paymentId: this.failedPaymentData.error.metadata.payment_id,
            orderId: this.failedPaymentData.error.metadata.order_id,
            description: this.failedPaymentData.error.description,
            source: this.failedPaymentData.error.source,
            step: this.failedPaymentData.error.step,
            reason: this.failedPaymentData.error.reason,
          },
        };
        this.paymentService.savePaymentInfo(paymentData);
        this.apiService.refreshFBToken();
        this.paymentService.updatePaymentFailureStatus(true);
        this.router.navigate(['order/failure']);
      }
    });
  }
}
