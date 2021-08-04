import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable()
export class APIService {
  constructor(private http: HttpClient) {}

  sendBoardInviteEmail(fromUser: string, toEmail: string, inviteUrl: string) {
    const apiUrl = `${environment.apiUrl}email/invite`;
    // ?from=${fromUser}&to${toEmail}&inviteUrl=${inviteUrl}
    return this.http
      .get(apiUrl, {
        params: {
          from: fromUser,
          to: toEmail,
          inviteUrl: inviteUrl,
        },
        observe: "response",
      })
      .toPromise();
  }
}
