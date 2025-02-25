import { NgModule } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { AccordionModule } from "primeng/accordion";

import { AddEditCustomerComponent } from "./customers/add-edit-customer/add-edit-customer.component";
import { AddEditCustomerAccountComponent } from "./customers/add-edit-customer-account/add-edit-customer-account";
import { CustomersComponent } from "./customers/customers.component";
import { ScriptsListComponent } from "./scripts/list/script-list.component";
import { SharedModule } from "../../modules/shared/shared.module";
import { TenantsRoutingModule } from "./tenants-routing.module";
import { NotificationSetupService } from "./network setup/notificationsetup.service";
import { NotificationSetupComponent } from "./network setup/notificationsetup.component";
import { AddEditNotificationComponent } from "./network setup/add-edit/notificationsetup-add-edit.component";
import { CustomerDashboardComponent } from "./customers/customer-dashboard/customer-dashboard.component";
import { MetricsViewComponent } from "./customers/customer-dashboard/metrics-view/metrics-view.component";
import { KpiSetupComponent } from "./servicemgmt/kpisetup/kpisetup.component";
import { KpiTicketListComponent } from "./servicemgmt/kpisetup/tickets/tickets-list.component";
import { KpiTicketAddEditComponent } from "./servicemgmt/kpisetup/tickets/tickets-addedit.component";
import { KpiUptimeAddEditComponent } from "./servicemgmt/kpisetup/uptime/uptime-addedit.component";
import { KpiUptimeListComponent } from "./servicemgmt/kpisetup/uptime/uptime-list.component";
import { SLAComponent } from "./servicemgmt/sla.component";
import { SLATemplateComponent } from "./servicemgmt/slatemplates/slatemplate.component";
import { NtfBannerComponent } from "./customers/customer-dashboard/notification-banner/notification-banner.component";
import { SLADashboardComponent } from "./sla-dashboard/sla-dashboard.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { SLAAddEditTemplateComponent } from "./servicemgmt/slatemplates/add-edit-slatemplate.component";
import { AddSlaComponent } from './customers/add-sla/add-sla.component';
import { KpireportingComponent } from './kpireporting/kpireporting.component';
import { AddEditConfigComponent } from './kpireporting/add-edit-config/add-edit-config.component';
import { AddKpiComponent } from './customers/add-kpi/add-kpi.component';
import { AddEditKpireportingComponent } from './kpireporting/add-edit-kpireporting/add-edit-kpireporting.component';
import { ReportComponent } from './kpireporting/add-edit-kpireporting/report/report.component';
import { EditorModule } from "primeng/primeng";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TenantsRoutingModule,
    AccordionModule,
    NgApexchartsModule,
    EditorModule
  ],
  declarations: [
    AddEditCustomerComponent,
    AddEditCustomerAccountComponent,
    CustomersComponent,
    ScriptsListComponent,
    NotificationSetupComponent,
    AddEditNotificationComponent,
    CustomerDashboardComponent,
    MetricsViewComponent,
    KpiSetupComponent,
    KpiTicketListComponent,
    KpiTicketAddEditComponent,
    KpiUptimeAddEditComponent,
    KpiUptimeListComponent,
    SLAComponent,
    SLATemplateComponent,
    NtfBannerComponent,
    SLADashboardComponent,
    SLAAddEditTemplateComponent,
    AddSlaComponent,
    KpireportingComponent,
    AddEditConfigComponent,
    AddKpiComponent,
    AddEditKpireportingComponent,
    ReportComponent
  ],
  providers: [NotificationSetupService, DecimalPipe],
})
export class TenantsModule {}
