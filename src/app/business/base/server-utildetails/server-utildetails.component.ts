import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  Input,
} from "@angular/core";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ServerUtilsService } from "src/app/business/base/server-utildetails/services/server-utils.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "src/app/modules/services/shared/common.service";

@Component({
  selector: "app-server-utildetails",
  templateUrl:
    "../../../presentation/web/base/server-utildetails/server-utildetails.component.html",
})
export class ServerUtilDetailsComponent implements OnInit {
  @Input() utilizationDetailConfigs: any;
  screens = [];
  current = "dashboard";
  currentConfigs = {} as any;
  userstoragedata: any = {};
  serverObj: any = {};
  customerObj: any = {};
  constructor(
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private router: Router,
    private serverUtilsService: ServerUtilsService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.currentConfigs = this.serverUtilsService.getItems();
    if (this.currentConfigs) {
      this.utilizationDetailConfigs = {
        utiltype: this.currentConfigs.utiltype,
        utilkey: this.currentConfigs.utilkey,
        instancerefid: this.currentConfigs.instancerefid,
        instancetyperefid: this.currentConfigs.instancetyperefid,
        date: this.currentConfigs.date,
        tenantid: this.currentConfigs.tenantid,
        utilkeyTitle: this.currentConfigs.utilkeyTitle,
      };
    }
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}

  changeView(to: string) {
    this.current = to;
  }
  closeWindow() {
    this.router.navigate(["/serverutils"], {
      queryParams: {
        detailes: true,
      },
    });
  }
}
