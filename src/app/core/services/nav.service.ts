import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable()
export class NavService {
    private _classSource= new Subject<string>();
    newClass$ = this._classSource.asObservable();

    constructor() {}

    changeClass(newName: string) {
        let newClass = "toolbar " + newName;
        this._classSource.next(newClass);
    }
}