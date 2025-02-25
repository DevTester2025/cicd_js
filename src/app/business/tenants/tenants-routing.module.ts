import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../../modules/services/auth-guard.service";
import { ScriptsListComponent } from "./scripts/list/script-list.component";
import { CustomersComponent } from "./customers/customers.component";
import { NotificationSetupComponent } from "./network setup/notificationsetup.component";
import { CustomerDashboardComponent } from "./customers/customer-dashboard/customer-dashboard.component";
import { MetricsViewComponent } from "./customers/customer-dashboard/metrics-view/metrics-view.component";
import { AppConstant } from "../../app.constant";
import { SLAComponent } from "./servicemgmt/sla.component";
import { SLADashboardComponent } from "./sla-dashboard/sla-dashboard.component";
import { SLATemplateComponent } from "./servicemgmt/slatemplates/slatemplate.component";
import { KpireportingComponent } from "./kpireporting/kpireporting.component";
import { AddEditConfigComponent } from "./kpireporting/add-edit-config/add-edit-config.component";
import { AddEditKpireportingComponent } from './kpireporting/add-edit-kpireporting/add-edit-kpireporting.component';
const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "scripts/list",
        canActivate: [AuthGuard],
        component: ScriptsListComponent,
        data: {
          title: "Scripts",
        },
      },
      {
        path: "subtenant",
        canActivate: [AuthGuard],
        component: CustomersComponent,
        data: {
          title: AppConstant.SUBTENANT,
        },
      },
      {
        path: "notification/setup",
        canActivate: [AuthGuard],
        component: NotificationSetupComponent,
        data: {
          title: "Notification Setup",
        },
      },
      {
        path: "dashboard/:customerid",
        // canActivate: [AuthGuard],
        component: CustomerDashboardComponent,
        data: {
          title: "Customer Dashboard",
        },
      },
      {
        path: "dashboard/metrics/:customerid",
        // canActivate: [AuthGuard],
        component: MetricsViewComponent,
        data: {
          title: "Customer Dashboard",
        },
      },
      {
        path: "slm",
        component: SLATemplateComponent,
        data: {
          title: "Service Level Management",
        },
      },
      {
        path: "operationalanalyser",
        component: SLADashboardComponent,
        data: {
          title: "Operations Trends Analyzer",
        },
      },
      {
        path: "kpi/reporting",
        component: KpireportingComponent,
        data: {
          title: "KPI Reporting",
        },
      },
      {
        path: "kpi/reporting/create",
        component: AddEditKpireportingComponent,
        data: {
          title: "KPI Reporting",
        },
      },
      {
        path: "kpi/reporting/edit/:id",
        component: AddEditKpireportingComponent,
        data: {
          title: "KPI Reporting",
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class TenantsRoutingModule { }
