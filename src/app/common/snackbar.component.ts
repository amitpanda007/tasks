import { Component, Inject } from "@angular/core";
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
} from "@angular/material/snack-bar";

@Component({
  selector: "success-snackbar",
  template: `
    <style>
      .flex-display {
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: space-between;
      }

      .hover {
        cursor: pointer;
      }
    </style>

    <span class="flex-display">
      <mat-icon>{{ data?.icon }}</mat-icon>
      <span style="color:#99ff99">
        {{ data?.text }}
      </span>
      <mat-icon *ngIf="data?.close" (click)="dismiss()" class="hover"
        >close</mat-icon
      >
      <span> </span
    ></span>
  `,
})
export class SuccessSnackbar {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
    private _snackRef: MatSnackBarRef<SuccessSnackbar>
  ) {}
  dismiss() {
    this._snackRef.dismiss();
  }
}

@Component({
  selector: "error-snackbar",
  template: `
    <mat-icon>{{ data?.icon }}</mat-icon>
    <span style="color:hotpink">
      {{ data?.text }}
    </span>
  `,
})
export class ErrorSnackbar {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
}
