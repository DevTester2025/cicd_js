import { NgModule } from "@angular/core";
import { NZ_I18N, en_US } from "ng-zorro-antd";
import en from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { PipelineTemplateComponent } from "./pipeline-template/pipeline-template.component";
import { SetupComponent } from "./setup/setup.component";
import { ReleasesComponent } from "./releases/releases.component";
import { CicdDashboardComponent } from "./cicd-dashboard/cicd-dashboard.component";
import { CicdRoutingModule } from "./cicd.routing";
import { PipelineTemplateDesign } from "./pipeline-template/pipeline-template-design/pipeline-template-design";
import { ReleasesListComponent } from "./releases/releases-list/releases-list.component";
import { ReleasesTransactionsComponent } from "./releases/releases-transactions/releases-transactions.component";
import { AddEditReleaseComponent } from "./releases/add-edit-release/add-edit-release.component";
import { ReactiveFormsModule } from "@angular/forms";
import { ReleaseViewComponent } from "./releases/release-view/release-view.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { ChartModule } from "primeng/primeng";
import { SetupmasterTestsComponent } from "./setup/setupmaster-tests/setupmaster-tests.component";
import { SetupmasterEnvironmentsComponent } from "./setup/setupmaster-environments/setupmaster-environments.component";
import { SetupmasterContainerRegistryComponent } from "./setup/setupmaster-container-registry/setupmaster-container-registry.component";
import { SetupmasterProvidersComponent } from "./setup/setupmaster-providers/setupmaster-providers.component";
import { AddEditProviderComponent } from "./setup/setupmaster-providers/add-edit-provider/add-edit-provider.component";
import { AddEditContainerRegistryComponent } from "./setup/setupmaster-container-registry/add-edit-container-registry/add-edit-container-registry.component";
import { AddEditTestsComponent } from "./setup/setupmaster-tests/add-edit-tests/add-edit-tests.component";
import { AddEditEnvironmentsComponent } from "./setup/setupmaster-environments/add-edit-environments/add-edit-environments.component";
import { AddEditCustomVariablesComponent } from "./setup/setupmaster-environments/add-edit-custom-variables/add-edit-custom-variables.component";
import { SetupmasterBuildComponent } from "./setup/setupmaster-build/setupmaster-build.component";
import { AddEditBuildComponent } from "./setup/setupmaster-build/add-edit-build/add-edit-build.component";
import { EditorModule } from "primeng/editor";
import { PipelineTemplateProperties } from "./pipeline-template/pipeline-template-properties/pipeline-settings";
import { AlertsNotificationComponent } from "./pipeline-template/pipeline-template-properties/alert-notifications/alert-notifications.component";
import { TemplatePropertiesComponent } from "./pipeline-template/pipeline-template-properties/properties/properties.component";
import { RollbackRetriesComponent } from "./pipeline-template/pipeline-template-properties/rollback-retries/rollback-retries.component";
import { DeploymentOptionsComponent } from "./pipeline-template/pipeline-template-properties/deployment-options/deployment-options.component";
import { CMDBTemplateComponent } from "./pipeline-template/pipeline-template-properties/CMDB/cmdb.component";
import { PropNotificationComponent } from "./pipeline-template/pipeline-template-properties/notifications/notifications.component";
import { IntegrationsComponent } from "./pipeline-template/pipeline-template-properties/integrations/integrations.component";

registerLocaleData(en);

@NgModule({
  imports: [
    CicdRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    ChartModule,
    EditorModule,
  ],
  declarations: [
    PipelineTemplateComponent,
    SetupComponent,
    ReleasesComponent,
    CicdDashboardComponent,
    PipelineTemplateDesign,
    ReleasesListComponent,
    ReleasesTransactionsComponent,
    AddEditReleaseComponent,
    ReleaseViewComponent,
    SetupmasterTestsComponent,
    SetupmasterEnvironmentsComponent,
    SetupmasterContainerRegistryComponent,
    SetupmasterProvidersComponent,
    AddEditProviderComponent,
    AddEditContainerRegistryComponent,
    AddEditTestsComponent,
    AddEditEnvironmentsComponent,
    AddEditCustomVariablesComponent,
    SetupmasterBuildComponent,
    AddEditBuildComponent,
    PipelineTemplateProperties,
    RollbackRetriesComponent,
    AlertsNotificationComponent,
    IntegrationsComponent,
    TemplatePropertiesComponent,
    DeploymentOptionsComponent,
    CMDBTemplateComponent,
    PropNotificationComponent,
  ],
  providers: [HttpHandlerService, { provide: NZ_I18N, useValue: en_US }],
  exports: [],
})
export class CICDModule {}
