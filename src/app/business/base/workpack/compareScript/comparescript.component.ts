import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    SimpleChanges,
  } from "@angular/core";
  import { FormBuilder, FormGroup, Validators } from "@angular/forms";
  import { AppConstant } from "src/app/app.constant";
  import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
  import { TenantsService } from "../../../tenants/tenants.service";
  import { CommonService } from "../../../../modules/services/shared/common.service";
  import * as _ from "lodash";
  import { AWSAppConstant } from "src/app/aws.constant";
  import { NzMessageService, NzNotificationService } from "ng-zorro-antd";
  import * as moment from "moment";
  import { WorkpackConstant } from "src/app/workpack.constant";
  import { AssetRecordService } from "src/app/business/base/assetrecords/assetrecords.service";
  import { Router, ActivatedRoute } from "@angular/router";
  import {
    IResourceType,
    IAssetHdr,
    IAssetDtl,
  } from "src/app/modules/interfaces/assetrecord.interface";
  import downloadService from "src/app/modules/services/shared/download.service";
  import { Buffer } from "buffer";
  import { Observable } from "rxjs";
import { promise } from "protractor";
  @Component({
    selector: "app-comparescript",
    templateUrl: "./comparescript.component.html",
    styleUrls: ["./comparescript.component.css"]
  })
  export class CompareScriptComponent implements OnInit {
    // @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
    // @Input() templateObj: any = {};
    // notifyNewEntry:any;
    resourceId;
    temptabIndex = 0;
    templateObj: any = {};
    loading = false;
    templateForm: FormGroup;
    customerList = [];
    categoryList = [];
    subcategoryList = [];
    severityList = [];
    impactList = [];
    urgencyList = [];
    contacttypes = [];
    templatestatusList = [];
    componentList = [];
    assignmentgroups = [];
    statusList = [
      AppConstant.STATUS.ACTIVE,
      AppConstant.STATUS.INACTIVE,
      AppConstant.STATUS.DELETED,
    ];
    userstoragedata: any;
    button = "Save";
    addCategory: boolean = false;
    edit = false;
    selectedIndex = 0;
    templateErrObj = {
      customerid: AWSAppConstant.VALIDATIONS.TICKETS.CUSTOMERNAME,
      category: AWSAppConstant.VALIDATIONS.TICKETS.CATEGORY,
      templateno: AWSAppConstant.VALIDATIONS.TICKETS.INCIDENTNo,
      title: AWSAppConstant.VALIDATIONS.TICKETS.TITLE,
      displaytitle: AWSAppConstant.VALIDATIONS.TICKETS.DISPLAYTITLE,
      severity: AWSAppConstant.VALIDATIONS.TICKETS.SEVERITY,
      notes: AWSAppConstant.VALIDATIONS.TICKETS.NOTES,
    };
    taskstemplateHeader = WorkpackConstant.COLUMNS.TASKSTEMPLATES;
    taskMode: string = "Add";
    taskstemplatesList: any[] = [];
    formTitle: string = "Add Task";
    isVisible: boolean = false;
    tasktemplateObj: any = {};
    selectedResource = [];
    selectedTaskResource = [];
    filteredColumns = [];
    // selectedResourceName = "";
    taskResource = [];
    taskResourceFormattedHeader = [];
    taskResourceFormattedData = [];
    taskResourceName = "";
    resource = {};
    isAddForm = true;
    // resourceData = [];
    // recordData = [];
    crnData = [];
    addformloading = false;
    resourceDetailMenuVisible = false;
    taskValueAssets = [];
    selectedTaskResourceId = [];
    editResourceId = "";
    // crndetails = [];
    taskResourceTypeList: any[] = [];
    selectedTaskResourceName: any;
    resourceDetails = {} as any;
    isEdit = false;
    selectedTaskEdit: any;
    referringAssetDetails = [];
    oldTaskTemplate;
    workflowformTitle="Workflow";
    selectedWorkflowTask = null;
    isworkflowVisible=false;
    resoruceTitle="";
    waiterSubscriber: any;
    waiterInterval:any;
    interval: any;
    @Input() resourceIds: any[];
    resourceComparisionData:any[];
    comparisionDataReady:boolean=false;

    constructor(
      private fb: FormBuilder,
      private tenantsService: TenantsService,
      private localStorageService: LocalStorageService,
      private commonService: CommonService,
      private message: NzMessageService,
      private notification: NzNotificationService,
      private assetRecordService: AssetRecordService,
      public router: Router,
      private routes: ActivatedRoute
    ) {
      this.userstoragedata = this.localStorageService.getItem(
        AppConstant.LOCALSTORAGE.USER
      );
      this.waiterSubscriber = new Observable((observer) => {
        this.waiterInterval = setInterval(() => { 
          this.userstoragedata = this.localStorageService.getItem(
            AppConstant.LOCALSTORAGE.USER
          );
          observer.next(this.userstoragedata);
        }, 1000);
      });
      this.waitForIntialize();
      // this.initForm();
      // this.getCustomerList();
      // this.getCategoryList();
      // this.getSubCategoryList();
    }
    waitForIntialize(router?:any,callback?:any,params?:any){
      this.waiterSubscriber.subscribe((res) => {
       let localstoreage = res;
       if(this.waiterInterval && localstoreage) {
        this.initForm();
        this.getCustomerList();
        this.getCategoryList();
        this.getSubCategoryList();
        clearInterval(this.waiterInterval);
       }
     });
     }
    ngOnInit() {
      // this.routes.queryParamMap.subscribe((p: any) => {
      //   if (p.params) {
      //     if (p.params.modelcrn != undefined) {
      //       this.selectedResourceName = p.params.modelcrn;
      //       this.getResourceDetail(this.selectedResourceName);
      //     } else if (p.params.resource != undefined) {
      //       this.selectedResourceName = p.params.resource.split("/")[0];
      //       this.editResourceId = p.params.resource.split("/")[1];
      //       this.resourceId = p.params.resource;
      //       this.editDetails(p.params.resource);
      //       this.isEdit = true;
      //     }
      //     if(p.params.srcfrom == "email"){
      //       setTimeout(() => {
      //         this.assignWorkflow();
      //       }, 3000);
      //     }
      //     setTimeout(() => {
      //       //   this.getTemplateAssets();
      //     }, 1000);
      //   }
      // });
    }
    ngOnChanges(changes: SimpleChanges): void {
      this.initForm();
      if (
        !_.isUndefined(changes.templateObj) &&
        !_.isEmpty(changes.templateObj.currentValue)
      ) {
        this.edit = true;
        this.editForm(changes.templateObj.currentValue);
      } else {
        this.edit = false;
      }
      this.getCustomerList();
      this.getCategoryList();
      this.getSubCategoryList();
      if(changes.resourceIds){
        this.prepareCompareData();
      }
    }
    tabChanged(event) {
      this.temptabIndex = event.index;
    }
    async prepareCompareData(){
      this.resourceComparisionData=[];

      for (let resourceIdx = 0; resourceIdx < this.resourceIds.length; resourceIdx++) {
        if(resourceIdx < 3){
          let scriptData = this.resourceIds[resourceIdx];
          let resourceId = scriptData.resource
          let selectedResourceName = resourceId.split("/")[0];
          let editResourceId = resourceId.split("/")[1];
          this.resourceId = resourceId;
          this.resourceComparisionData.push({
            resourceId:resourceId,
            resourceData:[],
            crndetails :[]
          });
           await this.editDetails(resourceId,selectedResourceName,resourceIdx).then(async (rs)=>{
            console.log(rs);
            let selectedResource=rs;
          let res= await this.loadReferences(selectedResource,resourceId,resourceIdx);
          console.log(res);
           }).catch((er)=>{
            console.log(er);
           });
          //  this.loadReferences(selectedResource,resourceid,resourceIdx);
          this.isEdit = true;
        }
        
     };
    }
    async loadReferences(selectedResource,resourceid,resourceIdx) {
      let recordData = selectedResource;
      let crns = [];
      this.taskResourceTypeList = [];
      _.filter(recordData, (item, idx) => {
        this.resourceComparisionData[resourceIdx].resourceData[idx] = [];
        if (item.fieldtype == "REFERENCE") {
          if (item.showbydefault == 0 || item.crn == this.selectedTaskResourceName) {
            this.taskResourceTypeList.push(item);
          }
          crns.push(item.relation);
          return item;
        }
      });
     await this.getAllCRNs(recordData,crns,resourceid,resourceIdx);
    }
    async editDetails(resourceid,selectedResourceName,resourceIdx) :Promise<any>{
      // call api to get the header and details of the assets
      let p=new Promise<any>((resolve, reject) => {
        try {
          this.assetRecordService
        .getResource(
          this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
          "tenantid"
          ],
          selectedResourceName
        )
        .subscribe((d) => {
          let hdrresponse = JSON.parse(d._body);
          let selectedResource = hdrresponse;
          this.assetRecordService
            .getResourceValuesById(btoa(resourceid))
            .subscribe((r) => {
              let crndetails = JSON.parse(r._body).data;
              this.resourceComparisionData[resourceIdx].crndetails=crndetails;
              // this.resourceDetails.details = this.crndetails;
              // this.getTaskTemplatesOnEdit();
              resolve(selectedResource);
              // this.loadReferences(selectedResource,resourceid,resourceIdx);
            });
        });
        } catch (error) {
          reject(error);
        }
        
      })
      return p;
    }
    getTaskTemplatesOnEdit() {
      let parseJson = (str) => {
        try {
          let parse = JSON.parse(str);
          return parse;
        } catch (error) {
          return "";
        }
      };
      _.each(this.resourceDetails.details, (d) => {
        let fieldvalue = parseJson(d.fieldvalue);
        if (_.isArray(fieldvalue)) {
          let tasktemplatedtl = _.find(fieldvalue, (t) => {
            console.log("field: ", t);
            if(t){
              return t.mode == AppConstant.WORKPACK_CONFIG.WP_TASK_KEY;
            }
            
          });
          if (tasktemplatedtl) {
            console.log(tasktemplatedtl);
            this.selectedTaskResourceName = tasktemplatedtl.crn;
            this.taskResourceName = tasktemplatedtl.crn;
            this.getTaskTemplateDetail(tasktemplatedtl.crn);
            _.each(fieldvalue, (tk) => {
              if(tk)
              this.selectedTaskResourceId.push(tk.crn + "/" + tk.resourceid);
            });
            this.selectedTaskResourceId = [...this.selectedTaskResourceId];
          }
        }
      });
    }
    notifyNewTaskEntry(data) {
      data.position = this.taskstemplatesList.length + 1;
      data.expected_result = "Ok / NOK";
      data.orchestrator_id = 0;
      data.workflow_id = 0;
      data["createdby"] = this.userstoragedata.fullname;
      data["createddt"] = new Date();
      data["updatedby"] = this.userstoragedata.fullname;
      data["updateddt"] = new Date();
      this.taskstemplatesList.push(data);
      this.hideModal();
    }
    showModal(obj): void {
      this.tasktemplateObj = obj ? obj : {};
      this.formTitle = "Add Task";
      this.isVisible = true;
      // this.buttonText = this.buttonText;
    }
    hideModal(): void {
      this.tasktemplateObj = {};
      this.formTitle = "Add Task";
      this.isVisible = false;
      // this.buttonText = this.buttonText;
    }
    changeTaskResourceType(details) {
      if (details) {
        // this.getTaskResourceDetails();
        this.selectedTaskResourceId = [];
        // this.selectedTaskResourceName=null;
        this.taskResourceName = details;
        this.getTaskTemplateDetail(details);
      }
      console.log(details);
    }
    getTaskResourceDetails(){
      this.assetRecordService
      .getResource(
        this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
        "tenantid"
        ],
        this.selectedTaskResourceName
      )
      .subscribe((d) => {
        let response: IAssetHdr[] = JSON.parse(d._body);
        console.log("selected task resource details:",response);
      });
    }
    getTaskTemplateDetail(crn: string) {
      this.selectedTaskResource = [];
      this.filteredColumns = [];
      this.assetRecordService
        .getResource(
          this.localStorageService.getItem(AppConstant.LOCALSTORAGE.USER)[
          "tenantid"
          ],
          crn
        )
        .subscribe((d) => {
          let response: IAssetHdr[] = JSON.parse(d._body);
          this.selectedTaskResource = response;
          // this.filteredColumns = [];
          // _.each(response, (itm: any, idx: number) => {
          //   itm.isSelected = itm.showbydefault ? true : false;
          //   if (itm.fieldtype != "Reference Asset") {
          //     this.filteredColumns.push(itm);
          //   }
          //   if (idx + 1 == response.length) {
          //     this.resource[crn] = {
          //       filtered: this.filteredColumns,
          //       selected: response,
          //     };
          //     // this.getAssets();
          //   }
          // });
          // this.loadReferences();
          // this.selectedResourceName = crn;
        });
    }
    formattasksTemplate(response) {
      console.log(this.taskResourceFormattedHeader);
    }
    
    async getAllCRNs(recordData,crns,resourceid,resourceIdx) :Promise<any>{
      new Promise<any>(async (resolve, reject) => {
        this.addformloading = true;
        let reqObj = {
          crns: crns,
          tenantid: this.userstoragedata.tenantid,
          status: "Active",
        };
        await this.assetRecordService.getAllDetail(reqObj).subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.crnData = response.data;
            this.formatData(recordData,resourceid,resourceIdx);
          } else {
            this.formatData(recordData,resourceid,resourceIdx);
          }
          resolve(true);
        });
      })
    }
    formatData(recordData,resourceid,resourceIdx) {
      // this.comparisionRecordData.push(recordData);
      recordData.forEach((o, idx) => {
        let obj: any = _.clone(o);
        obj.isEqualvalue=true;
        if (obj.fieldtype == "Text") {
          obj["fieldvalue"] = "";
        }
        if (obj.fieldtype == "Select" || obj.fieldtype == "STATUS") {
          obj["fieldvalue"] = null;
          obj["defaultValues"] =
            obj["defaultval"] != null && obj["defaultval"] != ""
              ? obj["defaultval"].split(",")
              : ["Unknown"];
        } else if (obj.fieldtype == "REFERENCE") {
          obj["defaultValues"] = [];
          obj["fieldvalue"] = null;
          _.map(this.crnData, (item) => {
            if (item.crn == obj.relation) {
              obj["defaultValues"].push({
                name: item.fieldvalue,
                crn: item.crn,
                resourceid: Number(item.resourceid.split("/")[1]),
              });
            }
            return item;
          });
        } else if (obj.fieldtype == "DOCUMENT") {
          try {
            if (typeof obj.fieldvalue == "string") {
              obj.fieldvalue = JSON.parse(obj.fieldvalue);
            }
          } catch (error) { }
        } else {
          obj["fieldvalue"] = "";
        }
        this.addformloading = false;
        this.resourceComparisionData[resourceIdx].resourceData[idx] = obj;
        if (this.resourceComparisionData[resourceIdx].crndetails) {
          let selectedkeyvalue: any = _.find(this.resourceComparisionData[resourceIdx].crndetails, {
            fieldkey: this.resourceComparisionData[resourceIdx].resourceData[idx].fieldkey,
          });
          if (selectedkeyvalue && selectedkeyvalue.resourceid) {
            this.resourceComparisionData[resourceIdx].resourceData[idx].resourceid = selectedkeyvalue.resourceid;
          }
          if (selectedkeyvalue && selectedkeyvalue.id) {
            this.resourceComparisionData[resourceIdx].resourceData[idx].id = selectedkeyvalue.id;
          }
          if (this.resourceComparisionData[resourceIdx].resourceData[idx].fieldtype == "REFERENCE") {
            this.resourceComparisionData[resourceIdx].resourceData[idx].fieldvalue = [];
            if (
              selectedkeyvalue &&
              selectedkeyvalue.fieldvalue != "" &&
              selectedkeyvalue.fieldvalue != null
            ) {
              let fieldvalue = JSON.parse(selectedkeyvalue.fieldvalue);
              _.map(fieldvalue, (item) => {
                let mappedData = _.find(
                  this.resourceComparisionData[resourceIdx].resourceData[idx].defaultValues,
                  (itm) => {
                    if (itm.name == item.name) {
                      return itm;
                    }
                  }
                );
                this.resourceComparisionData[resourceIdx].resourceData[idx].fieldvalue.push(mappedData);
                this.resourceComparisionData[resourceIdx].resourceData[idx].fieldvalue = [
                  ...this.resourceComparisionData[resourceIdx].resourceData[idx].fieldvalue,
                ];
              });
            }
          } else {
            this.resourceComparisionData[resourceIdx].resourceData[idx].fieldvalue = selectedkeyvalue
              ? selectedkeyvalue.fieldvalue
              : "";
          }
        }
        // this.resourceComparisionData[resourceIdx].resourceData[idx] = [...this.resourceComparisionData[resourceIdx].resourceData[idx]];
        return obj;
      });
      this.resourceComparisionData[resourceIdx].resourceData=[..._.orderBy(this.resourceComparisionData[resourceIdx].resourceData, ["ordernumber","id","asc"])];
      // this.recordData = [..._.orderBy(this.recordData, ["ordernumber","id","asc"])];
      if(this.resourceIds .length - 1 == resourceIdx){
        this.compareScript();
      }
    }
    isArrayEqual(x,y){
      const isSameSize = _.size(x) === _.size(y);
      return isSameSize && _(x).xorWith(y, _.isEqual).isEmpty();
    }
    compareScript(){
      
      if(this.resourceComparisionData.length > 1){
        if(this.resourceComparisionData[0].resourceData.length == this.resourceComparisionData[1].resourceData.length){
          this.resourceComparisionData[0].resourceData = _.map(this.resourceComparisionData[0].resourceData,(firstresourceData,idx)=>{
            firstresourceData.isEqualvalue=true;
            if(firstresourceData.fieldtype == "REFERENCE"){
              if(_.isArray(firstresourceData.fieldvalue) && _.isArray(this.resourceComparisionData[1].resourceData[idx].fieldvalue)){
                if(firstresourceData.fieldvalue.length == this.resourceComparisionData[1].resourceData[idx].fieldvalue.length){
                  firstresourceData.isEqualvalue = this.isArrayEqual(
                    firstresourceData.fieldvalue,
                    this.resourceComparisionData[1].resourceData[idx].fieldvalue
                  );
                }
                else{
                  firstresourceData.isEqualvalue=false;
                }
              }
              console.log("first: ",firstresourceData.fieldvalue);
              console.log("second: ",this.resourceComparisionData[1].resourceData[idx].fieldvalue);
            }
            else{
              if(firstresourceData.fieldvalue != this.resourceComparisionData[1].resourceData[idx].fieldvalue){
                firstresourceData.isEqualvalue=false;
                console.log("firstresourceData.isEqualvalue : ",firstresourceData.isEqualvalue);
              }
            }
            
            return firstresourceData;
          });
        }
      }
      this.comparisionDataReady=true;
      console.log("this.resourceComparisionData: ",this.resourceComparisionData)
    }
    changePosition(rowData, mode) {
      if (mode == "up") {
      }
      if (mode == "up") {
      }
    }
    rightbarChanged(event) {
      this.isVisible = false;
    }
    // close() {
    //   this.router.navigate([`/workpackmanager`],{ queryParams: { modelcrn: this.selectedResourceName } });
    // }
    openAddView() {
      this.resourceDetailMenuVisible = true;
      // this.resourceDetails = {};
      // this.referringAssetDetails = [];
      this.isAddForm = true;
    }

  
    editForm(value) {
      let data = { ...value };
      data.publishyn = value.publishyn == "Y" ? true : false;
      this.templateForm.patchValue(data);
    }
  
    disabledDate = (current) => {
      // Can not select days before today
      return moment().add(-1, "days") >= current;
    };
  
    initForm() {
      this.templateForm = this.fb.group({
        title: [
          null,
          Validators.compose([
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(500),
          ]),
        ],
        description: [""],
        component: [null],
        category: [null],
        version: [null],
        customerid: [null],
        reference: [null],
        prerequisites: [null],
        notes: [""],
        estimate: [0],
        status: [AppConstant.STATUS.ACTIVE],
      });
    }
    getCustomerList() {
      this.tenantsService
        .allcustomers({
          tenantid: this.userstoragedata.tenantid,
          status: AppConstant.STATUS.ACTIVE,
        })
        .subscribe((res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.customerList = response.data;
          } else {
            this.customerList = [];
          }
        });
    }
  
    getCategoryList() {
      let condition = {} as any;
      condition = {
        lookupkey: AppConstant.LOOKUPKEY.TICKET_CATEGORY,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: -1,
      };
      this.commonService.allLookupValues(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.categoryList = response.data;
        } else {
          this.categoryList = [];
        }
      });
    }
    getSubCategoryList() {
      let condition = {} as any;
      condition = {
        lookupkey: AppConstant.LOOKUPKEY.TICKET_SUBCATEGORY,
        status: AppConstant.STATUS.ACTIVE,
        tenantid: -1,
      };
      this.commonService.allLookupValues(condition).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.subcategoryList = response.data;
        } else {
          this.subcategoryList = [];
        }
      });
    }
  
    onCategoryChange(event) {
      console.log(event);
      if (event != "") {
        let existObj = _.find(this.categoryList, { keyvalue: event });
        if (existObj == undefined) {
          console.log("Value not available");
          this.addCategory = true;
        } else {
          this.addCategory = false;
        }
      }
    }
    onFile(event, data) {
      const reader = new FileReader();
      let attachmentFile = event.target.files[0];
      this.addDocs(attachmentFile, data);
      reader.onload = (e) => {
        // this.attachmentFileImage = e.target["result"];
      };
      reader.readAsDataURL(event.target.files[0]);
    }
    addDocs(attachmentFile, rowdata) {
      const formdata = new FormData();
      let data = {} as any;
      data.tenantid = this.userstoragedata.tenantid;
      data.lastupdateddt = new Date();
      data.lastupdatedby = this.userstoragedata.fullname;
      data.status = "Active";
      if (attachmentFile != undefined && attachmentFile != null) {
        formdata.append("file", attachmentFile);
      } else {
        this.message.error("Please upload file");
        return false;
      }
      data.createdby = this.userstoragedata["fullname"];
      data.createddt = new Date();
      data.crn = rowdata.crn;
      data.mode = AppConstant.WORKPACK_CONFIG.DOCUMENT_DATATYPE;
      // data.resourceid = rowdata.id;
      formdata.append("formData", JSON.stringify(data));
      this.assetRecordService.createDocs(formdata).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          let emptydata = [];
          emptydata.push(JSON.parse(response.data.meta));
          rowdata.fieldvalue = emptydata;
          // try {
          //   let parse = rowdata.fieldvalue;
          //   if (Array.isArray(parse)) {
          //     parse.push(JSON.parse(response.data.meta));
          //   } else {
          //     parse = [];
          //     parse.push(JSON.parse(response.data.meta));
          //   }
          //   rowdata.fieldvalue = parse;
          // } catch (error) {
          //   let emptydata = [];
          //   emptydata.push(JSON.parse(response.data.meta));
          //   rowdata.fieldvalue = emptydata;
          // }
        } else {
          this.message.error(response.message);
        }
      });
    }
    displayPreviewList(rowdata): any[] {
      let returnValue: any[] = [];
      try {
        let parse = rowdata.fieldvalue;
        try {
          if (typeof rowdata.fieldvalue == "string") {
            parse = JSON.parse(rowdata.fieldvalue);
          }
        } catch (error) {
          parse = rowdata.fieldvalue;
        }
        if (Array.isArray(parse)) {
          _.each(parse, (data, k) => {
            if (_.isObject(data)) {
              returnValue.push(data);
            }
          });
        }
        return returnValue;
      } catch (error) {
        return [];
      }
    }
    removeImage(rawData, idx) {
      let parse = rawData.fieldvalue;
      try {
        if (typeof rawData.fieldvalue == "string") {
          parse = JSON.parse(rawData.fieldvalue);
        }
        if (Array.isArray(parse)) {
          parse.splice(idx, 1);
          rawData.fieldvalue = parse;
          rawData.fieldvalue = [...rawData.fieldvalue];
        }
      } catch (error) {
      }
    }
    downloadFile(rowdata, d) {
      console.log(rowdata);
      if (rowdata.key) {
  
  
        this.assetRecordService
          .downloadDocs({
            key: rowdata.key,
          })
          .subscribe((result) => {
            let response = JSON.parse(result._body);
            var buffer = Buffer.from(response.data.content.data);
            const TYPED_ARRAY = new Uint8Array(buffer);
            const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
              return data + String.fromCharCode(byte);
            }, "");
            downloadService(buffer, response.data.filename);
          });
      }
    }
    notifyTaskEditEntry(data: any) {
      this.resourceDetailMenuVisible = true;
      this.selectedTaskEdit = null;
      this.selectedTaskEdit = data;
      this.isAddForm = false;
      this.viewResourceDetail(data);
      // this.selectedTaskEdit=[...this.selectedTaskEdit];
    }
    viewResourceDetail(data: Record<string, string>) {
      this.assetRecordService
        .getResourceValuesById(btoa(data["resource"]), `tagdetails=${true}`) // <<crn>>/<<resourceid>>
        .subscribe(
          (r) => {
            let response: {
              data: IAssetDtl[];
              inbound: Record<string, any>[];
              documents: Record<string, any>[];
              referringassets: Record<string, any>[];
            } = JSON.parse(r._body);
  
            let data: any = {
              details: [],
            };
            response.data.forEach((o) => {
              data[o["fieldkey"]] = o["fieldvalue"];
              data["header"] = this.selectedResource;
              data["details"].push(o);
            });
            this.resourceDetails = data;
            // this.inboudResourceDetails = response.inbound;
            this.referringAssetDetails = response.referringassets;
            this.resourceDetailMenuVisible = true;
          },
          (err) => {
            alert("Unable to fetch details. Try again.");
          }
        );
    }
    IsDecimalExist(pecimalNumber) {
      var l_boolIsExist = true;
  
      if (pecimalNumber % 1 == 0)
          l_boolIsExist = false;
  
      return l_boolIsExist;
  }
  onChanged(event){
    this.selectedWorkflowTask = null;
    this.isworkflowVisible=false;
  }
  assignWorkflow(){
    if(this.resourceId){
      this.selectedWorkflowTask = this.resourceId;
      this.resoruceTitle="";
      this.isworkflowVisible=true;
    }
  }
  compareScroll(event,id){
    let scrollTop = event.target.scrollTop;
    let scrollBy = event.target.scrollBy;
    for (let index = 0; index < this.resourceComparisionData.length; index++) {
      let elementId='comparepanel-'+index;
      if(id != elementId){
        let element : HTMLElement = document.getElementById(elementId);
        element.scrollTop=scrollTop;
        element.scrollBy=scrollBy;
      }
    }
    
  }
  }
  