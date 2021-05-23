import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TaskListComponent } from "./task-list/task.list.component";
import { TaskComponent } from "./task/task.component";

const routes: Routes = [{ path: "tasks", component: TaskListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TasksRoutingModule {
  static components = [TaskListComponent, TaskComponent];
}
