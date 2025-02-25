import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "src/app/app.constant";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";

@Injectable({
  providedIn: "root",
})
export class PipelineTemplateService {
  endpoint: string;
  serviceURL: any;
  private nodeData: { [nodeId: string]: { [tab: string]: any } } = {};
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.CICD.PIPELINETEMPLATE;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
  update(id, data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.UPDATE + id,
      data
    );
  }
  nodeById(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.NODE_BY_ID + id
    );
  }
  updateNode(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.UPDATE_NODE,
      data
    );
  }
  setNodeFormData(nodeId: string, tab: string, formData: any): void {
    if (!this.nodeData[nodeId]) {
      this.nodeData[nodeId] = {};
    }
    this.nodeData[nodeId][tab] = formData;
  }

  getNodeFormData(nodeId: string, tab: string): any {
    if (this.nodeData[nodeId] && this.nodeData[nodeId][tab]) {
      return this.nodeData[nodeId][tab];
    }
    return null;
  }
}
