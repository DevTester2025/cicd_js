import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AppComponent } from "./app.component";
import { TCOComponent } from "./business/base/tco/tco.component";
import { TenantComponent } from "./business/admin/tenant/tenant.component";
import { AddEditTenantComponent } from "./business/admin/tenant/add-edit-tenant/add-edit-tenant.component";

import { TagmanagerComponent } from "./business/base/tagmanager/tagmanager.component";
import { OrchestrationComponent } from "./business/base/orchestration/orchestration.component";
import { AddEditOrchestrationComponent } from "./business/base/orchestration/add-edit-orchestration/add-edit-orchestration.component";
import { RunOrchestrationComponent } from "./modules/components/run-orchestration/run-orch.component";
import { CostSetupComponent } from "./business/base/assets/costsetup/costsetup.component";
import { AddEditCostComponent } from "./business/base/assets/costsetup/add-edit/costsetup-add-edit.component";
import { TagGroupAddEditComponent } from "./business/base/tagmanager/add-edit/tag-group-add-edit.component";

import { AssetsComponent } from "./business/base/assets/assets.component";
import { AssetRecordsComponent } from "./business/base/assetrecords/assetrecords.component";
import { GlobalNotificationComponent } from "./business/base/global-notification.component";
import { ServerUtilsComponent } from "./business/base/server-utils/server-utils.component";
import { WindowListComponent } from "./business/base/server-utildetails/maintenance-window/list/maintwindow-list.component";
import { ServerUtilsMainChartComponent } from "./business/base/server-utils/utils-main-chart.component";
import { ServerUtilDetailsComponent } from "./business/base/server-utildetails/server-utildetails.component";
import { ServerDetailPredictionComponent } from "./business/base/server-utildetails/prediction/prediction.component";
import { RecommendationComponent } from "./business/base/server-utildetails/recommendation/recommendation.component";
import { RecommendationListComponent } from "./business/base/server-utildetails/recommendation/list/recommendation-list.component";
import { RightsizeGroupComponent } from "./business/base/rightsizegroup/list/rightsizegroup-list.component";
import { WorkflowListComponent } from "./business/base/server-utildetails/workflow-config/list/workflow-list.component";
import { BudgetComponent } from "./business/base/assets/budget/budget.component";
import { BillingComponent } from "./business/base/assets/billing/billing.component";
import { MonitoringComponent } from "./business/base/monitoring/monitoring.component";
import { MonitoringSummaryComponent } from "./business/base/monit-summary/monit-summary.component";
import { RightSizeHistoryComponent } from "./business/base/rightsizehistory/rs-history.component";
import { ServerDetailHolderComponent } from "./modules/components/serverdetailparent/serverdetailparent.component";
import { MonitoringDashboardComponent } from "./business/base/assets/monitoring-dashboard/monitoring-dashboard.component";
import { EventLogListComponent } from "./business/base/eventlog/eventlog-list.component";
import { AssetRecordTypeComponent } from "./business/base/recordtypes/recordtype.component";
import { AlertConfigComponent } from "./business/base/alertconfigs/alert.component";
import { TicketmanagementComponent } from "./business/base/ticketmanagement/ticketmanagement.component";
import { WorkpackManagertComponent } from './business/base/workpack/template/workpackmanager.component';
import { AddedittemplateComponent } from './business/base/workpack/template/addedittemplate/addedittemplate.component';
import { MonitoringSyntheticsComponent } from "./monitoring/synthetics/synthetics.component";
import { MonitoringSyntheticsDetailsComponent } from "./monitoring/synthetics/details/synthetic-details.component";
import { WorkflowManagertComponent } from 'src/app/business/base/workflow/workflow.component';
import { CommonRedirectComponent } from 'src/app/modules/components/common-redirect/commonredirect.component';
import { WorkflowExecutionComponent } from './business/base/workpack/execution/workpackexecution.component';
import { WorkpackListComponent } from './business/base/workpack/list/workpack-list.component';
import { ProductComponent } from '../app/business/base/product/product.component';
import { RequestManagementComponent } from "./business/base/request-management/request-management.component";
import { AddeditRequestManagementComponent } from "./business/base/request-management/addedit-request-management/addedit-request-management.component";
import { RequestApproversComponent } from "./business/base/request-management/request-approvers/request-approvers.component";
import { ComplianceReportComponent } from "./presentation/web/base/compliance-report/compliance-report.component";
import { ComplianceScoreListComponent } from "./presentation/web/base/compliance-score/compliance-score-list.component";
import { ComplianceScoreComponent } from "./presentation/web/base/compliance-score/compliance-score-view/compliance-score.component";
import { DashboardPatchingComponent } from "./presentation/web/base/dashboard-patching/patching.component";
// import { RequestApproverAddEditComponent } from "./business/base/request-management/request-approvers/request-approver-add-edit/request-approver-add-edit/request-approver-add-edit.component";

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "login",
  },
  {
    path: "tco",
    component: TCOComponent,
    data: {
      title: "Total Cost of Ownership (TCO) Calculator",
    },
  },
  {
    path: "tagmanager",
    component: TagmanagerComponent,
    data: {
      title: "Tag Manager",
    },
  },
  {
    path: "eventlog",
    component: EventLogListComponent,
    data: {
      title: "Event Logs",
    },
  },
  {
    path: "orchestration",
    component: OrchestrationComponent,
    data: {
      title: "Orchestration",
    },
  },
  {
    path: "orchestration/create",
    component: AddEditOrchestrationComponent,
    data: {
      title: "Orchestration",
    },
  },
  {
    path: "orchestration/run",
    component: RunOrchestrationComponent,
    data: {
      title: "Orchestration",
    },
  },
  {
    path: "monitoringview",
    component: MonitoringComponent,
    data: {
      title: "Utilization Monitoring",
    },
  },
  {
    path: "monitoring-summary",
    component: MonitoringSummaryComponent,
    data: {
      title: "Tactical Overview",
    },
  },
  {
    path: "rightsizehistory",
    component: RightSizeHistoryComponent,
    data: {
      title: "Rightsize History",
    },
  },
  {
    path: "orchestration/:mode/:id",
    component: AddEditOrchestrationComponent,
    data: {
      title: "Orchestration",
    },
  },
  {
    path: "costsetup",
    component: CostSetupComponent,
    data: {
      title: "Price Setup",
    },
  },
  {
    path: "maintenancewindow",
    component: WindowListComponent,
    data: {
      title: "Maintenance Window Setup",
    },
  },
  {
    path: "costsetup/addcost",
    component: AddEditCostComponent,
    data: {
      title: "Price Setup",
    },
  },
  {
    path: "costsetup/editcost/:id",
    component: AddEditCostComponent,
    data: {
      title: "Price Setup",
    },
  },
  {
    path: "tagmanager/creategroup",
    component: TagGroupAddEditComponent,
    data: {
      title: "Create Tag Group",
    },
  },
  {
    path: "tagmanager/group",
    component: TagmanagerComponent,
    data: {
      title: "Tag Group",
    },
  },
  {
    path: "tagmanager/editgroup/:id",
    component: TagGroupAddEditComponent,
    data: {
      title: "Edit Tag Group",
    },
  },
  {
    path: "assets",
    component: AssetsComponent,
    data: {
      title: "Asset Management",
    },
  },
  {
    path: "compliance-report",
    component: ComplianceReportComponent,
    data: {
      title: "Compliance Report",
    },
  },  
  {
    path: "compliance-score",
    component: ComplianceScoreListComponent,
    data: {
      title: "Security Compliance",
    },
  },
  {
    path: "compliance-score/view",
    component: ComplianceScoreComponent,
    data: {
      title: "Security Compliance",
    },
  },
  {
    path: "assetrecords",
    component: AssetRecordsComponent,
    data: {
      title: "CMDB",
    },
  },
  {
    path: "recordtypes",
    component: AssetRecordTypeComponent,
    data: {
      title: "Data management",
    },
  },
  {
    path: "alertconfigs",
    component: AlertConfigComponent,
    data: {
      title: "Alert Configuration",
    },
  },
  {
    path: "notifications",
    component: GlobalNotificationComponent,
    data: {
      title: "Notifications",
    },
  },
  {
    path: "assets/details",
    component: ServerDetailHolderComponent,
    data: {
      title: "Asset Details",
    },
  },
  {
    path: "assets/details/:hostid",
    component: ServerDetailHolderComponent,
    data: {
      title: "Asset Details",
    },
  },
  {
    path: "serverutils",
    component: ServerUtilsMainChartComponent,
    data: {
      title: "Server Utilization",
    },
  },
  {
    path: "workflow",
    component: WorkflowListComponent,
    data: {
      title: "Approval Workflow",
    },
  },
  {
    path: "serverutilsdtls",
    component: ServerUtilDetailsComponent,
    data: {
      title: "Server Utilization",
    },
  },
  {
    path: "recommendation",
    component: RecommendationComponent,
    data: {
      title: "Recommendation",
    },
  },
  {
    path: "recommendation/setup",
    component: RecommendationListComponent,
    data: {
      title: "Setup Recommendation",
    },
  },
  {
    path: "rightsizegroups",
    component: RightsizeGroupComponent,
    data: {
      title: "Rightsize Group",
    },
  },
  {
    path: "tenants",
    component: TenantComponent,
    data: {
      title: "Tenants",
    },
  },
  {
    path: "tenant/create",
    component: AddEditTenantComponent,
    data: {
      title: "Tenants",
    },
  },
  {
    path: "tenant/edit/:id",
    component: AddEditTenantComponent,
    data: {
      title: "Tenants",
    },
  },
  {
    path: "budget",
    component: BudgetComponent,
    data: {
      title: "Budget",
    },
  },
  {
    path: "billing",
    component: BillingComponent,
    data: {
      title: "Asset Billing",
    },
  },
  {
    path: "monitoring",
    component: MonitoringDashboardComponent,
    data: {
      title: "Monitoring",
    },
  },
  {
    path: "tickets",
    component: TicketmanagementComponent,
    data: {
      title: "Ticket Management",
    },
  },
  {
    path: "workpackmanager",
    component: WorkpackManagertComponent,
    data: {
      title: "Workpack Management",
    },
  },
  {
    path: "workpackmanager/createtemplate",
    component: AddedittemplateComponent,
    data: {
      title: "Create Template",
    },
  },
  {
    path: "workpackmanager/edittemplate",
    component: AddedittemplateComponent,
    data: {
      title: "Edit Template",
    },
  },
  {
    path: "workflow-executionlist",
    component: WorkflowExecutionComponent,
    data: {
      title: "Workpack Execution",
    },
  },
  {
    path: "workflow-list",
    component: WorkpackListComponent,
    data: {
      title: "Workpack List",
    },
  },
  {
    path: "workflow-module",
    component: WorkflowManagertComponent,
    data: {
      title: "Workflow",
    },
  },
  {
    path: "common-redirect",
    component: CommonRedirectComponent
  },
  {
    path: "products",
    component: ProductComponent,
    data: {
      title: "Products",
    },
  },
  {
    path: "request-management",
    component: RequestManagementComponent,
    data: {
      title: "Request Management",
    },
  },
  {
    path: "request-management/addrequest",
    component: AddeditRequestManagementComponent,
    data: {
      title: "Create Request",
    },
  },
  {
    path: "request-management/editrequest/:id",
    component: AddeditRequestManagementComponent,
    data: {
      title: "Edit Request",
    },
  },
  {
    path: "request-approvers",
    component: RequestApproversComponent,
    data: {
      title: "Request Approvers",
    },
  },
  {
    path: "patching",
    component: DashboardPatchingComponent,
    data: {
      title: "Patching",
    },
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
    }),
  ], // .../#/getcall
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule { }
