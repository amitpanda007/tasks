import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "filter-search",
  template: `
    <input
      class="search-input"
      name="search"
      type="text"
      placeholder={{placeholder}}
      [(ngModel)]="text"
      autocomplete="off"
    />
  `,
  styles: [
    `
      .search-input {
        -moz-box-shadow: 0 10px 35px rgba(0, 0, 0, 0.1);
        -webkit-appearance: none !important;
        -webkit-box-shadow: 0 10px 35px rgba(0, 0, 0, 0.1);
        background: #fff;
        border: 0;
        border-radius: 5px;
        box-shadow: 0 10px 35px rgba(0, 0, 0, 0.1);
        color: #6c757d;
        font-size: 0.9rem;
        height: 1.2rem;
        outline: none;
        padding: 0.6rem 0.6rem 0.6rem 1.5rem;
        // width: calc(100% - 4rem);
        width: 12.4rem;
      }
    `,
  ],
})
export class FilterSearchComponent implements OnInit {
  private _text: string;
  @Input() placeholder: string;
  @Input() get text() {
    return this._text;
  }

  set text(val: string) {
    this._text = val;
    this.changed.emit(this.text);
  }

  @Output() changed: EventEmitter<string> = new EventEmitter<string>();

  constructor() {}

  ngOnInit() {}
}