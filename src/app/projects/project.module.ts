import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { SharedModule } from "../shared/shared.module";
import { ProjectRoutingModule } from "./project.routing.module";

@NgModule({
  imports: [SharedModule, DragDropModule, ProjectRoutingModule],
  declarations: [ProjectRoutingModule.components],
})
export class ProjectModule {}
