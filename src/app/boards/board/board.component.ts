import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  Renderer2,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from "@angular/core";
import { Board } from "./board";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "board",
  templateUrl: "board.component.html",
  styleUrls: ["board.component.scss"],
})
export class BoardComponent implements OnInit, AfterViewInit {
  @Input() board: Board | null = null;
  @Input() showDescription: boolean = true;
  @Input() compactBoard: boolean = false;
  @Output() edit = new EventEmitter<Board>();
  @Output() open = new EventEmitter<string>();

  @ViewChild("boardCard", { static: false }) boardCardRef: ElementRef;

  @HostListener("contextmenu", ["$event"])
  onRightClick(event) {
    event.preventDefault();
    this.edit.emit(this.board);
  }

  public isFavourite: boolean = false;
  public primaryColor: string = "";
  public secondaryColor: string = "";
  public backGroundImage: string = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (this.board.favourite) {
      this.isFavourite = this.board.favourite.includes(
        this.authService.getUID()
      );
    }

    if (this.board.backgroundColors && this.board.backgroundColors.primary) {
      console.log("primary color found");
      const p = this.board.backgroundColors.primary;
      this.primaryColor = `rgb(${p.r},${p.g},${p.b},${p.a})`;
    }
    if (this.board.backgroundColors && this.board.backgroundColors.secondary) {
      const s = this.board.backgroundColors.secondary;
      this.secondaryColor = `rgb(${s.r},${s.g},${s.b},${s.a})`;
    }

    this.backGroundImage = `linear-gradient(${this.primaryColor}, ${this.secondaryColor})`;
  }

  ngAfterViewInit() {
    if (this.compactBoard) {
      this.renderer.setStyle(
        this.boardCardRef.nativeElement,
        "backgroundImage",
        this.backGroundImage
      );
    }
  }

  openBoard() {
    const boardId = this.board.id;
    this.open.emit(boardId);
    // this.router.navigate([`boards/${boardId}`], { replaceUrl: true });
  }
}
