import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RazorPayComponent } from "./razorpay-payment/razorpay.component";

const routes: Routes = [
  {
    path: "payments",
    component: RazorPayComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentRoutingModule {
  static components = [RazorPayComponent];
}
