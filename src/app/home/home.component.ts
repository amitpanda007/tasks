import { Component, Input, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { ErrorSnackbar } from "../common/snackbar.component";
import { HomeService } from "../core/services/home.service";

@Component({
  selector: "home",
  templateUrl: "home.component.html",
  styleUrls: ["home.component.scss"],
})
export class HomeComponent implements OnInit {
  public searchTerm: string;
  public readonlyMode: boolean;
  public privateMode: boolean;

  constructor(
    private homeService: HomeService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.privateMode = false;
    this.readonlyMode = false;
  }

  find() {}
}
