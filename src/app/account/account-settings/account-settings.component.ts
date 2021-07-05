import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { User } from "src/app/auth/user";
import { AccountService } from "src/app/core/services/account.service";

@Component({
  moduleId: module.id,
  selector: "account-settings",
  templateUrl: "account-settings.component.html",
  styleUrls: ["account-settings.compoennt.scss"],
})
export class AccountSettingsComponent implements OnInit {
  private userSubscription: Subscription;

  public user: User;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getUserInfo();
    this.userSubscription = this.accountService.userDataChanged.subscribe(
      (userData: any) => {
        this.user = userData;
        console.log(this.user);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  saveUserInformation(user: User) {
    this.accountService.saveUser(user);
  }
}
