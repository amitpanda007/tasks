import { NgModule } from "@angular/core";
import { AngularFireAuthGuard } from "@angular/fire/auth-guard";
import { RouterModule, Routes } from "@angular/router";
import { TaskListComponent } from "../tasks/task-list/task.list.component";
import { DailyListComponent } from "./daily-list/daily-list.component";
import { DailyTaskComponent } from "./daily-task/daily-task.component";

const routes: Routes = [
  {
    path: "daily",
    component: DailyListComponent,
    canActivate: [AngularFireAuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailyRoutingModule {
  static components = [DailyListComponent, DailyTaskComponent];
}
