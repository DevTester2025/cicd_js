import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ChipsModule } from "primeng/chips";
import { ChartModule } from "primeng/primeng";
import en from "@angular/common/locales/en";
import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from "@angular/http";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { NgZorroAntdModule, NZ_I18N, en_US } from "ng-zorro-antd";
import { registerLocaleData } from "@angular/common";
import { TableModule } from "primeng/table";
import { TreeModule } from "angular-tree-component";
import { MultiSelectModule } from "primeng/multiselect";
import { TreeTableModule } from "primeng/treetable";
import { ContextMenuModule } from "primeng/contextmenu";
import { MenuModule } from "primeng/menu";

import { AppConstant } from "./app.constant";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routing";
import { AddEditTenantComponent } from "./business/admin/tenant/add-edit-tenant/add-edit-tenant.component";
import { CommonService } from "./modules/services/shared/common.service";
import { ServerUtilsService } from "../app/business/base/server-utildetails/services/server-utils.service";
import { CommonFileService } from "./modules/services/commonfile.service";
import { DeploymentsModule } from "./business/deployments/deployments.module";
import { DashboardModule } from "./business/admin/dashboard/dashboard.module";
import { LoginModule } from "./business/base/login/login.module";
import { LocalStorageService } from "./modules/services/shared/local-storage.service";
import { ParametersModule } from "./business/admin/parameters/parameters.module";
import { RoleModule } from "./business/admin/role/role.module";
import { CostSetupComponent } from "./business/base/assets/costsetup/costsetup.component";
import { SharedModule } from "./modules/shared/shared.module";
import { SolutionModule } from "./business/tenants/solutiontemplate/solution.module";
import { SrmModule } from "./business/srm/srm.module";
import { SocketIoModule } from 'ngx-socket-io';
import { TenantsModule } from "./business/tenants/tenants.module";
import { TCOComponent } from "./business/base/tco/tco.component";
import { TenantComponent } from "./business/admin/tenant/tenant.component";
import { UserModule } from "./business/admin/users/users.module";
import { TagmanagerComponent } from "./business/base/tagmanager/tagmanager.component";
import { OrchestrationComponent } from "./business/base/orchestration/orchestration.component";
import { TagGroupAddEditComponent } from "./business/base/tagmanager/add-edit/tag-group-add-edit.component";
import { AssetsComponent } from "./business/base/assets/assets.component";
import { AssetRecordsComponent } from "./business/base/assetrecords/assetrecords.component";
import { GlobalNotificationComponent } from "./business/base/global-notification.component";
import { AssetsDashboardComponent } from "./business/base/assets/assets-dashboard/assets-dashboard.component";
import { AssetsListComponent } from "./business/base/assets/assets-list/assets-list.component";
import { AddEditCostComponent } from "./business/base/assets/costsetup/add-edit/costsetup-add-edit.component";
import { ServerUtilsMainChartComponent } from "./business/base/server-utils/utils-main-chart.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { ServerUtilDetailsComponent } from "./business/base/server-utildetails/server-utildetails.component";
import { ServerDetailUtilizationComponent } from "./business/base/server-utildetails/utilization/utilization.component";
import { ServerDetailPredictionComponent } from "./business/base/server-utildetails/prediction/prediction.component";
import { RecommendationComponent } from "./business/base/server-utildetails/recommendation/recommendation.component";
import { RecommendationListComponent } from "./business/base/server-utildetails/recommendation/list/recommendation-list.component";
import { RightsizeGroupComponent } from "./business/base/rightsizegroup/list/rightsizegroup-list.component";
import { SetupRecommendationComponent } from "./business/base/server-utildetails/recommendation/setup/recommendation-setup.component";
import { WorkflowListComponent } from "./business/base/server-utildetails/workflow-config/list/workflow-list.component";
import { RecommendationService } from "./business/base/server-utildetails/recommendation/recommendation.service";
import { RightsizegroupService } from "./business/base/rightsizegroup/rightsizegroup.service";
import { RecommendationSetupService } from "./business/base/server-utildetails/recommendation/setup/recommendation-setup.service";
import { WorkflowService } from "./business/base/server-utildetails/workflow-config/workflow.service";
import { OrchestrationService } from "./business/base/orchestration/orchestration.service";
import { ResizeRequestViewComponent } from "./business/srm/upgrade-request/request-view/resize-request-view.component";
import { BudgetComponent } from "./business/base/assets/budget/budget.component";
import { BillingComponent } from "./business/base/assets/billing/billing.component";
import { MonitoringComponent } from "./business/base/monitoring/monitoring.component";
import { MonitoringSummaryComponent } from "./business/base/monit-summary/monit-summary.component";
import { RightSizeHistoryComponent } from "./business/base/rightsizehistory/rs-history.component";
import { RightsizeDashboardComponent } from "./business/base/assets/rightsize-dashboard/rightsize-dashboard.component";
import { MonitoringDashboardComponent } from "./business/base/assets/monitoring-dashboard/monitoring-dashboard.component";
import { RealtimeMonitoringComponent } from "./business/base/assets/monitoring-dashboard/realtime-monitoring/realtime-monitoring.component";
import { UsageMonitoringComponent } from "./business/base/assets/monitoring-dashboard/usage-monitoring/usage-monitoring.component";
import { UsageChartComponent } from "./business/base/assets/monitoring-dashboard/usage-monitoring/usage-chart/usage-chart.component";
import { InstanceListComponent } from "./business/base/assets/monitoring-dashboard/instance-list/instance-list.component";
import { MonitoringAlertsComponent } from "./business/base/assets/monitoring-dashboard/monitoring-alerts/monitoring-alerts.component";
import { CreateAlertsComponent } from "./business/base/assets/monitoring-dashboard/monitoring-alerts/create-alerts/create-alerts.component";
import { MonitoringNotificationsComponent } from "./business/base/assets/monitoring-dashboard/monitoring-notifications/monitoring-notifications.component";
import { AlertConfigComponent } from "./business/base/alertconfigs/alert.component";
import { AssetTagsComponent } from "./business/base/assetrecords/asset-tag.component";
import { AssetInfoComponent } from "./business/base/assetrecords/asset-info.component";
import { EventLogListComponent } from "./business/base/eventlog/eventlog-list.component";
import { AssetRecordTypeComponent } from "./business/base/recordtypes/recordtype.component";
import { AddEditRecordTypeComponent } from "./business/base/recordtypes/addedit-recordtype.component";
import { WazuhService } from "./business/base/assets/security/wazuh.service";
import { TicketmanagementComponent } from "./business/base/ticketmanagement/ticketmanagement.component";
import { WorkpackManagertComponent } from "./business/base/workpack/template/workpackmanager.component";
import { MonitoringModule } from "./monitoring/monitoring.module";
import { NodeManagerModule } from "./business/base/assets/nodemangement/nodemanagement.module";
import { AttributefiltersComponent } from "./modules/components/attributefilters/attributefilters.component";
import { WorkflowManagertComponent } from "src/app/business/base/workflow/workflow.component";
import { WorkpackWorkflowService } from "src/app/business/base/workflow/workflow.service";
import { CommonRedirectComponent } from "src/app/modules/components/common-redirect/commonredirect.component";
import { QueryBuilderComponent } from "./modules/components/query-builder/query-builder.component";
import { WorkpackService } from "src/app/business/base/workpack/workpack.service";
import { WorkflowExecutionComponent } from "./business/base/workpack/execution/workpackexecution.component";
import { ProductMappingComponent } from "./business/base/assets/product-mapping/productmapping.component";
import { ProductComponent } from "../app/business/base/product/product.component";
import { AddEditProductComponent } from "../app/business/base/product/addedit-product.component";
import { WorkpackDefinitionComponent } from "./business/base/workpack/workpack-definition/workpackdefinition.component";
import { RequestManagementComponent } from "./business/base/request-management/request-management.component";
import { AddeditRequestManagementComponent } from "./business/base/request-management/addedit-request-management/addedit-request-management.component";
import { RequestApproversComponent } from "./business/base/request-management/request-approvers/request-approvers.component";
import { RequestApproversService } from "./business/base/request-management/request-approvers/request-approvers.service";
// import { RequestApproverAddEditComponent } from "./business/base/request-management/request-approvers/request-approver-add-edit/request-approver-add-edit/request-approver-add-edit.component";
import { WorkpackListComponent } from './business/base/workpack/list/workpack-list.component';
import { ApprovalFlowComponent } from './business/base/workflow/workflow-approvers/workflow-approvers.component';
import { CICDModule } from "./business/cicd/cicd.module";
import { environment } from "src/environments/environment";
import { ContactpointsService } from "./modules/services/shared/contactpoints.service";
// import { ErrorHandler } from "@angular/core";
// import * as Sentry from "@sentry/browser";
// import { SentryErrorHandler } from "./sentry-error-handler";
import { ComplianceReportComponent } from "./presentation/web/base/compliance-report/compliance-report.component";
import { NestedSectionsComponent } from "./presentation/web/base/compliance-report/sub-section.component";
import { ComplianceScoreListComponent } from "./presentation/web/base/compliance-score/compliance-score-list.component";
import { ComplianceScoreComponent } from './presentation/web/base/compliance-score/compliance-score-view/compliance-score.component';
import { ComplianceLogsComponent } from "./presentation/web/base/compliance-score/compliance-logs/compliance-logs.component";
import { DashboardPatchingComponent } from "./presentation/web/base/dashboard-patching/patching.component";
registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    RecommendationListComponent,
    RightsizeGroupComponent,
    SetupRecommendationComponent,
    AddEditTenantComponent,
    TCOComponent,
    AddEditCostComponent,
    TenantComponent,
    OrchestrationComponent,
    CostSetupComponent,
    TagmanagerComponent,
    TagGroupAddEditComponent,
    RightsizeDashboardComponent,
    AssetsComponent,
    AssetRecordsComponent,
    GlobalNotificationComponent,
    AssetsDashboardComponent,
    MonitoringComponent,
    MonitoringSummaryComponent,
    RightSizeHistoryComponent,
    BillingComponent,
    ResizeRequestViewComponent,
    WorkflowListComponent,
    AssetsListComponent,
    ServerUtilsMainChartComponent,
    ServerUtilDetailsComponent,
    ServerDetailPredictionComponent,
    ServerDetailUtilizationComponent,
    RecommendationComponent,
    BudgetComponent,
    MonitoringDashboardComponent,
    RealtimeMonitoringComponent,
    UsageMonitoringComponent,
    UsageChartComponent,
    InstanceListComponent,
    MonitoringAlertsComponent,
    CreateAlertsComponent,
    MonitoringNotificationsComponent,
    AlertConfigComponent,
    AssetTagsComponent,
    AssetInfoComponent,
    EventLogListComponent,
    AssetRecordTypeComponent,
    AddEditRecordTypeComponent,
    TicketmanagementComponent,
    WorkpackManagertComponent,
    AttributefiltersComponent,
    WorkflowManagertComponent,
    CommonRedirectComponent,
    QueryBuilderComponent,
    WorkflowExecutionComponent,
    ProductMappingComponent,
    ProductComponent,
    AddEditProductComponent,
    WorkpackDefinitionComponent,
    RequestManagementComponent,
    AddeditRequestManagementComponent,
    RequestApproversComponent,
    // RequestApproverAddEditComponent,
    WorkpackListComponent,
    // ApprovalFlowComponent,
    ComplianceReportComponent,
    NestedSectionsComponent,
    ComplianceScoreListComponent,
    ComplianceScoreComponent,
    ComplianceLogsComponent,
    DashboardPatchingComponent,
  ],
  imports: [
    TreeModule.forRoot(),
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    ChipsModule,
    ChartModule,
    DeploymentsModule,
    DashboardModule,
    NgApexchartsModule,
    HttpClientModule,
    HttpModule,
    LoginModule,
    NgZorroAntdModule,
    ParametersModule,
    RoleModule,
    SocketIoModule.forRoot({
      url: environment.baseURL.replace("/cloudmatiq", ""), options: {}
    }),
    SolutionModule,
    SrmModule,
    SharedModule,
    TableModule,
    TenantsModule,
    MonitoringModule,
    UserModule,
    NodeManagerModule,
    // NgxTreeSelectModule.forRoot({
    //   allowFilter: true,
    //   filterPlaceholder: 'Type your filter here...',
    //   maxVisibleItemCount: 5,
    //   idField: 'id',
    //   textField: 'name',
    //   childrenField: 'children',
    //   filterCaseSensitive: false,
    //   allowParentSelection: true,
    //   expandMode: ""
    // })
    MultiSelectModule,
    TreeTableModule,
    ContextMenuModule,
    MenuModule,
    CICDModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    // {
    //   provide: ErrorHandler,
    //   useValue: Sentry.captureException(SentryErrorHandler),
    // },
    CommonService,
    OrchestrationService,
    RightsizegroupService,
    CommonFileService,
    WazuhService,
    ServerUtilsService,
    WorkflowService,
    RecommendationService,
    RecommendationSetupService,
    LocalStorageService,
    WorkpackWorkflowService,
    WorkpackService,
    RequestApproversService,
    ContactpointsService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
