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

  navigatePayments() {
    console.log("Navigating to Payment");
  }

  navigateAccount() {
    console.log("Navigating to Account");
  }

  navigateBoards() {
    console.log("Navigating to Boards");
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
