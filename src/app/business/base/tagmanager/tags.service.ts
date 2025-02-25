import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import * as moment from "moment";
import { environment } from "../../../../environments/environment";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";

export interface ITag {
  tagid: number;
  tenantid: number;
  resourcetype: null;
  tagname: string;
  tagtype: string;
  regex: null;
  description: null;
  lookupvalues: null;
  required: boolean;
  status: string;
  createdby: string;
  createddt: Date;
  lastupdatedby: string;
  lastupdateddt: Date;
}

@Injectable({
  providedIn: "root",
})
export class TagService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.BASE.TAGS;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  all(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if(query) url = url + '?' + query;
    return this.httpHandler.POST(url, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }

  encodeTagValues(values: any, mode?: "picker" | "maintanance"): any {
    let tagValues = values;

    let d = [];

    for (let index = 0; index < tagValues.length; index++) {
      const value = Object.assign({}, tagValues[index]);

      if (!value.useVar) {
        if (value.tag.tagtype == "list" && Array.isArray(value.tagvalue)) {
          if (mode == "picker") value.tagvalue = value.tagvalue[0];
          else value.tagvalue = value.tagvalue.join(",");
        }

        if (
          (value.tag.tagtype == "range" || value.tag.tagtype == "number") &&
          value.tagvalue != null
        ) {
          value.tagvalue = value.tagvalue.toString();
        }

        if (value.tag.tagtype == "date" && value.tagvalue != null) {
          value.tagvalue = moment(value.tagvalue).format("YYYY-MM-DD");
        }
      }
      d.push(value);
    }

    return d;
  }

  decodeTagValues(values: any, mode?: "picker" | "maintanance"): any {
    let tagValues = values;
    var rx = new RegExp("^v_.*");

    let d = [];

    for (let index = 0; index < tagValues.length; index++) {
      const value = Object.assign({}, tagValues[index]);

      // To comply with use variable change functionalities
      if (
        value.tag != null &&
        value.tag.tagtype == "list" &&
        typeof value.tag.lookupvalues == "string"
      ) {
        if (value.taggroupid && value.taggroupid > 0) {
          value.tag.lookupvalues =
            value && value.tagvalue ? value.tagvalue.split(",") : "";
        } else {
          let lists = value.tag.lookupvalues.split(",");
          value.tag.lookupvalues = lists;
        }
      }
      if ( value.tag != null && value.tag.tagtype == "range" && value.tagvalue != null ) {
        let range = value.tag.lookupvalues;

        value.tag.min = value.tag.min || range.split(",")[0];
        value.tag.max = value.tag.max || range.split(",")[1];
      }

      if (value.tagvalue && rx.test(value.tagvalue)) {
        value.useVar = true;
      } else {
        if ( value.tag != null && value.tag.tagtype == "date" && value.tagvalue != null) {
          value.tagvalue = new Date(value.tagvalue);
        }

        if (value.tag != null && value.tag.tagtype == "number" && value.tagvalue != null) {
          value.tagvalue = Number(value.tagvalue);
        }

        if (value.tag != null && value.tag.tagtype == "range" && value.tagvalue != null) {
          value.tagvalue = Number(value.tagvalue) || 0;

          let range = value.tag.lookupvalues;

          value.tag.min = value.tag.min || range.split(",")[0];
          value.tag.max = value.tag.max || range.split(",")[1];
        }

        if (value.tag != null && value.tag.tagtype == "list") {
          let lists = value.tag.lookupvalues;
          if (mode == "picker") value.tagvalue = value.tagvalue;
          else value.tagvalue = lists;
        }
      }

      d.push(value);
    }

    return d;
  }

  prepareViewFormat(values: any, mode?: "picker" | "maintanance"): any {
    let l = [];
    for (let index = 0; index < values.length; index++) {
      const element = values[index];
      if(element.tag != null){
      if (!element.status || element.status == AppConstant.STATUS.ACTIVE) {
        let tagvalue = "";

        if (element.tag.tagtype == "date" && element.tagvalue != null) {
          tagvalue = moment(element.tagvalue).format("DD-MMM-YYYY");
        } else {
          tagvalue = element.tagvalue;
        }

        l.push({
          tagname: element.tag.tagname,
          tagvalue: tagvalue
        });
      }
    }
  }
    return l;
  }
}
