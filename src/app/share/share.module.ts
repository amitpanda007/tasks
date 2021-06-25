import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { ShareBoardsRoutingModule } from './share.routing.module';

@NgModule({
  imports: [SharedModule, ShareBoardsRoutingModule],
  declarations: [ShareBoardsRoutingModule.components],
})
export class ShareModule {}
