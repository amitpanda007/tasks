import { firestore } from "firebase";

export interface DueDate {
  date?: firestore.Timestamp;
  completed?: boolean;
}
