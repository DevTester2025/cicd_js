import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
} from "@angular/core";
import * as _ from "lodash";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { AWSService } from "src/app/business/deployments/aws/aws-service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";

@Component({
  selector: "app-cloudmatiq-operations",
  styles: [],
  templateUrl: "./operations.component.html",
})
export class OperationsComponent implements OnInit, OnChanges {
  @Input() instancemeta: any;
  instanceTypeList = [];
  instancetypeid = null;
  instancetyperefid = null;
  opstabIndex = 0;
  opstabTitle = "Snapshots";
  action = "";
  screens: any = [];
  appScreens: any = [];
  userstoragedata = {} as any;
  start = false;
  stop = false;
  resize = false;
  reboot = false;
  refresh = false;
  processing = false;
  constructor(
    private message: NzMessageService,
    private awsService: AWSService,
    private localStorageService: LocalStorageService,
    private modalService: NzModalService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.ASSET_MANAGEMENT,
    });
    if (_.includes(this.appScreens.actions, "Start Instance")) {
      this.start = true;
    }
    if (_.includes(this.appScreens.actions, "Resize Instance")) {
      this.resize = true;
    }
    if (_.includes(this.appScreens.actions, "Reboot Instance")) {
      this.reboot = true;
    }
    if (_.includes(this.appScreens.actions, "Stop Instance")) {
      this.stop = true;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.instancemeta.currentValue) {
      this.instancetypeid = changes.instancemeta.currentValue.instancetypeid;
      this.instancetyperefid =
        changes.instancemeta.currentValue.instancetyperefid;
    }
  }
  ngOnInit() {
    this.getInstanceTypeList();
  }
  opstabChange(event) {
    this.opstabIndex = event.index;
    this.opstabTitle = event.tab._title;
    this.action = event.tab._title.toLowerCase();
  }
  performVmaction(action) {
    this.refresh = false;
    this.modalService.create({
      nzTitle: _.capitalize(action) + " Instance",
      nzContent:  `Are you sure that you want to ${action} the instance, choose the Okay button below`,
      nzClosable: true,
      nzOnOk: () => {
        this.processing = true;
        let data = {} as any;
        data = {
          instancerefid: this.instancemeta.instancerefid,
          instancetyperefid: this.instancetyperefid,
          oldinstancetyperefid: this.instancemeta.instancetyperefid,
          tenantid: this.instancemeta.tenantid,
          updatedby: this.userstoragedata.fullname,
        };
        this.awsService.performVmaction(action, data).subscribe(
          (data) => {
            const response = JSON.parse(data._body);
            if (response.status) {
              this.message.success(response.message);
              this.refresh = true;
              this.processing = false;
            } else {
              this.message.error(response.message);
              this.refresh = true;
              this.processing = false;
            }
          },
          (err) => {
            this.message.error(AppConstant.VALIDATIONS.COMMONERR);
          }
        );
      },
    });
  }

  getInstanceTypeList() {
    let query = {} as any;
    query = {
      status: AppConstant.STATUS.ACTIVE,
    };
    this.awsService.allawsinstancetype(query).subscribe(
      (data) => {
        const response = JSON.parse(data._body);
        if (response.status) {
          this.instanceTypeList = response.data;
        } else {
          this.instanceTypeList = response.data;
        }
      },
      (err) => {
        this.message.error(AppConstant.VALIDATIONS.COMMONERR);
      }
    );
  }
}
