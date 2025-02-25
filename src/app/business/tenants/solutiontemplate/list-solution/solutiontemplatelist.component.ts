import { Component, OnInit } from "@angular/core";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { Router } from "@angular/router";
import { AppConstant } from "../../../../app.constant";
import * as _ from "lodash";
import { SolutionService } from "../solution.service";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { SrmService } from "src/app/business/srm/srm.service";
import downloadService from "../../../../modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-solutiontemplate",
  templateUrl:
    "../../../../presentation/web/tenant/solutiontemplate/list-solution/solutiontemplatelist.component.html",
})
export class SolutionListComponent implements OnInit {
  solutionsList: any = [];
  sList: any = [];
  totalCount = null;
  loading: Boolean = false;
  provider: any;
  spinning = false;
  solutionsListHeaders = [
    { field: "solutionname", header: "Solution Name", datatype: "string" },
    { field: "cloudprovider", header: "Data Center", datatype: "string" },
    { field: "notes", header: "Description", datatype: "string" },
    { field: "vmsummary", header: "VM", datatype: "string" },
    { field: "scriptssummary", header: "Scripts", datatype: "string" },
    { field: "sgsummary", header: "Firewall", datatype: "string" },
    { field: "lbsummary", header: "LB", datatype: "string" },
    { field: "sla", header: "SLA", datatype: "string" },
    {
      field: "notificationsummary",
      header: "Notifications",
      datatype: "string",
    },
  ];

  solutionTableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: true,
    pagination: true,
    clone: false,
    publish: true,
    tabledownload: true,
    pageSize: 10,
    scroll: { x: "130%" },
    title: "",
    widthConfig: [
      "10px",
      "10px",
      "10px",
      "10px",
      "10px",
      "10px",
      "10px",
      "10px",
      "10px",
      "10px",
    ],
  };
  userstoragedata = {} as any;
  screens = [];
  appScreens = {} as any;
  createSolution = false;
  deploySolution = false;
  sortValue = null;
  sortName = null;
  pageCount = AppConstant.pageCount;
  pageSize = 10;
  originalData = [];
  searchText: string;
  providerList: any = [];
  showcosts = false;
  isdownload = false;
  selectedcolumns = [] as any;
  downloadflag = false;
  constructor(
    private lsService: LocalStorageService,
    private router: Router,
    private solutionService: SolutionService,
    private commonService: CommonService,
    private message: NzMessageService,
    private modal: NzModalService,
    private srmService: SrmService,
  ) {
    this.userstoragedata = this.lsService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.lsService.getItem(AppConstant.LOCALSTORAGE.SCREENS);
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SOLUTION_TEMPLATE_MANAGEMENT,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.createSolution = true;
    }
    if (_.includes(this.appScreens.actions, "Deploy")) {
      this.deploySolution = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.solutionTableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.solutionTableConfig.delete = true;
    }
    if (_.includes(this.appScreens.actions, "Clone")) {
      this.solutionTableConfig.clone = true;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.downloadflag = true;
    } 
    if (_.includes(this.appScreens.actions, "Cost")) {
      this.solutionsListHeaders = [
        { field: "solutionname", header: "Solution Name", datatype: "string" },
        { field: "cloudprovider", header: "Data Center", datatype: "string" },
        { field: "notes", header: "Description", datatype: "string" },
        { field: "vmsummary", header: "VM", datatype: "string" },
        { field: "scriptssummary", header: "Scripts", datatype: "string" },
        { field: "sgsummary", header: "Firewall", datatype: "string" },
        { field: "lbsummary", header: "LB", datatype: "string" },
        { field: "totalprice", header: "Costs", datatype: "number" },
        { field: "sla", header: "SLA", datatype: "string" },
        {
          field: "notificationsummary",
          header: "Notifications",
          datatype: "string",
        },
      ];
      this.solutionTableConfig.widthConfig.push("10px");
      this.showcosts = true;
    }
    if (this.solutionsListHeaders && this.solutionsListHeaders.length > 0) {
      this.selectedcolumns = this.solutionsListHeaders
    }
  }

  ngOnInit() {
    this.getProviderList();
  }
  onPageSizeChange(size: number) {
    this.pageSize = size;
    if (this.searchText && this.searchText.trim() !== "") {
      this.globalSearch(this.searchText);
    } else {
      this.getSolutionsList();
      this.pageSize = this.solutionsList.length;
    }
  }
  getProviderList() {
    this.loading = true;
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
          const defaultprovider = _.find(this.providerList, function (item) {
            if (item.defaultvalue === "Y") {
              return item;
            }
          });
          this.provider = defaultprovider.keyvalue;
          this.getSolutionsList();
        } else {
          this.providerList = [];
        }
      });
  }
  onChange(event) {
    this.provider = event;
    if (
      this.provider !== AppConstant.CLOUDPROVIDER.ECL2 &&
      this.provider !== AppConstant.CLOUDPROVIDER.AWS &&
      this.provider !== AppConstant.CLOUDPROVIDER.ALIBABA &&
      this.provider !== AppConstant.CLOUDPROVIDER.SENTIA &&
      this.provider !== AppConstant.CLOUDPROVIDER.NUTANIX &&
      this.provider !== AppConstant.CLOUDPROVIDER.EQUINIX
    ) {
      this.solutionsList = [];
    } else {
      this.solutionsList = [];
      this.getSolutionsList();
    }
  }
  sort(sort: { key: string; value: string }): void {
    this.sortName = sort.key;
    this.sortValue = sort.value;
    this.search();
  }
  search(): void {
    const data = this.originalData.filter((item) => item);
    if (this.sortName) {
      // tslint:disable-next-line:max-line-length
      this.solutionsList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.solutionsList = data;
    }
    this.totalCount = this.solutionsList.length;
  }
  globalSearch(searchText: any) {
    if (searchText !== "" && searchText !== undefined && searchText != null) {
      const self = this;
      this.solutionsList = [];
      this.originalData.map(function (item) {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const element = item[key];
            const regxExp = new RegExp("\\b" + searchText, "gi");
            if (regxExp.test(element)) {
              if (!_.some(self.solutionsList, item)) {
                self.solutionsList.push(item);
              }
            }
          }
        }
      });
    } else {
      this.solutionsList = this.originalData;
    }
    this.totalCount = this.solutionsList.length;
  }
  getSolutionsList() {
    let response = {} as any;
    this.loading = true;
    let condition = {} as any;
    condition = {
      cloudprovider: this.provider,
      tenantid: this.userstoragedata.tenantid,
    };
    let query;
    if (this.isdownload === true) {
      query = `isdownload=${this.isdownload}`;
      condition["headers"] = this.selectedcolumns;
    }
    condition.statusList = [
      AppConstant.STATUS.ACTIVE,
      AppConstant.STATUS.INACTIVE,
    ];
    this.solutionService.all(condition,query).subscribe(
      (data) => {
        response = JSON.parse(data._body);
        this.loading = false;
        if (response.status) {
          if (this.isdownload) {
            this.solutionTableConfig.loading = false;
            var buffer = Buffer.from(response.data.content.data);
            downloadService(
              buffer,
              "Solution_Template.xlsx"
            );
            this.isdownload = false;
          }
          else {
            this.solutionsList = response.data;
            this.totalCount = this.solutionsList.length;
            this.originalData = response.data;
            this.solutionTableConfig.loading = false;
            }
          if (response.data.length > 0) {
            for (let i = 0; i < response.data.length; i++) {
              const d = response.data[i];
              const ntf = response.data[i].notifications;
              // Type : ${ntf.eventtype.join(', ')};
              if (ntf != null && ntf.modeofnotification !== undefined) {
                d.notificationsummary = ` 
                            Type : ${ntf.modeofnotification};
                            Config : ${ntf.configuration}
                            `;
              } else {
                d.notificationsummary = "";
              }
              if (!_.isEmpty(d.awssolutions)) {
                let amis = [];
                let scripts = [];
                for (let j = 0; j < d.awssolutions.length; j++) {
                  if (d.awssolutions[j].script) {
                    scripts.push(d.awssolutions[j].script.scriptname);
                  }
                  d.sgsummary = "Yes";
                  amis.push(
                    _.isEmpty(d.awssolutions[j].awsami)
                      ? ""
                      : d.awssolutions[j].awsami.aminame
                  );
                  if (d.awssolutions[j].lbid == null) {
                    d.lbsummary = "No";
                  } else {
                    d.lbsummary = "Yes";
                  }
                }
                d.vmsummary = amis.join(", ");
                amis = [];
                d.scriptssummary = scripts.join(", ");
                scripts = [];
              }
              if (!_.isEmpty(d.ecl2solutions)) {
                let amis = [];
                let scripts = [];
                for (let j = 0; j < d.ecl2solutions.length; j++) {
                  if (d.ecl2solutions[j].ecl2script) {
                    scripts.push(d.ecl2solutions[j].ecl2script.scriptname);
                  }
                  d.sgsummary = "Yes";
                  amis.push(
                    d.ecl2solutions[j].ecl2images.imagename.substring(0, 15)
                  );
                  if (_.isEmpty(d.ecl2loadbalancers)) {
                    d.lbsummary = "No";
                  } else {
                    d.lbsummary = "Yes";
                  }
                }
                d.vmsummary = amis.join(", ");
                amis = [];
                d.scriptssummary = scripts.join(", ");
                scripts = [];
              }
              if (!_.isEmpty(d.alisolution)) {
                let amis = [];
                let scripts = [];
                for (let j = 0; j < d.alisolution.length; j++) {
                  if (d.alisolution[j].script) {
                    scripts.push(d.alisolution[j].script.scriptname);
                  }
                  d.sgsummary = "Yes";
                  amis.push(
                    _.isEmpty(d.alisolution[j].aliimage)
                      ? ""
                      : d.alisolution[j].aliimage.imagename
                  );
                  if (_.isEmpty(d.alilb)) {
                    d.lbsummary = "No";
                  } else {
                    d.lbsummary = "Yes";
                  }
                }
                d.vmsummary = amis.join(", ");
                amis = [];
                d.scriptssummary = scripts.join(", ");
                scripts = [];
              }
            }
          }
        } else {
          // this.message.error(response.message);
          this.solutionsList = [];
          this.originalData = [];
          this.totalCount = 0;
        }
      },
      (err) => {
        this.loading = false;
        this.message.error(
          "Sorry! Something gone wrong in getting solutions list"
        );
      }
    );
  }

  dataChanged(result) {
    let response = {} as any;
    if (result.edit) {
      this.router.navigate(["solutiontemplate/edit", result.data.solutionid]);
    } else {
      const templatedata = {
        solutionid: result.data.solutionid,
        lastupdateddt: new Date(),
        tenantid: this.userstoragedata.tenantid,
        lastupdatedby: this.userstoragedata.fullname,
        status: "Deleted",
      };
      this.solutionService.update(templatedata).subscribe(
        (data) => {
          response = JSON.parse(data._body);
          if (response.status) {
            // this.message.info('Solution template removed');
            response.data.status === "Deleted"
              ? this.message.success(
                  "#" + response.data.solutionid + " Deleted Successfully"
                )
              : this.message.success(response.message);
            this.getSolutionsList();
          } else {
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error("Unable to remove solution data");
        }
      );
    }
  }

  cloneTemplate(data) {
    this.loading = true;
    this.solutionService.clone(data).subscribe((res) => {
      this.loading = false;
      const response = JSON.parse(res._body);
      if (response.status) {
        // this.solutionsList = [... this.solutionsList, response.data];
        this.getSolutionsList();
      } else {
        this.solutionsList = [...this.solutionsList];
      }
    });
  }
//#OP_B632
  refresh(){
    this.searchText = "";
    this.getSolutionsList();
  }
  download(){
    this.isdownload = true;
    this.getSolutionsList();
  }
  publish(data) {
    if (
      data.catalogdetails &&
      data.catalogdetails.publishstatus === "Published"
    ) {
      this.modal.confirm({
        nzTitle: "Are you sure you want to unpublish?",
        nzOkText: "Yes",
        nzOkType: "primary",
        nzOnOk: () => {
          const formdata = new FormData();
          formdata.append(
            "formData",
            JSON.stringify({
              catalogid: data.catalogdetails.catalogid,
              publishstatus: AppConstant.STATUS.DELETED,
              lastupdatedby: this.userstoragedata.fullnam,
              lastupdateddt: new Date(),
            })
          );
          this.srmService.updateCatalog(formdata).subscribe((result) => {
            let response = {} as any;
            response = JSON.parse(result._body);
            if (response.status) {
              this.message.success(response.message);
              this.refresh();
            } else {
              this.message.error(response.message);
            }
          });
        },
        nzCancelText: "No",
        nzOnCancel: () => console.log("Cancel"),
      });
    } else {
      this.modal.confirm({
        nzTitle: "Are you sure you want to publish?",
        nzOkText: "Yes",
        nzOkType: "primary",
        nzOnOk: () => {
          this.router.navigate(["srm/catalog/create"], {
            queryParams: {
              referencetype: "Solution",
              referenceid: data.solutionid,
              servicename: data.solutionname,
            },
          });
        },
        nzCancelText: "No",
        nzOnCancel: () => console.log("Cancel"),
      });
    }
  }
  
}
