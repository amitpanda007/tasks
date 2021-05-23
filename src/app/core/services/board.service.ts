import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/firestore";
import { Subject } from "rxjs";
import { Board } from "src/app/boards/board/board";
import { AuthService } from "./auth.service";

@Injectable()
export class BoardService {
  private boardsCollection: AngularFirestoreCollection<Board>;
  private allBoards: Board[];
  public boardsChanged = new Subject<Board[]>();

  constructor(
    private _store: AngularFirestore,
    private authService: AuthService
  ) {}

  getBoards() {
    this.boardsCollection = this._store.collection<Board>(
      this.authService.getUID()
    );

    this.boardsCollection
      .valueChanges({ idField: "id" })
      .subscribe((boards) => {
        this.allBoards = boards;
        this.boardsChanged.next([...this.allBoards]);
      });
  }

  addBoard(board: Board) {
    return this._store.firestore.runTransaction(async () => {
      const docInfo = await this._store
        .collection(this.authService.getUID())
        .add(board);
    });
  }
}
