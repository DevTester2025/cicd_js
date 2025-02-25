import * as PapaParse from "papaparse";

import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpHandlerService } from "../http-handler.service";
import * as _ from "lodash";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class JsonCsvCommonService {
  constructor() {}

  downloadCSVfromJson(json: object[], filename: any) {
    let csv = PapaParse.unparse(json);
    var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var csvURL = null;
    if (navigator.msSaveBlob) {
      csvURL = navigator.msSaveBlob(csvData, "sample.csv");
    } else {
      csvURL = window.URL.createObjectURL(csvData);
    }

    var tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", filename + ".csv");
    tempLink.click();
  }

  parseCSV(file: File): Promise<object> {
    return new Promise((resolve, reject) => {
      try {
        PapaParse.parse(file, {
          header: true,
          dynamicTyping: true,
          complete: function (results) {
            resolve(results);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
