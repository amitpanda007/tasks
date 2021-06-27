import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
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
  MatOptionModule,
  MatSelectModule,
} from "@angular/material";

import { CapitalizePipe } from "./capitalize.pipe";
import { DefaultPipe } from "./default.pipe";
import { DateFormatPipe } from "./date.format.pipe";
import { ShortnamePipe } from "./shortname.pipe";

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CapitalizePipe,
    DefaultPipe,
    DateFormatPipe,
    ShortnamePipe,
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
    MatOptionModule,
    MatSelectModule,
  ],
  declarations: [CapitalizePipe, DefaultPipe, DateFormatPipe, ShortnamePipe],
  providers: [MatNativeDateModule],
})
export class SharedModule {}
