import { Pipe, PipeTransform } from "@angular/core";
import { firestore } from "firebase";

@Pipe({ name: "dateformat" })
export class DateFormatPipe implements PipeTransform {
  transform(value: any, options: any): any {
    if (value && value.hasOwnProperty("seconds")) {
      console.log("Converting Firebase Timestamp");
      let date = (value as firestore.Timestamp).toDate();
      if (options == "short") {
        return this.dateFormatShort(date);
      }
      return this.defaultDateFormat(date);
    } else {
      console.log("Converting Regular Timestamp");
      let date = new Date(value);
      if (options == "short") {
        return this.dateFormatShort(date);
      }
      return this.defaultDateFormat(date);
    }
  }

  defaultDateFormat(date: Date) {
    const newDate = date.toLocaleString("en-US", {
      weekday: "short", // long, short, narrow
      day: "numeric", // numeric, 2-digit
      year: "numeric", // numeric, 2-digit
      month: "long", // numeric, 2-digit, long, short, narrow
    });
    return newDate;
  }

  dateFormatShort(date: Date) {
    const newDate = date.toLocaleString("en-US", {
      day: "numeric", // numeric, 2-digit
      month: "short", // numeric, 2-digit, long, short, narrow
    });
    return newDate;
  }
}
