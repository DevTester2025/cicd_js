import {
  Component,
  TemplateRef,
  ViewChild,
  OnInit,
  Input,
  HostListener,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SharedModule } from "../../../modules/shared/shared.module";
// import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from "lodash";
import { LocalStorageService } from "../../../modules/services/shared/local-storage.service";
import { AppConstant } from "../../../app.constant";
import { SrmService } from "../../../business/srm/srm.service";
import { CommonFileService } from "../../services/commonfile.service";
import { DomSanitizer } from "@angular/platform-browser";
import { CommonService } from "../../services/shared/common.service";
import { HttpHandlerService } from "../../services/http-handler.service";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-cloudmatiq-side-nav",
  templateUrl: "./sidenav.component.html",
  styles: [
    `
      :host ::ng-deep .trigger {
        font-size: 18px;
        line-height: 64px;
        padding: 0 24px;
        cursor: pointer;
        transition: color 0.3s;
      }

      :host ::ng-deep .trigger:hover {
        color: #1890ff;
      }

      :host ::ng-deep .logo {
        height: 32px;
        background: rgba(255, 255, 255, 0.2);
        margin: 16px;
      }

      .light-bg-nav {
        background: rgb(219, 219, 219);
      }
    `,
  ],
})
export class NzSideNavComponent implements OnInit {
  isCollapsed = false;
  triggerTemplate = null;
  isVisible = false;
  isOkLoading = false;
  userfullname: any = "";
  rolename: any = "";
  modelList: any = [];
  openMap = {};
  model: any = [];
  arr: any = [];
  screenObj = {} as any;
  screens: any = [];
  @Input() rightbar: Boolean = false;
  @Input() blockUI: Boolean = false;
  @Input() loadermessage: any = "";
  @ViewChild("trigger") customTrigger: TemplateRef<void>;
  title: String = "";
  userdata: any;
  tenantLogo: any = "";
  pendingCount = 0;
  demourl = "";
  constructor(
    private router: ActivatedRoute,
    public route: Router,
    private localStorageService: LocalStorageService,
    private srmService: SrmService,
    private commonService: CommonService,
    private domsanitizer: DomSanitizer,
    private httpService: HttpHandlerService,
    private sidenavService: CommonFileService
  ) {
    this.userdata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.arr = this.userdata.roles.roleaccess;
    let self = this;
    this.getLogo();
    this.arr.forEach((obj, i) => {
      if (obj.actions.length != 0 && obj.screens) {
        if (!self.screenObj[obj.screens.group]) {
          self.screenObj[obj.screens.group] = { data: [] } as any;
        }
        self.screenObj[obj.screens.group]["data"].push(obj.screens);
        self.screenObj[obj.screens.group]["name"] = obj.screens.group;
        self.screenObj[obj.screens.group]["icon"] = obj.screens.screenicon;
        self.screenObj[obj.screens.group]["position"] =
          obj.screens.displayorder;
      }
    });
    for (var obj in this.screenObj) {
      if (this.screenObj[obj])
        this.screenObj[obj].data = _.sortBy(this.screenObj[obj].data, [
          "displayorder",
        ]);
      this.screens.push(this.screenObj[obj]);
      if (this.screenObj[obj]["name"]) {
        this.openMap[this.screenObj[obj]["name"]] = true;
      }
    }
    this.screens = _.sortBy(this.screens, ["position"]);
    if (_.isEmpty(sidenavService.getSideNavItems())) {
      sidenavService.addSideNavItem(this.openMap);
    } else {
      this.openMap = sidenavService.getSideNavItems();
    }

    this.userfullname = this.userdata.fullname;
    this.rolename = this.userdata.roles.rolename;
    this.getPendingCount();
  }

  ngOnInit(): void {
    this.router.data.subscribe((data) => {
      this.title = data.title;
    });
    if (this.title == "Orchestration") {
      this.router.queryParams.subscribe((params) => {
        if (params["title"]) {
          this.title += ` - ${params["title"]}`;
        }
      });
    }
    this.getDemoUrl();
    this.updateIsCollapsed();
  }

  @HostListener("window:resize", ["$event"])
  onResize(): void {
    this.updateIsCollapsed();
  }

  updateIsCollapsed(): void {
    this.isCollapsed = window.innerWidth <= 768;
  }

  getDemoUrl() {
    let condition = {} as any;
    condition = {
      tenantid: this.userdata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      lookupkey: "DEMO_URL",
      keyname: this.title,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status && response.data.length > 0) {
        this.demourl = response.data[0].keyvalue;
      } else {
        this.demourl = "";
      }
    });
  }
  getPendingCount() {
    let condition = {} as any;
    condition = {
      tenantid: this.userdata.tenantid,
      status: AppConstant.STATUS.ACTIVE
    };

    this.srmService.getRequestCount(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.pendingCount = response.data;
      } else {
        this.pendingCount = 0;
      }
    });
  }

  openHandler(value: any): void {
    // for (const key in this.openMap) {
    //   if (key !== value) {
    //     this.openMap[key] = false;
    //   }
    // }
  }
  selectedLink(link) {
    this.route.navigate([link]);
  }
  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
    this.triggerTemplate = this.customTrigger;
  }
  logout() {
    this.localStorageService.clearAllItem();
    this.route.navigate(["login"]);
  }
  getLogo() {
    this.tenantLogo = `${environment.baseURL}/base/wazuh/file/${this.userdata.tenant.tenant_logo}?type=Tenant`;
  }
}
