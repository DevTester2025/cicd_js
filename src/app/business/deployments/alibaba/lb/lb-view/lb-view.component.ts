import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../../../app.constant";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AlibabaService } from "../../alibaba-service";
import * as _ from "lodash";
@Component({
  selector: "app-cloudmatiq-ali-lb-view",
  templateUrl:
    "../../../../../presentation/web/deployments/alibaba/lb/lb-view/lb-view.component.html",
})
export class ALILbViewComponent implements OnInit {
  userstoragedata = {} as any;
  lbid: any;
  loading = false;
  alibabalbObj: any = {};
  listeners: any;

  constructor(
    public router: Router,
    private alibabaService: AlibabaService,
    private routes: ActivatedRoute,
    private localStorageService: LocalStorageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.routes.params.subscribe((params) => {
      if (params.id !== undefined) {
        this.lbid = params.id;
        this.getLBDetails(this.lbid);
      }
    });
  }
  ngOnInit() {}
  getLBDetails(id) {
    this.loading = true;
    this.alibabaService.getloadbalancerById(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.alibabalbObj = response.data;
      } else {
        this.loading = false;
        this.alibabalbObj = {};
      }
    });
  }
}
