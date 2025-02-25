import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
@Component({
  selector: "app-releases",
  templateUrl: "./releases.component.html",
  styleUrls: ["./releases.component.css"],
})
export class ReleasesComponent implements OnInit {
  tabIndex = 0;
  buttonText = "Add";
  constructor(private router: Router, private routes: ActivatedRoute) {}

  ngOnInit() {
    this.routes.queryParams.subscribe((params) => {
      this.tabIndex = parseInt(params["tabIndex"] || "0");
    });
  }
  addReleases() {
    this.router.navigate(["cicd/release/create"]);
  }  
  onTabChange(index: number) {
    if (index === 1) {
      this.router.navigate([], {
        queryParams: {
          tabIndex: 1,
        },
      });
    } else {
      this.router.navigate([], {
        queryParams: {
          tabIndex: 0,
        },
      });
    }
  }
}
