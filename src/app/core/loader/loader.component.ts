import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { NavService } from "../services/nav.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { LoaderService } from "../services/loader.service";

@Component({
  selector: "loader",
  templateUrl: "loader.component.html",
  styleUrls: ["loader.component.scss"],
})
export class LoaderComponent implements OnInit {
  public isLoading: boolean = false;

  constructor(private loaderService: LoaderService) {}

  ngOnInit(): void {
    this.loaderService.newLoader$.subscribe((value) => {
      this.isLoading = value;
    });
  }
}
