import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
} from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ResizeRequestService } from "../../srm/upgrade-request/resize.service";

@Component({
  selector: "app-rs-history",
  templateUrl: "../../../presentation/web/base/rs-history.component.html",
  styles: ["./rs-history.component.css"],
})
export class RightSizeHistoryComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  filters = { asset: null } as any;
  zoneList = [];
  customersList = [];
  userstoragedata = {} as any;

  logs = [];
  tableHeader = [
    {
      field: "instancename",
      header: "Instance Name",
      datatype: "string",
      width: "13%",
    },
    {
      field: "reqdate",
      header: "Requested Date",
      datatype: "date",
      format: "dd-MMM-yyyy",
      width: "12%",
    },
    {
      field: "compdate",
      header: "Completed Date",
      datatype: "date",
      format: "dd-MMM-yyyy",
      width: "12%",
    },
    {
      field: "window",
      header: "Window Type",
      datatype: "string",
      width: "15%",
    },
    {
      field: "prevplan",
      header: "Previous Plan",
      datatype: "string",
      width: "12%",
    },
    {
      field: "currplan",
      header: "Current Plan",
      datatype: "string",
      width: "10%",
    },
    {
      field: "cloudprovider",
      header: "Provider",
      datatype: "string",
      width: "8%",
    },
    { field: "customer", header: "Customer", datatype: "string", width: "13%" },
    // { field: 'instancerefid', header: 'Instance Id', datatype: 'string', width:"15%" }
  ] as any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    manualsearch: true,
    manualsorting: false,
    sortbyList: [],
    view: true,
    chart: false,
    loading: false,
    pagination: true,
    frontpagination: false,
    manualpagination: false,
    selection: false,
    rightsize: false,
    taggingcompliance: false,
    pageSize: 10,
    scroll: { x: "1000px" },
    title: "",
    widthConfig: [
      "50px",
      "30px",
      "30px",
      "30px",
      "30px",
      "30px",
      "30px",
      "30px",
    ],
  } as any;
  totalCount = 0;

  viewServerDetail = false;
  serverDetail = null as any;

  constructor(
    private httpHandler: HttpHandlerService,
    private resizeService: ResizeRequestService,
    private localStorageService: LocalStorageService,
    private message: NzMessageService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngAfterViewInit(): void {}
  ngAfterViewChecked(): void {}

  ngOnInit() {
    this.getZone();
    this.getAllCustomers();
    this.getRequestData();
  }

  getZone() {
    this.zoneList = [];
    let url =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.OTHER.ECL2ZONES;
    if (this.filters.provider === "ECL2") {
      url =
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.OTHER.ECL2ZONES;
    }
    if (this.filters.provider === "AWS") {
      url =
        AppConstant.API_END_POINT +
        AppConstant.API_CONFIG.API_URL.OTHER.AWSZONES;
    }
    this.httpHandler
      .POST(url, {
        status: "Active",
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.zoneList = response.data;
          } else {
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getAllCustomers() {
    let cndtn = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;

    this.httpHandler
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.TENANTS.CLIENT.FINDALL,
        cndtn
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.customersList = response.data;
        } else {
          this.customersList = [];
        }
      });
  }

  tableEvent(event) {
    if (event.view) {
      this.serverDetail = {
        cloudprovider: event.data.cloudprovider,
        instanceref: event.data.instancerefid,
        instancereftype: "instancerefid",
      };
      this.viewServerDetail = true;
    }
  }

  getRequestData() {
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      reqstatus: "Completed",
      status: "Active",
    } as any;
    if (this.filters.provider) condition.cloudprovider = this.filters.provider;
    if (this.filters.customerid) condition.customerid = this.filters.customerid;
    if (this.filters.daterange && this.filters.daterange.length > 0)
      condition.daterange = this.filters.daterange;
    this.logs = [];
    this.resizeService.allRequest(condition).subscribe(
      (result: any) => {
        const response = JSON.parse(result._body);
        if (response.status) {
          console.log("Response Is", response);
          let arr = [];
          response.data.forEach((req) => {
            arr.push({
              instancerefid: req.instance.instancerefid,
              instanceid: req.instance.instanceid,
              instancename: req.instance.instancename,
              region: req.instance.region,
              reqdate: req.createddt,
              compdate: req.lastupdateddt,
              cloudprovider: req.cloudprovider,
              window:
                req.maintwindow && req.maintwindow.windowname
                  ? req.maintwindow.windowname
                  : "",
              prevplan: req.currentplan.plantype,
              currplan: req.upgradeplan.plantype,
              customer: req.customer.customername,
            });
          });
          this.logs = [...arr];
        } else {
          console.log("No Response Is", response);
        }
      },
      (err) => {
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }
}
