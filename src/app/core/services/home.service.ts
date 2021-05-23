import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";

@Injectable()
export class HomeService {
  constructor(private _store: AngularFirestore, private _router: Router) {}

  getInterviewFromFirebase(interviewId: string) {
    const interviewDoc = this._store
      .collection("interviews")
      .doc(interviewId)
      .get();

    return interviewDoc;
  }

  getCandidateFromFirebase(interviewId: string, candidateId: string) {
    const candidateDoc = this._store
      .collection("interviews")
      .doc(interviewId)
      .collection("candidates")
      .doc(candidateId)
      .get();

    return candidateDoc;
  }

  navigateToInterview(interviewId: string) {
    this._router.navigate([`/interview/${interviewId}`]);
  }

  navigateToInterviewWithCandidate(interviewId: string, candidateId) {
    this._router.navigate([`/interview/${interviewId}/${candidateId}`]);
  }
}
