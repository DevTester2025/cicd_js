import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../../../../app.constant";
import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
import { CommonService } from "../../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { Ecl2Service } from "../../../ecl2-service";
@Component({
  selector: "app-nat",
  templateUrl:
    "../../../../../../presentation/web/deployments/ecl2/firewall/firewallvsrx/nat/nat.component.html",
})
export class NatComponent implements OnInit, OnChanges {
  @Input() natObj: any;
  sourceNATObj: any = {};
  destinationNATObj: any = {};
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  loading = false;
  disabled = false;
  isVisible = false;
  formdata: any = {};
  formTitle: any;
  index: any;
  openmodal: any;
  sourcenatList: any = [];
  destinationnatList: any = [];
  proxynatList: any = [];
  vsrxList: any;
  tableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 0,
    title: "",
    widthConfig: ["25px", "25px", "25px", "25px", "25px"],
  } as any;
  sourcetableHeader: any = [
    { field: "rulename", header: "Rule Name", datatype: "string" },
    { field: "fromzone", header: "Source Zone", datatype: "string" },
    { field: "tozone", header: "Destination Zone", datatype: "string" },
    { field: "sourceaddress", header: "Source Address", datatype: "string" },
    {
      field: "destinationaddress",
      header: "Destination Address",
      datatype: "string",
    },
  ];
  constructor(
    private fb: FormBuilder,
    private messageService: NzMessageService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.natObj) &&
      !_.isEmpty(changes.natObj.currentValue)
    ) {
      console.log(changes.natObj);
      this.sourceNATObj = changes.natObj.currentValue;
      this.destinationNATObj = changes.natObj.currentValue;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
    } else {
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }

  onChanged(val) {
    this.isVisible = val;
  }
  dataChanged(event) {}

  notifyNewEntry(event) {
    if (event.type === "Source NAT") {
      this.sourcenatList = [...this.sourcenatList, event];
    } else if (event.type === "Destination NAT") {
      this.destinationnatList = [...this.destinationnatList, event];
    }
    this.isVisible = false;
  }

  showModal(type) {
    this.openmodal = type;
    this.isVisible = true;
  }
}
