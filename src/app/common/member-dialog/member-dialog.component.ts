import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";
import { SharedUser } from "src/app/boards/board/board";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "app-member-dialog",
  templateUrl: "./member-dialog.component.html",
  styleUrls: ["./member-dialog.component.scss"],
})
export class MemberDialogComponent implements OnInit {
  public memberSearch: string;
  // private taskMembers: SharedUser[];

  constructor(
    public dialogRef: MatDialogRef<MemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MemberDialogData,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.data.addedMembers) {
      console.log("Initialted Added Members List");
      this.data.addedMembers = [];
    }
    // Check if current memebr is in members list else add it
    const currentUser = {
      id: this.authService.getUID(),
      name: this.authService.getUserDisplayName(),
    };
    let userFound = false;
    this.data.members.every((member) => {
      if (member.id == currentUser.id) {
        userFound = true;
        return false;
      }
    });
    if (!userFound) {
      this.data.members.splice(0, 0, currentUser);
    }
    this.calculateAddedMember();
  }

  calculateAddedMember() {
    console.log(this.data.members);
    console.log(this.data.addedMembers);
    this.data.members.forEach((member) => {
      const memberIndex = this.data.addedMembers.findIndex(
        (mem) => mem.id == member.id
      );
      if (memberIndex > -1) {
        member.isAdded = true;
      } else {
        member.isAdded = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.data);
  }

  showAllMembers() {
    console.log("Showing all members");
  }

  addRemoveMemberFromTask(member: SharedUser) {
    console.log(member);
    console.log(this.data.addedMembers);
    console.log(this.data.addedMembers.indexOf(member));

    const memberIndex = this.data.addedMembers.findIndex(
      (mem) => mem.id == member.id
    );
    if (memberIndex > -1) {
      this.data.addedMembers.splice(memberIndex, 1);
    } else {
      this.data.addedMembers.push(member);
    }

    this.calculateAddedMember();
  }
}

export interface MemberDialogData {
  members: SharedUser[];
  addedMembers: SharedUser[];
}

export interface MemberDialogResult {
  members: SharedUser[];
  addedMembers: SharedUser[];
}
