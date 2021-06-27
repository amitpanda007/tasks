import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "shortname" })
export class ShortnamePipe implements PipeTransform {
  transform(value: string) {
    if (value) {
      return value
        .split(" ")
        .map((n) => n[0])
        .join("");
    }
    return value;
  }
}
