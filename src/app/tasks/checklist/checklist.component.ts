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

  public checklistOverDue: boolean;

  constructor() {}

  ngOnInit(): void {
    this.checkDueDateStatus();
  }

  toggleChecklistEditing(checklist: CheckList) {
    checklist.isEditing = !checklist.isEditing;
  }

  checkDueDateStatus() {
    if (this.checklist.dueDate && this.checklist.dueDate.date) {
      const timeNowMilli = new Date().getTime();
      const firebaseTime = Number(this.checklist.dueDate.date.toDate());
      if (firebaseTime > timeNowMilli) {
        this.checklistOverDue = false;
      } else {
        this.checklistOverDue = true;
      }
    }
  }
}
