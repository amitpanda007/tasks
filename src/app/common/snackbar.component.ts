import { Component, Inject } from "@angular/core";
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';

@Component({
  selector: "success-snackbar",
  template: `
    <span style="color:#99ff99">
      {{data}}
    </span>
  `
})
export class SuccessSnackbar {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}


@Component({
  selector: "error-snackbar",
  template: `
    <span style="color:hotpink">
      {{data}}
    </span>
  `
})
export class ErrorSnackbar {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
