import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
  Input,
} from "@angular/core";

import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AppConstant } from "src/app/app.constant";
import * as _ from "lodash";
import { RecommendationService } from "../recommendation.service";
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-recommendation-list",
  templateUrl:
    "../../../../../presentation/web/base/server-utildetails/recommendation/list/recommendation-list.component.html",
})
export class RecommendationListComponent implements OnInit {
  @Input() utilizationDetailConfigs: any;
  screens = [];
  recommendationList = [] as any;
  originalData = [] as any;
  current = "dashboard";
  formTitle = "Setup Recommendation";
  setupFormTitle = "Generate Rules";
  currentConfigs = {} as any;
  userstoragedata: any = {};
  predictionObj: any = {};
  visibleadd: any = false;
  setupadd: any = false;
  isVisible: any = false;
  isAutomateVisible: any = false;
  sortValue = null;
  sortName = null;
  loading: any = false;
  appScreens = {} as any;
  buttonText = "Add";
  cloudprovider = "ECL2";
  customerObj: any = {};
  recommendationTableHeader = [
    // { header: 'Type', field: 'resourcetype', datatype: 'string' },
    { header: "Plan", field: "plan", datatype: "string" },
    { header: "CPU Min Util (%)", field: "cpuutilmin", datatype: "string" },
    { header: "CPU Max Util (%)", field: "cpuutilmax", datatype: "string" },
    { header: "Memory Min Util (%)", field: "memutilmin", datatype: "string" },
    { header: "Memory Max Util (%)", field: "memutilmax", datatype: "string" },
    // { header: 'Disc Min Util', field: 'discutilmin', datatype: 'string' },
    // { header: 'Disc Max Util', field: 'discutilmax', datatype: 'string' },
    // { header: 'Data Min Util', field: 'netutilmin', datatype: 'string' },
    // { header: 'Data Max Util', field: 'netutilmax', datatype: 'string' },
    // { header: 'Duration', field: 'duration', datatype: 'string' },
    { header: "Recommended Plan 1", field: "recommended1", datatype: "string" },
    // { header: 'Recommended Plan 2', field: 'recommended2', datatype: 'string' },
    // { header: 'Recommended Plan 3', field: 'recommended3', datatype: 'string' },
    { header: "Status", field: "status", datatype: "string" },
    { header: "Updated By", field: "lastupdatedby", datatype: "string" },
    {
      header: "Updated On",
      field: "lastupdateddt",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ] as any;
  recommendationTableConfig = {
    edit: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    scroll: { x: "2000px" },
    widthConfig: [
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
      "80px",
    ],
  } as any;
  constructor(
    private localStorageService: LocalStorageService,
    private predictionService: RecommendationService,
    private message: NzMessageService,
    private router: Router
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.recomentationList();
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.RECOMMENDATION_SETUP,
    });
    if (_.includes(this.appScreens.actions, "Create")) {
      this.visibleadd = true;
    }
    if (_.includes(this.appScreens.actions, "Automate")) {
      this.setupadd = true;
    }
    if (_.includes(this.appScreens.actions, "Edit")) {
      this.recommendationTableConfig.edit = true;
    }
    if (_.includes(this.appScreens.actions, "Delete")) {
      this.recommendationTableConfig.delete = true;
    }
  }

  ngOnInit() {}

  changeView(to: string) {
    this.current = to;
  }
  closeWindow() {
    this.router.navigate(["/serverutils"]);
  }
  showModal(data?) {
    this.predictionObj = data;
    this.isVisible = true;
    console.log(data);
  }
  showSetupModal(data?) {
    this.isAutomateVisible = true;
  }
  notifyEntry(event) {
    this.recomentationList();
    this.isVisible = false;
    this.isAutomateVisible = false;
  }

  onChanged(event) {
    this.isVisible = false;
    this.isAutomateVisible = false;
    console.log(event);
  }
  recomentationList() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      cloudprovider: this.cloudprovider,
    };
    this.predictionService.all(condition).subscribe((data) => {
      const response = JSON.parse(data._body);
      if (response.status) {
        this.loading = false;
        this.originalData = response.data;
        this.recommendationList = response.data;
        this.recommendationList.forEach((element) => {
          element.cpuutilmin = parseFloat(element.cpuutilmin).toFixed(2);
          element.cpuutilmax = parseFloat(element.cpuutilmax).toFixed(2);
          element.memutilmin = parseFloat(element.memutilmin).toFixed(2);
          element.memutilmax = parseFloat(element.memutilmax).toFixed(2);
          element.plan = element.awscurrentplan
            ? element.awscurrentplan["plantype"]
            : null || element.ecl2currentplan
            ? element.ecl2currentplan["instancetypename"]
            : null || null;
          element.recommended1 = element.awsrecommendedplanone
            ? element.awsrecommendedplanone["plantype"]
            : null || element.ecl2recommendedplanone
            ? element.ecl2recommendedplanone["instancetypename"]
            : null || null;
          element.recommended2 = element.awsrecommendedplantwo
            ? element.awsrecommendedplantwo["plantype"]
            : null || element.ecl2recommendedplantwo
            ? element.ecl2recommendedplantwo["instancetypename"]
            : null || null;
          element.recommended3 = element.awsrecommendedplanthree
            ? element.awsrecommendedplanthree["plantype"]
            : null || element.ecl2recommendedplanthree
            ? element.ecl2recommendedplanthree["instancetypename"]
            : null || null;
        });
      } else {
        this.loading = false;
        this.originalData = [];
        this.recommendationList = [];
      }
    });
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
      this.recommendationList = data.sort((a, b) =>
        this.sortValue === "ascend"
          ? a[this.sortName] > b[this.sortName]
            ? 1
            : -1
          : b[this.sortName] > a[this.sortName]
          ? 1
          : -1
      );
    } else {
      this.recommendationList = data;
    }
  }
  deletePrediction(data) {
    this.loading = true;
    this.predictionService
      .update({
        recommendationid: data.recommendationid,
        status: AppConstant.STATUS.INACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.loading = false;
            this.recomentationList();
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.message.error(response.message);
          }
        },
        (err) => {
          this.loading = false;
          this.message.error("Unable to Delete. Please try again");
        }
      );
  }
}
