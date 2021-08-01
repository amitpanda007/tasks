import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotFoundComponent } from "./404/404.component";
import { HomeComponent } from "./landing/home.component";
import { PricingComponent } from "./pricing/pricing.component";
const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {
  static components = [HomeComponent, PricingComponent, NotFoundComponent];
}
