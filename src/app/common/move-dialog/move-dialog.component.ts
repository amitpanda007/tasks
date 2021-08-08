import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { BoardService } from "../../core/services/board.service";
import { Board } from "../../boards/board/board";
import { TaskList } from "../../tasks/task-list/tasklist";
import { Label } from "src/app/tasks/task/label";
import { Task } from "src/app/tasks/task/task";

@Component({
  selector: "app-move-dialog",
  templateUrl: "./move-dialog.component.html",
  styleUrls: ["./move-dialog.component.scss"],
})
export class MoveDialogComponent implements OnInit {
  private boardListSubscription: Subscription;
  private taskListSubscription: Subscription;
  public selectedBoard: Board;
  public selectedList: TaskList;
  public moveBoards: Board[];
  public moveTaskLists: TaskList[];

  constructor(
    public dialogRef: MatDialogRef<MoveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MoveDialogData,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    // this.boardService.getBoards();
    this.boardListSubscription = this.boardService
      .getBoardsWithoutObserver()
      .subscribe((_boards) => {
        console.log(_boards);
        this.moveBoards = _boards;
      });
  }

  ngOnDestroy(): void {
    this.boardListSubscription.unsubscribe();
    this.moveBoards = null;
    if (this.taskListSubscription) {
      this.taskListSubscription.unsubscribe();
      this.moveTaskLists = null;
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  async move() {
    if (this.selectedBoard && this.selectedList) {
      if (this.selectedBoard.id == this.data.boardId) {
        this.boardService.moveTasks(
          this.selectedBoard.id,
          this.data.task.id,
          this.selectedList.id
        );
        this.dialogRef.close({ targetListId: this.selectedList.id });
      } else {
        // Copy/Create Task in new board
        let newCehcklist = [];
        let newDueDate = null;
        if (this.data.task.checklists) {
          newCehcklist = this.data.task.checklists;
        }

        if (this.data.task.dueDate) {
          newDueDate = this.data.task.dueDate;
        }

        //FIXME: inxed needs to be determine where the task is getting moved to.
        const newTask = {
          index: 0,
          title: this.data.task.title,
          description: this.data.task.description,
          backgroundColor: this.data.task.backgroundColor,
          listId: this.selectedList.id,
          dueDate: newDueDate,
          checklist: newCehcklist,
          created: new Date(),
          modified: new Date(),
        };
        console.log(newTask);
        const taskId = await this.boardService.addTask(
          this.selectedBoard.id,
          newTask
        );

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
            this.boardService.updateLabel(
              this.selectedBoard.id,
              label.id,
              label
            );
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
              label.taskIds = [];
              label.taskIds.push(taskId);
              this.boardService.addLabelWithGivenId(
                this.selectedBoard.id,
                label.id,
                label
              );
            } else {
              foundLabel.taskIds.splice(
                foundLabel.taskIds.indexOf(this.data.task.id),
                1
              );
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

        //Delete task from current board
        this.boardService.deleteTask(this.data.boardId, this.data.task.id);
        this.dialogRef.close({ targetListId: null });
      }
    }
  }

  async boardSelected($event) {
    this.selectedBoard = $event.value;
    // this.boardService.getTaskList(this.selectedBoard.id);
    this.taskListSubscription = this.boardService
      .getTaskListWithoutSubscription(this.selectedBoard.id)
      .subscribe((_tasklist) => {
        this.moveTaskLists = _tasklist;
      });
  }

  async listSelected($event) {
    this.selectedList = $event.value;
  }
}

export interface MoveDialogData {
  task: Task;
  boardId: string;
  labels: Label[];
}

export interface MoveDialogResult {
  targetListId: string;
}
