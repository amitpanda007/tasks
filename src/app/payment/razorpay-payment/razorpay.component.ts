import { Component, Input, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { APIService } from "src/app/core/services/api.service";
import { HomeService } from "../../core/services/home.service";

declare var Razorpay: any;

@Component({
  selector: "razorpay-component",
  templateUrl: "razorpay.component.html",
  styleUrls: ["razorpay.component.scss"],
})
export class RazorPayComponent implements OnInit {
  constructor(private apiService: APIService) {}

  ngOnInit(): void {}

  razorPayOptions = {
    key: "",
    amount: "",
    currency: "INR",
    name: "",
    description: "Tasks payment",
    order_id: "",
    handler: (res) => {
      console.log(res);
    },
  };

  buyWithRazorPay() {
    const paymentData = {
      name: "Amit P",
      amount: 100,
    };
    this.apiService.paymentWithRazorPay(paymentData).then((res) => {
      console.log(res);
      this.razorPayOptions.key = res["key"];
      this.razorPayOptions.amount = res["value"]["amount"];
      this.razorPayOptions.name = paymentData["name"];
      this.razorPayOptions.order_id = res["value"]["id"];
      this.razorPayOptions.handler = this.razorPayResponseHandler;
      let rzp1 = new Razorpay(this.razorPayOptions);
      rzp1.open();
      console.log("RazorPay Payment Modal Opened");
    });
  }

  razorPayResponseHandler(response) {
    console.log(response);
  }
}
