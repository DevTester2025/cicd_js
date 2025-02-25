import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import * as _ from "lodash";
import { LocalStorageService } from "../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../app.constant";

@Component({
  selector: "app-srm",
  templateUrl: "../../presentation/web/srm/srm.component.html",
})
export class SrmComponent implements OnInit {
  userstoragedata = {} as any;
  screens = [];
  appScreens = {} as any;
  createGenericFlag = false;
  createServiceFlag = false;
  loading = true;
  constructor(
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SERVICE_CATALOG_REQUEST,
    });

    if (_.includes(this.appScreens.actions, "Create")) {
      this.createGenericFlag = true;
      this.createServiceFlag = true;
    }
  }

  ngOnInit() {}
  navigate() {
    this.router.navigate(["srm/generic/create"]);
  }
  notfiyEntry(event) {
    this.loading = event;
  }
}
