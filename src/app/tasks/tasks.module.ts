import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { TasksRoutingModule } from "./tasks.routing.module";
import { ColorCircleModule } from "ngx-color/circle";
import { ChecklistComponent } from "./checklist/checklist.component";
import { ColorChromeModule } from "ngx-color/chrome";

@NgModule({
  imports: [
    SharedModule,
    DragDropModule,
    TasksRoutingModule,
    ColorCircleModule,
    ColorChromeModule
  ],
  declarations: [TasksRoutingModule.components],
  exports: [ChecklistComponent],
})
export class TasksModule {}
