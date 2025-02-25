import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class AssetRecordService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.ASSETRECORDS;
  }
  // Report builder
  createquery(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.REPORTBUILDER.CREATE, data);
  }
  updatequery(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.REPORTBUILDER.UPDATE, data);
  }
  allqueries(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.REPORTBUILDER.FINDALL, data);
  }
  getqueryById(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.REPORTBUILDER.FINDBYID + data;
    if (query) {
      url = url + "?" + query;
    }
    return this.httpHandler.GET(url);
  }
  getCMDBQueryReport(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.REPORTBUILDER.REPORT, data);
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  createDetail(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CREATEDTL,
      data
    );
  }
  bulkcreateDetail(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.BULKCREATEDTL,
      data
    );
  }
  bulkupdateDetail(data, query?: string): Observable<any> {
    query = "?" + (query ? query : "");
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.BULKUPDATEDTL + query,
      data
    );
  }
  createHistory(data, query?: string): Observable<any> {
    query = "?" + (query ? query : "");
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CREATEHISTORY,
      data
    )
  }

  createComment(data, query?: string): Observable<any> {
    query = "?" + (query ? query : "");
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CREATECMD + query,
      data
    );
  }
  createDocs(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CREATEDOCS,
      data
    );
  }
  deleteDoc(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.DELETEDOCS,
      data
    );
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  updateBulk(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.BULKUPDATE, data);
  }
  updateDetail(data, query?: string): Observable<any> {
    let ep = this.endpoint + this.serviceURL.UPDATEDTL;
    if (query) ep = ep + "?" + query;
    return this.httpHandler.POST(
      ep,
      data
    );
  }
  updateComment(data, query?: string): Observable<any> {
    query = "?" + (query ? query : "");
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.UPDATECMD + query,
      data
    );
  }
  all(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) {
      url = url + "?" + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getAllDetail(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALLDTL;
    if (query) {
      url = url + "?" + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getAllComments(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.FINDALLCMD,
      data
    );
  }
  getAllHistory(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.FINDALLHISTORY,
      data
    );
  }
  getAllDocuments(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.FINDALLDOCS,
      data
    );
  }
  downloadDocs(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.DOWNLOADDOCS,
      data
    );
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
  getResourceTypes(data, query?) {
    let url = this.endpoint + this.serviceURL.RESOURCETYPE;
    if (query) url += `?${query}`;
    return this.httpHandler.POST(
      url,
      data
    );
  }
  getResource(tenantid: number, crn: string, dtl_operationtype?: string) {
    let req: any = {
      tenantid: tenantid,
    }
    if (dtl_operationtype) {
      req.dtl_operationtype = dtl_operationtype;
    }
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.RESOURCE.replace("{type}", crn),
      {
        tenantid,
      }
    );
  }
  getResourceByFilter(data) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.RESOURCEFILTER,
      data
    );
  }
  getResourceValuesById(id: string, query?) {
    let url =
      this.endpoint + this.serviceURL.RESOURCEDETAILSBYID.replace("{id}", id);
    if (query) url += `?${query}`;
    return this.httpHandler.GET(url);
  }
  getResourceAssets(body: Record<string, any>) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.RESOURCEDETAILS,
      body
    );
  }
  getParentResource(body: Record<string, any>) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.QUERYBUILD,
      body
    );
  }
  getBuilder(body: Record<string, any>, query?) {
    let url = this.endpoint + this.serviceURL.QUERYBUILDQ;
    if (query) url += `?${query}`;
    return this.httpHandler.POST(
      url,
      body
    );
  }
  getResourceFieldValues(body: Record<string, any>) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.RESOURCEFIELDVALUES,
      body
    );
  }
  getResourceKPI(body: Record<string, any>) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.RESOURCECHART,
      body
    );
  }
  getAssets(body: Record<string, any>, query?) {
    let url = this.endpoint + this.serviceURL.ASSETLIST;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, body);
  }
  getReferenceList(data) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.EXTERNALREFLIST,
      data
    );
  }
  copyResourceDetails(data) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.COPYRESOURCEDETAILS,
      data
    );
  }
  txnrefList(data: any) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.TXNREFLIST,
      data
    );
  }
  updateWatchList(data: any) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.UPDATE_WATCHLIST,
      data
    );
  }
  updateTxn(data: any) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.UPDATETXN,
      data
    );
  }
  bulkcreateTxnRef(data: any) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.BULKCREATE_TXNREF,
      data
    );
  }
  workpackrelationList(data: any) {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.WORKPACK_RELATION,
      data
    );
  }
  clone(data: any) {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CLONE, data);
  }

}
