import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthGuard } from "src/app/modules/services/auth-guard.service";
import { CicdDashboardComponent } from "./cicd-dashboard/cicd-dashboard.component";
import { SetupComponent } from "./setup/setup.component";
import { PipelineTemplateComponent } from "./pipeline-template/pipeline-template.component";
import { ReleasesComponent } from "./releases/releases.component";
import { PipelineTemplateDesign } from "./pipeline-template/pipeline-template-design/pipeline-template-design";
import { AddEditReleaseComponent } from "./releases/add-edit-release/add-edit-release.component";
import { ReleaseViewComponent } from "./releases/release-view/release-view.component";
import { AddEditProviderComponent } from "./setup/setupmaster-providers/add-edit-provider/add-edit-provider.component";
import { AddEditContainerRegistryComponent } from "./setup/setupmaster-container-registry/add-edit-container-registry/add-edit-container-registry.component";
import { AddEditTestsComponent } from "./setup/setupmaster-tests/add-edit-tests/add-edit-tests.component";
import { AddEditEnvironmentsComponent } from "./setup/setupmaster-environments/add-edit-environments/add-edit-environments.component";
import { AddEditCustomVariablesComponent } from "./setup/setupmaster-environments/add-edit-custom-variables/add-edit-custom-variables.component";
import { AddEditBuildComponent } from "./setup/setupmaster-build/add-edit-build/add-edit-build.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "cicd",
        canActivate: [AuthGuard],
        component: CicdDashboardComponent,
        data: {
          title: "CICD Dashboard",
        },
      },
      {
        path: "cicd/setup",
        canActivate: [AuthGuard],
        component: SetupComponent,
        data: {
          title: "Setup",
        },
      },
      {
        path: "cicd/setup/provider/create",
        canActivate: [AuthGuard],
        component: AddEditProviderComponent,
        data: {
          title: "Create Provider",
        },
      },
      {
        path: "cicd/setup/provider/update/:id",
        canActivate: [AuthGuard],
        component: AddEditProviderComponent,
        data: {
          title: "Update Provider",
        },
      },
      {
        path: "cicd/setup/containerregistry/create",
        canActivate: [AuthGuard],
        component: AddEditContainerRegistryComponent,
        data: {
          title: "Create Container Registry",
        },
      },
      {
        path: "cicd/setup/containerregistry/update/:id",
        canActivate: [AuthGuard],
        component: AddEditContainerRegistryComponent,
        data: {
          title: "Update Container Registry",
        },
      },
      {
        path: "cicd/setup/testtool/create",
        canActivate: [AuthGuard],
        component: AddEditTestsComponent,
        data: {
          title: "Create Test Tool",
        },
      },
      {
        path: "cicd/setup/testtool/update/:id",
        canActivate: [AuthGuard],
        component: AddEditTestsComponent,
        data: {
          title: "Update Test Tool",
        },
      },
      {
        path: "cicd/setup/environments/create",
        canActivate: [AuthGuard],
        component: AddEditEnvironmentsComponent,
        data: {
          title: "Create Environments",
        },
      },
      {
        path: "cicd/setup/environments/update/:id",
        canActivate: [AuthGuard],
        component: AddEditEnvironmentsComponent,
        data: {
          title: "Update Environments",
        },
      },
      {
        path: "cicd/setup/customvariable/create",
        canActivate: [AuthGuard],
        component: AddEditCustomVariablesComponent,
        data: {
          title: "Create Custom Variables",
        },
      },
      {
        path: "cicd/setup/customvariable/update/:id",
        canActivate: [AuthGuard],
        component: AddEditCustomVariablesComponent,
        data: {
          title: "Update Custom Variables",
        },
      },
      {
        path: "cicd/pipelinetemplate",
        canActivate: [AuthGuard],
        component: PipelineTemplateComponent,
        data: {
          title: "Pipeline Template",
        },
      },
      {
        path: "cicd/releases",
        canActivate: [AuthGuard],
        component: ReleasesComponent,
        data: {
          title: "Releases",
        },
      },
      // {
      //   path: "cicd/releases/:tabIndex/:page",
      //   canActivate: [AuthGuard],
      //   component: ReleasesComponent,
      //   data: {
      //     title: "Releases",
      //   },
      // },
      {
        path: "cicd/pipelinetemplate/createpipelinetemplate",
        canActivate: [AuthGuard],
        component: PipelineTemplateDesign,
        data: {
          title: "Pipeline Template Design",
        },
      },
      {
        path: "cicd/pipelinetemplate/:mode/:id",
        canActivate: [AuthGuard],
        component: PipelineTemplateDesign,
        data: {
          title: "Pipeline Template",
        },
      },
      {
        path: "cicd/pipelinetemplate/:mode/:templatename",
        canActivate: [AuthGuard],
        component: PipelineTemplateDesign,
        data: {
          title: "Pipeline Template Design",
        },
      },
      {
        path: "cicd/release/create",
        canActivate: [AuthGuard],
        component: AddEditReleaseComponent,
        data: {
          title: "Create Release",
        },
      },
      {
        path: "cicd/release/update/:id",
        canActivate: [AuthGuard],
        component: AddEditReleaseComponent,
        data: {
          title: "Update Release",
        },
      },
      {
        path: "cicd/release/view/:id",
        canActivate: [AuthGuard],
        component: ReleaseViewComponent,
        data: {
          title: "View Release",
        },
      },
      {
        path: "cicd/setup/build/create",
        canActivate: [AuthGuard],
        component: AddEditBuildComponent,
        data: {
          title: "Create Build",
        },
      },
      {
        path: "cicd/setup/build/update/:id",
        canActivate: [AuthGuard],
        component: AddEditBuildComponent,
        data: {
          title: "Update Build",
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class CicdRoutingModule { }
