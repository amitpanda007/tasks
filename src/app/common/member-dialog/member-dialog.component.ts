import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SharedUser } from "src/app/boards/board/board";
import { AuthService } from "src/app/core/services/auth.service";
import * as cloneDeep from "lodash/cloneDeep";

@Component({
  selector: "app-member-dialog",
  templateUrl: "./member-dialog.component.html",
  styleUrls: ["./member-dialog.component.scss"],
})
export class MemberDialogComponent implements OnInit {
  public memberSearch: string;
  public filteredMembers: SharedUser[];
  public showAllMemberBtn: boolean = false;
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

    this.updateFilteredMembers();
    // let clonedMembers = cloneDeep(this.data.members);
    // this.filteredMembers = clonedMembers.slice(0, 5);
  }

  updateFilteredMembers() {
    let clonedMembers = cloneDeep(this.data.members);
    this.filteredMembers = clonedMembers.slice(0, 5);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(this.data);
  }

  showAllMembers() {
    console.log("Showing all members");
    this.showAllMemberBtn = true;
    this.filteredMembers = this.data.members;
  }

  calculateAddedMember() {
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
    this.updateFilteredMembers();
  }

  filterMembers(data) {
    if (data) {
      this.filteredMembers = this.data.members.filter((candidateList: any) => {
        return (
          candidateList.name.toLowerCase().indexOf(data.toLowerCase()) > -1
        );
      });
    } else {
      this.filteredMembers = this.data.members;
    }
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
