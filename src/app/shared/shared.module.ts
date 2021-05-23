import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatSnackBarModule,
  MatButtonModule,
  MatCardModule,
  MatToolbarModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatBadgeModule,
  MatProgressSpinnerModule,
  MatSlideToggleModule,
  MatExpansionModule,
  MatIconModule,
  MatPaginatorModule,
  MatTabsModule,
  MatProgressBarModule,
  MatChipsModule,
  MatTooltipModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSliderModule,
  MatTableModule,
} from "@angular/material";

import { CapitalizePipe } from "./capitalize.pipe";
import { DefaultPipe } from "./default.pipe";

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CapitalizePipe,
    DefaultPipe,
    MatSnackBarModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatIconModule,
    MatPaginatorModule,
    MatTabsModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatTableModule,
  ],
  declarations: [CapitalizePipe, DefaultPipe],
  providers: [MatNativeDateModule],
})
export class SharedModule {}
