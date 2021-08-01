import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { take } from "rxjs/operators";

@Component({
  selector: "app-not-found",
  templateUrl: "./404.component.html",
  styleUrls: ["./404.component.scss"],
})
export class NotFoundComponent implements OnInit {
  path: string;

  constructor(private router: Router) {}

  ngOnInit() {}

  navigateHome() {
    this.router.navigate([""]);
  }
}
