import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CommonService } from "../../../../modules/services/shared/common.service";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";

import { NzMessageService, UploadFile } from "ng-zorro-antd";
import { ActivatedRoute, Router } from "@angular/router";
import { AccessControlCommonService } from "../../../../modules/services/shared/access.service";
import { AppConstant } from "src/app/app.constant";

@Component({
  selector: "app-solutiontemplate",
  styles: [
    `
      .hover-pointer:hover {
        cursor: pointer;
      }
      .ant-breadcrumb-separator {
        color: white;
      }
      form .ant-input-group .ant-cascader-picker,
      form .ant-input-group .ant-select {
        width: 100%;
      }
      .ant-form-item-control .ant-select .ant-select-selection,
      .ant-input-number {
        width: 100%;
      }
    `,
  ],
  templateUrl:
    "../../../../presentation/web/tenant/solutiontemplate/solutiontemplatecreate.component.html",
})
export class SolutionTemplateCreateComponent {
  subtenantLable = AppConstant.SUBTENANT;
  // current: number = 0;
  // rightbarcontent = '';
  // rightbarTitle: String = '';
  // rightbar: Boolean = false;
  // rightbarWidth: number = 350;
  // gatheringData: Boolean = false;
  // editMode: Boolean = false;
  // existingdata: any;
  // fileList: UploadFile[] = [];
  // securityGroupAdd: Boolean = false;
  // fetchingSummary: Boolean = false;

  // snameForm: FormGroup;
  // snameFormLoading: Boolean;
  // loadBalancerForm: FormGroup;

  // clientList: any = [];
  // cloudprovider: any = [];
  // SLAList: any = [];
  // notificationList: any = [];

  // vpcList: any = [];
  // subnetList: any = [];
  // securityGroupList: any = [];
  // zonesList: any = [];
  // assignlb;

  // solutionTemplateData;

  // _serverList = [];
  // _loadbalancersList = [];
  // _solutionData: any = {
  //   solutionname: ''
  // };
  // _editLB = {
  //   data: {},
  //   status: false
  // }
  // _solutionid: Number;
  // _slaList: any = [];

  // showSummary: Boolean = false;
  // showSLA: Boolean = false;
  // // param
  // paramQuery = {} as any;
  // constructor(private access: AccessControlCommonService, private router: Router, private route: ActivatedRoute, private message: NzMessageService, private lsService: LocalStorageService, private fb: FormBuilder, private commonService: CommonService, private solutionTemplateService: SolutionTemplateService) {
  //   this.constructForm();
  //   this.paramQuery = { paramtype: 'Template', templateid: this._solutionid, status: 'Active' };
  // }

  // constructForm() {
  //   this.snameForm = this.fb.group({
  //     solutionname: [null, Validators.required],
  //     clientid: [-1],
  //     cloudprovider: ["AWS", Validators.required],
  //     eventtype: [null, Validators.required],
  //     modeofnotification: [null, Validators.required],
  //     configuration: [null, Validators.required],
  //     slaname: [null, Validators.required],
  //     notes: [""],
  //     status: [true],
  //     createdby: [this.lsService.getItem('user').fullname],
  //     createddt: [new Date()],
  //     lastupdateddt: [new Date()],
  //     lastupdatedby: [this.lsService.getItem('user').fullname],
  //     tenantid: [this.lsService.getItem('user').tenantid]
  //   })
  //   this.loadBalancerForm = this.fb.group({
  //     lbname: [null, [Validators.required, Validators.pattern(new RegExp(/(\w|-)(?!=\S)/g))]],
  //     listeners: [null, Validators.required],
  //     subnetid: [null, Validators.required],
  //     securitypolicy: [null, Validators.required],
  //     securitygroupid: [null, Validators.required],
  //     hcunhealthythreshold: [10, Validators.required],
  //     certificatearn: [null, Validators.required],
  //     hcport: [null, Validators.required],
  //     hcinterval: [10, Validators.required],
  //     hctimeout: [10, Validators.required],
  //     hchealthythreshold: [10, Validators.required],
  //     solutionid: [],
  //     assignlb: [null, Validators.required],
  //     status: ['Active'],
  //     notes: [""],
  //     createdby: [this.lsService.getItem('user').fullname],
  //     createddt: [new Date()],
  //     tenantid: [this.lsService.getItem('user').tenantid]
  //   })
  // }

  // dataChanged(event) {
  //   this.rightbar = false;
  // }
  // ngOnInit() {
  //   this.access.getPageAccess(1);
  //   this.getClients();
  //   // this.getNotifications();
  //   this.getSLAList();
  //   this.getVPCList();
  //   this.getAWSZones();
  //   this.getSubnetList();
  //   this.getSecurityGroupList();
  //   this.route.params.subscribe(params => {
  //     if (params['sid'] !== undefined) {
  //       this._solutionid = parseInt(params['sid']);
  //       this.editMode = true;
  //       this.gatheringData = true;
  //       this.getSolutionData(params['sid'])
  //     }
  //   })
  // }

  // getVPCList() {
  //   this.solutionTemplateService.getVpcList({
  //     status: 'active'
  //   }).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.vpcList = response.data
  //     } else {
  //       // this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Sorry! Something gone wrong');
  //   })
  // }

  // getAWSZones() {
  //   this.solutionTemplateService.getZones({
  //     status: 'Active'
  //   }).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.zonesList = response.data
  //     } else {
  //       // this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Sorry! Something gone wrong');
  //   })
  // }

  // getSLAList() {
  //   this.commonService.allLookupValues({
  //     status: 'Active',
  //     keylist:['SLA_TYPE']
  //   }).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.SLAList = response.data
  //     } else {
  //       // this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Sorry! Something gone wrong');
  //   })
  // }

  // getClients() {
  //   this.commonService.allCustomers({
  //     status: 'active'
  //   }).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.clientList = response.data
  //     } else {
  //       // this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Sorry! Something gone wrong');
  //   })
  // }

  // getNotifications() {
  //   this.solutionTemplateService.getNotificationsList({
  //     status: 'active'
  //   }).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.notificationList = response.data
  //     } else {
  //       // this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Sorry! Something gone wrong');
  //   })
  // }

  // getSubnetList() {
  //   this.solutionTemplateService.getSubnetList({
  //     status: 'active'
  //   }).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.subnetList = response.data
  //     } else {
  //       // this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Sorry! Something gone wrong');
  //   })
  // }

  // getSecurityGroupList() {
  //   console.log('Called');
  //   this.solutionTemplateService.getSecurityGroupList({
  //     status: 'active'
  //   }).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.securityGroupList = response.data
  //     } else {
  //       // this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Sorry! Something gone wrong');
  //   })
  // }

  // getSolutionData(id?, create?) {
  //   this.fetchingSummary = true;
  //   if (create) {
  //     var id = JSON.parse(localStorage.getItem('_solutionData')).solutionid
  //   }
  //   this.solutionTemplateService.getSolutionByID(id).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.fetchingSummary = false;
  //       this.solutionTemplateData = response.data;
  //       console.log(this.solutionTemplateData);
  //       if(this.solutionTemplateData.slas.length > 0){
  //         this._slaList = this.solutionTemplateData.slas
  //       }
  //       let snameFormData = {
  //         ...this.solutionTemplateData,
  //         ...this.solutionTemplateData.solutionnotifications
  //       }
  //       this._serverList = this.solutionTemplateData.awssolutions;
  //       if (this.solutionTemplateData.lb && this.solutionTemplateData.lb.length > 0) {
  //         this._loadbalancersList = this.solutionTemplateData.lb;
  //       } else {
  //         this._loadbalancersList = [];
  //       }
  //       localStorage.setItem('_solutionData', JSON.stringify(this.solutionTemplateData))
  //       console.log(snameFormData);
  //       this.snameForm.patchValue({ ...this.solutionTemplateData, ...this.solutionTemplateData.solutionnotifications, notes: this.solutionTemplateData.notes });
  //       this.gatheringData = false;
  //       if (create) {
  //         this.current = this.current + 1
  //       }
  //     } else {
  //       this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Unable to retrieve solution template data');
  //   })
  // }

  // addSLA(data) {
  //   this._slaList.concat(data);
  //   this.showSLA = false;
  //   // this.solutionTemplateService.addSLA(data).subscribe(data => {
  //   //   var response = JSON.parse(data._body);
  //   //   if (response.status) {
  //   //     this.getSLAList();
  //   //     this.message.success(response.message);
  //   //     this.snameForm.get("slaid").setValue(response.data.slaid);
  //   //     this.rightbar = false
  //   //   } else {
  //   //     this.message.error(response.message);
  //   //   }
  //   // }, err => {
  //   //   this.message.error('Unable to add SLA. Try again');
  //   // })
  // }

  // addeditServers(data) {
  //   this._serverList = data;
  // }

  // updateAWSServer(data) {
  //   this.solutionTemplateService.updateAWSSolution(data).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.message.success(response.message);
  //     } else {
  //       this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Unable to update Server configs');
  //   })
  // }

  // addSubnet(data) {
  //   this.solutionTemplateService.addSubnet(data).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.message.success(response.message);
  //       this.getSubnetList();
  //       this.rightbar = false
  //     } else {
  //       this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.message.error('Unable to add subnet. Try again');
  //   })
  // }

  // addoreditSolution() {
  //   if (this.editMode) {
  //     var sData = this.solutionTemplateData;
  //   }
  //   var formData = this.snameForm.value
  //   this.snameFormLoading = true;
  //   var commons = {
  //     createdby: formData.createdby,
  //     createddt: formData.createddt,
  //     lastupdatedby: this.lsService.getItem('user').fullname,
  //     lastupdateddt: new Date(),
  //     tenantid: formData.tenantid
  //   }
  //   var status = this.snameForm.value.status === true ? 'Active' : 'Inactive';
  //   var data:any = {
  //     solutionname: formData.solutionname,
  //     clientid: formData.clientid,
  //     cloudprovider: formData.cloudprovider,
  //     notes: formData.notes,
  //     slaname: formData.slaname,
  //     notifications: {
  //       ...commons,
  //       eventtype: formData.eventtype,
  //       modeofnotification: formData.modeofnotification,
  //       configuration: formData.configuration
  //     },
  //     ...commons,
  //     status: status
  //   }

  //   if(this._slaList.length > 0){
  //     data.slas = this._slaList
  //   }

  //   // Older code
  //   if (!this.editMode) {
  //     this.createSolution(data);
  //   } else {
  //     if (!this.snameForm.pristine) {
  //       data.notifications['notificationid'] = sData.solutionnotifications.notificationid;
  //       data.status = "Active";
  //       data['solutionid'] = sData.solutionid
  //       this.updateSolution(data);
  //     } else {
  //       this.snameFormLoading = false;
  //       this.current += 1;
  //     }
  //   }

  //   // New Code
  //   // this.solutionTemplateData = {
  //   //   ...data
  //   // }
  //   // if (this._slaList.length > 0) {
  //   //   data.slas = this._slaList;
  //   //   if (!this.editMode) {
  //   //     this.createSolution(data);
  //   //   } else {
  //   //     if (!this.snameForm.pristine) {
  //   //       data.notifications['notificationid'] = sData.solutionnotifications.notificationid;
  //   //       data.status = "Active";
  //   //       data['solutionid'] = sData.solutionid
  //   //       console.log(data);
  //   //       // this.updateSolution(data);
  //   //     } else {
  //   //       this.snameFormLoading = false;
  //   //       this.current += 1;
  //   //     }
  //   //   }
  //   // } else {
  //   //   this.message.error('Please add one or more SLA\'s');
  //   // }
  // }

  // createSolution(data) {
  //   data.tenantid = this.lsService.getItem("user").tenantid;
  //   console.log(data);
  //   this.solutionTemplateService.createSolution(data).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.message.success(response.message);
  //       this._solutionData = response.data;
  //       this._solutionid = parseInt(response.data.solutionid);
  //       localStorage.setItem('_solutionData', JSON.stringify(this._solutionData));
  //       this.snameFormLoading = false;
  //       this.current += 1
  //     } else {
  //       this.message.error(response.message);
  //       this.snameFormLoading = false;
  //     }
  //   })
  // }

  // addLoadBalancer() {
  //   if (this.loadBalancerForm.valid) {
  //     var old = this.loadBalancerForm.value;
  //     old.solutionid = JSON.parse(localStorage.getItem('_solutionData')).solutionid;
  //     old.lastupdateddt = new Date();
  //     old.lastupdatedby = this.lsService.getItem('user').fullname;
  //     old.vpcid = this._serverList[0].vpcid
  //     delete old['assignlb']
  //     if (this._editLB.status) {
  //       var lbData: any = this._editLB
  //       old.lbid = lbData.data.lbid;
  //       var index = this._loadbalancersList.findIndex(x => x.lbid === old.lbid);
  //       old.lastupdatedby = this.lsService.getItem("user").fullname;
  //       old.lastupdateddt = new Date();
  //       this.solutionTemplateService.updateLoadBalancer(old).subscribe(data => {
  //         var response = JSON.parse(data._body);
  //         if (response.status) {
  //           this._loadbalancersList[index] = response.data
  //           var solArr = [];
  //           if (this.loadBalancerForm.get("assignlb").value.length > 0) {
  //             for (var i = 0; i < this.loadBalancerForm.get("assignlb").value.length; i++) {
  //               var sData = this._serverList.find(o => o.awssolutionid == this.loadBalancerForm.get("assignlb").value[i])
  //               sData.lbid = lbData.data.lbid
  //               solArr.push(sData);

  //               for (var j = 0; j < this._serverList.length; j++) {
  //                 if (this._serverList[j].awssolutionid == this.loadBalancerForm.get("assignlb").value[i]) {
  //                   this._serverList[j].lbid = response.data.lbid
  //                 }
  //               }
  //             }
  //             this.bulkUpdateSolution(solArr);
  //           }
  //           this._editLB.status = false;
  //           this.loadBalancerForm.reset();

  //         } else {
  //           this.message.error(response.message);
  //         }
  //       }, err => {
  //         this.message.error('Unable to update load balancer');
  //       })
  //     } else {
  //       old.createdby = this.lsService.getItem("user").fullname;
  //       old.createddt = new Date();
  //       old.lastupdatedby = this.lsService.getItem("user").fullname;
  //       old.lastupdateddt = new Date();
  //       old.notes = this.loadBalancerForm.get("notes").value || "";
  //       old.status = "Active";
  //       old.tenantid = this.lsService.getItem("user").tenantid;
  //       this.solutionTemplateService.addLoadBalancer(old).subscribe(data => {
  //         var response = JSON.parse(data._body);
  //         if (response.status) {
  //           this._loadbalancersList = [
  //             ...this._loadbalancersList,
  //             response.data,
  //           ]
  //           var solArr = [];
  //           for (var i = 0; i < this.loadBalancerForm.get("assignlb").value.length; i++) {
  //             var sData = this._serverList.find(o => o.awssolutionid == this.loadBalancerForm.get("assignlb").value[i])
  //             sData.lbid = response.data.lbid
  //             solArr.push(sData);

  //             for (var j = 0; j < this._serverList.length; j++) {
  //               if (this._serverList[j].awssolutionid == this.loadBalancerForm.get("assignlb").value[i]) {
  //                 this._serverList[j].lbid = response.data.lbid
  //               }
  //             }
  //           }
  //           this.bulkUpdateSolution(solArr);
  //           this.loadBalancerForm.reset();
  //         } else {
  //           this.message.error(response.message);
  //         }
  //       }, err => {
  //         this.message.error('Unable to add load balancer');
  //       })
  //     }
  //   } else {
  //     this.message.error('Please fill in all the required fields')
  //   }
  // }

  // editLB(lb) {
  //   let assigneeList = [];
  //   this._serverList.forEach(o => {
  //     if (o.lbid == lb.lbid) {
  //       assigneeList.push(o.awssolutionid);
  //     }
  //   })
  //   lb.assignlb = assigneeList
  //   console.log(lb);
  //   this._editLB.data = lb;
  //   this._editLB.status = true;
  //   this.loadBalancerForm.patchValue(lb);
  // }

  // removeLB(lb, i) {
  //   lb.status = "Deleted";
  //   this.solutionTemplateService.updateLoadBalancer(lb).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.message.success('Load balancer removed');
  //       this._loadbalancersList.splice(i, 1);
  //     } else {
  //       this.message.error(response.message);
  //     }
  //   })
  // }

  // updateSolution(data) {
  //   let std = this.solutionTemplateData
  //   let n = data.notifications
  //   delete data['notifications']
  //   let s = data;
  //   // this.bulkUpdateSLA(this._slaList);
  //   this.solutionTemplateService.updateNotification(n).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {

  //       this.solutionTemplateService.updateSolution(s).subscribe(dt => {
  //         var resp = JSON.parse(dt._body);
  //         if (resp.status) {
  //           this.snameFormLoading = false;
  //           this.message.success(resp.message);
  //           this.current += 1;
  //           this.paramQuery.templateid = resp.data.solutionid;
  //           this.paramQuery.customerid = resp.data.clientid;
  //         } else {
  //           this.message.error(resp.message);
  //         }
  //       }, err => {
  //         this.snameFormLoading = false;
  //         this.message.error('Unable to update solution template settings');
  //       })
  //     } else {
  //       this.message.error(response.message);
  //     }
  //   }, err => {
  //     this.snameFormLoading = false;
  //     this.message.error('Unable to update notification settings');
  //   });
  // }

  // bulkUpdateSLA(data){
  //   this.solutionTemplateService.bulkUpdateSLA(data).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       // this.message.success(response.message);
  //     } else {
  //       this.message.error(response.message);
  //     }
  //   })
  // }

  // bulkUpdateSolution(data) {
  //   console.log(data);
  //   this.solutionTemplateService.bulkUpdateSolution(data).subscribe(data => {
  //     var response = JSON.parse(data._body);
  //     if (response.status) {
  //       this.message.success(response.message);
  //     } else {
  //       this.message.error(response.message);
  //     }
  //   })
  // }
  // notifyScriptEntry(data) { }
  // closeSummary(event) {
  //   this.showSummary = event;
  // }
}
