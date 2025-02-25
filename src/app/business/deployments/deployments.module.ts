import { NgModule } from "@angular/core";
import { NZ_I18N, en_US } from "ng-zorro-antd";
import en from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";
import { OrganizationChartModule } from "primeng/organizationchart";

registerLocaleData(en);

import { AWSService } from "./aws/aws-service";
import { AlibabaService } from "./alibaba/alibaba-service";
import { AmilistComponent } from "./amilist/amilist.component";
import { DeploySolutionComponent } from "./deploysolution/deploysolution.component";
import { DeploymentsService } from "./deployments.service";
import { DeploymentsRoutingModule } from "./deployments.routing";
import { CommongatewayComponent } from "./ecl2/commongateway/commongateway.component";
import { Ecl2Service } from "./ecl2/ecl2-service";
import { FirewallComponent } from "./ecl2/firewall/firewall.component";
import { HttpHandlerService } from "../../modules/services/http-handler.service";
import { InstanceComponent } from "./ecl2/instance/instance.component";
import { InternetgatewayComponent } from "./ecl2/internetgateway/internetgateway.component";
import { KeysComponent } from "./ecl2/keys/keys.component";
import { CloudAssetComponent } from "./cloudassets/cloudasset.component";
import { CloudAssetService } from "./cloudassets/cloudasset.service";
import { VMWareService } from "./vmware/vmware-service";
import { LbViewComponent } from "./aws/lb/lb-view/lb-view.component";
import { LblistComponent } from "./lblist/lblist.component";
import { NetworkComponent } from "./ecl2/network/network.component";
import { PortComponent } from "./ecl2/network/port/port.component";
import { SharedModule } from "../../modules/shared/shared.module";
import { SubnetComponent } from "./ecl2/network/subnet/subnet.component";
import { VolumesComponent } from "./ecl2/volumes/volumes.component";
import { InterconnectivityComponent } from "./ecl2/interconnectivity/interconnectivity.component";
import { ALILbViewComponent } from "./alibaba/lb/lb-view/lb-view.component";
import { AWSInternetGatewayComponent } from "./aws/igw/igw.component";
@NgModule({
  imports: [DeploymentsRoutingModule, OrganizationChartModule, SharedModule],
  declarations: [
    AmilistComponent,
    ALILbViewComponent,
    CommongatewayComponent,
    DeploySolutionComponent,
    FirewallComponent,
    InstanceComponent,
    InternetgatewayComponent,
    KeysComponent,
    CloudAssetComponent,
    LbViewComponent,
    LblistComponent,
    NetworkComponent,
    PortComponent,
    SubnetComponent,
    VolumesComponent,
    InterconnectivityComponent,
    AWSInternetGatewayComponent,
  ],
  providers: [
    AWSService,
    AlibabaService,
    CloudAssetService,
    VMWareService,
    DeploymentsService,
    Ecl2Service,
    HttpHandlerService,
    { provide: NZ_I18N, useValue: en_US },
  ],
  exports: [
    DeploySolutionComponent,
    LblistComponent,
    AWSInternetGatewayComponent,
  ],
})
export class DeploymentsModule { }
