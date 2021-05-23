import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppRoutingModule } from "./app-routing.module";
import { CoreModule } from "./core/core.module";
import { SharedModule } from "./shared/shared.module";
import { HomeModule } from "./home/home.module";

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

@NgModule({
  declarations: [
    AppComponent,
    SuccessSnackbar,
    ErrorSnackbar,
    DeleteConfirmationDialogComponent,
    FileUploadDialogComponent,
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
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireAuthGuardModule,
  ],
  entryComponents: [
    SuccessSnackbar,
    ErrorSnackbar,
    DeleteConfirmationDialogComponent,
    FileUploadDialogComponent,
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
})
export class AppModule {}
