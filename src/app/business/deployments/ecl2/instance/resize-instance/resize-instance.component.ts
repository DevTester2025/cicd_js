import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { AssetsService } from "src/app/business/base/assets/assets.service";
import { AppConstant } from "src/app/app.constant";
import { NzMessageService } from "ng-zorro-antd";

@Component({
  selector: "app-resize-instance",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/instance/resize-instance/resize-instance.component.html",
})
export class ResizeInstanceComponent implements OnInit, OnChanges {
  @Input() instancerefid;

  gettingServerDetails = false;
  resizingInstance = false;

  userstoragedata = {} as any;
  asset = null;
  flavors = [];

  currentflavour = 0;
  instanceflavour;

  constructor(
    private localStorageService: LocalStorageService,
    private httpService: HttpHandlerService,
    private message: NzMessageService,
    private assetService: AssetsService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.getFlavors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["instancerefid"]) {
      if (changes["instancerefid"].currentValue != null) {
        this.getServerDetails();
      }
    }
  }

  ngOnInit() {}

  getFlavors() {
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2INSTANCETYPELIST,
        {
          status: "Active",
        }
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);

        if (response) {
          if (response.data && response.data.length > 0) {
            this.flavors = response.data;
          } else {
            this.message.info("Server not found !");
          }
        } else {
          this.message.info(response.message);
        }
        this.gettingServerDetails = false;
      });
  }

  getServerDetails() {
    this.gettingServerDetails = true;
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.BASE.ASSETS.LISTBYFILTERS,
        {
          provider: "ECL2",
          asset: AppConstant.TAGS.TAG_RESOURCETYPES[8],
          data: {
            tenantid: this.userstoragedata.tenantid,
            instancerefid: this.instancerefid,
          },
        }
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);

        if (response) {
          if (response.data && response.data.assets.length > 0) {
            this.asset = response.data.assets[0];
            this.currentflavour = this.asset["instancetyperefid"];
          } else {
            this.message.info("Server not found !");
          }
        } else {
          this.message.info(response.message);
        }
        this.gettingServerDetails = false;
      });
  }

  resizeInstance() {
    this.gettingServerDetails = true;
    this.httpService
      .POST(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.DEPLOYMENTS.ECL2INSTANCERESIZE,
        {
          region: this.asset["region"],
          tenantid: this.asset["tenantid"],
          serverid: this.instancerefid,
          ecl2tenantid: this.asset["customerdetail"]["ecl2tenantid"],
          instancetype: this.instanceflavour,
        }
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);

        this.message.info(response.message);
        this.gettingServerDetails = false;
      });
  }
}
