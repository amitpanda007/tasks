import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { BoardsRoutingModule } from "./boards.routing.module";

@NgModule({
  imports: [SharedModule, DragDropModule, BoardsRoutingModule],
  declarations: [BoardsRoutingModule.components],
})
export class BoardsModule {}
