import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import * as moment from "moment";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { TenantsService } from "../../tenants.service";
import { DashboardConfigService } from "../dashboard-config.service";
import { IncidentService } from "../incidents.service";
import { PrometheusService } from "../../../base/prometheus.service";
import { NotificationService } from "src/app/business/base/global-notification.service";
import { DecimalPipe } from "@angular/common";
import { Buffer } from "buffer";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-customer-dashboard",
  styleUrls: ["./customer-dashboard.component.css"],
  templateUrl:
    "../../../../presentation/web/tenant/customers/customer-dashboard/customer-dashboard.component.html",
})
export class CustomerDashboardComponent implements OnInit {
  dataSet = [];
  overview = true;
  customerid;
  userstoragedata = {} as any;
  incidentList: any[] = [];
  dashboardConfig: any[] = [];
  customerObj = {} as any;
  svgList = [];
  pinstancesList = [];
  dinstancesList = [];
  formattedList = [];
  dinstancesAvgs = [];
  groupedData = {} as any;
  incidentObj = {} as any;
  ntfList = [];
  ntfObj = {} as any;
  isSpinning = true;
  maintenanceList = [];
  serverStatus = {
    avg: 0,
    sum: 0,
    fill: "",
    title: "No metrics found",
  } as any;
  constructor(
    private router: Router,
    private incidentService: IncidentService,
    private localStorageService: LocalStorageService,
    private prometheusService: PrometheusService,
    private route: ActivatedRoute,
    private dashboardConfigService: DashboardConfigService,
    private tenantsService: TenantsService,
    private notificationService: NotificationService,
    private _decimalPipe: DecimalPipe,
    private domsanitizer: DomSanitizer
  ) {
    this.route.params.subscribe((params) => {
      if (params["customerid"] !== undefined) {
        this.customerid = Number(params.customerid);
        this.getAllIncidents();
        this.getCustomerInfo();
        this.getInstanceRefs();
        this.getNtfList();
      }
    });
  }

  ngOnInit() {
    this.updateCounter();
  }
  ngAfterViewInit() {
    this.isSpinning = true;
  }
  openMetrics() {
    this.router.navigate(["dashboard/metrics/" + this.customerid]);
  }
  getInstanceRefs() {
    this.dinstancesList = [];
    this.formattedList = [];
    this.dinstancesAvgs = [];
    let reqObj = {
      customerid: this.customerid,
      status: AppConstant.STATUS.ACTIVE,
      reportyn: "Y",
    } as any;
    let query = "?include=header";
    this.dashboardConfigService.getdetails(reqObj, query).subscribe((d) => {
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
        let days = 90;
        let data = {
          tenantid: response.data[0].tenantid,
          instances: instances,
          start:
            moment().subtract(days, "days").format("YYYY-MM-DDT") +
            "00:00:00.000",
          end: moment().format("YYYY-MM-DDT") + moment().format("HH:mm:ss.SSS"),
        };
        this.prometheusService.getVMuptime(data).subscribe((d) => {
          let response = JSON.parse(d._body);
          this.pinstancesList = response.data.result;
          _.map(this.pinstancesList, (item) => {
            _.map(item.values, (o) => {
              let ainstance: any = _.find(this.dinstancesList, (di) => {
                if (di.instances.instancerefid == item.metric.job) {
                  return di;
                }
              });
              let instance = {
                name:
                  ainstance.displayname != null
                    ? ainstance.displayname
                    : ainstance.instances.instancename,
                actualsla: ainstance.uptime,
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
                  let len = this.formattedList.length;
                  this.formattedList.push(instance);
                }
              }
            });
            return item;
          });
          this.getDashboardConfig();
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
    let reqObj = {
      customerid: this.customerid,
      status: AppConstant.STATUS.ACTIVE,
    } as any;
    let query = "?include=tag";
    this.dashboardConfigService.all(reqObj, query).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        _.map(response.data, (t, i: number) => {
          t.svgList = [];
          t.overallavg = 0;
          t.overallavgprcnt = 0;
          t.len = 0;
          t.isExpand = false;
          let exist = _.find(this.dashboardConfig, {
            sectionname: t.sectionname,
          });
          if (exist == undefined) {
            this.formSVG(t, i);
          }
          return t;
        });
      } else {
        this.dashboardConfig = [];
        this.isSpinning = false;
      }
    });
  }
  getAllIncidents() {
    // let reversed = _.range(0, 30);
    // let len = reversed.length;
    // _.map(reversed, (itm, idx) => {
    //   let obj = {
    //     date: moment().subtract(itm, "days").format("DD-MMM-YYYY"),
    //     value: [],
    //   };
    //   this.incidentList.push(obj);
    // });
    let reqObj = {
      customerid: this.customerid,
      status: AppConstant.STATUS.ACTIVE,
      publishyn: "Y",
    } as any;
    let days = 30;
    let enddate = moment().format("YYYY-MM-DD") + " 23:59:59";
    let startdate =
      moment().subtract(days, "days").format("YYYY-MM-DD") + " 00:00:00";
    reqObj["startdate"] = startdate;
    reqObj["enddate"] = enddate;
    this.incidentService.all(reqObj).subscribe((result) => {
      let response = JSON.parse(result._body);
      if (response.status) {
        let len = response.data.length;
        _.map(response.data, (itm, idx) => {
          let obj = {
            date: moment(itm.incidentdate).format("DD-MMM-YYYY"),
            value: _.filter(response.data, {
              incidentdate: itm.incidentdate,
            }),
          } as any;
          let exist = _.find(this.incidentList, { date: obj.date });
          if (exist == undefined) {
            this.incidentList.push(obj);
          }
          this.incidentList = _.orderBy(this.incidentList, ["date"], ["desc"]);
        });
      }
    });
  }
  formSVG(t, i) {
    let x = 0;
    let reversed = _.reverse(_.range(0, 90));
    let len = reversed.length;
    _.map(reversed, (itm, idx) => {
      let obj = {
        date: moment().subtract(itm, "days").format("DD-MMM-YYYY"),
        dDate: moment().subtract(itm, "days").format("YYYY-MM-DD"),
        fill: "#f0f5f5",
        style: { "background-color": "#f0f5f5" },
        x: x,
        avg: 0,
        sum: 0,
        dategrp: [],
      } as any;
      obj.title = "No records on " + obj.date;
      x = x + 5;
      let exist = _.find(this.dinstancesAvgs, { sectionname: t.sectionname });

      obj.dategrp = _.filter(this.formattedList, (d) => {
        if (
          moment(obj.dDate).isSame(d.fDate) &&
          _.includes(exist.instances, d.id)
        ) {
          return d;
        }
      });
      obj.sum = _.sumBy(obj.dategrp, (d: any) => {
        return d.avg;
      });
      obj.sum = obj.sum ? obj.sum : 0;
      obj.avg = obj.dategrp.length > 0 ? obj.sum / obj.dategrp.length : 0;
      if (obj.avg > exist.avg) {
        obj.fill = "#A3E798";
        obj.style = { "background-color": "#A3E798" };
        obj.title =
          this._decimalPipe.transform(obj.avg, "1.2-2") +
          "%,No downtime recorded on " +
          obj.date;
      } else if (obj.avg >= 50 && obj.avg < exist.avg) {
        obj.fill = "#ffa64d";
        obj.style = { "background-color": "#ffa64d" };
        obj.title =
          this._decimalPipe.transform(obj.avg, "1.2-2") +
          "%,Downtime recorded on " +
          obj.date;
      } else if (obj.avg > 0 && obj.avg < 50) {
        obj.fill = "#FF0000";
        obj.style = { "background-color": "#FF0000" };
        obj.title =
          this._decimalPipe.transform(obj.avg, "1.2-2") +
          "%,Servers are not stable " +
          obj.date;
      }
      t.svgList.push(obj);
      if (len == idx + 1) {
        this.overAvgCalc(i, t);
        this.isSpinning = false;
      }
    });
  }
  overAvgCalc(i, t) {
    t.avg1 = 0;
    t.avg2 = 0;
    t.avg3 = 0;
    t.len1 = 0;
    t.len2 = 0;
    t.len3 = 0;
    _.map(t.svgList, (d: any, i: number) => {
      t.overallavg = t.overallavg + d.avg;
      // 0 - 29 (1)
      if (i <= 29) {
        t.avg1 = t.avg1 + d.avg;

        if (d.avg > 0) {
          t.len1 = t.len1 + 1;
        }
      }
      // 30 - 59 (1)
      if (i > 30 && i <= 59) {
        t.avg2 = t.avg2 + d.avg;

        if (d.avg > 0) {
          t.len2 = t.len2 + 1;
        }
      }
      if (i > 60 && i <= 89) {
        t.avg3 = t.avg3 + d.avg;

        if (d.avg > 0) {
          t.len3 = t.len3 + 1;
        }
      }
    });
    // t.overallavgprcnt = t.overallavg ? t.overallavg / t.len : 100;
    t.overallavgprcnt =
      (t.avg1 > 0 ? t.avg1 / t.len1 : 0) +
      (t.avg2 > 0 ? t.avg2 / t.len2 : 0) +
      (t.avg3 > 0 ? t.avg3 / t.len3 : 0);
    t.thirtyavgprcnt = t.avg3 > 0 ? t.avg3 / t.len3 : 0;
    this.dashboardConfig.push(t);
    this.serverStatus.sum = _.sumBy(this.dashboardConfig, (d) => {
      return d.overallavgprcnt;
    });
    this.serverStatus.avg = this.serverStatus.sum
      ? this.serverStatus.sum
      : 0 / this.dashboardConfig.length;
    if (_.includes(this.dashboardConfig, { fill: "#FF0000" })) {
      this.serverStatus.fill = { backgroundColor: "#FF0000" };
      this.serverStatus.title = "Servers at critical stage";
    } else if (_.includes(this.dashboardConfig, { fill: "#ffa64d" })) {
      this.serverStatus.fill = { backgroundColor: "#ffa64d" };
      this.serverStatus.title = "Servers running with average uptime";
    } else {
      this.serverStatus.fill = { backgroundColor: "#A3E798" };
      this.serverStatus.title = "All servers running Normal";
    }
  }
  dateFormat(date) {
    return moment(date * 1000).format("DD-MM-YYYY");
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
        expectedsla: 0,
      } as any;
      let exist = _.find(this.dinstancesAvgs, {
        sectionname: avgObj.sectionname,
      });
      _.map(this.dinstancesList, (i) => {
        if (
          i.dashboardconfig &&
          i.dashboardconfig.sectionname == avgObj.sectionname
        ) {
          avgObj.instances.push(i.instances.instancerefid);
        }
      });
      avgObj.len = avgObj.instances.length;
      avgObj.expectedsla = o.uptime;
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
  updateExpandView(idx?, sidx?) {
    let selectedData = this.dashboardConfig[idx].svgList[sidx];
    this.dashboardConfig[idx].isExpand = true;
    this.dashboardConfig[idx].selectedData = selectedData;
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
