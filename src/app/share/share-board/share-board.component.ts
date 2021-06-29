import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { BoardServiceV2 } from '../../core/services/boardv2.service';
import { Board } from '../../boards/board/board';
import { Invitation } from '../../common/invite-dialog/invitation';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: "share-board",
  templateUrl: "share-board.component.html",
  styleUrls: ["share-board.component.scss"],
})
export class ShareBoardComponent implements OnInit {
  private boardId: string;
  private invitationId: string;

  public board: Board;
  public invitation: Invitation;
  public boardLink: string;
  public isInvalidInvitation: boolean = false;
  public hasBoardAccess: boolean = false;
  public showInvitation: boolean = false;

  constructor(private router: Router, 
    private route: ActivatedRoute, 
    private bordServiceV2: BoardServiceV2, 
    private authService: AuthService) {}

  ngOnInit(): void {
    this.boardId = this.route.snapshot.params.boardId;
    this.invitationId = this.route.snapshot.params.invitationId;

    this.bordServiceV2.getBoardInvitation(this.boardId, this.invitationId).get().subscribe(invitationDocRef => {
      this.invitation = invitationDocRef.data() as Invitation;
      // Check if No Invitation found with given ID
      if(this.invitation == undefined) {
        this.isInvalidInvitation = true;
      } else {
        // Check if Invitation has already been accepted
        if(this.invitation.accepted) {
          this.isInvalidInvitation = true;
        }

        // Check if current user is owner of board
        if(this.invitation.creator == this.authService.getUID()) {
          this.hasBoardAccess = true;
          const baseUrl = window.location.origin;
          this.boardLink = `${baseUrl}/boards/${this.boardId}`;
        }
      }

      if(!this.isInvalidInvitation && !this.hasBoardAccess) {
        this.showInvitation = true;
      }
    });

    this.bordServiceV2.getBoard(this.boardId).get().subscribe(boardDocRef => {
      this.board = boardDocRef.data() as Board;
    });
  }

  accept() {
    console.log("Accepted the Invitation");
    this.bordServiceV2.acceptInvitation(this.boardId, this.invitationId);
    this.router.navigate(['/boards']);
  }

  cancel() {
    console.log("Cancelling the Invitation");
    this.router.navigate(['/boards']);
  }

}