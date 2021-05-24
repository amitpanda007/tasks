import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Board } from "./board";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: "board",
  templateUrl: "board.component.html",
  styleUrls: ["board.component.scss"],
})
export class BoardComponent implements OnInit {
  @Input() board: Board | null = null;
  @Output() edit = new EventEmitter<Board>();

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  openBoard() {
    const boardId = this.board.id;
    this.router.navigate([`${boardId}`], {relativeTo: this.route});
  }
}
