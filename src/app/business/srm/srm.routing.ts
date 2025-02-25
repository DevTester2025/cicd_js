import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SrmComponent } from "./srm.component";
import { SRMGenericListComponent } from "./generic-request/list/generic-list.component";
import { SRMCatalogListComponent } from "./catalog-request/list/catalog-list.component";
import { AuthGuard } from "../../modules/services/auth-guard.service";
import { CatalogRequestComponent } from "./catalog-request/catalog-request.component";
import { GenericRequestComponent } from "./generic-request/generic-request.component";
import { SRMAddEditServiceComponent } from "./service-request/add-edit/add-edit-service.component";
import { SRMServiceListComponent } from "./service-request/service-list/service-list.component";
import { InboxComponent } from "./inbox/inbox.component";
import { UpgradeRequestComponent } from "./upgrade-request/request.component";
import { SRMServiceViewComponent } from "./service-request/service-view/service-view.component";
import { SRMCatalogViewComponent } from "./catalog-request/view/catalog-view.component";
import { GenericViewComponent } from "./generic-request/generic-view/generic-view.component";
import { SRMProgressRequestComponent } from "./catalog-request/progress-update/progress-update.component";
import { ProgressUpdateComponent } from "./generic-request/progress-update/progress-update.component";
import { NotificationComponent } from "./notification/notification.component";
import { ResizeRequestViewComponent } from "./upgrade-request/request-view/resize-request-view.component";
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: "srm",
        canActivate: [AuthGuard],
        component: SrmComponent,
        data: {
          title: "Service Catalog",
        },
      },
      {
        path: "srm/list",
        canActivate: [AuthGuard],
        component: SRMServiceListComponent,
        data: {
          title: "Service Catalog",
        },
      },
      {
        path: "srm/catalog/list",
        canActivate: [AuthGuard],
        component: SRMCatalogListComponent,
        data: {
          title: "Service Catalog",
        },
      },
      {
        path: "srm/create",
        canActivate: [AuthGuard],
        component: SrmComponent,
        data: {
          title: "Service Catalog",
        },
      },
      {
        path: "srm/generic/create",
        canActivate: [AuthGuard],
        component: GenericRequestComponent,
        data: {
          title: "Generic Request",
        },
      },
      {
        path: "srm/generic/list",
        canActivate: [AuthGuard],
        component: SRMGenericListComponent,
        data: {
          title: "Generic Request",
        },
      },
      {
        path: "srm/generic/request/:id",
        canActivate: [AuthGuard],
        component: GenericRequestComponent,
        data: {
          title: "Generic Request",
        },
      },
      {
        path: "srm/catalog/create",
        canActivate: [AuthGuard],
        component: SRMAddEditServiceComponent,
        data: {
          title: "Service Catalog",
        },
      },
      {
        path: "srm/inbox",
        canActivate: [AuthGuard],
        component: InboxComponent,
        data: {
          title: "Inbox",
        },
      },
      {
        path: "resize/list",
        canActivate: [AuthGuard],
        component: UpgradeRequestComponent,
        data: {
          title: "Resize Requests",
        },
      },
      {
        path: "resize/view/:id",
        canActivate: [AuthGuard],
        component: ResizeRequestViewComponent,
        data: {
          title: "Resize Requests",
        },
      },
      {
        path: "srm/catalog/edit/:id",
        canActivate: [AuthGuard],
        component: SRMAddEditServiceComponent,
        data: {
          title: "Service Catalog",
        },
      },
      {
        path: "srm/catalog/publish",
        canActivate: [AuthGuard],
        component: SRMCatalogViewComponent,
        data: {
          title: "Service Catalog",
        },
      },
      {
        path: "srm/catalog/view",
        canActivate: [AuthGuard],
        component: SRMCatalogViewComponent,
        data: {
          title: "Service Catalog",
        },
      },
      {
        path: "srm/catalog/view/:id",
        canActivate: [AuthGuard],
        component: SRMServiceViewComponent,
        data: {
          title: "Service Catalog Details",
          mode: "View",
        },
      },
      {
        path: "srm/service/create",
        canActivate: [AuthGuard],
        component: CatalogRequestComponent,
        data: {
          title: "Service Request",
        },
      },
      {
        path: "srm/service/edit/:id",
        canActivate: [AuthGuard],
        component: CatalogRequestComponent,
        data: {
          title: "Service Request",
        },
      },
      {
        path: "srm/generic/view/:id",
        canActivate: [AuthGuard],
        component: GenericViewComponent,
        data: {
          title: "Generic Request Details",
          mode: "View",
        },
      },
      {
        path: "srm/progress/:id",
        canActivate: [AuthGuard],
        component: SRMProgressRequestComponent,
        data: {
          title: "Service Request",
        },
      },
      {
        path: "srm/generic/progress/:id",
        canActivate: [AuthGuard],
        component: ProgressUpdateComponent,
        data: {
          title: "Generic Request",
        },
      },
      {
        path: "srm/notification",
        canActivate: [AuthGuard],
        component: NotificationComponent,
        data: {
          title: "Notifications",
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class SRMRoutingModule {}
