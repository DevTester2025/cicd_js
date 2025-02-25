import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AppConstant } from "../../../../../app.constant";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { Ecl2Service } from "../../ecl2-service";
import * as _ from "lodash";

@Component({
  selector: "app-cloudmatiq-ecl2-lb-view",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/lb/lb-view/lb-view.component.html",
})
export class ECL2LbViewComponent implements OnInit {
  userstoragedata = {} as any;
  lbid: any;
  loading = false;
  ecl2lbObj: any = {};
  listeners: any;
  subnet: any;
  awssolution: any = [];
  constructor(
    public router: Router,
    private routes: ActivatedRoute,
    private ecl2Service: Ecl2Service,
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
    this.ecl2Service.lbbyId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.loading = false;
        this.ecl2lbObj = response.data;
      } else {
        this.loading = false;
        this.ecl2lbObj = {};
      }
    });
  }
}
