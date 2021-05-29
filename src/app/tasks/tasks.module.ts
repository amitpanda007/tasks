import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { TasksRoutingModule } from "./tasks.routing.module";
import { ColorCircleModule } from "ngx-color/circle";

@NgModule({
  imports: [
    SharedModule,
    DragDropModule,
    TasksRoutingModule,
    ColorCircleModule,
  ],
  declarations: [TasksRoutingModule.components],
})
export class TasksModule {}
