import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";

@Component({
  selector: "app-cloudmatiq-skeleton",
  styles: [
    `
      .card {
        height: 100%;
        display: grid;
        color: white;
        min-height: 150px;
        justify-items: center;
        align-items: center;
      }
    `,
  ],
  templateUrl: "./sk.component.html",
})
export class SkeletonComponent implements OnInit, OnChanges {
  @Input() loading: boolean = false;
  @Input() message: string = "";

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}
}
