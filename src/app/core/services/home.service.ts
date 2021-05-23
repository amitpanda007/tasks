import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";

@Injectable()
export class HomeService {
  constructor(private _store: AngularFirestore, private _router: Router) {}
}
