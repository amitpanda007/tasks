import { NgModule } from "@angular/core";
import { AngularFireAuthGuard } from "@angular/fire/auth-guard";
import { RouterModule, Routes } from "@angular/router";
import { TaskListComponent } from "../tasks/task-list/task.list.component";
import { ShareBoardComponent } from './share-board/share-board.component';

const routes: Routes = [
  {
    path: "share/board/:boardId/:invitationId",
    component: ShareBoardComponent,
    canActivate: [AngularFireAuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShareBoardsRoutingModule {
  static components = [ShareBoardComponent];
}
