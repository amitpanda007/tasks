import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Board } from "./board";

@Component({
  selector: "board",
  templateUrl: "board.component.html",
  styleUrls: ["board.component.scss"],
})
export class BoardComponent implements OnInit {
  @Input() board: Board | null = null;
  @Output() edit = new EventEmitter<Board>();

  constructor() {}

  ngOnInit(): void {}
}
