import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BaordListComponent } from "./board-list/board.list.component";
import { BoardComponent } from "./board/board.component";

const routes: Routes = [{ path: "boards", component: BaordListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BoardsRoutingModule {
  static components = [BaordListComponent, BoardComponent];
}
