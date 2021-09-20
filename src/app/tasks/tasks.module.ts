import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { TasksRoutingModule } from "./tasks.routing.module";
import { ColorCircleModule } from "ngx-color/circle";
import { ChecklistComponent } from "./checklist/checklist.component";
import { ColorChromeModule } from "ngx-color/chrome";
import { TaskComponent } from "./task/task.component";

@NgModule({
  imports: [
    SharedModule,
    DragDropModule,
    TasksRoutingModule,
    ColorCircleModule,
    ColorChromeModule
  ],
  declarations: [TasksRoutingModule.components],
  exports: [ChecklistComponent, TaskComponent],
})
export class TasksModule {}
