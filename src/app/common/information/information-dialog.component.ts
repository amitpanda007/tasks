import { Component, ElementRef, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogConfig,
  MatDialog,
} from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { NotificationService } from "src/app/core/services/notification.service";
import { Information } from "./information";

@Component({
  selector: "app-information-board-dialog",
  templateUrl: "./information-dialog.component.html",
  styleUrls: ["./information-dialog.component.scss"],
})
export class InformationDialogComponent implements OnInit {
  private positionRelativeToElement: ElementRef =
    this.data.positionRelativeToElement;
  public informationImage: string;
  private imageSubscription: Subscription;

  constructor(
    public dialogRef: MatDialogRef<InformationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InformationDialogData,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const matDialogConfig = new MatDialogConfig();
    const rect: DOMRect =
      this.positionRelativeToElement.nativeElement.getBoundingClientRect();

    matDialogConfig.position = {
      top: `${rect.bottom + 14}px`,
      left: `${rect.left - 284}px`,
    };
    this.dialogRef.updatePosition(matDialogConfig.position);

    this.imageSubscription = this.notificationService
      .getInformationImage(this.data.informations[0].url)
      .subscribe((image) => {
        console.log(image);
        this.informationImage = image;
      });
  }

  ngOnDestroy(): void {
    if (this.imageSubscription) {
      this.imageSubscription.unsubscribe();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

export interface InformationDialogData {
  positionRelativeToElement: ElementRef;
  informations: Information[];
}

export interface InformationDialogResult {}
