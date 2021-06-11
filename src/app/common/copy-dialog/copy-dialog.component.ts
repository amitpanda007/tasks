import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { firestore } from "firebase";
import { BoardService } from '../../core/services/board.service';
import { Subscription } from 'rxjs';
import { Board } from '../../boards/board/board';
import { TaskList } from '../../tasks/task-list/tasklist';
import { Task } from '../../tasks/task/task';
import { Label } from '../../tasks/task/label';

@Component({
  selector: "app-copy-dialog",
  templateUrl: "./copy-dialog.component.html",
  styleUrls: ["./copy-dialog.component.scss"],
})
export class CopyDialogComponent implements OnInit{
  private boardListSubscription: Subscription;
  private taskListSubscription: Subscription;
  public selectedBoard: Board;
  public selectedList: TaskList;
  public boards: Board[];
  public taskLists: TaskList[];
  public primaryColor: string;
  public titleText: string;

  public keepChecklist: boolean = true;
  public keepLabels: boolean = true;
  public keepDueDate: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<CopyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CopyDialogData,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.primaryColor = "primary";
    this.titleText = this.data.task.title;
    this.boardService.getBoards();
    this.boardListSubscription = this.boardService.getBoardsWithoutObserver().subscribe(_boards => {
      console.log(_boards);
      this.boards = _boards;
    });
  }

  ngOnDestroy(): void {
    this.boardListSubscription.unsubscribe();
    if(this.taskListSubscription) {
      this.taskListSubscription.unsubscribe();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  //TODO: Fix copy for labels when its same board & its a new board
  async copy() {
    let newDueDate = null;
    let newCheckList = [];

    if(this.keepChecklist) {
      if(this.data.task.checklist && this.data.task.checklist.length > 0) {
        newCheckList = this.data.task.checklist;
      }
    }
    if(this.keepDueDate) {
      newDueDate = this.data.task.dueDate
    }

    const newTask = {
      title: this.titleText,
      description: this.data.task.description,
      backgroundColor: this.data.task.backgroundColor,
      listId: this.selectedList.id,
      dueDate: newDueDate,
      checklist: newCheckList
    }
    console.log(newTask);
    const taskId = await this.boardService.addTask(this.selectedBoard.id, newTask);

    if(this.keepLabels) {
      const filteredLabels = this.data.labels.filter(label =>  {
        if(label.taskIds) {
          return (
            label.taskIds.includes(this.data.task.id)
          );
        }
      })
      console.log(filteredLabels);
      filteredLabels.forEach(async label => {
        label.taskIds.push(taskId);
        if(this.selectedBoard.id == this.data.boardId) {
          this.boardService.updateLabel(this.selectedBoard.id, label.id, label);
        }else {
          console.log(`Current Label: ${label.name}`);
          const foundLabelColl = await this.boardService.findLabel(this.selectedBoard.id, label);
          // console.log(foundLabel);
          // if(foundLabel.length > 0) {
          //   console.log("Existing Label Found");
          //   this.boardService.updateLabel(this.selectedBoard.id, label.id, label);
          // }else {
          //   console.log("Label Not Found. Adding New Label");
          //   this.boardService.addLabel(this.selectedBoard.id, label);
          // }
        }
      });
    }

    this.dialogRef.close();
  }

  async boardSelected($event) {
    this.selectedBoard = $event.value;
    this.taskListSubscription = this.boardService.getTaskListWithoutSubscription(this.selectedBoard.id).subscribe(_tasklist => {
      this.taskLists = _tasklist;
    });
  }

  async listSelected($event) {
    this.selectedList = $event.value;
  }
}

export interface CopyDialogData {
  boardId: string;
  task: Task;
  labels: Label[];
}

export interface CopyDialogResult {
  name: string;
}
