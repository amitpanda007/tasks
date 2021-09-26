import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { BoardComponent } from "./board/board.component";
import { BoardsRoutingModule } from "./boards.routing.module";

@NgModule({
  imports: [SharedModule, DragDropModule, BoardsRoutingModule],
  declarations: [BoardsRoutingModule.components],
  exports: [BoardComponent],
})
export class BoardsModule {}
