import { NgModule } from "@angular/core";

import { NZ_I18N, en_US } from "ng-zorro-antd";
import en from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";

registerLocaleData(en);

import { CatalogRequestComponent } from "./catalog-request/catalog-request.component";
import { GenericRequestComponent } from "./generic-request/generic-request.component";
import { GenericViewComponent } from "./generic-request/generic-view/generic-view.component";
import { HttpHandlerService } from "../../modules/services/http-handler.service";
import { InboxComponent } from "./inbox/inbox.component";
import { InboxListComponent } from "./inbox/inbox-list/inbox-list.component";
import { UpgradeRequestComponent } from "./upgrade-request/request.component";
import { UpgradeRequestListComponent } from "./upgrade-request/request-list/request-list.component";
import { NotificationComponent } from "./notification/notification.component";
import { ProgressUpdateComponent } from "./generic-request/progress-update/progress-update.component";
import { SrmComponent } from "./srm.component";
import { SrmService } from "./srm.service";
import { ResizeRequestService } from "./upgrade-request/resize.service";
import { SRMRoutingModule } from "./srm.routing";
import { SharedModule } from "../../modules/shared/shared.module";
import { SRMCatalogListComponent } from "./catalog-request/list/catalog-list.component";
import { WindowListComponent } from "../base/server-utildetails/maintenance-window/list/maintwindow-list.component";
import { SRMGenericListComponent } from "./generic-request/list/generic-list.component";
import { SRMServiceListComponent } from "./service-request/service-list/service-list.component";
import { SRMAddEditServiceComponent } from "./service-request/add-edit/add-edit-service.component";
import { SRMServiceViewComponent } from "./service-request/service-view/service-view.component";
import { SRMCatalogViewComponent } from "./catalog-request/view/catalog-view.component";
import { SRMProgressRequestComponent } from "./catalog-request/progress-update/progress-update.component";
import { ApprovalFlowComponent } from "../base/workflow/workflow-approvers/workflow-approvers.component";
import { EditorModule } from "primeng/editor";


@NgModule({
  imports: [SRMRoutingModule, SharedModule,EditorModule],
  declarations: [
    CatalogRequestComponent,
    GenericRequestComponent,
    GenericViewComponent,
    InboxComponent,
    UpgradeRequestComponent,
    UpgradeRequestListComponent,
    InboxListComponent,
    NotificationComponent,
    ProgressUpdateComponent,
    SrmComponent,
    SRMCatalogListComponent,
    SRMGenericListComponent,
    SRMServiceListComponent,
    SRMAddEditServiceComponent,
    WindowListComponent,
    SRMServiceViewComponent,
    SRMCatalogViewComponent,
    SRMProgressRequestComponent,
    ApprovalFlowComponent,
  ],
  providers: [
    SrmService,
    ResizeRequestService,
    HttpHandlerService,
    { provide: NZ_I18N, useValue: en_US },
  ],
})
export class SrmModule {}
