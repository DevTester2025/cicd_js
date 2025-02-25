import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../../app.constant";
import { HttpHandlerService } from "../../../../modules/services/http-handler.service";
import { Http } from "@angular/http";

@Injectable({
  providedIn: "root",
})
export class ExptrService {
  endpoint: string;
  exptrMappingURL: any;
  constructor(private httpHandler: HttpHandlerService, private http: Http) {
    this.endpoint = AppConstant.API_END_POINT;
    this.exptrMappingURL = AppConstant.API_CONFIG.API_URL.BASE.EXPTRMAPPING;
  }
  listByFilters(data, query?): Observable<any> {
    let url = this.endpoint + this.exptrMappingURL.ORCH_LIST;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  listDashboards(data, query?): Observable<any> {
    let url = this.endpoint + this.exptrMappingURL.LIST;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  createMapping(data): Observable<any> {
    let url = this.endpoint + this.exptrMappingURL.CREATE_MAPPING;
    return this.httpHandler.POST(url, data);
  }
  updateMapping(data): Observable<any> {
    let url = this.endpoint + this.exptrMappingURL.UPDATE_MAPPING;
    return this.httpHandler.POST(url, data);
  }
}
