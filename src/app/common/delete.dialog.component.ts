import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

@Component({
  selector: "delete-dialog",
  template: `
    <div mat-dialog-content>
      <p>Are you sure?</p>
    </div>

    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ delete: true }">Ok</button>
      <button mat-button (click)="cancel()">Cancel</button>
    </div>
  `,
})
export class DeleteConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>
  ) {}

  cancel() {
    const data = {
      delete: false,
    };
    this.dialogRef.close(data);
  }
}

export interface DeleteConfirmationDialogResult {
  delete: boolean;
}
