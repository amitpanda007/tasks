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
import { AngularFireStorageModule } from "@angular/fire/storage";
import { FileUploadDialogComponent } from "./common/file-upload.dialog.component";
import { TaskDialogComponent } from "./common/task-dialog/task-dialog.component";
import { BoardDialogComponent } from "./common/board-dialog/board-dialog.component";
import { BoardsModule } from "./boards/boards.module";
import { LabelDialogComponent } from "./common/label-dialog/label-dialog.component";
import { ColorCircleModule } from "ngx-color/circle";
import { ColorSwatchesModule } from "ngx-color/swatches";
import { ColorChromeModule } from "ngx-color/chrome";
import { CalenderDialogComponent } from "./common/calender-dialog/calender-dialog.component";
import { ColorDialogComponent } from "./common/color-dialog/color-dialog.component";
import { MemberDialogComponent } from "./common/member-dialog/member-dialog.component";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MoveDialogComponent } from "./common/move-dialog/move-dialog.component";
import { CopyDialogComponent } from "./common/copy-dialog/copy-dialog.component";
import { InviteDialogComponent } from "./common/invite-dialog/invite-dialog.component";
import { ShareModule } from "./share/share.module";
import { DailyModule } from "./daily/daily.module";
import { DailyTaskDialogComponent } from "./common/daily-task-dialog/daily-task-dialog.component";
import { ConfirmDialogComponent } from "./common/confirm-dialog/confirm-dialog.component";
import { AccountModule } from "./account/account.module";
import { MessageDialogComponent } from "./common/message-dialog/message-dialog.component";
import { RouterModule } from "@angular/router";
import { FilterSearchComponent } from "./common/filter-search.component";
import { QRCodeModule } from "angularx-qrcode";
import { ChecklistDialogComponent } from "./common/checklist-dialog/checklist-dialog.component";
import { MemberInfoDialogComponent } from "./common/member-info/member-info-dialog.component";
import { MemberActivityDialogComponent } from "./common/member-activity/member-activity-dialog.component";
import { BoardSettingsDialogComponent } from "./common/board-settings/board-settings-dialog.component";
import { CloseBoardDialogComponent } from "./common/close-board/close-board-dialog.component";
import { ClosedBoardContentDialogComponent } from "./common/closed-board-content/closed-board-content-dialog.component";
import { CopyBoardDialogComponent } from "./common/copy-board-dialog/copy-board-dialog.component";
import { BoardTemplateDialogComponent } from "./common/board-template-dialog/board-template-dialog.component";
import { TaskTemplateDialogComponent } from "./common/task-template-dialog/task-template-dialog.component";
import { BoardInfoDialogComponent } from "./common/board-info-dialog/board-info-dialog.component";
import { NotificationDialogComponent } from "./common/notification/notification-dialog.component";
import { InformationDialogComponent } from "./common/information/information-dialog.component";
import { AutomationDialogComponent } from "./common/automation-dialog/automation-dialog.component";
import { UploadDialogComponent } from "./common/upload-dialog/upload-dialog.component";
import { SubscriptionDialogComponent } from "./common/subscription-dialog/subscription-dialog.component";
import { PaymentModule } from "./payment/payment.module";
import { PaymentResultDialogComponent } from "./common/payment-result-dialog/payment-result-dialog.component";
import { ProjectModule } from "./projects/project.module";

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
    CopyDialogComponent,
    InviteDialogComponent,
    DailyTaskDialogComponent,
    ConfirmDialogComponent,
    MessageDialogComponent,
    FilterSearchComponent,
    ChecklistDialogComponent,
    MemberInfoDialogComponent,
    MemberActivityDialogComponent,
    BoardSettingsDialogComponent,
    CloseBoardDialogComponent,
    ClosedBoardContentDialogComponent,
    CopyBoardDialogComponent,
    BoardTemplateDialogComponent,
    TaskTemplateDialogComponent,
    BoardInfoDialogComponent,
    NotificationDialogComponent,
    InformationDialogComponent,
    AutomationDialogComponent,
    UploadDialogComponent,
    SubscriptionDialogComponent,
    PaymentResultDialogComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AuthModule,
    SharedModule,
    CoreModule,
    HomeModule,
    TasksModule,
    BoardsModule,
    DailyModule,
    AccountModule,
    PaymentModule,
    ProjectModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireAuthGuardModule,
    AngularFireStorageModule,
    ColorCircleModule,
    ColorSwatchesModule,
    DragDropModule,
    ShareModule,
    AppRoutingModule,
    QRCodeModule,
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
    CopyDialogComponent,
    InviteDialogComponent,
    DailyTaskDialogComponent,
    ConfirmDialogComponent,
    MessageDialogComponent,
    ChecklistDialogComponent,
    MemberInfoDialogComponent,
    MemberActivityDialogComponent,
    BoardSettingsDialogComponent,
    CloseBoardDialogComponent,
    ClosedBoardContentDialogComponent,
    CopyBoardDialogComponent,
    BoardTemplateDialogComponent,
    TaskTemplateDialogComponent,
    BoardInfoDialogComponent,
    NotificationDialogComponent,
    InformationDialogComponent,
    AutomationDialogComponent,
    UploadDialogComponent,
    SubscriptionDialogComponent,
    PaymentResultDialogComponent,
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
