import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { TenantsService } from "../../../tenants.service";
import { DashboardConfigService } from "../../dashboard-config.service";
import { IncidentService } from "../../incidents.service";
import * as moment from "moment";
import { PrometheusService } from "src/app/business/base/prometheus.service";
import { NotificationService } from "src/app/business/base/global-notification.service";
import { Buffer } from "buffer";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: "app-metrics-view",
  templateUrl:
    "../../../../../presentation/web/tenant/customers/customer-dashboard/metrics-view/metrics-view.component.html",
  styleUrls: ["./metrics-view.component.css"],
})
export class MetricsViewComponent implements OnInit {
  uptime = false;
  customerid;
  userstoragedata = {} as any;
  incidentList = [];
  dashboardConfig = [];
  selectedTag = null;
  selectedYr = "2022";
  customerObj = {} as any;
  calendarSet = [];
  pinstancesList = [];
  dinstancesList = [];
  formattedList = [];
  dinstancesAvgs = [];
  ntfList = [];
  ntfObj = {} as any;
  maintenanceList = [];
  isSpinning = false;
  constructor(
    private router: Router,
    private incidentService: IncidentService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private dashboardConfigService: DashboardConfigService,
    private tenantsService: TenantsService,
    private prometheusService: PrometheusService,
    private notificationService: NotificationService,
    private domsanitizer: DomSanitizer
  ) {
    this.route.params.subscribe((params) => {
      if (params["customerid"] !== undefined) {
        this.customerid = Number(params.customerid);
        this.getNtfList();
      }
    });
  }

  ngOnInit() {
    this.getCustomerInfo();
    this.getDashboardConfig();
  }
  gotoHome() {
    this.router.navigate(["dashboard/" + this.customerid]);
  }
  dateFormat(date) {
    return moment(date * 1000).format("DD-MM-YYYY");
  }
  getInstanceRefs() {
    this.dinstancesList = [];
    this.formattedList = [];
    this.dinstancesAvgs = [];
    let dashboardConfig = _.find(this.dashboardConfig, {
      value: this.selectedTag,
    });
    this.dashboardConfigService
      .getdetails(
        {
          customerid: this.customerid,
          status: AppConstant.STATUS.ACTIVE,
          reportyn: "Y",
          confighdrids: dashboardConfig.ids,
        },
        "?include=header"
      )
      .subscribe((d) => {
        let response = JSON.parse(d._body);
        if (response.status) {
          this.dinstancesList = response.data;
          let instances = "";
          response.data.forEach((o) => {
            if (instances != "")
              instances = instances + "|" + o.instances.instancerefid;
            if (instances == "") instances = o.instances.instancerefid;
          });
          this.headerAvgComputation(response.data);
          let endmonth = moment().format("MM-DDT");
          let enddate =
            this.selectedYr + "-" + endmonth + moment().format("23:59:59.SSS");
          let startdate = this.selectedYr + "-01-01T" + "00:00:00.000";
          let data = {
            tenantid: response.data[0].tenantid,
            instances: instances,
            start: startdate,
            end: enddate,
          };
          this.prometheusService.getVMuptime(data).subscribe((d) => {
            let response = JSON.parse(d._body);
            this.pinstancesList = response.data.result;
            _.map(this.pinstancesList, (item) => {
              _.map(item.values, (o) => {
                let instance = {
                  id: item.metric.job,
                  date: this.dateFormat(o[0]),
                  uptime: Number(o[1]),
                  fDate: moment(o[0] * 1000).format("YYYY-MM-DD"),
                  length: 1,
                  sectionname: "",
                  time: moment(o[0] * 1000).format("HH:mm"),
                } as any;
                // check here for maintenance Data?
                let maintenanceExist = _.filter(this.maintenanceList, (m) => {
                  let day = moment(instance.fDate).format("dddd").toLowerCase();
                  let maintenance = m.maintwindow[day];
                  if (
                    moment(instance.fDate).isBetween(m.startdate, m.enddate) &&
                    maintenance &&
                    instance.time >= maintenance.start &&
                    instance.time <= maintenance.end
                  ) {
                    return m;
                  }
                  // else if (
                  //   moment(instance.fDate).isBetween(m.startdate, m.enddate)
                  // ) {
                  //   return m;
                  // }
                });
                if (maintenanceExist.length == 0) {
                  let exist: any = _.find(this.formattedList, (l) => {
                    if (
                      l.id == item.metric.job &&
                      moment(l.fDate).isSame(instance.fDate)
                    ) {
                      return l;
                    }
                  });
                  if (exist) {
                    instance.uptime = instance.uptime + exist.uptime;
                    instance.length = instance.length + exist.length;
                    instance.avg = instance.uptime / instance.length;
                    let index = _.indexOf(this.formattedList, exist);
                    this.formattedList[index] = instance;
                  } else {
                    instance.avg = instance.uptime / instance.length;
                    this.formattedList.push(instance);
                  }
                }
              });
              return item;
            });
            this.formCalendarData();
          });
        } else {
          this.isSpinning = false;
        }
      });
  }
  getCustomerInfo() {
    this.tenantsService
      .customerbyId(
        this.customerid,
        `download=${true}&` +
          "include=" +
          JSON.stringify(["maintenancewindowmap"])
      )
      .subscribe((result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.customerObj = response.data.data;
          if (response.data.content != null) {
            var buffer = Buffer.from(response.data.content.data);
            const TYPED_ARRAY = new Uint8Array(buffer);
            const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, "");
            let base64String = btoa(STRING_CHAR);
            this.customerObj.logo = this.domsanitizer.bypassSecurityTrustUrl(
              "data:image/jpg;base64, " + base64String
            );
          }
          this.maintenanceList = _.filter(
            response.data.maintenancewindowmap,
            (itm) => {
              if (itm.maintwindow.status == "Active") {
                itm.startdate = moment(itm.maintwindow.startdate).format(
                  "YYYY-MM-DD"
                );
                itm.enddate = moment(itm.maintwindow.enddate).format(
                  "YYYY-MM-DD"
                );
                return itm;
              }
            }
          );
        }
      });
  }
  getDashboardConfig() {
    this.isSpinning = true;
    let reqObj = {
      customerid: this.customerid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    let query = "?include=tag";
    this.dashboardConfigService.all(reqObj, query).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        _.map(response.data, (itm) => {
          let exist = _.find(this.dashboardConfig, {
            label: itm.sectionname,
          });
          let index = _.indexOf(this.dashboardConfig, exist);
          if (exist != undefined) {
            exist.ids.push(itm.confighdrid);
            this.dashboardConfig[index] = exist;
          } else {
            this.dashboardConfig.push({
              label: itm.sectionname,
              value: itm.confighdrid,
              ids: [itm.confighdrid],
            });
          }
          return itm;
        });
        this.selectedTag = this.dashboardConfig[0].value;
        this.onYrChange();
      } else {
        this.dashboardConfig = [];
        this.isSpinning = false;
        this.onYrChange();
      }
    });
  }
  incidentObj = {} as any;
  getAllIncidents(yr?) {
    let reqObj = {
      customerid: this.customerid,
      status: AppConstant.STATUS.ACTIVE,
      publishyn: "Y",
    } as any;
    let enddate = yr + "-12-31" + " 23:59:59";
    let startdate = yr + "-01-01" + " 00:00:00";
    reqObj["startdate"] = startdate;
    reqObj["enddate"] = enddate;
    this.incidentService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        this.incidentObj = _.groupBy(response.data, "incidentdate");
      }
    });
  }
  onYrChange() {
    if (this.selectedTag) {
      this.calendarSet = [];
      this.getInstanceRefs();
    }
    this.getAllIncidents(this.selectedYr);
  }
  formCalendarData() {
    this.calendarSet = [];
    for (var i = 1; i <= 12; i++) {
      if (i < 10) {
        let obj = {
          month: this.selectedYr + "-0" + i + "-01",
          highlights: {},
          days: moment(this.selectedYr + "-0" + i, "YYYY-MM").daysInMonth(),
          startdt: this.selectedYr + "-0" + i + "-01",
          enddt: moment(this.selectedYr + "-0" + i + "-01")
            .add(i, "days")
            .format("YYYY-MM-DD"),
          avg: 0,
          sum: 0,
          overallavg: 0,
          overallavgprcnt: 0,
          len: 0,
        } as any;
        this.calendarSet.push(obj);
        this.formDates(obj, i);
      } else if (i <= 12) {
        let obj = {
          month: this.selectedYr + "-" + i + "-01",
          startdt: this.selectedYr + "-" + i + "-01",
          enddt: moment(this.selectedYr + "-" + i + "-01")
            .add(i, "days")
            .format("YYYY-MM-DD"),
          days: moment(this.selectedYr + "-" + i, "YYYY-MM").daysInMonth(),
          highlights: {},
          avg: 0,
          sum: 0,
          overallavg: 0,
          overallavgprcnt: 0,
          len: 0,
        } as any;
        this.calendarSet.push(obj);
        this.isSpinning = false;
        this.formDates(obj, i);
      }
    }
  }

  formDates(obj, i) {
    _.map(_.range(1, obj.days + 1), (itm, idx) => {
      let date = moment(obj.month).add(idx, "days").format("DD-MM-YYYY");
      let cDate = moment().format("YYYY-MM-DD");
      let dDate = moment(obj.month).add(idx, "days").format("YYYY-MM-DD");
      obj.highlights[date] = { color: "#f0f5f5", percentage: 100 };
      let dashboardConfig = _.find(this.dashboardConfig, {
        value: this.selectedTag,
      });
      let exist = _.find(this.dinstancesAvgs, {
        sectionname: dashboardConfig.label,
      });
      obj.dategrp = [];
      obj.dategrp = _.filter(this.formattedList, (d) => {
        if (
          _.includes(exist.instances, d.id) &&
          moment(dDate).isSame(d.fDate) &&
          !moment(dDate).isAfter(cDate)
        ) {
          return d;
        }
      });

      if (obj.dategrp.length > 0) {
        obj.len = obj.len + 1;
        obj.sum = _.sumBy(obj.dategrp, (d: any) => {
          return d.avg;
        });
        obj.avg = obj.dategrp.length > 0 ? obj.sum / obj.dategrp.length : 0;
      } else {
        obj.sum = 0;
        obj.avg = 0;
      }
      obj.highlights[date]["percentage"] = obj.avg;
      if (obj.avg > exist.avg) {
        obj.highlights[date]["color"] = "#A3E798";
      } else if (obj.avg >= 50 && obj.avg < exist.avg) {
        obj.highlights[date]["color"] = "#ffa64d";
      } else if (obj.avg > 0 && obj.avg < 50) {
        obj.highlights[date]["color"] = "#FF0000";
      }
      obj.overallavg = obj.avg + obj.overallavg;
      obj.overallavgprcnt = obj.overallavg > 0 ? obj.overallavg / obj.len : 100;
      this.calendarSet[i - 1] = obj;
    });
  }
  headerAvgComputation(data) {
    data.forEach((o) => {
      let avgObj = {
        // id: o.confighdrid,
        sectionname: o.dashboardconfig.sectionname,
        sum: o.uptime,
        len: 0,
        avg: 0,
        instances: [],
      } as any;
      let exist = _.find(this.dinstancesAvgs, {
        sectionname: avgObj.sectionname,
      });
      _.map(this.dinstancesList, (i) => {
        if (i.dashboardconfig.sectionname == avgObj.sectionname) {
          avgObj.instances.push(i.instances.instancerefid);
        }
      });
      avgObj.len = avgObj.instances.length;
      if (exist) {
        avgObj.sum = avgObj.sum + exist.sum;
        avgObj.avg = _.divide(avgObj.sum, avgObj.len);
        let index = _.indexOf(this.dinstancesAvgs, exist);
        this.dinstancesAvgs[index] = avgObj;
      } else {
        avgObj.avg = _.divide(avgObj.sum, avgObj.len);
        this.dinstancesAvgs.push(avgObj);
      }
    });
  }
  getNtfList() {
    let reqObj: any = {
      customerid: this.customerid,
    };
    this.notificationService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);

      if (response.status) {
        this.ntfList = response.data;
        this.ntfObj = response.data.length > 0 ? response.data[0] : {};
        if (!_.isEmpty(this.ntfList)) {
          this.updateCounter();
        }
      }
    });
  }
  updateCounter() {
    setTimeout(() => {
      let difference = 0;
      _.map(this.ntfList, (itm) => {
        if (itm.implementationdt != null) {
          difference = moment(itm.implementationdt).diff(moment());
          var days = Math.floor(difference / (1000 * 60 * 60 * 24));
          var hours = Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          var minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          var seconds = Math.floor((difference % (1000 * 60)) / 1000);

          itm.timer =
            days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
        }
        if (difference < 0) {
          itm.timer = "EXPIRED";
        }
        this.updateCounter();
        return itm;
      });
    }, 1);
  }
}
