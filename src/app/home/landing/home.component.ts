import { Component, Input, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/core/services/auth.service";
import { ErrorSnackbar } from "../../common/snackbar.component";
import { HomeService } from "../../core/services/home.service";

@Component({
  selector: "home",
  templateUrl: "home.component.html",
  styleUrls: ["home.component.scss"],
})
export class HomeComponent implements OnInit {
  public emailId: string;
  private authSubscription: Subscription;

  constructor(
    private homeService: HomeService,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {
    this.authSubscription = this.authService
      .authStateChanged()
      .subscribe((isAuthenticated) => {
        console.log(isAuthenticated);
        if (isAuthenticated) {
          this.router.navigate(["/boards"]);
        }
      });
  }

  ngOnInit(): void {
    this.emailId = "";
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  find() {}

  signUp() {
    if (this.emailId.trim() === "") {
      return;
    }
    console.log("Navigating to sign up");
    this.router.navigate([`/register/${this.emailId}`]);
  }
}
