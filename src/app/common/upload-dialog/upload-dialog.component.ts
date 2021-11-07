import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AccountService } from "src/app/core/services/account.service";

@Component({
  selector: "app-upload-dialog",
  templateUrl: "./upload-dialog.component.html",
  styleUrls: ["./upload-dialog.component.scss"],
})
export class UploadDialogComponent implements OnInit {
  private fileToUpload: any;

  constructor(
    public dialogRef: MatDialogRef<UploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UploadDialogData,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  cancel(): void {
    this.dialogRef.close();
  }

  fileChanged(event: any) {
    console.log(event);
    this.fileToUpload = event.target.files[0];
  }

  upload() {
    this.accountService.uploadAvatarImage(
      this.fileToUpload.name,
      this.fileToUpload
    );
  }
}

export interface UploadDialogData {}

export interface UploadDialogResult {}
