import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { PaymentRoutingModule } from "./payment.routing.module";

@NgModule({
  imports: [SharedModule, PaymentRoutingModule],
  declarations: [PaymentRoutingModule.components],
  exports: [],
})
export class PaymentModule {}
