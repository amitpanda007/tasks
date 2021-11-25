import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-payment-result-dialog",
  templateUrl: "./payment-result-dialog.component.html",
  styleUrls: ["./payment-result-dialog.component.scss"],
})
export class PaymentResultDialogComponent implements OnInit{
  constructor(
    public dialogRef: MatDialogRef<PaymentResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentResultDialogData
  ) {}

  ngOnInit(): void {
    console.log("PAYMENT RESULT INITIATED");
    console.log(this.data);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close({ confirm: true });
  }
}

export interface PaymentResultDialogData {
  isPaymentSuccess: boolean;
  isPaymentFailed: boolean;
  subscriptionId: string;
}

export interface PaymentResultDialogResult {
  confirm: boolean;
}
