import { NgModule, SkipSelf, Optional } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";

import { AuthService } from "./services/auth.service";
import { CacheService } from "./services/cache.service";
import { LocalStorageService } from "./services/local.storage.service";
import { EnsureModuleLoadedOnceGuard } from "./services/ensure-module-loaded-once.guard";
import { NavComponent } from "./nav/nav.component";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { MatSnackBarModule } from "@angular/material";
import { NavService } from "./services/nav.service";
import { HomeService } from "./services/home.service";
import { BoardService } from "./services/board.service";
import { BoardServiceV2 } from "./services/boardv2.service";
import { DailyService } from "./services/daily.service";
import { AccountService } from "./services/account.service";
import { APIService } from "./services/api.service";
import { LoaderService } from "./services/loader.service";
import { LoaderComponent } from "./loader/loader.component";
import { NotificationService } from "./services/notification.service";
import { PaymentService } from "./services/payment.service";

@NgModule({
  imports: [CommonModule, SharedModule],
  exports: [NavComponent, LoaderComponent],
  declarations: [NavComponent, LoaderComponent],
  providers: [
    AuthService,
    CacheService,
    LocalStorageService,
    MatSnackBarModule,
    NavService,
    HomeService,
    BoardService,
    BoardServiceV2,
    DailyService,
    AccountService,
    APIService,
    LoaderService,
    NotificationService,
    PaymentService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class CoreModule extends EnsureModuleLoadedOnceGuard {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }
}
