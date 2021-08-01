import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { NotFoundComponent } from "./home/404/404.component";
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
  {
    path: "**",
    component: NotFoundComponent,
    data: { title: "Not Found" },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
