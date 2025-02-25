import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import * as moment from "moment";
import { environment } from "../../../../environments/environment";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class TagValueService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.TAGVALUE;
  }
  create(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.CREATE;
    if (query) url += query;
    return this.httpHandler.POST(url, data);
  }
  update(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.UPDATE;
    if (query) url += query;
    return this.httpHandler.POST(url, data);
  }
  bulkupdate(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.BULKUPDATE;
    if (query) url += query;
    return this.httpHandler.POST(url, data);
  }
  bulkcreate(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.BULKCREATE;
    if (query) url += query;
    return this.httpHandler.POST(url, data);
  }
  all(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) url += query;
    return this.httpHandler.POST(url, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
}
