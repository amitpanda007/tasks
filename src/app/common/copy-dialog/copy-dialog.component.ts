import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BoardService } from "../../core/services/board.service";
import { Subscription } from "rxjs";
import { Board } from "../../boards/board/board";
import { TaskList } from "../../tasks/task-list/tasklist";
import { Task } from "../../tasks/task/task";
import { Label } from "../../tasks/task/label";
import * as cloneDeep from "lodash/cloneDeep";

@Component({
  selector: "app-copy-dialog",
  templateUrl: "./copy-dialog.component.html",
  styleUrls: ["./copy-dialog.component.scss"],
})
export class CopyDialogComponent implements OnInit {
  private copyBoardListSubscription: Subscription;
  private copyTaskListSubscription: Subscription;
  public selectedBoard: Board;
  public selectedList: TaskList;
  public copyBoards: Board[];
  public copyTaskLists: TaskList[];
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
    // this.boardService.getBoards();
    this.copyBoardListSubscription = this.boardService
      .getBoardsWithoutObserver()
      .subscribe((_boards) => {
        console.log(_boards);
        this.copyBoards = _boards;
      });
  }

  ngOnDestroy(): void {
    this.copyBoardListSubscription.unsubscribe();
    if (this.copyTaskListSubscription) {
      this.copyTaskListSubscription.unsubscribe();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  async copy() {
    let newDueDate = null;
    let newCheckList = [];

    if (this.keepChecklist) {
      if (this.data.task.checklist && this.data.task.checklist.length > 0) {
        newCheckList = this.data.task.checklist;
      }
    }
    if (this.keepDueDate) {
      newDueDate = this.data.task.dueDate;
    }

    //FIXME: inxed needs to be determine where the task is getting copied to.
    const newTask = {
      index: 0,
      title: this.titleText,
      description: this.data.task.description,
      backgroundColor: this.data.task.backgroundColor,
      listId: this.selectedList.id,
      dueDate: newDueDate,
      checklist: newCheckList,
    };
    console.log(newTask);
    const taskId = await this.boardService.addTask(
      this.selectedBoard.id,
      newTask
    );

    if (this.keepLabels) {
      const filteredLabels = this.data.labels.filter((label) => {
        if (label.taskIds) {
          return label.taskIds.includes(this.data.task.id);
        }
      });
      console.log(filteredLabels);
      filteredLabels.forEach(async (label) => {
        if (this.selectedBoard.id == this.data.boardId) {
          label.taskIds.push(taskId);
          console.log(this.selectedBoard.id, this.data.boardId);
          this.boardService.updateLabel(this.selectedBoard.id, label.id, label);
        } else {
          let foundLabel: any = await this.boardService.findLabelPromise(
            this.selectedBoard.id,
            label
          );
          console.log(`Current Label: ${label.name}`);
          console.log(foundLabel);
          if (foundLabel == undefined) {
            console.log("Label Not Found. Adding New Label");
            // Remove current board label information
            const clonedLabel = cloneDeep(label);
            clonedLabel.taskIds = [];
            clonedLabel.taskIds.push(taskId);
            this.boardService.addLabelWithGivenId(
              this.selectedBoard.id,
              clonedLabel.id,
              clonedLabel
            );
          } else {
            foundLabel.taskIds.push(taskId);
            console.log("Existing Label Found");
            this.boardService.updateLabel(
              this.selectedBoard.id,
              foundLabel.id,
              foundLabel
            );
          }
        }
      });
    }

    this.dialogRef.close();
  }

  async boardSelected($event) {
    this.selectedBoard = $event.value;
    this.copyTaskListSubscription = this.boardService
      .getTaskListWithoutSubscription(this.selectedBoard.id)
      .subscribe((_tasklist) => {
        this.copyTaskLists = _tasklist;
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
