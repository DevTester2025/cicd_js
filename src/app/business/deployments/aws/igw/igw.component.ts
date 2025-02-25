import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import * as _ from "lodash";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { AWSService } from "../aws-service";
@Component({
  selector: "app-aws-internetgateway",
  templateUrl:
    "../../../../presentation/web/deployments/aws/igw/igw.component.html",
})
export class AWSInternetGatewayComponent implements OnInit, OnChanges {
  @Input() gatewayid: string;
  @Input() assetData: any;
  userstoragedata = {} as any;
  loading = false;
  igwObj: any = {};
  visibleadd = false;
  provider: any = AppConstant.CLOUDPROVIDER.AWS;
  providerList: any = [];
  igwForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private message: NzMessageService,
    private awsService: AWSService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    this.clearForm();
    if (changes.assetData.currentValue) {
      this.igwObj = changes.assetData.currentValue;
      this.igwForm = this.fb.group({
        gatewayname: [this.igwObj.gatewayname],
        awsinternetgatewayid: [this.igwObj.awsinternetgatewayid],
        vpc: [this.igwObj.vpc ? this.igwObj.vpc.vpcname : ""],
        notes: [this.igwObj.notes],
      });
    }
  }
  clearForm() {
    this.igwForm = this.fb.group({
      gatewayname: [""],
      awsinternetgatewayid: [""],
      vpc: [""],
      notes: [""],
    });
  }
}
