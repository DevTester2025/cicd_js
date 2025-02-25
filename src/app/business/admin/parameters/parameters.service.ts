import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import { AppConstant } from "../../../app.constant";

@Injectable()
export class ParametersService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.PARAMETERS;
  }

  addParams(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }

  updateParams(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }

  getParamsList(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) url = url + `?` + query;
    return this.httpHandler.POST(
      url,
      data
    );
  }

  getCustomers(data): any {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.CLIENT.FINDALL,
      data
    );
  }

  getTenants() {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.FINDALL,
      {
        status: "Active",
      }
    );
  }

  getScripts(data) {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.BASE.SCRIPTS.FINDALL,
      data
    );
  }

  getGlobalHeader() {
    return [
      { field: "paramtype", header: "Type", datatype: "string", isdefault: true },
      { field: "fieldname", header: "Name", datatype: "string", isdefault: true },
      { field: "fieldvalue", header: "Value", datatype: "string", isdefault: true },
      { field: "tenant", header: "Tenant", datatype: "string", isdefault: true },
      { field: "template", header: "Template", datatype: "string", isdefault: true },
      { field: "customer", header: AppConstant.SUBTENANT, datatype: "string", isdefault: true },
      { field: "script", header: "Script", datatype: "string", isdefault: true },
      { field: "notes", header: "Notes", datatype: "string", isdefault: true },
      { field: "createdby", header: "Created By", datatype: "string", isdefault: true },
      {
        field: "createddt",
        header: "Created On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
        isdefault: true,
      },
    ];
  }

  getTenantHeader() {
    return [
      { field: "paramtype", header: "Type", datatype: "string", isdefault: true },
      { field: "fieldname", header: "Name", datatype: "string", isdefault: true },
      { field: "fieldvalue", header: "Value", datatype: "string", isdefault: true },
      { field: "tenant", header: "Tenant", datatype: "string", isdefault: true },
      { field: "template", header: "Template", datatype: "string", isdefault: true },
      { field: "customer", header: AppConstant.SUBTENANT, datatype: "string", isdefault: true },
      { field: "script", header: "Script", datatype: "string", isdefault: true },
      { field: "notes", header: "Notes", datatype: "string", isdefault: true },
      { field: "createdby", header: "Created By", datatype: "string", isdefault: true },
      {
        field: "createddt",
        header: "Created On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
        isdefault: true,
      },
    ];
  }

  getTemplateHeader() {
    return [
      { field: "paramtype", header: "Type", datatype: "string", isdefault: true },
      { field: "fieldname", header: "Name", datatype: "string", isdefault: true },
      { field: "fieldvalue", header: "Value", datatype: "string", isdefault: true },
      { field: "tenant", header: "Tenant", datatype: "string", isdefault: true },
      { field: "template", header: "Template", datatype: "string", isdefault: true },
      { field: "customer", header: AppConstant.SUBTENANT, datatype: "string", isdefault: true },
      { field: "script", header: "Script", datatype: "string", isdefault: true },
      { field: "notes", header: "Notes", datatype: "string", isdefault: true },
      { field: "createdby", header: "Created By", datatype: "string", isdefault: true },
      {
        field: "createddt",
        header: "Created On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
        isdefault: true,
      },
    ];
  }

  getScriptHeader() {
    return [
      { field: "paramtype", header: "Type", datatype: "string", isdefault: true },
      { field: "fieldname", header: "Name", datatype: "string", isdefault: true },
      { field: "fieldvalue", header: "Value", datatype: "string", isdefault: true },
      { field: "tenant", header: "Tenant", datatype: "string", isdefault: true },
      { field: "template", header: "Template", datatype: "string", isdefault: true },
      { field: "customer", header: AppConstant.SUBTENANT, datatype: "string", isdefault: true },
      { field: "script", header: "Script", datatype: "string", isdefault: true },
      { field: "notes", header: "Notes", datatype: "string" },
      { field: "createdby", header: "Created By", datatype: "string", isdefault: true },
      {
        field: "createddt",
        header: "Created On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
        isdefault: true,
      },
    ];
  }

  getVariableHeader() {
    return [
      { field: "paramtype", header: "Type", datatype: "string", isdefault: true },
      { field: "fieldname", header: "Variable", datatype: "string", isdefault: true },
      { field: "fieldlabel", header: "Label", datatype: "string", isdefault: true },
      { field: "tenant", header: "Tenant", datatype: "string", isdefault: true },
      { field: "template", header: "Template", datatype: "string", isdefault: true },
      { field: "customer", header: AppConstant.SUBTENANT, datatype: "string", isdefault: true },
      { field: "script", header: "Script", datatype: "string", isdefault: true },
      { field: "notes", header: "Notes", datatype: "string", isdefault: true },
      { field: "createdby", header: "Created By", datatype: "string", isdefault: true },
      {
        field: "createddt",
        header: "Created On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
        isdefault: true,
      },
    ];
  }
}
