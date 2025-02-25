import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppConstant } from "../../../app.constant";
import { ElementRef } from "@angular/core";
import { HttpHandlerService } from "../../../modules/services/http-handler.service";
import * as _ from "lodash";
import * as moment from "moment";
import { jsPDF } from "jspdf";
import { DomSanitizer } from "@angular/platform-browser";
import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { promise } from "protractor";
@Injectable({
    providedIn: "root",
  })
export class WorkpackService {
    endpoint: string;
    serviceURL: any;
    constructor(private httpHandler: HttpHandlerService,
      private localStorageService: LocalStorageService,
      private assetRecordService: AssetRecordService) {
      this.endpoint = AppConstant.API_END_POINT;
      this.serviceURL = AppConstant.API_CONFIG.API_URL.SRM.WORKFLOW;
      
    }
    download(data): Observable<any> {
        let url = this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKPACK.DOWNLOAD;
        return this.httpHandler.POST(url, data);
      }
      workflowExecute(data): Observable<any> {
        let url = this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKPACK.EXECUTE;
        return this.httpHandler.POST(url, data);
      }
      async getAssetDetails(resourceId:string){
        let taskDetails=[];
        let filteredColumns=[];
        let assetsDetails=[];
        let crn = resourceId.split("/")[0];
        let resoruceDetails= await this.getResourceDetail(crn);
        if(resoruceDetails){
          if(resoruceDetails.length > 0){
            _.each(resoruceDetails, (itm: any, idx: number) => {
              if (itm.fieldtype != "Reference Asset") {
                filteredColumns.push(itm);
              }
            });
            let columns = [];
            _.map(filteredColumns, (itm: any) => {
              columns.push(
                _.pick(itm, [
                  "fieldkey",
                  "fieldname",
                  "fieldtype",
                  "assettype",
                  "linkid",
                  "isSelected",
                  "referencekey",
                ])
              );
            });
            let resource={};
            resource[resourceId]=true;
            let f = {
              tenantid: this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
                "tenantid"
              ],
              crn: crn,
              fields: columns,
              // columns : columns,
              filters: {
                resource : resource
              },
            };
           let assetsRes = await this.getAssets(f);
           if(assetsRes){
            if(assetsRes.rows){
              assetsDetails=assetsRes.rows;
            }
           }
          }
        }
        let formattedData=[];
        if(assetsDetails.length > 0){
          _.each(assetsDetails,(assetData)=>{
            let taskDetails = _.map(_.cloneDeep(filteredColumns),(f:any)=>{
              f.fieldvalue = "";
              if(assetData[f.fieldname]){
                f.fieldvalue = assetData[f.fieldname];
              }
              return f;
            });
            formattedData.push({taskDetails});
          });
          
        }
        console.log(resoruceDetails);
        console.log(formattedData);
        let output= {
          filteredColumns : filteredColumns,
          assetsDetails : assetsDetails
        };
        return output;
      }
    
    async getResourceDetail(crn:string): Promise<any>{
      return new Promise( ( resolve, reject )=>{
        try {
          this.assetRecordService
          .getResource(
            this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
            "tenantid"
            ],
            crn
          ).subscribe((r) => {
            resolve(JSON.parse(r._body));
          });
        } catch (error) {
          reject(error);
        }
       
      });
      
    }
    async getAssets(req:any): Promise<any>{
      return new Promise( ( resolve, reject )=>{
        try {
          this.assetRecordService.getResourceAssets(req).subscribe((r) => {
    
            resolve(JSON.parse(r._body));
          });
          
        } catch (error) {
          reject(false);
        }
      });
    }
  public downloadWorkpack(
    formattedData: any[],
    downloadableDiv: ElementRef,
    sanitizer
  ) {
    let mainhtmlcontent = `<html>
        <title></title>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width"> 
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="x-apple-disable-message-reformatting"> 
            <title></title> 
        
            <link href="https://fonts.googleapis.com/css?family=Work+Sans:200,300,400,500,600,700" rel="stylesheet">
        </head>
        <body>
            <header>
                <div style='text-align:center;width:100%'>dsadasdasdsad das sdasddasd ada dasd Page <span class="pageCounter"></span>/<span class="totalPages"></span></div>
            </header>
           <table> {{body_content}}</table>
           <footer>
            <div style='text-align:center;width:100%'>Page <span class="pageCounter"></span>/<span class="totalPages"></span></div>
            </footer>
        </body>
    </html>`;
    let bodycontent = "";
    // _.each(formattedData, (fields) => {
    //   if (fields.fieldtype == "Textarea") {
    //     bodycontent += `<div>
    //             <h4 style="margin: 10px 0px;text-align: left;font-size: 20px;     font-weight: bold;">
    //             ${fields.fieldname}
    //             </h4>
    //             <div style="font-size: 16px;">
    //             ${fields.fieldvalue}
    //             </div>
    //             </div>`;
    //   } else if (fields.fieldtype != "AUTOGEN") {
    //     bodycontent += `<div>
    //             <h4>
    //             ${fields.fieldname}
    //             </h4>
    //             <span style="font-size: 16px;">
    //             ${fields.fieldvalue}
    //             </span>
    //             </div>`;
    //   }
    // });
    let executionData:any[] = _.filter( formattedData,(f)=>{
        return (f.operationtype == AppConstant.CMDB_OPERATIONTYPE[1] || f.operationtype == AppConstant.CMDB_OPERATIONTYPE[2])
    });
    let cmdbData:any[] = _.filter( formattedData,(f)=>{
        return (f.operationtype == AppConstant.CMDB_OPERATIONTYPE[0])
    });
    _.each(cmdbData, (fields) => {
      if (fields.fieldtype == "Textarea") {
        bodycontent += `<tr>
                    <td>
                        <h4 style="margin: 10px 0px;text-align: left;font-size: 12px;     font-weight: bold;">
                        ${fields.fieldname}
                        </h4>
                    <td>
                    <td>
                        <div style="font-size: 12px;">
                        ${fields.fieldvalue}
                        </div>
                    <td>
                  </tr>`;
      } else if (fields.fieldtype == "URL") {
        bodycontent += `<tr>
                    <td>
                        <h4>
                        ${fields.fieldname}
                        </h4>
                    </td>
                    <td>
                        <a href="${fields.fieldvalue}" style="font-size: 12px;">
                        ${fields.fieldvalue}
                        </a>
                    <td>
                  </tr>`;
      } else if (fields.fieldtype != "AUTOGEN") {
        bodycontent += `<tr>
                    <td>
                        <h4>
                        ${fields.fieldname}
                        </h4>
                    </td>
                    <td>
                        <span style="font-size: 12px;">
                        ${fields.fieldvalue}
                        </span>
                    <td>
                  </tr>`;
      }
    });
    mainhtmlcontent = mainhtmlcontent.replace("{{body_content}}", bodycontent);
    console.log("mainhtmlcontent",mainhtmlcontent);
    // downloadableDiv.nativeElement.innerHTML = bodycontent;
    // let elem = document.getElementById("downloadableDiv");
    // let sanitizedElement = sanitizer.bypassSecurityTrustHtml(mainhtmlcontent);
    const doc = new jsPDF({
      unit: "px",
      format: [842, 1191] // [595, 842], // 
    });
    
    try {
        // part 1
        doc.setFontSize(12);
        
      doc.html(mainhtmlcontent, {
        margin:[20,80],
        x : 20,
        y : 20,
        callback: (doc: jsPDF) => {
            var pagecount=doc.getNumberOfPages();
            for (let i = 0; i < pagecount; i++) {
                // doc.setPage(i);  
                // let pagecurrent=doc.getPageInfo(i).pageNumber;     
                // doc.text('Page ' + String(i) + ' of ' + String(pagecount), 210 - 20, 297 - 30);
            }
        //   doc.deletePage(doc.getNumberOfPages());
          doc.save("pdf-export");
        },
      });
      
    } catch (error) {
      console.error(error);
    }
  }
  executionList(data,query?): Observable<any>{
    let url = this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.WORKPACK.EXECUTIONLIST;
    if (query) url = url + "?" + query;
    return this.httpHandler.POST(url, data);
  }
  findOperationType(crn,resourceId){

  }
}

