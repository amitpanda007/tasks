import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from "@angular/core";
import { MatDialog } from "@angular/material";
import * as firebase from "firebase";
import { firestore } from "firebase";
import {
  CalenderDialogComponent,
  CalenderDialogResult,
} from "src/app/common/calender-dialog/calender-dialog.component";
import {
  MessageDialogComponent,
  MessageDialogResult,
} from "src/app/common/message-dialog/message-dialog.component";
import { Constant } from "src/app/shared/constants";

@Component({
  selector: "project",
  templateUrl: "project.component.html",
  styleUrls: ["project.component.scss"],
})
export class ProjectComponent implements OnInit {
  ngOnInit(): void {
    console.log("Starting Project Component");
  }

  ngOnDestroy(): void {}
}
