import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./core/core.module";
import { SharedModule } from "./shared/shared.module";
import { HomeModule } from "./home/home.module";
import { TasksModule } from "./tasks/tasks.module";

import { AppComponent } from "./app.component";
import { SuccessSnackbar, ErrorSnackbar } from "./common/snackbar.component";
import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { environment } from "src/environments/environment";
import { DeleteConfirmationDialogComponent } from "./common/delete.dialog.component";
import { AuthModule } from "./auth/auth.module";
import { AngularFireAuthGuardModule } from "@angular/fire/auth-guard";
import { FileUploadDialogComponent } from "./common/file-upload.dialog.component";
import { TaskDialogComponent } from "./common/task-dialog/task-dialog.component";
import { BoardDialogComponent } from "./common/board-dialog/board-dialog.component";
import { BoardsModule } from "./boards/boards.module";
import { LabelDialogComponent } from "./common/label-dialog/label-dialog.component";
import { ColorCircleModule } from "ngx-color/circle";
import { ColorSwatchesModule } from "ngx-color/swatches";
import { CalenderDialogComponent } from "./common/calender-dialog/calender-dialog.component";
import { ColorDialogComponent } from "./common/color-dialog/color-dialog.component";
import { MemberDialogComponent } from "./common/member-dialog/member-dialog.component";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MoveDialogComponent } from './common/move-dialog/move-dialog.component';
import { CopyDialogComponent } from './common/copy-dialog/copy-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    SuccessSnackbar,
    ErrorSnackbar,
    DeleteConfirmationDialogComponent,
    FileUploadDialogComponent,
    TaskDialogComponent,
    BoardDialogComponent,
    LabelDialogComponent,
    CalenderDialogComponent,
    ColorDialogComponent,
    MemberDialogComponent,
    MoveDialogComponent,
    CopyDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AuthModule,
    SharedModule,
    CoreModule,
    HomeModule,
    TasksModule,
    BoardsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireAuthGuardModule,
    ColorCircleModule,
    ColorSwatchesModule,
    DragDropModule
  ],
  entryComponents: [
    SuccessSnackbar,
    ErrorSnackbar,
    DeleteConfirmationDialogComponent,
    FileUploadDialogComponent,
    TaskDialogComponent,
    BoardDialogComponent,
    LabelDialogComponent,
    CalenderDialogComponent,
    ColorDialogComponent,
    MemberDialogComponent,
    MoveDialogComponent,
    CopyDialogComponent
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
