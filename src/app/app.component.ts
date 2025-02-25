import { Component, HostListener } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "app";
  //commented the code due to lag in application
  // @HostListener("document:keydown", ["$event"]) onKeydownHandler(
  //   event: KeyboardEvent
  // ) {
  //   if (event.ctrlKey && event["keyCode"] === 80) {
  //     return false;
  //   }
  // }
}
