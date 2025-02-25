import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../../../app.constant";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { DeploymentsService } from "../../../deployments.service";
import * as _ from "lodash";

@Component({
  selector: "app-lb-view",
  templateUrl:
    "../../../../../presentation/web/deployments/aws/lb/lb-view/lb-view.component.html",
})
export class LbViewComponent implements OnInit {
  userstoragedata = {} as any;
  lbid: any;
  loading = false;
  awslbObj: any = {};
  listeners: any;
  subnet: any;
  awssolution: any = [];
  constructor(
    public router: Router,
    private deploymentsService: DeploymentsService,
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
    this.deploymentsService.loadbalancerbyId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.awslbObj = response.data;
        this.listeners = this.awslbObj.listeners.join(",");
        this.subnet = this.awslbObj.lbsubnet;
        const instance = _.map(this.awslbObj.awssolution, function (obj: any) {
          return obj.instancename;
        });
        this.awssolution = instance.length > 1 ? instance.join(",") : instance;
      } else {
        this.loading = false;
        this.awslbObj = {};
      }
    });
  }
}
