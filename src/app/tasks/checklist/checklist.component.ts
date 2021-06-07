import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { CheckList } from "../task/checklist";

@Component({
  selector: "checklist",
  templateUrl: "checklist.component.html",
  styleUrls: ["checklist.component.scss"],
})
export class ChecklistComponent implements OnInit {
  @Input() checklist: CheckList | null = null;
  @Output() duedate = new EventEmitter<CheckList>();
  @Output() assign = new EventEmitter<CheckList>();
  @Output() delete = new EventEmitter<CheckList>();
  @Output() done = new EventEmitter<CheckList>();

  constructor() {}

  ngOnInit(): void {}

  toggleChecklistEditing(checklist: CheckList) {
    checklist.isEditing = !checklist.isEditing;
  }
}
