import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
// import { SolutionTemplateCreateComponent } from './create/solutiontemplatecreate.component';
import { AuthGuard } from "../../../modules/services/auth-guard.service";
// import { SolutionTemplateComponent } from './solutiontemplate.component';
// import { SolutionTemplateAWSLbComponent } from 'src/app/business/tenants/solutiontemplate/aws/lb.component';
// import { SolutionTemplateAWSInstancesComponent } from 'src/app/business/tenants/solutiontemplate/aws/instances.component';
import { SolutionListComponent } from "./list-solution/solutiontemplatelist.component";
import { SolutionAddEditComponent } from "./add-edit-solution/solution-add-edit.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "solutiontemplate/create",
        canActivate: [AuthGuard],
        component: SolutionAddEditComponent,
        data: {
          title: "Solution Template",
        },
      },
      // {
      //     path: 'solution/:mode', canActivate: [AuthGuard], component: SolutionTemplateComponent, data: {
      //         title: 'Solution Template'
      //     },
      // },
      // {
      //     path: 'solution/:mode/aws/instances', canActivate: [AuthGuard], component: SolutionTemplateAWSInstancesComponent, data: {
      //         title: 'Solution Template'
      //     },
      // },
      // {
      //     path: 'solution/:mode/aws/lb', canActivate: [AuthGuard], component: SolutionTemplateAWSLbComponent, data: {
      //         title: 'Solution Template'
      //     },
      // },
      {
        path: "solutiontemplate/edit/:sid",
        canActivate: [AuthGuard],
        component: SolutionAddEditComponent,
        data: {
          title: "Solution Template",
        },
      },
      {
        path: "solutiontemplate",
        canActivate: [AuthGuard],
        component: SolutionListComponent,
        data: {
          title: "Solution Templates",
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class SolutionRoutingModule {}
