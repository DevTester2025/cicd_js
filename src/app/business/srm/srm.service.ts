import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { environment } from "../../../environments/environment";
import { HttpHandlerService } from "../../modules/services/http-handler.service";
import { AppConstant } from "../../app.constant";

@Injectable()
export class SrmService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS;
  }
  private catalog = new Subject<any>();
  allCatalog(data,query?): Observable<any> {
    let url;
    url = this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.CATALOG.FINDALL
    if (query) url = url + "?" + query;
    return this.httpHandler.POST(url, data);
  }
  createCatalog(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.CATALOG.CREATE,
      data
    );
  }
  updateCatalog(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.CATALOG.UPDATE,
      data
    );
  }
  allService(data,query?): Observable<any> {
    let url;
    url = this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.SERVICE.FINDALL
    if (query) url = url + "?" + query;
    return this.httpHandler.POST(url, data);
  }
  addService(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.SERVICE.CREATE,
      data
    );
  }
  updateService(data, query?): Observable<any> {
    let url;
    url = this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.SERVICE.UPDATE;
    if (query) url = url + "?" + query;
    return this.httpHandler.POST(url, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.SERVICE.FINDBYID + id
    );
  }
  getByIdCatalog(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.CATALOG.FINDBYID + id
    );
  }
  allSrmActions(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.ACTION.FINDALL,
      data
    );
  }
  updateSrmAction(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.ACTION.UPDATE,
      data
    );
  }
  getRequestCount(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.SERVICE.COUNT,
      data
    );
  }

  allMaintwindows(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.MAIN_WINDOW.FINDALL;
    if (query) url = url + "?" + query;
    return this.httpHandler.POST(url, data);
  }
  addMaintwindow(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.MAIN_WINDOW.CREATE,
      data
    );
  }
  updateMaintwindow(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.MAIN_WINDOW.UPDATE,
      data
    );
  }
  byIdMaintwindow(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint +
        AppConstant.API_CONFIG.API_URL.SRM.MAIN_WINDOW.FINDBYID +
        id
    );
  }
  allMaintwindowmapping(data, query?): Observable<any> {
    let url =
      this.endpoint +
      AppConstant.API_CONFIG.API_URL.SRM.MAIN_WINDOW_MAP.FINDALL;
    if (query) url = url + "?" + query;
    return this.httpHandler.POST(url, data);
  }
  addMaintwindowmapping(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.MAIN_WINDOW_MAP.CREATE,
      data
    );
  }
  byIdMaintwindowmapping(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint +
        AppConstant.API_CONFIG.API_URL.SRM.MAIN_WINDOW_MAP.FINDBYID +
        id
    );
  }
  updateMaintwindowmapping(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.SRM.MAIN_WINDOW_MAP.UPDATE,
      data
    );
  }
  getCatalog(data: any) {
    this.catalog.next(data);
  }
 
  observeCatalog() {
    return this.catalog.asObservable();
  } 
}
