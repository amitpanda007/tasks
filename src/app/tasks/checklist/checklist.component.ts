import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { CheckList } from "../task/checklist";

@Component({
  selector: "checklist",
  templateUrl: "checklist.component.html",
  styleUrls: ["checklist.component.scss"],
})
export class ChecklistComponent implements OnInit {
  @Input() checklist: CheckList | null = null;
  @Input() showDuedate: boolean = true;
  @Input() showAssign: boolean = true;
  @Input() showDelete: boolean = true;

  @Output() duedate = new EventEmitter<CheckList>();
  @Output() assign = new EventEmitter<CheckList>();
  @Output() delete = new EventEmitter<CheckList>();
  @Output() done = new EventEmitter<CheckList>();
  @Output() convert = new EventEmitter<CheckList>();

  public checklistOverDue: boolean;
  public dueDate;
  private backupChecklist: CheckList;

  constructor() {}

  ngOnInit(): void {
    this.checkDueDateStatus();
    this.backupChecklist = JSON.parse(JSON.stringify(this.checklist));
  }

  toggleChecklistEditing(checklist: CheckList) {
    checklist.isEditing = !checklist.isEditing;
  }

  markChecklistClose(checklist: CheckList) {
    checklist.isEditing = !checklist.isEditing;
    this.checklist = JSON.parse(JSON.stringify(this.backupChecklist));
  }

  markChecklistDone(checklist: CheckList) {
    this.done.emit(checklist);
  }

  convertToCard(checklist: CheckList) {
    this.convert.emit(checklist);
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
