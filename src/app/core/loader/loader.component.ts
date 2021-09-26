import { Component, OnInit } from "@angular/core";
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
