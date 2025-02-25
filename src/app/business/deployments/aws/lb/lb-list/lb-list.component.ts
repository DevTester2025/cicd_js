import { Component, OnInit } from "@angular/core";
import { AppConstant } from "../../../../../app.constant";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { DeploymentsService } from "../../../deployments.service";
import { Router } from "@angular/router";
import { Ecl2Service } from "../../../ecl2/ecl2-service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { element } from "protractor";
@Component({
  selector: "app-cloudmatiq-lb-list",
  templateUrl:
    "../../../../../presentation/web/deployments/aws/lb/lb-list/lb-list.component.html",
  styleUrls: [
    "../../../../../presentation/web/deployments/aws/lb/lb-list/lb-list.component.css",
  ],
})
export class AWSLbListComponent implements OnInit {
  userstoragedata = {} as any;
  // Table
  awslbList = [];
  lbObj = {} as any;
  tableHeader: any[] = [];
  tableConfig = {} as any;
  loading = true;
  provider: any = AppConstant.CLOUDPROVIDER.AWS;
  providerList: any = [];
  constructor(
    private deploysltnService: DeploymentsService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private ecl2Service: Ecl2Service,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.awslbList = [];
    this.tableConfig = {
      edit: false,
      delete: false,
      view: true,
      globalsearch: true,
      loading: false,
      pagination: true,
      pageSize: 10,
      scroll: { x: "1000px" },
      title: "",
      widthConfig: [
        "25px",
        "10px",
        "10px",
        "10px",
        "10px",
        "25px",
        "30px",
        "25px",
        "25px",
      ],
    };
  }
  ngOnInit() {
    this.getProviderList();
    this.getAllList();
  }
  getProviderList() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.CLOUDPROVIDER,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.providerList = response.data;
        } else {
          this.providerList = [];
        }
      });
  }
  onChange(event) {
    this.provider = event;
    if (
      this.provider != AppConstant.CLOUDPROVIDER.ECL2 &&
      this.provider != AppConstant.CLOUDPROVIDER.AWS
    ) {
      this.tableHeader = [
        { field: "lbname", header: "Load Balancer Name", datatype: "string" },
        { field: "hcport", header: "Port", datatype: "number" },
        { field: "hcinterval", header: "Interval", datatype: "number" },
        {
          field: "hchealthythreshold",
          header: "Healthy Threshold",
          datatype: "number",
        },
        {
          field: "hcunhealthythreshold",
          header: "Unhealthy Threshold",
          datatype: "number",
        },
        { field: "status", header: "Status", datatype: "string" },
        { field: "lastupdatedby", header: "Updated By", datatype: "string" },
        {
          field: "lastupdateddt",
          header: "Updated On",
          datatype: "timestamp",
          format: "dd-MMM-yyyy hh:mm:ss",
        },
      ];
      this.awslbList = [];
    } else if (this.provider == AppConstant.CLOUDPROVIDER.ECL2) {
      this.awslbList = [];
      this.getECL2LBList();
    } else if (this.provider == AppConstant.CLOUDPROVIDER.AWS) {
      this.awslbList = [];
      this.getAllList();
    }
  }
  getECL2LBList() {
    this.tableHeader = [
      { field: "lbname", header: "Load Balancer Name", datatype: "string" },
      {
        field: "loadbalancerplan",
        header: "Load Balancer Plan",
        datatype: "number",
      },
      {
        field: "availabilityzone",
        header: "Available Zone",
        datatype: "number",
      },
      { field: "status", header: "Status", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
    ];
    this.loading = true;
    this.ecl2Service
      .allecl2loadbalancer({
        tenantid: this.userstoragedata.tenantid,
        status: "Active",
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.loading = false;
          this.tableConfig.widthConfig = [
            "25px",
            "25px",
            "25px",
            "25px",
            "25px",
            "25px",
          ];
          this.awslbList = response.data;
        } else {
          this.loading = false;
          this.awslbList = [];
        }
      });
  }
  getAllList() {
    this.tableHeader = [
      { field: "lbname", header: "Load Balancer Name", datatype: "string" },
      { field: "hcport", header: "Port", datatype: "number" },
      { field: "hcinterval", header: "Interval", datatype: "number" },
      {
        field: "hchealthythreshold",
        header: "Healthy Threshold",
        datatype: "number",
      },
      {
        field: "hcunhealthythreshold",
        header: "Unhealthy Threshold",
        datatype: "number",
      },
      { field: "status", header: "Status", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
    ];
    this.loading = true;
    this.deploysltnService
      .allawsloadbalancers({ tenantid: this.userstoragedata.tenantid })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.awslbList = response.data;
        } else {
          this.loading = false;
          this.awslbList = [];
        }
      });
  }
  // Event emitted function to get the data from table
  dataChanged(result) {
    if (result.view) {
      this.lbObj = result.data;
      if (this.lbObj) {
        if (this.lbObj.lbid) {
          this.router.navigate(["loadbalancers/view/" + this.lbObj.lbid]);
        } else if (this.lbObj.loadbalancerid) {
          this.router.navigate([
            "loadbalancers/ecl2/view/" + this.lbObj.loadbalancerid,
          ]);
        }
      }
    }
  }
}
