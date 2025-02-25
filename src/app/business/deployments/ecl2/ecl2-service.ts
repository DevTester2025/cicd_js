import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
@Injectable()
export class Ecl2Service {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS;
  }

  // ECL2 Instance Type
  allecl2InstanceType(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.ECL2.INSTANCETYPE.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }

  // ECL2 AMI
  allecl2sami(data, distinct?: boolean): Observable<any> {
    let url = this.endpoint + this.serviceURL.ECL2.AMI.FINDALL;
    if (distinct) url += "?distinct=" + true;
    return this.httpHandler.POST(url, data);
  }
  createecl2ami(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.AMI.CREATE,
      data
    );
  }
  updateecl2ami(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.AMI.UPDATE,
      data
    );
  }

  // ECL2 Instance Type
  allecl2Zones(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.ZONES.FINDALL,
      data
    );
  }

  // ECL2 Network
  allecl2nework(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.NETWORK.FINDALL,
      data
    );
  }
  createecl2network(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.NETWORK.CREATE,
      data
    );
  }
  updateecl2network(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.NETWORK.UPDATE,
      data
    );
  }
  deleteecl2network(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.NETWORK.DELETE,
      data
    );
  }

  // ECL2 Subnet
  allecl2subnet(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.SUBNET.FINDALL,
      data
    );
  }
  createecl2subnet(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.SUBNET.CREATE,
      data
    );
  }
  updateecl2subnet(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.SUBNET.UPDATE,
      data
    );
  }
  deleteecl2subnet(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.SUBNET.DELETE,
      data
    );
  }

  // ECL2 Port
  allecl2port(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.PORT.FINDALL,
      data
    );
  }
  createecl2port(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.PORT.CREATE,
      data
    );
  }
  updateecl2port(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.PORT.UPDATE,
      data
    );
  }
  deleteecl2port(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.PORT.DELETE,
      data
    );
  }

  // ECL2 Volume
  allecl2volume(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VOLUMES.FINDALL,
      data
    );
  }
  createecl2volume(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VOLUMES.CREATE,
      data
    );
  }
  updateecl2volume(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VOLUMES.UPDATE,
      data
    );
  }
  getByVolume(id, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.ECL2.VOLUMES.FINDBYID + id;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.GET(url);
  }

  // ECL2 Solution
  allecl2solution(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.SOLUTION.FINDALL,
      data
    );
  }
  createecl2solution(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.SOLUTION.CREATE,
      data
    );
  }
  updateecl2solution(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.SOLUTION.UPDATE,
      data
    );
  }
  solutionById(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.ECL2.SOLUTION.FINDBYID + id
    );
  }
  createconnreq(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.SOLUTION.CONNREQ,
      data
    );
  }

  // ECL2 Load Balancer
  allecl2loadbalancer(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LOADBALANCER.FINDALL,
      data
    );
  }
  createecl2loadbalancer(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LOADBALANCER.CREATE,
      data
    );
  }
  updateecl2loadbalancer(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LOADBALANCER.UPDATE,
      data
    );
  }
  deleteecl2loadbalancer(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LOADBALANCER.DELETE,
      data
    );
  }
  lbbyId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.ECL2.LOADBALANCER.FINDBYID + id
    );
  }

  // ECL2 Key
  allecl2keypair(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.KEYPAIR.FINDALL,
      data
    );
  }
  createecl2keypair(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.KEYPAIR.CREATE,
      data
    );
  }
  updateecl2keypair(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.KEYPAIR.UPDATE,
      data
    );
  }

  // ECL2 zone
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.ECL2.ZONE + id);
  }

  // ECL2 Internet Gateway
  allecl2gateway(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.GATEWAY.FINDALL,
      data
    );
  }
  createecl2gateway(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.GATEWAY.CREATE,
      data
    );
  }
  updateecl2gateway(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.GATEWAY.UPDATE,
      data
    );
  }
  deleteecl2gateway(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.GATEWAY.DELETE,
      data
    );
  }

  // ECL2 Internet Services
  allecl2internetservices(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.INTERNETSERVICES.FINDALL,
      data
    );
  }

  // ECL2 QOS Options
  allecl2qosoptions(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.QOSOPTIONS.FINDALL,
      data
    );
  }

  // ECL2 Firewall
  allecl2firewall(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.FIREWALL.FINDALL,
      data
    );
  }
  createecl2firewall(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.FIREWALL.CREATE,
      data
    );
  }
  updateecl2firewall(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.FIREWALL.UPDATE,
      data
    );
  }
  deleteecl2firewall(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.FIREWALL.DELETE,
      data
    );
  }

  // ECL2 Firewall plans
  allecl2firewallplans(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.FIREWALLPLAN.FINDALL,
      data
    );
  }
  allecl2vasrxplans(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VSRXPLAN.FINDALL,
      data
    );
  }

  // ECL Firewall Interface
  updateecl2firewallinterface(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.FIREWALLINTERFACE.UPDATE,
      data
    );
  }
  allecl2firewallinterface(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.FIREWALLINTERFACE.FINDALL,
      data
    );
  }

  // ECL2 Internet gateway interface
  allecl2iginterface(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.INTERFACE.FINDALL,
      data
    );
  }
  createecl2iginterface(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.INTERFACE.CREATE,
      data
    );
  }
  updateecl2iginterface(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.INTERFACE.UPDATE,
      data
    );
  }
  deleteecl2iginterface(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.INTERFACE.DELETE,
      data
    );
  }

  // ECL2 Internet gateway globalip
  allecl2igglobalip(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.GLOBALIP.FINDALL,
      data
    );
  }
  createecl2igglobalip(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.GLOBALIP.CREATE,
      data
    );
  }
  updateecl2igglobalip(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.GLOBALIP.UPDATE,
      data
    );
  }
  deleteecl2igglobalip(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.GLOBALIP.DELETE,
      data
    );
  }

  // ECL2 Internet gateway staticip
  allecl2igstaticip(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.STATICIP.FINDALL,
      data
    );
  }
  createecl2igstaticip(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.STATICIP.CREATE,
      data
    );
  }
  updateecl2igstaticip(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.STATICIP.UPDATE,
      data
    );
  }
  deleteecl2igstaticip(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.STATICIP.DELETE,
      data
    );
  }

  // ECL LBPlan
  allecl2lbplans(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LBPLAN.FINDALL,
      data
    );
  }

  // ECL Data Synchronization
  datasync(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.DATASYNC,
      data
    );
  }

  // ECL Common function pool
  alleclcommonfnpool(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.COMMONFNPOOL.FINDALL,
      data
    );
  }

  // ECL Common function gateway
  alleclcommonfngateway(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.COMMONFUNCGATEWAY.FINDALL,
      data
    );
  }
  createeclcommonfngateway(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.COMMONFUNCGATEWAY.CREATE,
      data
    );
  }
  updateeclcommonfngateway(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.COMMONFUNCGATEWAY.UPDATE,
      data
    );
  }
  deleteeclcommonfngateway(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.COMMONFUNCGATEWAY.DELETE,
      data
    );
  }

  // ECL LB Interface
  updateecl2lbinterface(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LBINTERFACE.UPDATE,
      data
    );
  }
  allecl2lbinterface(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LBINTERFACE.FINDALL,
      data
    );
  }

  // ECL2 Syslog Servers
  createecllbsyslogserver(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LBSYSLOGSERVERS.CREATE,
      data
    );
  }
  updateecl2lbsyslogserver(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LBSYSLOGSERVERS.UPDATE,
      data
    );
  }
  allecl2lbsyslogserver(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LBSYSLOGSERVERS.FINDALL,
      data
    );
  }

  // ECL2 VSRX
  createeclvsrx(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VSRX.CREATE,
      data
    );
  }
  updateecl2vsrx(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VSRX.UPDATE,
      data
    );
  }
  allecl2vsrx(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VSRX.FINDALL,
      data
    );
  }
  deleteecl2vsrx(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VSRX.DELETE,
      data
    );
  }
  vsrxbyId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.ECL2.VSRX.FINDBYID + id
    );
  }
  rpc(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VSRX.RPC,
      data
    );
  }

  // VNC Console
  vncConsole(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VNCCONSOLE,
      data
    );
  }

  // VSRX console retry
  vsrxcall(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.VSRX.RETRY,
      data
    );
  }

  // LB retry
  lbcall(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.LOADBALANCER.RETRY,
      data
    );
  }

  // Tenant connection request & connection

  getECL2TenantconnRequestList(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.TENANTCONN_REQ.FINDALL,
      data
    );
  }
  createECL2TenantConnRequest(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.TENANTCONN_REQ.CREATE,
      data
    );
  }
  updateECL2TenantConnRequest(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.TENANTCONN_REQ.UPDATE,
      data
    );
  }
  deleteECL2TenantConnRequest(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.TENANTCONN_REQ.DELETE,
      data
    );
  }

  getECL2TenantConnectionList(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.TENANT_CONNECTION.FINDALL,
      data
    );
  }
  createECL2TenantConnection(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.TENANT_CONNECTION.CREATE,
      data
    );
  }
  updateECL2TenantConnection(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.TENANT_CONNECTION.UPDATE,
      data
    );
  }
  byIdECL2TenantConnection(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.ECL2.TENANT_CONNECTION.FINDBYID + id
    );
  }
  deleteECL2TenantConnection(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.TENANT_CONNECTION.DELETE,
      data
    );
  }
}
