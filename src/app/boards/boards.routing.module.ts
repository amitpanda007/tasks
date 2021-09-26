import { NgModule } from "@angular/core";
import { AngularFireAuthGuard } from "@angular/fire/auth-guard";
import { RouterModule, Routes } from "@angular/router";
import { TaskListComponent } from "../tasks/task-list/task.list.component";
import { BaordListComponent } from "./board-list/board.list.component";
import { BoardComponent } from "./board/board.component";

const routes: Routes = [
  {
    path: "boards",
    component: BaordListComponent,
    canActivate: [AngularFireAuthGuard],
  },
  {
    path: "boards/:boardId",
    component: TaskListComponent,
    canActivate: [AngularFireAuthGuard],
    children: [
      {
        path: ":taskId",
        component: TaskListComponent,
        canActivate: [AngularFireAuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BoardsRoutingModule {
  static components = [BaordListComponent, BoardComponent];
}
