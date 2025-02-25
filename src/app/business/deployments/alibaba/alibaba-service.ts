import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class AlibabaService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS;
  }
  // Deloyments
  alldeployments(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.DEPLOYMENT.FINDALL,
      data
    );
  }
  createdeployment(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.DEPLOYMENT.CREATE,
      data
    );
  }
  updatedeployments(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.DEPLOYMENT.UPDATE,
      data
    );
  }
  deploymentbyId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.ALIBABA.DEPLOYMENT.FINDBYID + id
    );
  }
  // Images
  allimages(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.IMAGE.FINDALL,
      data
    );
  }
  createimage(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.IMAGE.CREATE,
      data
    );
  }
  updateimage(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.IMAGE.UPDATE,
      data
    );
  }
  // Instance Type
  allinstancetypes(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.INSTANCETYPE.FINDALL,
      data
    );
  }
  // Keys
  allkeys(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.KEY.FINDALL,
      data
    );
  }
  createkey(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.KEY.CREATE,
      data
    );
  }
  updatekey(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.KEY.UPDATE,
      data
    );
  }
  // Load Balancer
  allloadbalancers(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.LOADBALANCER.FINDALL,
      data
    );
  }
  createloadbalancer(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.LOADBALANCER.CREATE,
      data
    );
  }
  updateloadbalancer(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.LOADBALANCER.UPDATE,
      data
    );
  }
  getloadbalancerById(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.ALIBABA.LOADBALANCER.FINDBYID + id
    );
  }
  // Load Balancer Listener
  alllblisteners(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.LBLISTENER.FINDALL,
      data
    );
  }
  createlblistener(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.LBLISTENER.CREATE,
      data
    );
  }
  updatelblistener(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.LBLISTENER.UPDATE,
      data
    );
  }
  // Security Group
  allsecuritygroups(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.SECURITYGROUP.FINDALL,
      data
    );
  }
  createsecuritygroup(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.SECURITYGROUP.CREATE,
      data
    );
  }
  updatesecuritygroup(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.SECURITYGROUP.UPDATE,
      data
    );
  }
  // Security Group Rules
  allsgrules(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.SGRULES.FINDALL,
      data
    );
  }
  createsgrule(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.SGRULES.CREATE,
      data
    );
  }
  updatesgrule(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.SGRULES.UPDATE,
      data
    );
  }
  // Solution
  allsolutions(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.SOLUTION.FINDALL,
      data
    );
  }
  createsolution(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.SOLUTION.CREATE,
      data
    );
  }
  updatesolution(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.SOLUTION.UPDATE,
      data
    );
  }
  solutionbyId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.ALIBABA.SOLUTION.FINDBYID + id
    );
  }
  // Tag
  alltags(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.TAG.FINDALL,
      data
    );
  }
  createtag(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.TAG.CREATE,
      data
    );
  }
  updatetag(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.TAG.UPDATE,
      data
    );
  }
  // Volumes
  allvolumes(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.VOLUME.FINDALL,
      data
    );
  }
  createvolume(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.VOLUME.CREATE,
      data
    );
  }
  updatevolume(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.VOLUME.UPDATE,
      data
    );
  }
  // VPC
  allvpcs(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.VPC.FINDALL,
      data
    );
  }
  createvpc(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.VPC.CREATE,
      data
    );
  }
  updatevpc(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.VPC.UPDATE,
      data
    );
  }
  // VSwitch
  allvswitches(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.VSWITCH.FINDALL,
      data
    );
  }
  createvswitch(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.VSWITCH.CREATE,
      data
    );
  }
  updatevswitch(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.VSWITCH.UPDATE,
      data
    );
  }
  // Zone
  allzones(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.ZONE.FINDALL,
      data
    );
  }
  createzone(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.ZONE.CREATE,
      data
    );
  }
  updatezone(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ALIBABA.ZONE.UPDATE,
      data
    );
  }
}
