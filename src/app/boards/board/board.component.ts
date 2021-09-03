import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Board } from "./board";
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "board",
  templateUrl: "board.component.html",
  styleUrls: ["board.component.scss"],
})
export class BoardComponent implements OnInit {
  @Input() board: Board | null = null;
  @Output() edit = new EventEmitter<Board>();
  public isFavourite: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    if(this.board.favourite) {
      this.isFavourite = this.board.favourite.includes(this.authService.getUID());
    }
  }

  openBoard() {
    const boardId = this.board.id;
    this.router.navigate([`${boardId}`], {relativeTo: this.route});
  }
}
