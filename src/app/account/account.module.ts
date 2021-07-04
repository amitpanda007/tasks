import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { AccountRoutingModule } from "./account.routing.module";

@NgModule({
  imports: [ReactiveFormsModule, SharedModule, AccountRoutingModule],
  declarations: [AccountRoutingModule.components],
  exports: [],
})
export class AccountModule {}
