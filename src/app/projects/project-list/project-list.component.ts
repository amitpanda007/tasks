import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { MatDialog, throwToolbarMixedModesError } from "@angular/material";
import { Subscription } from "rxjs";
// import * as cloneDeep from "lodash/cloneDeep";
import { cloneDeep } from "lodash";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
  selector: "project-list",
  templateUrl: "project-list.component.html",
  styleUrls: ["project-list.component.scss"],
})
export class ProjectListComponent implements OnInit {
  ngOnInit(): void {
    console.log("HELLO");
  }
}
