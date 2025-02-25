import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import * as _ from "lodash";
import { AssetsService } from "../../assets.service";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../app.constant";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { Ecl2Service } from "../../../../deployments/ecl2/ecl2-service";
import { AWSService } from "../../../../deployments/aws/aws-service";
import { TagService } from "../../../tagmanager/tags.service";
@Component({
  selector: "app-instance-list",
  templateUrl:
    "../../../../../presentation/web/base/assets/monitoring-dashboard/instance-list.component.html",
  styleUrls: ["./instance-list.component.css"],
})
export class InstanceListComponent implements OnInit {
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  openFilter = false;
  filters = {} as any;
  zoneList = [];
  customersList = [];
  assetList = [];
  tagList = [];
  selectedTag = {} as any;
  providerList = [
    {
      label: "ECL2",
      value: "ECL2",
    },
    {
      label: "AWS",
      value: "AWS",
    },
  ];
  instanceList = [
    {
      title: "Brasilia",
      instancename: "DE1-TMS037",
      datacollected: false,
    },
    {
      title: "Copenhagen",
      instancename: "ECL-DE1-LBS023",
      datacollected: false,
    },
    {
      title: "Paris",
      instancename: "AWS-StorageGW",
      datacollected: false,
    },
    {
      title: "Brussels",
      instancename: "ECL-US1-ws016-Restore-OS1",
      datacollected: false,
    },
    {
      title: "Reykjavik",
      instancename: "ECLUS1PROBE04",
      datacollected: true,
    },
    {
      title: "Moscow",
      instancename: "UK1-TMS028",
      datacollected: true,
    },
    {
      title: "Madrid",
      instancename: "UK1-TMS027",
      datacollected: true,
    },
    {
      title: "London",
      instancename: "DE1-TMS038",
      datacollected: true,
    },
    {
      title: "Peking",
      instancename: "ECLDE1PROBE03",
      datacollected: true,
    },
    {
      title: "New Delhi",
      instancename: "DE1VSQLT0009",
      datacollected: true,
    },
    {
      title: "Tokyo",
      instancename: "DE1VSQLT0008",
      datacollected: true,
    },
    {
      title: "New Delhi",
      instancename: "DE1VSQLT0009",
      datacollected: true,
    },
    {
      title: "Tokyo",
      instancename: "DE1VSQLT0008",
      datacollected: true,
    },
    {
      title: "New Delhi",
      instancename: "DE1VSQLT0009",
      datacollected: true,
    },
    {
      title: "Tokyo",
      instancename: "DE1VSQLT0008",
      datacollected: true,
    },
  ];
  userstoragedata = {} as any;
  dataList = [];
  limit = 50;
  offset = 0;
  pagesize = 50;
  pageIndex = 1;
  loadingMore = false;
  selectedTagGroupName = "";
  constructor(
    private assetsService: AssetsService,
    private localStorageService: LocalStorageService,
    private tagService: TagService,
    private ecl2Service: Ecl2Service,
    private awsService: AWSService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.getCustomerList();
    this.getAllTags();
    this.getInstanceList(50, 0);
  }
  onProviderChange(event) {
    this.getRegions(event);
    this.getAllInstances(event);
  }
  tagChanged(e) {
    if (e != null) {
      let tag = this.tagList.find((o) => o["tagid"] == e);
      let tagClone = _.cloneDeep(tag);

      this.filters.tagvalue = null;

      if (tagClone.tagtype == "list") {
        tagClone.lookupvalues = tagClone.lookupvalues.split(",");
      } else if (
        tagClone.tagtype == "range" &&
        typeof tagClone.lookupvalues == "string"
      ) {
        tagClone.min = tagClone.lookupvalues.split(",")[0];
        tagClone.min = tagClone.lookupvalues.split(",")[1];
      }

      this.selectedTag = _.cloneDeep(tagClone);
    }
  }
  getAllTags() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.tagService.all(cndtn).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let d = response.data.map((o) => {
          let obj = o;
          if (obj.tagtype == "range") {
            let range = obj.lookupvalues.split(",");
            obj.min = Number(range[0]);
            obj.max = Number(range[1]);
            obj.lookupvalues = Math.ceil(
              Math.random() * (+obj.max - +obj.min) + +obj.min
            );
          }

          return obj;
        });
        this.tagList = d;
      } else {
        this.tagList = [];
      }
    });
  }
  getRegions(event) {
    this.zoneList = [];
    let condition = {
      status: AppConstant.STATUS.ACTIVE,
    };
    if (event == "ECL2") {
      this.ecl2Service.allecl2Zones(condition).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response) {
          this.zoneList = response.data;
        } else {
          this.zoneList = [];
        }
      });
    }
    if (event == "AWS") {
      this.awsService.allawszone(condition).subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response) {
          this.zoneList = response.data;
        } else {
          this.zoneList = [];
        }
      });
    }
  }
  getCustomerList() {
    this.commonService
      .allCustomers({
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response) {
          this.customersList = response.data;
        } else {
          this.customersList = [];
        }
      });
  }
  getAllInstances(event) {
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      monitoringyn: "Y",
    } as any;
    if (event) {
      condition["cloudprovider"] = event;
    }
    if (this.filters.customerid) {
      condition["customerid"] = this.filters.customerid;
    }
    if (this.filters.zoneid) {
      condition["zoneid"] = this.filters.zoneid;
    }
    this.commonService.allInstances(condition).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response) {
        this.assetList = response.data;
      } else {
        this.assetList = [];
      }
    });
  }
  getInstanceList(limit?, offset?) {
    if (!_.isEmpty(this.filters)) {
      this.dataList = [];
    }
    let condition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      monitoringyn: "Y",
    } as any;
    if (this.filters.cloudprovider) {
      condition["cloudprovider"] = this.filters.cloudprovider;
    }
    if (this.filters.zoneid) {
      condition["zoneid"] = this.filters.zoneid;
    }
    if (this.filters.customerid) {
      condition["customerid"] = this.filters.customerid;
    }
    if (this.filters.tagid) {
      condition["tagid"] = this.filters.tagid;
    }
    if (this.filters.tagvalue) {
      condition["tagvalue"] = [this.filters.tagvalue];
    }
    this.commonService
      .allInstances(condition, `limit=${limit}&offset=${offset}`)
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response) {
          this.dataList = [...this.dataList, ...response.data];
          if (this.pageIndex != 1) {
            this.pagesize = this.pagesize + this.dataList.length;
          }
        } else {
          if (!_.isEmpty(this.filters)) {
            this.dataList = [];
          }
          this.pageIndex = 1;
          this.pagesize = 50;
        }
        this.loadingMore = false;
        this.notifyEntry.next({ data: this.dataList });
      });
    // this.assetsService.getMonitoringInstances(condition, `?limit=${this.limit}&offset=${this.offset}`).subscribe(result => {
    //   let response = JSON.parse(result._body);
    //   if (response) {
    //     let list = [] as any;
    //     if (response.data && response.data.data.length > 0) {
    //       list = _.map(response.data.data, function (item) {
    //         item.datacollected = response.data.datacollected;
    //         return item;
    //       });
    //     }
    //     // if (response.data.instances) {
    //     //   response.data.instances.forEach(element => {
    //     //     list.push({
    //     //       datacollected: true,
    //     //       ...element
    //     //     });
    //     //   });
    //     // }
    //     // if (response.data.missinginstances) {
    //     //   response.data.missinginstances.forEach(element => {
    //     //     list.push({
    //     //       datacollected: false,
    //     //       ...element
    //     //     });
    //     //   });
    //     // }
    //     console.log(list);
    //     this.dataList = list;
    //     if (this.pageIndex != 1) {
    //       this.pagesize = this.pagesize + this.dataList.length;
    //     }
    //     this.loadingMore = false;
    //   }
    // });
  }
  onLoadMore() {
    this.loadingMore = true;
    this.pageIndex = this.pageIndex + 1;
    this.offset = (this.pageIndex - 1) * this.limit;
    this.getInstanceList(this.limit, this.offset);
  }
  viewData(data) {
    this.assetsService
      .getMonitoringInstances({ instancerefid: data.instancerefid })
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response) {
          let index = _.findIndex(this.dataList, {
            instanceid: response.data.data.instanceid,
          });
          this.dataList[index].datacollected = response.data.datacollected;
          this.dataList = [...this.dataList];
          this.notifyEntry.next({ data: this.dataList });
        }
      });
  }
  filterBy() {
    this.openFilter = true;
  }
  handleOk() {
    this.openFilter = false;
  }
  applyFilter() {
    this.openFilter = false;
    this.getInstanceList(50, 0);
  }
}
