import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Task } from "./task";

@Component({
  selector: "task",
  templateUrl: "task.component.html",
  styleUrls: ["task.component.scss"],
})
export class TaskComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() edit = new EventEmitter<Task>();
  private showLabelText: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  hideLabelName() {
    this.showLabelText = !this.showLabelText;
  }
}
