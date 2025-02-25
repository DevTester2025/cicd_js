import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { AssetsService } from "../assets/assets.service";
import { EventLogService } from "./eventlog.service";

@Component({
  selector: "app-cloudmatiq-eventlog-view",
  templateUrl:
    "../../../presentation/web/base/eventlog/eventlog-view.component.html",
  styles: [
    `
      #eventdetail div {
        color: #fff;
        font-size: 13px;
        padding: 10px;
        font-family: "Open Sans", sans-serif;
      }
    `,
  ],
})
export class EventLogViewComponent implements OnInit {
  logList = [];
  selectedEvent = {} as any;
  screens = [];
  appScreens = {} as any;
  instanceObj = {} as any;
  showDetails = false;
  loading = false;

  editReferences = false;
  reference = "";
  @Input() referencesList = [];
  @Input() id;
  @Input() isReference = false;
  constructor(
    private localStorageService: LocalStorageService,
    private eventlogService: EventLogService,
    private message: NzMessageService,
    private assetService: AssetsService
  ) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.EVENTLOG,
    } as any);
  }
  ngOnInit() { }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.isReference.currentValue) {
      this.isReference =
        changes.isReference.currentValue == "true" ? true : false;
    }
    if (changes.id.currentValue != undefined) {
      this.id = changes.id.currentValue;
      this.getEventData();
    }
  }
  getEventData() {
    this.loading=true;
    this.eventlogService.byId(this.id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.selectedEvent = response.data;
      } else {
        this.selectedEvent = {};
      }
      this.loading=false;
    });
  }
  async updateEventLog() {
    this.eventlogService
      .update({
        id: this.selectedEvent.id,
        references: JSON.stringify(this.referencesList),
      })
      .subscribe(
        (res) => {
          console.log("References attached >>>>");
        },
        (err) => {
          console.log("Error attaching references >>>>");
          console.log(err);
        }
      );
  }
  showInstance(id) {
    this.assetService.listByFilters({
      data: { instancerefid: id },
      provider: AppConstant.CLOUDPROVIDER.AWS,
      asset: AppConstant.TAGS.TAG_RESOURCETYPES[8]
    }, `?limit=1`).subscribe((data) => {
      let response = JSON.parse(data._body);
      if (response.status && response.data.assets.length > 0) {
        this.instanceObj = response.data.assets[0];
        this.instanceObj.instancereftype = "instancerefid";
        this.instanceObj.instanceref = id;
        this.showDetails = true;
      } else {
        this.message.error("Instance details not found");
      }
    });
  }
  onChanged() {
    this.showDetails = false;
  }
  openURL(url: string) {
    window.open(url, "_blank");
  }
}
