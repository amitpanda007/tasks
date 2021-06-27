import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { DailyRoutingModule } from "./daily.routing.module";

@NgModule({
  imports: [SharedModule, DragDropModule, DailyRoutingModule],
  declarations: [DailyRoutingModule.components],
})
export class DailyModule {}
