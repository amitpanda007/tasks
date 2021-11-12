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
  public uploadProgress: number = 0;
  public isUploadComplete: boolean = false;
  public uploadConfirmed: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UploadDialogData,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  cancel(): void {
    if(this.uploadConfirmed) {
      this.dialogRef.close();
    }else {
      //TODO: Delete uploaded data from firebase storage
    }
  }

  fileChanged(event: any) {
    console.log(event);
    this.fileToUpload = event.target.files[0];
  }

  upload() {
    const fileName = `${this.data.userId}_${this.fileToUpload.name}`;
    const uploadProgress = this.accountService.uploadAvatarImage(
      fileName,
      this.fileToUpload
    );

    uploadProgress.subscribe((progress) => {
      console.log(progress);
      this.uploadProgress = progress;
      if (progress == 100) {
        this.isUploadComplete = true;
      }
    });
  }

  confirmUpload() {
    this.uploadConfirmed = true;
    const fileName = `${this.data.userId}_${this.fileToUpload.name}`;
    this.dialogRef.close({confirm: true, fileName: fileName});
  }
}

export interface UploadDialogData {
  userId: string;
}

export interface UploadDialogResult {
  confirm: boolean;
  fileName: string;
}
