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
    this.boardListSubscription = this.boardService.boardsChanged.subscribe(_boards => {
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

  async copy() {
    let newDueDate = undefined;
    let newCheckList = undefined;

    if(this.keepChecklist) {
      newCheckList = this.data.task.checklist
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
      filteredLabels.forEach(label => {
        label.taskIds.push(taskId);
        this.boardService.updateLabel(this.selectedBoard.id, label.id, label);
      });
    }

    this.dialogRef.close();
  }

  async boardSelected($event) {
    this.selectedBoard = $event.value;
    this.boardService.getTaskList(this.selectedBoard.id);
    this.taskListSubscription = this.boardService.taskListsChanged.subscribe(_tasklist => {
      this.taskLists = _tasklist;
    });
  }

  async listSelected($event) {
    this.selectedList = $event.value;
  }
}

export interface CopyDialogData {
  task: Task;
  labels: Label[];
}

export interface CopyDialogResult {
  name: string;
}
