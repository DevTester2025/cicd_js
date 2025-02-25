import { array } from "@amcharts/amcharts4/core";
import {
    Component,
    OnInit,
    Input,
    EventEmitter,
    Output,
    OnChanges,
    SimpleChanges,
  } from "@angular/core";
  import { Router, ActivatedRoute } from "@angular/router";
  import { environment } from "src/environments/environment";
  import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
  import { AppConstant } from "src/app/app.constant";
  import * as _ from 'lodash';
  import { Observable } from "rxjs";
  @Component({
    selector: "app-cloudmatiq-common-redirect",
    templateUrl: "./commonredirect.component.html",
  })
  export class CommonRedirectComponent implements OnInit, OnChanges {
    waiterSubscriber: any;
    waiterInterval:any;
    interval: any;
    userstoragedata: any;
    constructor(private routes: ActivatedRoute,private router: Router,
        private localStorageService: LocalStorageService,) {
        this.waiterSubscriber = new Observable((observer) => {
            // this.waiterInterval = setInterval(() => { 
            //   this.userstoragedata = this.localStorageService.getItem(
            //     AppConstant.LOCALSTORAGE.USER
            //   );
            //   observer.next(this.userstoragedata);
            // }, 1000);
          });
    }
    waitForIntialize(router,callback?:any,params?:any){
        this.waiterSubscriber.subscribe((res) => {
         let localstoreage = res;
         if(this.waiterInterval && localstoreage) {
            
           if(callback){
            let output= callback(params);
            this.router.navigate(output.nav, { queryParams: output.qparams });
           }
           clearInterval(this.waiterInterval);
         }
       });
       }
    ngOnInit(): void {
        let router=this.router;
        this.routes.queryParamMap.subscribe((p: any) => {
            if (p.params) {
                if(p.params.redirecturl){
                    // this.waitForIntialize(router,this.arrangeRedirection,p.params.url);
                    this.userstoragedata = this.localStorageService.getItem(
                        AppConstant.LOCALSTORAGE.USER
                      );
                    if(this.userstoragedata != null){
                        this.arrangeRedirection(p.params.redirecturl);
                    }
                    else{
                        this.router.navigate(["login"], {
                            queryParams: {
                                redirecturl: p.params.redirecturl,
                            },
                          });  
                    }
                    
                }
            }
        });
    }
    arrangeRedirection(params){
        let splits=params.split("?");
        let base='';
        let queryparams='';
        let output={
            nav:[],
            qparams:{}
        };
        if(splits.length > 0){
            base =splits[0];
            queryparams=splits[1] ? splits[1] : '';
            if(base){
                let valparams=base.replace(environment.weburl,"");
                let nav=[];
                nav.push(valparams);
                let qparams={};
                if(queryparams){
                    let qryArr:any[]=queryparams.split("&");
                    _.each(qryArr,(q)=>{
                        let keyval:string[]=q.split("=");
                        if(keyval){
                            qparams[keyval[0]]=keyval[1] || '';
                        }
                    });
                }
                output.nav=nav;
                output.qparams=qparams;
                setTimeout(() => {
                    this.router.navigate(nav, { queryParams: qparams});
                }, 3000);
            }
        }
        return output;
    }
  
    ngOnChanges(changes: SimpleChanges) {
     
    }
  }
  