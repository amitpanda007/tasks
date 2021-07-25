import { Component, Input, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { HomeService } from "../../core/services/home.service";

@Component({
  selector: "pricing",
  templateUrl: "pricing.component.html",
  styleUrls: ["pricing.component.scss"],
})
export class PricingComponent {
  constructor(
    private homeService: HomeService,
    private _snackBar: MatSnackBar
  ) {}
}
