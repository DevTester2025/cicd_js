import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
@Injectable()
export class AWSService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS;
  }
  // AWS IGW
  allawsigw(data): Observable<any> {
    let url = this.endpoint + this.serviceURL.AWS.IGW.FINDALL;
    return this.httpHandler.POST(url, data);
  }

  // AWS AMI
  allawsami(data, distinct?: boolean): Observable<any> {
    let url = this.endpoint + this.serviceURL.AWS.AMI.FINDALL;
    if (distinct) url += "?distinct=" + true;
    return this.httpHandler.POST(url, data);
  }
  createawsami(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.AMI.CREATE,
      data
    );
  }
  updateawsami(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.AMI.UPDATE,
      data
    );
  }

  // AWS VPC
  allawsvpc(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.VPC.FINDALL,
      data
    );
  }
  createawsvpc(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.VPC.CREATE,
      data
    );
  }
  updateawsvpc(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.VPC.UPDATE,
      data
    );
  }

  // AWS SUBNET
  allawssubnet(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SUBNET.FINDALL,
      data
    );
  }
  createawssubnet(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SUBNET.CREATE,
      data
    );
  }
  updateawssubnet(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SUBNET.UPDATE,
      data
    );
  }

  // AWS SUBNET
  allawssg(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SECURITYGROUP.FINDALL,
      data
    );
  }
  createawssg(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SECURITYGROUP.CREATE,
      data
    );
  }
  updateawssg(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SECURITYGROUP.UPDATE,
      data
    );
  }
  allawssgrules(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SGRULES.FINDALL,
      data
    );
  }
  // AWS ZONES
  allawszone(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.ZONES.FINDALL,
      data
    );
  }
  createawszone(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.ZONES.CREATE,
      data
    );
  }
  updateawszone(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.ZONES.UPDATE,
      data
    );
  }

  // AWS VOLUMES
  allawsvolumes(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.VOLUMES.FINDALL,
      data
    );
  }
  createawsvolumes(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.VOLUMES.CREATE,
      data
    );
  }
  updateawsvolumes(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.VOLUMES.UPDATE,
      data
    );
  }
  awsgetVolume(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.AWS.VOLUMES.FINDBYID + data;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.GET(url);
  }

  // AWS TAGS
  allawstags(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.TAGS.FINDALL,
      data
    );
  }
  createawstags(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.TAGS.CREATE,
      data
    );
  }
  updateawstags(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.TAGS.UPDATE,
      data
    );
  }

  // AWS SOLUTIONS
  allawssolutions(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SOLUTIONS.FINDALL,
      data
    );
  }
  createawssolutions(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SOLUTIONS.CREATE,
      data
    );
  }
  updateawssolutions(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SOLUTIONS.UPDATE,
      data
    );
  }
  bulkupdateawssolutions(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.SOLUTIONS.BULKUPDATE,
      data
    );
  }
  // AWS KEYS
  allawskeys(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.KEYS.FINDALL,
      data
    );
  }
  createawskeys(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.KEYS.CREATE,
      data
    );
  }
  updateawskeys(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.KEYS.UPDATE,
      data
    );
  }

  // AWS ZONES
  allawsinstancetype(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.AWS.INSTANCETYPE.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  createawsinstancetype(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.INSTANCETYPE.CREATE,
      data
    );
  }
  updateawsinstancetype(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.INSTANCETYPE.UPDATE,
      data
    );
  }
  // AWS LB
  allawslb(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.LB.FINDALL,
      data
    );
  }
  createawslb(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.LB.CREATE,
      data
    );
  }
  updateawslb(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.LB.UPDATE,
      data
    );
  }
  performVmaction(action, data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.VMACTION.replace("{action}", action),
      data
    );
  }
}
