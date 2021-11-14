import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../shared/shared.module";
import { TaskComponent } from "../tasks/task/task.component";
import { TasksModule } from "../tasks/tasks.module";
import { AccountRoutingModule } from "./account.routing.module";

@NgModule({
  imports: [
    ReactiveFormsModule,
    SharedModule,
    AccountRoutingModule,
    TasksModule,
  ],
  declarations: [AccountRoutingModule.components],
  exports: [],
})
export class AccountModule {}
