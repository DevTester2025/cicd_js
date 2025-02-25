import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import * as moment from "moment";
import { environment } from "../../../../environments/environment";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { Http } from "@angular/http";

@Injectable({
  providedIn: "root",
})
export class AssetsService {
  endpoint: string;
  serviceURL: any;
  serviceMappingURL: any;
  downloadEndpoint: any;
  constructor(private httpHandler: HttpHandlerService, private http: Http) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.ASSETS;
    this.serviceMappingURL = AppConstant.API_CONFIG.API_URL.BASE.ASSETMAPPING;
    this.downloadEndpoint = AppConstant.WebHooksURL
  }
  getMonitoringInstances(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.MONITORIN_INSTANCES;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  listByFilters(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.LISTBYFILTERS;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  assetDownload(data):Observable<any>{
    let url = this.downloadEndpoint + this.serviceURL.DOWNLOAD
    return this.httpHandler.POST(url, data);
  }
  bulkUpdate(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceMappingURL.BULKUPDATE,
      data
    );
  }
  bulkCreate(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceMappingURL.BULKCREATE,
      data
    );
  }
  updateAssetMapping(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceMappingURL.UPDATE;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  createAssetMapping(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceMappingURL.CREATE;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  listAsset(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceMappingURL.LIST;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getCost(query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.TOTALCOST;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.GET(url);
  }
  listProducts(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.PRODUCTLIST;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  addProducts(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.ADDPRODUCT;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
}
