import { NgModule } from "@angular/core";
import { AngularFireAuthGuard } from "@angular/fire/auth-guard";
import { RouterModule, Routes } from "@angular/router";
import { ProjectListComponent } from "./project-list/project-list.component";
import { ProjectComponent } from "./project/project.component";

const routes: Routes = [
  {
    path: "projects",
    component: ProjectListComponent,
    canActivate: [AngularFireAuthGuard],
  },
  {
    path: "projects/:projectId",
    component: ProjectComponent,
    canActivate: [AngularFireAuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {
  static components = [ProjectListComponent, ProjectComponent];
}
