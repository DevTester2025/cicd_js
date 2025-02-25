import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../app.constant";
import { HttpHandlerService } from "../../modules/services/http-handler.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { Http } from "@angular/http";

@Injectable({
  providedIn: "root",
})
export class PrometheusService {
  endpoint: string;
  serviceURL: any;
  constructor(
    private httpHandler: HttpHandlerService,
    private http: Http,
    private localStorageService: LocalStorageService
  ) {
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.PROMETHEUS;
  }
  getVMStatus(data): Observable<any> {
    return this.http.post(
      AppConstant.API_END_POINT + this.serviceURL.VMSTATUS,
      data
    );
  }
  getVMuptime(data?): Observable<any> {
    let url = AppConstant.API_END_POINT + this.serviceURL.VMUPTIME;

    return this.httpHandler.POST(url, data);
  }
  kpisummary(data?): Observable<any> {
    let url = AppConstant.API_END_POINT + this.serviceURL.KPISUMMARY;

    return this.httpHandler.POST(url, data);
  }
  getcount(data?): Observable<any> {
    let url = AppConstant.API_END_POINT + this.serviceURL.COUNT;

    return this.httpHandler.POST(url, data);
  }
  getdatewisecount(data?): Observable<any> {
    let url = AppConstant.API_END_POINT + this.serviceURL.DATEWISECOUNT;
    return this.httpHandler.POST(url, data);
  }
  getAllList(data,query?): Observable<any> {
    let url = AppConstant.API_END_POINT + this.serviceURL.DATALIST;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
}
