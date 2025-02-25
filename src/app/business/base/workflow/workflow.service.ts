import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { AppConstant } from "../../../app.constant";
@Injectable()
export class WorkpackWorkflowService {
  endpoint: string;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
  }
  allWorkflow(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOW.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  createWorkflow(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOW.CREATE;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  updateWorkflow(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOW.UPDATE;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOW.FINDBYID + id);
  }
  delete(id): Observable<any> {
    return this.httpHandler.DELETE(this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOW.DELETE +"/"+ id);
  }

  allWorkflowApprvl(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOWAPPROVER.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  createWorkflowApprvl(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOWAPPROVER.CREATE;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  updateWorkflowApprvl(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOWAPPROVER.UPDATE;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  createWorkflowAction(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOWACTION.CREATE;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  bulkWorkflowAction(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOWACTION.BULKCREATE;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  allWorkflowAction(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOWACTION.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  updateWorkflowAction(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOWACTION.UPDATE;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
  bulkupdateWorkflowAction(data, query?): Observable<any> {
    let url =
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKFLOWACTION.BULKUPDATE;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(url, data);
  }
}
