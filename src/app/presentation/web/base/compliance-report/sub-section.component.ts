import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AppConstant } from "src/app/app.constant";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
@Component({
  selector: "app-nested-tabs",
  templateUrl: "./sub-section.component.html",
})
export class NestedSectionsComponent implements OnInit {
  @Input() tabIndex = 0;
  @Input() iframeSrc = "";
  @Input() noData;
  selectedType = "";
  complianceModules = {};
  selectedTabData = [];
  nodetabIndex = 0;
  dashboardURL: any;
  userstoragedata = {} as any;

  constructor(
    private sanitizer: DomSanitizer,
    private commonService: CommonService,
    private LocalStorage: LocalStorageService,
  ) {
    this.userstoragedata = this.LocalStorage.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit(): void {
    this.getComplianceModules();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tabIndex && changes.tabIndex.currentValue) {
      if (this.complianceModules && this.complianceModules[this.tabIndex]) {
        this.selectedTabData = this.complianceModules[this.tabIndex];
        this.selectedType = this.selectedTabData[0];
        this.noData = changes.noData.currentValue;
        this.onChanged();
      }
    }
    if (changes.iframeSrc) {
      this.iframeSrc = changes.iframeSrc.currentValue;
      this.onChanged();
    }
  }
  onChanged() {
    
      this.dashboardURL = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.iframeSrc.replace("{:viewId}", this.selectedType["viewId"])
      );
    
  }

  getComplianceModules() {
    this.commonService
      .allLookupValues({
        lookupkey: AppConstant.LOOKUPKEY.COMPLIANCE_MODULES,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          const keyvalue = JSON.parse(response.data[0].keyvalue);
          this.complianceModules = keyvalue;

          if (this.complianceModules[this.tabIndex]) {
            this.selectedTabData = this.complianceModules[this.tabIndex];
            this.selectedType = this.selectedTabData[0];
            this.onChanged();
          }
        } else {
          this.complianceModules = {};
        }
      });
  }
}
