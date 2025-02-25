import { Component, Input, OnInit } from "@angular/core";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { SecurityContext } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: "app-compliance-score",
  templateUrl: "./compliance-score.component.html",
  styleUrls: ["./compliance-score.component.css"],
})
export class ComplianceScoreComponent implements OnInit {
  @Input() isTemplateShowHide = false;
  selectedRequirement: any[] = [];
  loading = false;
  userstoragedata = {} as any;
  isModalVisible = false;
  isVisible = false
  modalTitle = "";
  formTitle = "";
  dashboardURL: SafeUrl; 
  instanceData: any;
  logsList = [];
  modalData = {};
  iframeSrc =
    "https://wazuhdb.opsmaster.ai/app/dashboards#/view/1c7ed300-10ea-11ef-96cf-8bfc28575c01?embed=true&hide-filter-bar=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1d,to:now))";
    

  complianceReport = AppConstant.COMPLIANCEREPORT
  selectedCompliance: any = null;
  isRmediationVisible = false;
  constructor(
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }

  ngOnInit() {
    this.init();
  }

  init() {
    this.instanceData = this.commonService.getInstanceDetails();
    console.log(this.instanceData, "instanceData")
  }

  getProgressScore(score: number) {
    if (score >= 80) {
      return 'progress-low';
    } else if (score >= 60 && score < 80) {
      return 'progress-medium';
    } else if (score >= 30 && score < 60) {
      return 'progress-high';
    } else {
      return 'progress-critical';
    }
  }

  getRiskScore(score: number) {
    if (score < 30) {
      return 'progress-low';
    } else if (score >= 30 && score < 60) {
      return 'progress-medium';
    } else if (score >= 60 && score < 80) {
      return 'progress-high';
    } else {
      return 'progress-critical';
    }
  }

  onPanelChange(active: boolean, index: any): void {
    if (active) {
      if (!this.selectedRequirement[index]) {
        this.selectedRequirement[index] = [];
      }
    } else {
      this.selectedCompliance = null;
      this.selectedRequirement = [];
    }
  }

  showDashboard(title: string): void {
    this.modalTitle = title;
    this.isModalVisible = true;
    const sanitizedURL = this.sanitizer.sanitize(SecurityContext.URL, this.iframeSrc);
    if (sanitizedURL) {
      this.dashboardURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeSrc);
    } else {
      this.dashboardURL = null;
    }
  }
  close() {
    this.router.navigate(["compliance-score"], { queryParams: { list: true } });
  }
  onRequirementClick(e: any, index: number) {
    console.log(e);
    this.selectedRequirement[index] = e ? e.subcontrols : [];
  }  
  
  onControlsClick(event: any){
    this.modalData = event;
    this.isVisible = true
    this.formTitle = "Requirement description" + " " + " - " + " " + event.id
  }

  dataChanged(result){
    console.log(result);
  }
}
