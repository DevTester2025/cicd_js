import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgZorroAntdModule } from "ng-zorro-antd";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChartModule } from "primeng/primeng";
import { TableModule } from "primeng/table";
import { ChipsModule } from "primeng/chips";
import { EditorModule } from "primeng/editor";
import { AgGridModule } from 'ag-grid-angular';

import { AuthGuard } from "../services/auth-guard.service";
import { AddSLAComponent } from "../../business/shared/common/sla-add/sla-add.component";
import { AWSInstanceAddEditComponent } from "../../business/deployments/aws/instance/add-edit-instance/instance-add-edit.component";
import { AmiAddEditComponent } from "../../business/deployments/aws/ami/add-edit-ami/add-edit-ami.component";
import { AddEditCommongatewayComponent } from "../../business/deployments/ecl2/commongateway/add-edit-commongateway/add-edit-commongateway.component";
import { AddEditInternetgatewayComponent } from "../../business/deployments/ecl2/internetgateway/add-edit-internetgateway/add-edit-internetgateway.component";
import { AddEditFirewallComponent } from "../../business/deployments/ecl2/firewall/add-edit-firewall/add-edit-firewall.component";
import { DeploymentsListComponent } from "../../business/deployments/deploysolution/list/deploysolution-list.component";
import { DatatableComponent } from "../components/datatable/datatable.component";
import { EditableTextComponent } from "../components/editable/editable.component";
import { RunOrchestrationComponent } from "../components/run-orchestration/run-orch.component";
import { MaskTextComponent } from "../components/contentmask/mask.component";
import { UptimeCalendarComponent } from "../components/uptime-calendar/uc.component";
import { HTMLRenderComponent } from "../components/htmlrenderer/render.component";
import { ResourceBilling } from "../components/drilldownreport/report.component";
import { ServerDetailComponent } from "../components/serverdetail/serverdetail.component";
import { ServerDetailHolderComponent } from "../components/serverdetailparent/serverdetailparent.component";
import { SkeletonComponent } from "../components/skeleton/sk.component";
import { SyntheticsComponent } from "../components/synthetics/synthetics.component";
import { TagPickerComponent } from "../components/tagpicker/tagpicker.component";
import { ResizeInstanceComponent } from "../../business/deployments/ecl2/instance/resize-instance/resize-instance.component";
import { ECL2AddEditInstanceComponent } from "../../business/deployments/ecl2/instance/add-edit-instance/add-edit-instance.component";
import { ECL2AddEditLbComponent } from "../../business/deployments/ecl2/lb/add-edit-lb/add-edit-lb.component";
import { ECL2AddEditVolumesComponent } from "../../business/deployments/ecl2/volumes/add-edit-volumes/add-edit-volumes.component";
import { ECL2AddEditNetworkComponent } from "../../business/deployments/ecl2/network/add-edit-network/add-edit-network.component";
import { ECL2AddEditAmiComponent } from "../../business/deployments/ecl2/ami/add-edit-ami/add-edit-ami.component";
import { ECL2AddEditSubnetComponent } from "../../business/deployments/ecl2/network/subnet/add-edit-subnet/add-edit-subnet.component";
import { ECL2AddEditPortComponent } from "../../business/deployments/ecl2/network/port/add-edit-port/add-edit-port.component";
import { ECL2AddEditKeysComponent } from "../../business/deployments/ecl2/keys/add-edit-keys/add-edit-keys.component";
import { ECL2LbViewComponent } from "../../business/deployments/ecl2/lb/lb-view/lb-view.component";
import { FirewallinterfaceComponent } from "../../business/deployments/ecl2/firewall/firewallinterface/firewallinterface.component";
import { FirewallvsrxComponent } from "../../business/deployments/ecl2/firewall/firewallvsrx/firewallvsrx.component";
import { GlobalipComponent } from "../../business/deployments/ecl2/internetgateway/globalip/globalip.component";
import { InterfaceComponent } from "../../business/deployments/ecl2/internetgateway/interface/interface.component";
import { KeysAddEditComponent } from "../../business/deployments/aws/keys/add-edit-keys/key-add-edit.component";
import { LbAddEditComponent } from "../../business/deployments/aws/lb/lb-add-edit/lb-add-edit.component";
import { LbInterfaceComponent } from "../../business/deployments/ecl2/lb/lb-interface/lb-interface.component";
import { LbSyslogserversComponent } from "../../business/deployments/ecl2/lb/lb-syslogservers/lb-syslogservers.component";
import { LbVrrpComponent } from "../../business/deployments/ecl2/lb/lb-vrrp/lb-vrrp.component";
import { LbIpComponent } from "../../business/deployments/ecl2/lb/lb-ip/lb-ip.component";
import { NzSideNavComponent } from "../components/sidenav/sidenav.component";
import { OrganizationChartModule } from "primeng/organizationchart";
import { ParametersComponent } from "../../business/admin/parameters/parameters.component";
import { SummaryViewComponent } from "../components/summary/summary-view.component";
import { SideBarComponent } from "../components/sidebar/sidebar.component";
import { ScriptAddEditComponent } from "../../business/tenants/scripts/add-edit/script-add-edit.component";
import { TagAddEditComponent } from "../../business/base/tagmanager/add-edit/tag-add-edit.component";
import { SubnetAddEditComponent } from "../../business/deployments/aws/subnet/add-edit-subnet/subnet-add-edit.component";
import { SgAddEditComponent } from "../../business/deployments/aws/sg/add-edit-sg/sg-add-edit.component";
import { StaticipComponent } from "../../business/deployments/ecl2/internetgateway/staticip/staticip.component";
import { SecurityzoneComponent } from "../../business/deployments/ecl2/firewall/firewallvsrx/securityzone/securityzone.component";
import { VpcAddEditComponent } from "../../business/deployments/aws/vpc/add-edit-vpc/add-edit-vpc.component";
import { VolumeAddEditComponent } from "../../business/deployments/aws/volumes/add-edit-volume/volume-add-edit.component";
import { SourcenatComponent } from "../../business/deployments/ecl2/firewall/firewallvsrx/nat/sourcenat/sourcenat.component";
import { DestinationnatComponent } from "../../business/deployments/ecl2/firewall/firewallvsrx/nat/destinationnat/destinationnat.component";
import { ProxyarpComponent } from "../../business/deployments/ecl2/firewall/firewallvsrx/nat/proxyarp/proxyarp.component";
import { SecuritypolicyComponent } from "../../business/deployments/ecl2/firewall/firewallvsrx/securitypolicy/securitypolicy.component";
import { AddEditInterconnectivityComponent } from "../../business/deployments/ecl2/interconnectivity/add-edit-interconnectivity/add-edit-interconnectivity.component";
import { TenantconnectionComponent } from "../../business/deployments/ecl2/interconnectivity/tenantconnection/tenantconnection.component";
import { VpcListComponent } from "../../business/deployments/aws/vpc/list-vpc/list-vpc.component";
import { AssetsMappingComponent } from "../../business/base/assets/assets-mapping/assets-mapping.component";
import { AddeditcostsComponent } from "../../business/tenants/solutiontemplate/costsummary/addeditcosts/addeditcosts.component";
import { CostsummaryComponent } from "../../business/tenants/solutiontemplate/costsummary/costsummary.component";
import { AssetCostsComponent } from "../../business/base/assets/asset-costs/asset-costs.component";
import { AddEditOrchestrationComponent } from "../../business/base/orchestration/add-edit-orchestration/add-edit-orchestration.component";
import { OrchestrationLogsComponent } from "../../business/base/orchestration/logs/logs.component";
// import { AlertConfigComponent } from "../../business/base/alertconfigs/alert.component";

// Alibaba
import { ALIAddEditInstanceComponent } from "../../business/deployments/alibaba/instance/add-edit-instance/add-edit-instance.component";
import { ALIAddEditImageComponent } from "../../business/deployments/alibaba/image/add-edit-image/add-edit-image.component";
import { ALIAddEditVolumeComponent } from "../../business/deployments/alibaba/volume/add-edit-volume/add-edit-volume.component";
import { ALIAddEditVpcComponent } from "../../business/deployments/alibaba/vpc/add-edit-vpc/add-edit-vpc.component";
import { ALIAddEditVswitchComponent } from "../../business/deployments/alibaba/vswitch/add-edit-vswitch/add-edit-vswitch.component";
import { ALIAddEditSgComponent } from "../../business/deployments/alibaba/sg/add-edit-sg/add-edit-sg.component";
import { ALIAddEditKeypairComponent } from "../../business/deployments/alibaba/keypair/add-edit-keypair/add-edit-keypair.component";
import { ALIAddEditLbComponent } from "../../business/deployments/alibaba/lb/add-edit-lb/add-edit-lb.component";
import { AddEditRecommendationComponent } from "../../business/base/server-utildetails/recommendation/add-edit/add-edit-recommendation.component";
import { AddEditRightsizeGroupComponentComponent } from "../../business/base/rightsizegroup/add-edit/add-edit-rightsizegroup.component";
import { AddEditWorkflowComponent } from "../../business/base/server-utildetails/workflow-config/add-edit/add-edit-workflow.component";
import { UpgradeRequestAddEditComponent } from "src/app/business/base/server-utildetails/add-edit/upgraderequest-add-edit.component";
import { ScheduledRequestAddEditComponent } from "../../business/base/server-utildetails/schedule-resize/scheduled-resize-add-edit.component";
import { ServerUtilsComponent } from "../../business/base/server-utils/server-utils.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { BudgetsummaryComponent } from "../../business/base/assets/budget/budgetsummary/budgetsummary.component";
import { AddeditbudgetComponent } from "../../business/base/assets/budget/addeditbudget/addeditbudget.component";
import { SummarydtlComponent } from "../../business/base/assets/budget/summarydtl/summarydtl.component";
import { ImgFallbackDirective } from "./utils/imgfb.attr";
import { AdhocRequestComponent } from "../../business/srm/adhoc-request/adhoc-request.component";
import { DailybillingComponent } from "../../business/base/assets/billing/dailybilling/dailybilling.component";
import { AddEditVmAccountComponent } from "../../business/tenants/customers/add-edit-vm-account/add-edit-vm-account.component";
import { FiltersComponent } from "../../business/shared/filters/filters.component";
import { AddEditCloudAssetComponent } from "../../business/deployments/cloudassets/add-edit-cloudasset/add-edit-cloudasset.component";
import { AddEditVMwareComponent } from "../../business/deployments/vmware/add-edit-vm/add-edit-vm.component";
import { AddVMAssetsComponent } from "../../business/deployments/vmware/add-edit-vm-assets/add-vm-asset.component";
import { SecurityComponent } from "../../business/base/assets/security/security.component";
import { SecurityComplianceComponent } from "../../business/base/assets/security-compliance/security-compliance.component";
import { AppDetailsComponent } from "../../business/base/assets/wazuh-details/details.component";
import { AddeditticketComponent } from "src/app/business/base/ticketmanagement/addeditticket/addeditticket.component";
import { EventLogViewComponent } from "src/app/business/base/eventlog/eventlog-view.component";
import { TicketViewComponent } from "src/app/business/base/ticketmanagement/ticketview.component";

import { MaintwindowMappingComponent } from "src/app/business/base/server-utildetails/maintenance-window/maintwindow-mapping/maintwindow-mapping.component";
import { CommentsComponent } from "src/app/business/base/comments/comments.component";
import { AddEditWindowComponent } from "src/app/business/base/server-utildetails/maintenance-window/add-edit/add-edit-maintwindow.component";
import { PrometheusComponent } from "../components/serverdetail/prometheus.component";
import { AdditionalFiltersComponent } from "../components/additionalfilters/additionalfilters.component";
import { SnapshotsComponent } from "../components/serverdetail/snapshots/snapshots.component";
import { OperationsComponent } from "../components/serverdetail/operations/operations.component";
import { HistoryComponent } from "../components/serverdetail/history/history.component";
import { ServerSchedulesComponent } from "../../modules/components/serverdetail/schedules/schedules.component";
import { AssetCommentsComponent } from "src/app/business/base/assetrecords/asset-comments.component";
import { AssetParentComponent } from "src/app/business/base/assetrecords/asset-parent.component";
import { AssetDocsComponent } from "src/app/business/base/assetrecords/asset-documents.component";
import { AssetHistoryComponent } from "src/app/business/base/assetrecords/asset-history.component";
import { ReportSettingsComponent } from '../../modules/components/report-settings/report-settings.component';
import { AddedittemplateComponent } from 'src/app/business/base/workpack/template/addedittemplate/addedittemplate.component'
// import { AddedittasktemplateComponent } from 'src/app/business/base/workpack/template/addedittaskstemplate/addedittaskstemplate.component'
import { addEditTaskTemplateAssetsComponent } from 'src/app/business/base/workpack/template/addedittasktemplateAssets/addedittasktemplateAssets.component';
import { tasktemplateAssetListComponent } from 'src/app/business/base/workpack/template/tasktemplateAssetList/tasktemplateAssetList.component';
import { WorkflowAddEditComponent } from 'src/app/business/base/workflow/workflow-add-edit/workflowAddEdit.component';
import { SafePipe } from "src/app/html.pipe";
import { CompareScriptComponent } from 'src/app/business/base/workpack/compareScript/comparescript.component'
import { WorkpackSelectiontComponent } from 'src/app/business/base/workpack/template/workpackselection/workpackselection.component'
import { AddCustomerProductComponent } from 'src/app/business/tenants/customers/products/customer-products.component';
import { AlertNtfComponent } from "../components/alerts/alerts.component";
import { PipelineValidatorComponent } from "src/app/business/cicd/pipeline-template/pipeline-validator/pipeline-validator.component";
import { NotificationsComponent } from "src/app/business/base/notifications/notifications.component";
@NgModule({
  imports: [
    CommonModule,
    ChartModule,
    ChipsModule,
    NgApexchartsModule,
    FormsModule,
    OrganizationChartModule,
    NgZorroAntdModule,
    ReactiveFormsModule,
    TableModule,
    EditorModule,
    AgGridModule
  ],
  declarations: [
    // AlertConfigComponent,
    ImgFallbackDirective,
    SafePipe,
    AddEditInternetgatewayComponent,
    AddEditFirewallComponent,
    AWSInstanceAddEditComponent,
    SecurityComponent,
    AddeditbudgetComponent,
    AddSLAComponent,
    AmiAddEditComponent,
    AddEditRecommendationComponent,
    AppDetailsComponent,
    AddEditWorkflowComponent,
    SecurityComplianceComponent,
    AddEditRightsizeGroupComponentComponent,
    AssetsMappingComponent,
    AssetCostsComponent,
    AddEditOrchestrationComponent,
    OrchestrationLogsComponent,
    ScheduledRequestAddEditComponent,
    AddEditCloudAssetComponent,
    AddEditVMwareComponent,
    AddVMAssetsComponent,
    FiltersComponent,
    AddEditCommongatewayComponent,
    ALIAddEditImageComponent,
    ALIAddEditInstanceComponent,
    ALIAddEditVolumeComponent,
    ServerUtilsComponent,
    ALIAddEditVpcComponent,
    ServerDetailHolderComponent,
    ALIAddEditVswitchComponent,
    ALIAddEditSgComponent,
    ALIAddEditKeypairComponent,
    ALIAddEditLbComponent,
    DatatableComponent,
    EditableTextComponent,
    RunOrchestrationComponent,
    MaskTextComponent,
    UptimeCalendarComponent, HTMLRenderComponent,
    ResourceBilling,
    SkeletonComponent,
    SyntheticsComponent,
    ServerDetailComponent,
    TagPickerComponent,
    ResizeInstanceComponent,
    DeploymentsListComponent,
    ECL2AddEditInstanceComponent,
    ECL2AddEditLbComponent,
    AddeditcostsComponent,
    AddEditVmAccountComponent,
    CostsummaryComponent,
    ECL2AddEditVolumesComponent,
    ECL2AddEditNetworkComponent,
    ECL2AddEditAmiComponent,
    ECL2AddEditSubnetComponent,
    ECL2AddEditPortComponent,
    ECL2AddEditKeysComponent,
    ECL2LbViewComponent,
    FirewallinterfaceComponent,
    FirewallvsrxComponent,
    GlobalipComponent,
    InterfaceComponent,
    KeysAddEditComponent,
    LbAddEditComponent,
    NzSideNavComponent,
    LbInterfaceComponent,
    LbSyslogserversComponent,
    LbVrrpComponent,
    LbIpComponent,
    ParametersComponent,
    SummaryViewComponent,
    SideBarComponent,
    ScriptAddEditComponent,
    UpgradeRequestAddEditComponent,
    TagAddEditComponent,
    SubnetAddEditComponent,
    SgAddEditComponent,
    StaticipComponent,
    SecuritypolicyComponent,
    SecurityzoneComponent,
    AddEditInterconnectivityComponent,
    VolumeAddEditComponent,
    VpcAddEditComponent,
    VpcListComponent,
    SourcenatComponent,
    DestinationnatComponent,
    ProxyarpComponent,
    TenantconnectionComponent,
    BudgetsummaryComponent,
    SummarydtlComponent,
    AdhocRequestComponent,
    DailybillingComponent,
    AddeditticketComponent,
    EventLogViewComponent,
    TicketViewComponent,
    MaintwindowMappingComponent,
    CommentsComponent,
    AddEditWindowComponent,
    PrometheusComponent,
    AdditionalFiltersComponent,
    ReportSettingsComponent,
    SnapshotsComponent,
    OperationsComponent,
    HistoryComponent,
    ServerSchedulesComponent,
    AssetParentComponent,
    AssetCommentsComponent,
    AssetDocsComponent,
    AssetHistoryComponent,
    AddedittemplateComponent,
    // AddedittasktemplateComponent,
    addEditTaskTemplateAssetsComponent,
    tasktemplateAssetListComponent,
    WorkflowAddEditComponent,
    CompareScriptComponent,
    WorkpackSelectiontComponent,
    AddCustomerProductComponent, 
    AlertNtfComponent,
    PipelineValidatorComponent,
    NotificationsComponent
  ],
  exports: [
    ImgFallbackDirective,
    AWSInstanceAddEditComponent,
    AddSLAComponent,
    AmiAddEditComponent,
    AddEditInternetgatewayComponent,
    AddEditFirewallComponent,
    AddeditbudgetComponent,
    AddEditCommongatewayComponent,
    SecurityComponent,
    AddeditcostsComponent,
    AppDetailsComponent,
    CostsummaryComponent,
    AddEditCloudAssetComponent,
    AddEditVMwareComponent,
    AddVMAssetsComponent,
    FiltersComponent,
    AddEditInterconnectivityComponent,
    ALIAddEditImageComponent,
    ServerUtilsComponent,
    ALIAddEditInstanceComponent,
    SecurityComplianceComponent,
    ALIAddEditVolumeComponent,
    ALIAddEditVpcComponent,
    ServerDetailHolderComponent,
    AddEditRightsizeGroupComponentComponent,
    AddEditRecommendationComponent,
    ScheduledRequestAddEditComponent,
    AddEditWorkflowComponent,
    AssetsMappingComponent,
    AssetCostsComponent,
    AddEditOrchestrationComponent,
    OrchestrationLogsComponent,
    ALIAddEditVswitchComponent,
    ALIAddEditSgComponent,
    ALIAddEditKeypairComponent,
    ALIAddEditLbComponent,
    CommonModule,
    ChartModule,
    ChipsModule,
    DatatableComponent,
    EditableTextComponent,
    RunOrchestrationComponent,
    MaskTextComponent,
    UptimeCalendarComponent, HTMLRenderComponent,
    ResourceBilling,
    SkeletonComponent,
    SyntheticsComponent,
    ServerDetailComponent,
    TagPickerComponent,
    ResizeInstanceComponent,
    DeploymentsListComponent,
    ECL2AddEditInstanceComponent,
    AddEditVmAccountComponent,
    ECL2AddEditLbComponent,
    ECL2AddEditVolumesComponent,
    ECL2AddEditNetworkComponent,
    ECL2AddEditAmiComponent,
    ECL2AddEditSubnetComponent,
    ECL2AddEditPortComponent,
    ECL2AddEditKeysComponent,
    ECL2LbViewComponent,
    FirewallinterfaceComponent,
    FirewallvsrxComponent,
    FormsModule,
    GlobalipComponent,
    InterfaceComponent,
    KeysAddEditComponent,
    LbAddEditComponent,
    LbInterfaceComponent,
    LbSyslogserversComponent,
    LbVrrpComponent,
    LbIpComponent,
    NgZorroAntdModule,
    NzSideNavComponent,
    OrganizationChartModule,
    ParametersComponent,
    ReactiveFormsModule,
    SummaryViewComponent,
    SideBarComponent,
    ScriptAddEditComponent,
    UpgradeRequestAddEditComponent,
    TagAddEditComponent,
    SubnetAddEditComponent,
    SgAddEditComponent,
    StaticipComponent,
    SecuritypolicyComponent,
    SecurityzoneComponent,
    TableModule,
    VpcAddEditComponent,
    VpcListComponent,
    VolumeAddEditComponent,
    SourcenatComponent,
    DestinationnatComponent,
    ProxyarpComponent,
    TenantconnectionComponent,
    BudgetsummaryComponent,
    SummarydtlComponent,
    AdhocRequestComponent,
    DailybillingComponent,
    AddeditticketComponent,
    EventLogViewComponent,
    TicketViewComponent,
    MaintwindowMappingComponent,
    CommentsComponent,
    AddEditWindowComponent,
    PrometheusComponent,
    AdditionalFiltersComponent,
    ReportSettingsComponent,
    // AlertConfigComponent,
    SnapshotsComponent,
    OperationsComponent,
    HistoryComponent,
    ServerSchedulesComponent,
    AssetParentComponent,
    AssetCommentsComponent,
    AssetDocsComponent,
    AssetHistoryComponent,
    AddedittemplateComponent,
    // AddedittasktemplateComponent,
    addEditTaskTemplateAssetsComponent,
    tasktemplateAssetListComponent,
    WorkflowAddEditComponent,
    CompareScriptComponent,
    WorkpackSelectiontComponent,
    AddCustomerProductComponent,
    AlertNtfComponent,
    AgGridModule,
    PipelineValidatorComponent,
    NotificationsComponent
  ],
  providers: [AuthGuard],
})
export class SharedModule { }
