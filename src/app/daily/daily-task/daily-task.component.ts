import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DailyTask } from "./dailytask";

@Component({
  selector: "daily-task",
  templateUrl: "daily-task.component.html",
  styleUrls: ["daily-task.component.scss"],
})
export class DailyTaskComponent implements OnInit {
  @Input() dailyTask: DailyTask;
  @Output() edit = new EventEmitter<DailyTask>();

  constructor() {}

  ngOnInit(): void {}
}
