import { Injectable } from "@angular/core";
import { Subject } from "rxjs/internal/Subject";

@Injectable()
export class LoaderService {
  private _loaderSource = new Subject<boolean>();
  newLoader$ = this._loaderSource.asObservable();

  constructor() {}

  changeLoading(value: boolean) {
    this._loaderSource.next(value);
  }
}
