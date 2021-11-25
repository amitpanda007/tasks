import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PaymentResultComponent } from "./payment-result/payment-result.component";
import { RazorPayComponent } from "./razorpay-payment/razorpay.component";

const routes: Routes = [
  {
    path: "payments",
    component: RazorPayComponent,
  },
  {
    path: "order/success",
    component: PaymentResultComponent,
  },
  {
    path: "order/failure",
    component: PaymentResultComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {
  static components = [RazorPayComponent, PaymentResultComponent];
}
