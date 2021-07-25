import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/landing/home.component";
import { PricingComponent } from "./home/pricing/pricing.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    data: { title: "Home" },
  },
  {
    path: "pricing",
    component: PricingComponent,
    data: { title: "Tasks: Pricing" },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
