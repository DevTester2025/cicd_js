import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Http } from "@angular/http";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { AppConstant } from "src/app/app.constant";

@Injectable({
  providedIn: "root",
})
export class SSMService {
  endpoint: string;
  serviceURL: any;
  serviceMappingURL: any;
  constructor(private httpHandler: HttpHandlerService, private http: Http) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.SSM;
  }
  updateRole(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.UPDATEROLE;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  sync(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.SYNC;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  all(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  allCommands(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALLCMDS;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  allAssociations(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALLASS;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getBaselines(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.GETBASELINES;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getPatchCompliance(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.PATCHCOMPLIANCE;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getComplianceSummary(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.COMPLIANCESUMMARY;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getInventoryDashboard(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.INVDASHBOARD;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getPMDashboard(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.PMDASHBOARD;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  createInventory(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.CREATEINV;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  createPatchbaseline(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.CREATEPB;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  updatePatchbaseline(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.UPDATEPB;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  setDefaultPatchbaseline(data): Observable<any> {
    let url = this.endpoint + this.serviceURL.DEFAULTPB;
    return this.httpHandler.POST(url, data);
  }
  deletePatchbaseline(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.DELETEPB;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  configurePatch(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.CONFIGPB;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  associationStatus(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.ASS_STATUS;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  complaincebyId(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.COMPLAINCE_BYID + `/${data.instancerefid}`;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getInstanceProfile(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALLINSPROFILE;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getCommandDesc(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.COMMAND_DESC + `/${data.commandid}`;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getAssExeList(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.ASS_DESC + `executions/${data.associationid}`;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  getAssDesc(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.ASS_DESC + `/${data.associationid}`;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
  allMaintwindows(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.ALL_MW;
    if (query) {
      url = url + query;
    }
    return this.httpHandler.POST(url, data);
  }
}
