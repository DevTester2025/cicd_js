import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as _ from "lodash";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { EventLogService } from "src/app/business/base/eventlog/eventlog.service";
import { AWSService } from "src/app/business/deployments/aws/aws-service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";

@Component({
  selector: "app-cloudmatiq-snapshots",
  styles: [],
  templateUrl: "./snapshots.component.html",
})
export class SnapshotsComponent implements OnInit, OnChanges {
  @Input() assetData: any;
  tableHeader = [
    { field: "type", header: "Action", datatype: "string" },
    { field: "SnapshotId", header: "Snapshot Id", datatype: "string" },
    { field: "VolumeSize", header: "Size(GB)", datatype: "string" },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
    },
  ] as any;
  tableConfig = {
    edit: false,
    view: false,
    delete: false,
    globalsearch: true,
    loading: false,
    pagination: true,
    pageSize: 10,
    title: "",
    restore: false,
  } as any;
  snapsList = [];
  createSnapshot = false;
  snapshotForm: FormGroup;
  screens: any = [];
  appScreens: any = [];
  userstoragedata = {} as any;
  createsnap = false;
  processing = false;
  totalCount;
  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private awsService: AWSService,
    private eventlogService: EventLogService,
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
    if (_.includes(this.appScreens.actions, "Create Snapshots")) {
      this.createsnap = true;
    }
    if (_.includes(this.appScreens.actions, "Restore Snapshots")) {
      this.tableConfig.restore = true;
    }
    if (_.includes(this.appScreens.actions, "Delete Snapshots")) {
      this.tableConfig.delete = true;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getLogs();
  }
  ngOnInit() {
    this.snapshotForm = this.fb.group({
      description: ["", Validators.required],
    });
  }
  snapshotChanged(event) {
    this.processing = true;
    if (event.delete || event.restore) {
      let action = event.delete ? "deletesnapshot" : "restoresnapshot";
      let data = {} as any;
      data = {
        tenantid: event.data.tenantid,
        instancerefid: event.data.providerrefid,
        volume: {
          SnapshotId: event.data.SnapshotId,
          VolumeSize: event.data.VolumeSize,
        },
        updatedby: this.userstoragedata.fullname,
      };
      this.awsService.performVmaction(action, data).subscribe(
        (data) => {
          const response = JSON.parse(data._body);
          if (response.status) {
            this.message.success(response.message);
            this.processing = false;
            this.getLogs();
          } else {
            this.processing = false;
            this.message.error(response.message);
          }
        },
        (err) => {
          this.message.error(AppConstant.VALIDATIONS.COMMONERR);
        }
      );
    }
  }
  addSnapshot() {
    let action = "snapshot";
    this.processing = true;
    this.modalService.create({
      nzTitle: "Snapshot Instance",
      nzContent: `Are you sure that you want to Snapshot the instance, click Okay button to continue`,
      nzClosable: true,
      nzOnOk: () => {
        let data = {} as any;
        data = {
          instancerefid: this.assetData.instancerefid,
          tenantid: this.assetData.tenantid,
          updatedby: this.userstoragedata.fullname,
        };
        this.awsService.performVmaction(action, data).subscribe(
          (data) => {
            const response = JSON.parse(data._body);
            if (response.status) {
              this.message.success(response.message);
              this.getLogs();
              this.processing = false;
            } else {
              this.message.error(response.message);
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
  getLogs() {
    let reqObj = {
      tenantid: this.assetData.tenantid,
      providerrefid: this.assetData.instancerefid,
      eventtypes: ["VM_SNAPSHOT", "VM_DELETESNAPSHOT"],
    };
    this.eventlogService.all(reqObj).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.snapsList = [];
        _.map(response.data, (itm) => {
          let meta = JSON.parse(itm.meta);
          if (meta) {
            itm = _.merge(itm, meta);
            itm.delete = false;
            itm.type = "Snapshot Created";
            if (_.includes(itm.eventtype, "VM_DELETESNAPSHOT")) {
              itm = _.merge(itm, itm.data);
              itm.delete = true;
              itm.type = "Snapshot Deleted";
            }
            this.snapsList.push(itm);
          }
          return itm;
        });
      } else {
        this.snapsList = [];
      }
      this.totalCount = this.snapsList.length;
    });
  }
}
