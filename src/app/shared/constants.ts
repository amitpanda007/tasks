export const Constant = {
  STATUS_OPTIONS: [
    {
      id: 1,
      name: "ToDo",
      backgroundColor: "#CFD8DC",
      color: "#455A64",
    },
    {
      id: 2,
      name: "Open",
      backgroundColor: "#0048b0",
      color: "#ffffff",
    },
    {
      id: 3,
      name: "Inprogress",
      backgroundColor: "#BBDEFB",
      color: "#0D47A1",
    },
    {
      id: 4,
      name: "Done",
      backgroundColor: "#B9F6CA",
      color: "#2E7D32",
    },
    {
      id: 5,
      name: "Blocked",
      backgroundColor: "#FF9E80",
      color: "#D84315",
    },
  ],
  DUE_OPTIONS: [
    { text: "Has no due date", selected: false },
    { text: "Due in the next day", selected: false },
    { text: "Due in the next week", selected: false },
    { text: "Due in the next month", selected: false },
    { text: "Overdue", selected: false },
    { text: "Due date marked complete", selected: false },
    { text: "Not marked as complete", selected: false },
  ],
  DUE_OPTIONS_TEXT: {
    HAS_NO_DUE_DATE: "Has no due date",
    DUE_NEXT_DAY: "Due in the next day",
    DUE_NEXT_WEEK: "Due in the next week",
    DUE_NEXT_MONTH: "Due in the next month",
    OVERDUE: "Overdue",
    DUE_COMPLETED: "Due date marked complete",
    DUE_NOT_COMPLETE: "Not marked as complete",
  },
  SORT_ORDERS: {
    INDEX: "index",
    CREATED: "created",
    MODIFIED: "modified",
    DUEDATE: "dueDate",
    CHECKLIST: "checklist",
  },
  CARD_FILTERS: {
    LABEL: "label",
    MEMBER: "member",
    DUE: "due"
  },
  LABLE_FILTER_NO_LABEL: "No labels",
  LABLE_FILTER_NO_MEMBER: "No Member"
};
