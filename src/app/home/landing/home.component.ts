import { Component, Input, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { Router } from "@angular/router";
import { ErrorSnackbar } from "../../common/snackbar.component";
import { HomeService } from "../../core/services/home.service";

@Component({
  selector: "home",
  templateUrl: "home.component.html",
  styleUrls: ["home.component.scss"],
})
export class HomeComponent implements OnInit {
  public emailId: string;

  constructor(
    private homeService: HomeService,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.emailId = "";
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
