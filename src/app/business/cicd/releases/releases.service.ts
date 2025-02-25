import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class ReleasesService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.CICD.RELEASES;
  }

  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.GETBYID + id);
  }
  getAllReleases(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.RELEASE;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  getAllConfigReleases(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.RELEASECONFIG;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  createWorkflowTrigger(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.WORKFLOWTRIGGER,
      data
    );
  }
  reRunWorkflow(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.RERUNWORKFLOW,
      data
    );
  }
  cancelWorkflow(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.CANCELWORKFLOW,
      data
    );
  }
  logbyId(id, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.GETLOG + id;
    if (query) url = url + `?` + query;
    return this.httpHandler.GET(url);
  }
  logdetailsbyId(id, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.GETLOGDETAILS + id;
    if (query) url = url + `?` + query;
    return this.httpHandler.GET(url);
  }
  createRelease(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  updateRelease(id, data): Observable<any> {
    return this.httpHandler.POST(this.endpoint+this.serviceURL.UPDATE + id, data);
  }  
  releaseDelete(id): Observable<any> {
    return this.httpHandler.DELETE(this.endpoint + this.serviceURL.DELETE+ id);
  }

}
