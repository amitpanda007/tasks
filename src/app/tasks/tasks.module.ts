import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { TasksRoutingModule } from "./tasks.routing.module";

@NgModule({
  imports: [SharedModule, DragDropModule, TasksRoutingModule],
  declarations: [TasksRoutingModule.components],
})
export class TasksModule {}
