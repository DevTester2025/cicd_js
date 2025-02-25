import { NgModule } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { AccordionModule } from "primeng/accordion";
import { NodeManagementComponent } from "./node-management.component";
import { NodeManagementLogComponent } from "./node-management-log.component";
import { InventoryComponent } from "./inventory/inventory.component";
import { SetupInventoryComponent } from "./inventory/setup-inventory.component";
import { ConfigPatchComponent } from "./patch-manager/config-patch.component";
import { PatchBaselineComponent } from "./patch-manager/patch-baseline.component";
import { PatchManagerComponent } from "./patch-manager/patch-manager.component";
import { NodeManagementRoutingModule } from "./nodemanagement.routing.module";
import { NgApexchartsModule } from "ng-apexcharts";
import { en_US, NZ_I18N } from "ng-zorro-antd";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { SSMService } from "./ssm.service";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { NodeDetailComponent } from "./node-detail.component";
import { CommandHistoryComponent } from "./runcommand/command-history.component";
import { AssociationComponent } from "./statemanager/association.component";
import { CommandInstanceOverviewComponent } from "./runcommand/command-instance.component";
import { AssociationLogComponent } from "./statemanager/association-log.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NodeManagementRoutingModule,
    NgApexchartsModule,
  ],
  declarations: [
    NodeManagementComponent,
    PatchManagerComponent,
    InventoryComponent,
    SetupInventoryComponent,
    PatchBaselineComponent,
    ConfigPatchComponent,
    NodeManagementLogComponent,
    NodeDetailComponent,
    CommandHistoryComponent,
    AssociationComponent,
    CommandInstanceOverviewComponent,
    AssociationLogComponent
  ],
  providers: [
    HttpHandlerService,
    SSMService,
    { provide: NZ_I18N, useValue: en_US },
  ],
})
export class NodeManagerModule {}
