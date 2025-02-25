import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class VMWareService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS.VMWARE;
  }
  listByFilters(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.LISTBYFILTERS;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  syncAssets(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.SYNC;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
}
