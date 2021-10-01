import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { Board } from "../../boards/board/board";
import { TaskList } from "../../tasks/task-list/tasklist";
import { Task } from "../../tasks/task/task";
import { Label } from "../../tasks/task/label";
import * as cloneDeep from "lodash/cloneDeep";
import { BoardServiceV2 } from "src/app/core/services/boardv2.service";

@Component({
  selector: "app-copy-dialog",
  templateUrl: "./copy-dialog.component.html",
  styleUrls: ["./copy-dialog.component.scss"],
})
export class CopyDialogComponent implements OnInit {
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
    private boardServiceV2: BoardServiceV2
  ) {}

  ngOnInit(): void {
    this.primaryColor = "primary";
    this.titleText = this.data.task.title;

    // this.boardService.getBoards();
    // this.boardServiceV2
    //   .getBoardsWithoutObserver()
    //   .then((_boards) => {
    //     console.log(_boards);
    //     this.copyBoards = _boards;
    //   });

      this.copyBoards = [];
      this.boardServiceV2
      .getBoardsAsync()
      .then((_boards) => {
        console.log(_boards);
        _boards.forEach((board) => {
          const data = board.data() as Board;
          data.id = board.id;
          this.copyBoards.push(data);
        });
      });
  }

  ngOnDestroy(): void {}

  cancel(): void {
    this.dialogRef.close();
  }

  // async copy() {
  //   let newDueDate = null;
  //   let newCheckList = [];

  //   if (this.keepChecklist) {
  //     if (this.data.task.checklists && this.data.task.checklists.length > 0) {
  //       newCheckList = this.data.task.checklists;
  //     }
  //   }
  //   if (this.keepDueDate) {
  //     newDueDate = this.data.task.dueDate;
  //   }

  //   //FIXME: inxed needs to be determine where the task is getting copied to.
  //   const newTask = {
  //     index: 0,
  //     title: this.titleText,
  //     description: this.data.task.description,
  //     backgroundColor: this.data.task.backgroundColor,
  //     listId: this.selectedList.id,
  //     dueDate: newDueDate,
  //     checklist: newCheckList,
  //     created: new Date(),
  //     modified: new Date(),
  //   };
  //   console.log(newTask);
  //   const taskId = await this.boardServiceV2.addTask(
  //     this.selectedBoard.id,
  //     newTask
  //   );

  //   if (this.keepLabels) {
  //     const filteredLabels = this.data.labels.filter((label) => {
  //       if (label.taskIds) {
  //         return label.taskIds.includes(this.data.task.id);
  //       }
  //     });
  //     console.log(filteredLabels);
  //     filteredLabels.forEach(async (label) => {
  //       if (this.selectedBoard.id == this.data.boardId) {
  //         label.taskIds.push(taskId);
  //         console.log(this.selectedBoard.id, this.data.boardId);
  //         this.boardServiceV2.updateLabel(this.selectedBoard.id, label.id, label);
  //       } else {
  //         let foundLabel: any = await this.boardServiceV2.findLabelPromise(
  //           this.selectedBoard.id,
  //           label
  //         );
  //         console.log(`Current Label: ${label.name}`);
  //         console.log(foundLabel);
  //         if (foundLabel == undefined) {
  //           console.log("Label Not Found. Adding New Label");
  //           // Remove current board label information
  //           const clonedLabel = cloneDeep(label);
  //           clonedLabel.taskIds = [];
  //           clonedLabel.taskIds.push(taskId);
  //           this.boardServiceV2.addLabelWithGivenId(
  //             this.selectedBoard.id,
  //             clonedLabel.id,
  //             clonedLabel
  //           );
  //         } else {
  //           foundLabel.taskIds.push(taskId);
  //           console.log("Existing Label Found");
  //           this.boardServiceV2.updateLabel(
  //             this.selectedBoard.id,
  //             foundLabel.id,
  //             foundLabel
  //           );
  //         }
  //       }
  //     });
  //   }

  //   this.dialogRef.close();
  // }


  async copyBatch() {
    //FIXME: inxed needs to be determine where the task is getting copied to.
    const newTask: Task = {
      index: 0,
      title: this.titleText,
      description: this.data.task.description ? this.data.task.description : "",
      backgroundColor: this.data.task.backgroundColor ? this.data.task.backgroundColor : "",
      listId: this.selectedList.id,
      created: new Date(),
      modified: new Date(),
    };

    if (this.keepChecklist) {
      if (this.data.task.checklists && this.data.task.checklists.length > 0) {
        const newCheckList = this.data.task.checklists;
        newTask.checklists = newCheckList;
      }
    }
    if (this.keepDueDate) {
      const newDueDate = this.data.task.dueDate;
      newTask.dueDate = newDueDate;
    }
    
    let filteredLabels: Label[] = [];
    let updateLabels: Label[] = [];
    let createLabels: Label[] = [];
    let labelsFromNewBoard: Label[] = [];

    if (this.keepLabels) {
      filteredLabels = this.data.labels.filter((label) => {
        if (label.taskIds) {
          return label.taskIds.includes(this.data.task.id);
        }
      });

      if (this.selectedBoard.id == this.data.boardId) {
        // isUpdateLabel = true;
        updateLabels = filteredLabels;
      } else {
        // isCreateLabel = true;
        const labelSnapstot = await this.boardServiceV2.getLabelsSnapshot(this.selectedBoard.id);
        labelSnapstot.forEach(label => {
          const newLabel = label.data() as Label;
          newLabel.id = label.id;
          labelsFromNewBoard.push(newLabel);
        });

        console.log(labelsFromNewBoard);
        // Check if filtered labels exist in new board then add them to updateLabels else add them to createLabels
        filteredLabels.forEach((fltrLabel) => {
          let itemFound = false;
          labelsFromNewBoard.forEach(label => {
            if(fltrLabel.name == label.name) {
              updateLabels.push(label);
              itemFound = true;
            }
          });
          if(!itemFound) {
            createLabels.push(fltrLabel);
          }
        })
      }
    }

    console.log(newTask);
    console.log(updateLabels);
    console.log(createLabels);
    
    this.boardServiceV2.copyTaskBatch(newTask, this.selectedBoard.id, updateLabels, createLabels);
    this.dialogRef.close();
  }

  async boardSelected($event) {
    console.log($event);
    this.selectedBoard = $event.value;
    this.copyTaskLists = [];
    this.boardServiceV2
      .getTaskListAsync(this.selectedBoard.id)
      .then((_tasklist) => {
        _tasklist.forEach((list) =>{
          const data = list.data() as TaskList;
          data.id = list.id;
          this.copyTaskLists.push(data);
        });
      });
  }

  async listSelected($event) {
    console.log($event);
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
