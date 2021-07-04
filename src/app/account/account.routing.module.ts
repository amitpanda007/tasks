import { NgModule } from "@angular/core";
import { AngularFireAuthGuard } from "@angular/fire/auth-guard";
import { RouterModule, Routes } from "@angular/router";
import { AccountSettingsComponent } from "./account-settings/account-settings.component";

const routes: Routes = [
  {
    path: "account",
    component: AccountSettingsComponent,
    canActivate: [AngularFireAuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {
  static components = [AccountSettingsComponent];
}
