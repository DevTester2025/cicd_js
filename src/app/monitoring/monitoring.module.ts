import { NgModule } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { AccordionModule } from "primeng/accordion";
import { GalleriaModule } from "primeng/galleria";

import { SharedModule } from "../modules/shared/shared.module";
import { MonitoringRoutingModule } from "./monitoring-route.module";

import { MonitoringSyntheticsComponent } from "./synthetics/synthetics.component";
import { MonitoringSyntheticsDetailsComponent } from "./synthetics/details/synthetic-details.component";
import { SslComponent } from './ssl/ssl.component';
import { AddeditSslComponent } from './ssl/addedit-ssl/addedit-ssl.component';
import { SSLService } from './ssl/sslservice';
import { MonitoringChartComponent } from './synthetics/monitoring-chart/monitoring-chart.component';
import { NgApexchartsModule } from "ng-apexcharts";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MonitoringRoutingModule,
    AccordionModule,
    GalleriaModule,
    NgApexchartsModule
  ],
  declarations: [
    MonitoringSyntheticsComponent,
    MonitoringSyntheticsDetailsComponent,
    SslComponent,
    AddeditSslComponent,
    MonitoringChartComponent,
  ],
  providers: [DecimalPipe, SSLService],
})
export class MonitoringModule { }
