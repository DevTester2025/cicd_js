import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-setup",
  templateUrl: "./setup.component.html",
  styleUrls: ["./setup.component.css"],
})
export class SetupComponent implements OnInit {
  isIndex: boolean;
  tabIndex = 0;
  currentPageIndex: number = 1;
  constructor(private router: Router, private routes: ActivatedRoute) { }

  ngOnInit() {
    this.routes.queryParams.subscribe((params) => {
      this.currentPageIndex = params['page'];
      this.tabIndex = parseInt(params["tabIndex"] || "0");
    });
  }

  onTabChange(index: number) {
    this.router.navigate(["cicd/setup"], {
      queryParams: { page: this.currentPageIndex, tabIndex: index }
    });
  };
};
