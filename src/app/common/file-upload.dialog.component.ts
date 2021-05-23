import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";

export interface SampleCandidate {
  rank: number;
  name: string;
  time: string;
}

const ELEMENT_DATA: SampleCandidate[] = [
  { rank: 1, name: "Adams Mufasa", time: "09:30" },
  { rank: 2, name: "Helium Hills", time: "10:30" },
];

@Component({
  selector: "delete-dialog",
  template: `
    <div class="form-group">
      <input
        type="file"
        id="file"
        (change)="handleFileInput($event.target.files)"
      />
    </div>

    <p class="info">Upload excel (.xlsx) file with below format.</p>

    <table mat-table [dataSource]="dataSource">
      <ng-container matColumnDef="rank">
        <th mat-header-cell *matHeaderCellDef>Rank</th>
        <td mat-cell *matCellDef="let element">{{ element.rank }}</td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let element">{{ element.name }}</td>
      </ng-container>

      <ng-container matColumnDef="time">
        <th mat-header-cell *matHeaderCellDef>Time</th>
        <td mat-cell *matCellDef="let element">{{ element.time }}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
    </table>

    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ content: fileToUpload }">
        Ok
      </button>
      <button mat-button (click)="cancel()">Cancel</button>
    </div>
  `,
  styles: [
    `
      table {
        width: 100%;
        border: 2px dotted black;
        margin-top: 15px;
        background-color: antiquewhite;
      }

      .info {
        font-size: small;
        font-weight: 500;
        margin-top: 10px;
      }

      .form-group {
        display: flex;
        justify-content: center;
        border: 2px solid #3700be;
        padding: 10px;
      }
    `,
  ],
})
export class FileUploadDialogComponent {
  displayedColumns: string[] = ["rank", "name", "time"];
  dataSource = ELEMENT_DATA;
  fileToUpload: File;
  constructor(public dialogRef: MatDialogRef<FileUploadDialogComponent>) {
    this.fileToUpload = null;
  }

  cancel() {
    const data = {
      content: null,
    };
    this.dialogRef.close(data);
  }

  handleFileInput(files: FileList) {
    if (files.length !== 1) throw new Error("Cannot upload multiple files.");
    this.fileToUpload = files.item(0);
  }
}

export interface FileUploadDialogResult {
  content: File;
}
