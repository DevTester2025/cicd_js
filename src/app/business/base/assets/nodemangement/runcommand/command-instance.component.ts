import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SSMService } from "../ssm.service";

@Component({
  selector: "app-cloudmatiq-commandinstance",
  templateUrl:
    "../../../../../presentation/web/base/assets/nodemangement/runcommand/command-instance.component.html",
  styles: [],
})
export class CommandInstanceOverviewComponent implements OnInit {
  commandList = [];
  userstoragedata = {} as any;
  @Input() region;
  @Input() instancerefid;
  @Input() commandobj;
  @Input() refresh;
  @Input() accountid;
  loading = false;
  constructor(
    private localStorageService: LocalStorageService,
    private ssmService: SSMService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    this.getCommandDesc();
  }
  getCommandDesc() {
    this.loading = true;
    let condition = {
      region: this.region,
      commandid: this.commandobj.CommandId,
      tenantid: this.userstoragedata.tenantid,
    };
    if (this.accountid != null && this.accountid != undefined) {
      condition["accountid"] = this.accountid;
    }
    this.ssmService.getCommandDesc(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      this.loading = false;
      if (response.status) {
        this.commandList = response.data["CommandInvocations"];
      }
    });
  }
}
