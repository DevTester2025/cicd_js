import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class DashboardConfigService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.DASHBOARDCONFIG;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.HDR.CREATE,
      data
    );
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.HDR.UPDATE,
      data
    );
  }
  all(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.HDR.FINDALL;
    if (query) url += query;
    return this.httpHandler.POST(url, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.HDR.FINDBYID + id
    );
  }
  delete(id): Observable<any> {
    return this.httpHandler.DELETE(
      this.endpoint + this.serviceURL.HDR.DELETE + id
    );
  }
  getdetails(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.DTL.FINDALL;
    if (query) url += query;
    return this.httpHandler.POST(url, data);
  }
  bulkupdatedetails(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.DTL.BULKUPDATE,
      data
    );
  }
  bulkupdate(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.HDR.BULKUPDATE,
      data
    );
  }
}
