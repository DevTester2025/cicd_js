import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { Router } from "@angular/router";
import { AppConstant } from "../../../../app.constant";
import * as _ from "lodash";
import { SolutionService } from "../solution.service";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { CostSetupService } from "../../../../business/base/assets/costsetup/costsetup.service";

@Component({
  selector: "app-costsummary",
  styleUrls: [
    "../../../../presentation/web/tenant/solutiontemplate/solution.component.less",
  ],
  templateUrl:
    "../../../../presentation/web/tenant/solutiontemplate/costsummary/costsummary.component.html",
})
export class CostsummaryComponent implements OnInit, OnChanges {
  @Input() solutionData: any = {};
  @Input() disableEdit: any;
  @Output() solutionCostChanges: EventEmitter<any> = new EventEmitter();
  solutionCosts: any = [];
  tagTableHeader = [
    { field: "assetname", header: "Particulars", datatype: "string" },
    { field: "priceperunit", header: "Price", datatype: "string" },
    { field: "pricingmodel", header: "Pricing Model", datatype: "string" },
    { field: "totalprice", header: "Cost (Monthly)", datatype: "string" },
  ];

  tagTableConfig = {
    edit: true,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    clone: false,
    pageSize: 10,
    // scroll: { x: '130%' },
    title: "",
    widthConfig: ["30px", "20px"],
  };
  userstoragedata = {} as any;
  costObj = {} as any;
  formTitle = "";
  buttonText = "";
  isVisible = false;
  loading = false;
  enableEdit = true;
  costVisualList: any = [];
  pricingModel: any = [];
  monthlyValue: any = {};
  allsolutioncostList: any = [];
  totalcostpermonth: any;
  totalprice: any;
  constructor(
    private lsService: LocalStorageService,
    private router: Router,
    private solutionService: SolutionService,
    private commonService: CommonService,
    private costSetupService: CostSetupService,
    private message: NzMessageService
  ) {
    this.userstoragedata = this.lsService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes &&
      changes.solutionData.currentValue &&
      Object.keys(changes.solutionData.currentValue).length > 0
    ) {
      this.getAllList();
      this.getPricing();
      console.log("Re fetching cost:::::::::::::::");
    }
  }

  ngOnInit() {
    this.enableEdit = true;
    console.log(this.solutionData);
    if (this.disableEdit) {
      this.enableEdit = false;
      this.tagTableConfig.globalsearch = false;
      this.tagTableConfig.pagination = false;
      this.tagTableConfig.edit = false;
    }
    // this.getAllList();
    // this.getPricing();
  }
  getPricing() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.PRICING_MODEL,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        this.loading = false;
        if (response.status) {
          response.data.forEach((element) => {
            if (element.keyname == AppConstant.LOOKUPKEY.MONTHLY) {
              this.monthlyValue = element;
            }
          });
          this.pricingModel = response.data;
        } else {
          this.pricingModel = [];
          this.monthlyValue = {};
        }
      });
  }
  getAllList() {
    this.solutionCosts = [];
    this.allsolutioncostList = [];
    this.loading = true;
    this.solutionService
      .allcosts({
        cloudprovider: this.solutionData.cloudprovider,
        tenantid: this.userstoragedata.tenantid,
        solutionid: this.solutionData.solutionid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          let assetObj: any = _.find(response.data, { costtype: "Asset" });
          let currency = assetObj.costvisual.currency;
          let self = this;
          _.map(response.data, function (i: any) {
            i.totalprice = currency + " " + Number(i.baseprice).toFixed(2);
            i.pricingmodel = i.costvisual
              ? i.costvisual.pricingmodel
              : AppConstant.LOOKUPKEY.MONTHLY;
            i.priceperunit = i.costvisual
              ? i.costvisual.priceperunit
              : i.baseprice;
            // i.baseprice = i.costvisual ? i.costvisual.priceperunit : i.baseprice;
            if (i.assetid == null && i.assetname) {
              let obj = i as any;
              obj.assetname = i.assetname;
              obj.plantype = i.assetname;
              obj.resourcetype = "Others";
              self.forData(obj);
            }
            return i;
          });
          this.totalcostpermonth = _.sumBy(response.data, function (o: any) {
            return Number(o.baseprice);
          });
          this.totalprice = _.sumBy(response.data, function (o: any) {
            return Number(o.priceperunit);
          });
          this.totalcostpermonth = this.totalcostpermonth
            ? currency + " " + this.totalcostpermonth.toFixed(2)
            : "";
          // this.solutionCosts = response.data;
          // this.solutionCosts = [...this.solutionCosts];
          this.allsolutioncostList = [...response.data];
          this.loading = false;
        } else {
          this.solutionCosts = [];
          this.loading = false;
        }

        if (this.solutionData.cloudprovider == "ECL2") {
          this.getByIDECL2();
        }
        if (this.solutionData.cloudprovider == "AWS") {
          this.getByIdAWS();
        }
      });
  }
  showModal(): void {
    this.costObj = {};
    this.formTitle = AppConstant.SOLUTIONCOSTS.ADD;
    this.buttonText = AppConstant.SOLUTIONCOSTS.ADD;
    this.isVisible = true;
  }
  rightbarChanged(val) {
    this.isVisible = val;
  }
  forData(data) {
    data.solutionid = this.solutionData.solutionid;
    data.tenantid = this.solutionData.tenantid;
    data.costtype = "Asset";
    // data.baseprice = 0;
    data.pricingmodel = AppConstant.LOOKUPKEY.MONTHLY;
    data.totalprice = data.totalprice;
    data.status = AppConstant.STATUS.ACTIVE;
    data.createdby = this.userstoragedata.fullname;
    data.createddt = new Date();
    let existdata: any = _.find(this.allsolutioncostList, {
      assetname: data.assetname,
    });
    if (existdata != undefined) {
      this.solutionCosts.push(existdata);
    } else {
      this.solutionCosts.push(data);
    }
  }

  processData(data) {
    let obj = {} as any;
    if (this.solutionData.cloudprovider == "ECL2") {
      if (!_.isEmpty(data.ecl2solutions)) {
        data.ecl2solutions.forEach((element) => {
          // Check Image
          obj = {
            assetname: element.ecl2instancetype.instancetypename,
            plantype: element.ecl2instancetype.instancetypename,
            image: element.ecl2images.platform,
            resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[8],
            assetid: element.ecl2solutionid,
          };
          this.forData(obj);

          // Check volume
          if (!_.isEmpty(element.volumes) && !_.isEmpty(element.volumes.size)) {
            obj = {
              assetname: element.volumes.volumename,
              plantype: element.volumes.size.toString(),
              resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[12],
              assetid: element.volumeid,
            };
            this.forData(obj);
          }

          // Check Firewall
          if (!_.isEmpty(element.ecl2vsrx)) {
            obj = {
              assetname: element.ecl2vsrx.vsrxname,
              plantype: element.ecl2vsrx.ecl2vsrxplan.vsrxplanname,
              resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[6],
              assetid: element.ecl2vsrx.vsrxid,
            };
            this.forData(obj);
          }
        });
      }
      if (!_.isEmpty(data.ecl2loadbalancers)) {
        data.ecl2loadbalancers.forEach((element) => {
          if (element != null && element.status == AppConstant.STATUS.ACTIVE) {
            obj = {
              assetname: element.lbname,
              plantype: element.loadbalancerplan,
              resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[5],
              assetid: element.loadbalancerid,
            };
            this.forData(obj);
          }
        });
      }
    }

    if (this.solutionData.cloudprovider == "AWS") {
      if (!_.isEmpty(data.awssolutions)) {
        data.awssolutions.forEach((element) => {
          // Check Image
          obj = {
            assetname: element.awsinsttype.instancetypename,
            plantype: element.awsinsttype.instancetypename,
            image: element.awsami.platform,
            resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[8],
            assetid: element.awssolutionid,
          };
          this.forData(obj);

          // Check Volume
          if (!_.isEmpty(element.volumes)) {
            element.volumes.forEach((vol) => {
              obj = {
                assetname: vol.volumetype,
                plantype: vol.sizeingb.toString() + " GB",
                resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[12],
                assetid: vol.volumeid,
              };
              this.forData(obj);
            });
          }

          // // Check VPC
          // if (!_.isEmpty(element.awsvpc)) {
          //   obj = {
          //     assetname: element.awsvpc.vpcname,
          //     plantype: null,
          //     resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[4],
          //     assetid: element.awsvpc.vpcid
          //   };
          //   this.forData(obj);
          // }
        });
      }
      if (!_.isEmpty(data.lb)) {
        data.lb.forEach((element) => {
          obj = {
            assetname: element.lbname,
            plantype: null,
            resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[5],
            assetid: element.lbid,
          };
          this.forData(obj);
        });
      }
    }
    console.log(this.solutionCosts);
    this.solutionCosts = [...this.solutionCosts];
    let newObj: any = _.find(this.solutionCosts, function (i: any) {
      if (i.solutioncostid == undefined || i.solutioncostid == null) {
        return i;
      }
    });
    console.log(newObj);
    if (newObj != undefined) {
      this.getCostVisuals();
    }
  }
  getByIDECL2() {
    this.solutionService
      .ecl2byId(this.solutionData.solutionid)
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.processData(response.data);
        }
      });
  }
  getByIdAWS() {
    let response = {} as any;
    this.solutionService
      .byId(this.solutionData.solutionid)
      .subscribe((data) => {
        response = JSON.parse(data._body);
        if (response.status) {
          this.processData(response.data);
        }
      });
  }
  getCostVisuals() {
    let condition = {
      cloudprovider: this.solutionData.cloudprovider,
      region: this.solutionData.region,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    if (this.solutionData.cloudprovider == "ECL2") {
      condition.region = this.solutionData.zone.region;
    }
    if (this.solutionCosts.length > 0) {
      condition.plantypes = [];
      condition.resourcetypes = [];
      this.solutionCosts.forEach((i) => {
        if (i.solutioncostid == undefined && i.solutioncostid == null) {
          condition.plantypes.push(i.plantype);
          condition.resourcetypes.push(i.resourcetype);
        }
      });
    }
    this.costSetupService.all(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.costVisualList = response.data;
      } else {
        this.costVisualList = [];
      }
      let newObj: any = _.find(this.solutionCosts, function (i: any) {
        if (i.solutioncostid == undefined || i.solutioncostid == null) {
          return i;
        }
      });
      if (newObj != undefined && this.costVisualList.length > 0) {
        this.priceCalculation();
      } else {
        let removeobj: any = _.remove(this.solutionCosts, function (i: any) {
          if (i.priceperunit == undefined) {
            return i;
          }
        });
        this.solutionCosts = [...this.solutionCosts];
      }
    });
  }
  priceCalculation() {
    this.loading = true;
    if (
      this.solutionCosts &&
      this.solutionCosts.length > 0 &&
      this.costVisualList &&
      this.costVisualList.length > 0
    ) {
      for (let i = 0; i < this.solutionCosts.length; i++) {
        if (
          this.solutionCosts[i].solutioncostid == undefined ||
          this.solutionCosts[i].solutioncostid == null
        ) {
          this.costVisualList.forEach((element) => {
            // For instances
            if (
              element.resourcetype == this.solutionCosts[i].resourcetype &&
              element.plantype == this.solutionCosts[i].plantype &&
              element.image == this.solutionCosts[i].image
            ) {
              this.solutionCosts[i].costvisualid = element.costvisualid;
              this.solutionCosts[i].priceperunit = element.priceperunit;
              this.solutionCosts[i].pricingmodel = element.pricingmodel;
              if (element.pricingmodel == AppConstant.LOOKUPKEY.MONTHLY) {
                this.solutionCosts[i].baseprice = element.priceperunit;
              } else {
                this.solutionCosts[i].baseprice =
                  this.commonService.getMonthlyPrice(
                    this.pricingModel,
                    element.pricingmodel,
                    element.priceperunit,
                    element.currency,
                    true
                  );
              }
              this.solutionCosts[i].totalprice =
                element.currency + " " + this.solutionCosts[i].baseprice;
            }

            // For others
            if (
              element.resourcetype == this.solutionCosts[i].resourcetype &&
              element.plantype == this.solutionCosts[i].plantype
            ) {
              this.solutionCosts[i].costvisualid = element.costvisualid;
              this.solutionCosts[i].priceperunit = element.priceperunit;
              this.solutionCosts[i].pricingmodel = element.pricingmodel;
              if (element.pricingmodel == AppConstant.LOOKUPKEY.MONTHLY) {
                this.solutionCosts[i].baseprice = element.priceperunit;
              } else {
                this.solutionCosts[i].baseprice =
                  this.commonService.getMonthlyPrice(
                    this.pricingModel,
                    element.pricingmodel,
                    element.priceperunit,
                    element.currency,
                    true
                  );
              }
              this.solutionCosts[i].totalprice =
                element.currency + " " + this.solutionCosts[i].baseprice;
            }
          });
        }
      }

      if (this.solutionCosts.length > 0) {
        console.log(this.solutionCosts);
        let removeobj: any = _.remove(this.solutionCosts, function (i: any) {
          if (i.priceperunit == undefined) {
            return i;
          }
        });
        this.solutionCosts = [...this.solutionCosts];
        this.loading = false;
        this.upsertCosts(this.solutionCosts);
      }
    } else {
      let removeobj: any = _.remove(this.solutionCosts, function (i: any) {
        if (i.priceperunit == undefined) {
          return i;
        }
      });
      this.solutionCosts = [...this.solutionCosts];
      this.loading = false;
      this.upsertCosts(this.solutionCosts);
    }
  }

  upsertCosts(data) {
    let removeobj: any = _.remove(data, function (i: any) {
      if (i.solutioncostid) {
        return i;
      }
    });
    if (data.length > 0) {
      console.log(data);
      this.solutionService.bulkcreatecosts(data).subscribe((result) => {
        const response = JSON.parse(result._body);
        if (response.status) {
          //  this.getAllList();
        }
      });
    }
  }

  notifyNewEntry(event) {
    this.isVisible = false;
    this.getAllList();
  }

  dataChanged(result) {
    if (result.edit) {
      this.isVisible = true;
      this.costObj = result.data;
    }
  }
}
