import {
  Component,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { TenantsService } from "../../../../tenants/tenants.service";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { AWSAppConstant } from "src/app/aws.constant";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
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
import { Observable } from "rxjs";
import { UsersService } from "src/app/business/admin/users/users.service";
import { NotificationSetupService } from "src/app/business/tenants/network setup/notificationsetup.service";

@Component({
  selector: "app-addeditworkpacktemplate",
  templateUrl: "./addedittemplate.component.html",
  styles: [
    `
      :host ::ng-deep .ant-collapse-content {
        background-color: #475560 !important;
      }
      :host ::ng-deep .ant-btn[disabled] {
        background-color: transparent;
      }
      :host ::ng-deep .ant-btn[disabled]:hover {
        background-color: transparent;
      }
      :host ::ng-deep .ant-form-item-label label:after {
        margin: 0 !important;
      }
    `,
  ],
})
export class AddedittemplateComponent implements OnInit {
  resourceId: string;
  tabIndex = 0;
  templateObj: any = {};
  loading = false;
  templateForm: FormGroup;
  customerList = [];
  categoryList = [];
  subcategoryList = [];
  severityList = [];
  impactList = [];
  urgencyList = [];
  componentList = [];
  statusList = [
    AppConstant.STATUS.ACTIVE,
    AppConstant.STATUS.INACTIVE,
    AppConstant.STATUS.DELETED,
  ];
  userStorageData: any;
  addCategory = false;
  isEditMode = false;
  selectedIndex = 0;
  templateErrorMessages = {
    customerid: AWSAppConstant.VALIDATIONS.TICKETS.CUSTOMERNAME,
    category: AWSAppConstant.VALIDATIONS.TICKETS.CATEGORY,
    templateno: AWSAppConstant.VALIDATIONS.TICKETS.INCIDENTNo,
    title: AWSAppConstant.VALIDATIONS.TICKETS.TITLE,
    displaytitle: AWSAppConstant.VALIDATIONS.TICKETS.DISPLAYTITLE,
    severity: AWSAppConstant.VALIDATIONS.TICKETS.SEVERITY,
    notes: AWSAppConstant.VALIDATIONS.TICKETS.NOTES,
  };
  taskTemplatesList: any[] = [];
  formTitle = "Add Task";
  isVisible = false;
  taskTemplates: any = {};
  selectedResource = [];
  selectedTaskResource = [];
  filteredColumns = [];
  selectedResourceCRN = "";
  taskResource = [];
  taskResourceFormattedHeader = [];
  taskResourceFormattedData = [];
  taskResourceName = "";
  resource = {};
  isAddForm = true;
  resourceData = [];
  recordData = [];
  crnData = [];
  addFormLoading = false;
  resourceDetailMenuVisible = false;
  taskValueAssets = [];
  selectedTaskResourceId = [];
  editResourceId = "";
  crnDetails = [];
  originalCrnDetails = [];
  taskResourceTypeList: any[] = [];
  selectedTaskResourceName: any;
  selectedTask: any;
  resourceDetails = {} as any;
  isEdit = false;
  selectedTaskEdit: any;
  referringAssetDetails = [];
  oldTaskTemplate;
  selectedWorkflowTask = null;
  isWorkflowVisible = false;
  waiterSubscriber: any;
  waiterInterval: any;
  interval: any;
  usersList: any[];
  cmdbOperationType = AppConstant.CMDB_OPERATIONTYPE;
  workpackOperationType = AppConstant.WORKPACK_OPERATIONTYPE;
  workpackDefaultAttr = AppConstant.WORKPACK_DEFAULT_ATTR;
  workpackStatus = this.workpackOperationType[0];
  txnRefList: any[] = [];
  isExecutableVersion = false;
  isReviewerLogin = false;
  isTreeVisible = false;
  selectedWorkpackTitle = '';
  selectedTaskDetails: any[] = [];
  isPublished = false;
  screens: any = [];
  appScreens = {} as any;
  visibleAdd = false;
  visibleOnly = false;
  visibleEdit = false;
  visibleDelete = false;
  visiblePublish = false;
  saveLoading = false;
  executionStatus: any;
  executionStatusList = AppConstant.WORKPACK_EXECUTIONSTATUS;
  selectedFields: any[];
  srcFrom = "";
  runID: any = "";
  watchList: any[] = [];
  selectedTaskResourceID;
  workflow_config = {
    assignee_placeholder: "Executor/Installer",
    tabltitle_info: "Workflow Execution",
    tabltitle_comments: "Remarks/Observations",
    tabltitle_document: "Documents"
  };

  watchListWorkPack = [];
  selectedValue: any;
  constructor(
    private fb: FormBuilder,
    private tenantsService: TenantsService,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private messageService: NzMessageService,
    private assetRecordService: AssetRecordService,
    public router: Router,
    private route: ActivatedRoute,
    private userService: UsersService,
    private modalService: NzModalService,
    private notificationService: NotificationSetupService
  ) {
    // Initialize user storage data and screen permissions
    this.userStorageData = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    const workpackScreenCode = AppConstant.SCREENCODES.WORKPACKTEMPLATE;
    this.appScreens = _.find(this.screens, {
      screencode: workpackScreenCode
    });
    if (this.appScreens) {
      this.visibleOnly = _.includes(this.appScreens.actions, "View");
      this.visibleAdd = _.includes(this.appScreens.actions, "Create");
      this.visibleEdit = _.includes(this.appScreens.actions, "Edit");
      this.visibleDelete = _.includes(this.appScreens.actions, "Delete");
      this.visiblePublish = _.includes(this.appScreens.actions, "Publish");
    }
    // Observable to periodically check for user storage data
    this.waiterSubscriber = new Observable((observer) => {
      this.waiterInterval = setInterval(() => {
        this.userStorageData = this.localStorageService.getItem(
          AppConstant.LOCALSTORAGE.USER
        );
        observer.next(this.userStorageData);
      }, 1000);
    });
    this.waitForInitialize();
  }

  // Wait for initialization and load necessary data
  waitForInitialize(router?: any, callback?: any, params?: any) {
    this.waiterSubscriber.subscribe((res) => {
      const localStorageData = res;
      if (this.waiterInterval && localStorageData) {
        this.initForm();
        this.getCustomerList();
        this.getCategoryList();
        this.getSubCategoryList();
        clearInterval(this.waiterInterval);
      }
    });
  }

  // Lifecycle hook for component initialization
  ngOnInit() {
    this.getUserList();
    this.getNotificationList()
    this.route.queryParamMap.subscribe((params: any) => {
      if (params.params) {
        if (params.params.modelcrn !== undefined) {
          this.selectedResourceCRN = params.params.modelcrn;
          this.getResourceDetail(this.selectedResourceCRN);
        } else if (params.params.resource !== undefined) {
          this.selectedResourceCRN = params.params.resource.split("/")[0];
          this.editResourceId = params.params.resource.split("/")[1];
          this.resourceId = params.params.resource;
          this.editDetails(params.params.resource);
          this.isEdit = true;
        }
        if (params.params.srcfrom) {
          this.srcFrom = params.params.srcfrom;
        }
        if (params.params.srcfrom === "email") {
          setTimeout(() => {
            this.assignWorkflow();
          }, 3000);
        }
        setTimeout(() => {
          // this.getTemplateAssets();
        }, 1000);
      }
    });
  }

  // Lifecycle hook for changes detection
  ngOnChanges(changes: SimpleChanges): void {
    this.initForm();
    if (
      !_.isUndefined(changes.templateObj) &&
      !_.isEmpty(changes.templateObj.currentValue)
    ) {
      this.isEditMode = true;
      this.editForm(changes.templateObj.currentValue);
    } else {
      this.isEditMode = false;
    }

    this.getCustomerList();
    this.getCategoryList();
    this.getSubCategoryList();
  }

  // Handle tab change event
  tabChanged(event) {
    this.tabIndex = event.index;
  }

  // Fetch user list  // Fetch user list
  getUserList() {
    this.userService
      .allUsers({
        tenantid: this.userStorageData.tenantid,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.usersList = _.map(response.data, (user) => {
            user.userid = user.userid.toString();
            return user;
          });
        }
      });
  }

  // Load references for the selected resource
  loadReferences() {
    this.recordData = this.selectedResource;
    let crns = [];
    this.taskResourceTypeList = [];
    _.filter(this.recordData, (item, idx) => {
      this.resourceData[idx] = [];
      if (item.fieldtype === "REFERENCE") {
        if (item.crn === this.selectedTaskResourceName) {
          this.taskResourceTypeList.push(item);
        }
        crns.push(item.relation);
        return item;
      }
    });
    this.getAllCRNs(crns);
  }

  // Get keys of an object
  objectKeys(obj) {
    return Object.keys(obj);
  }

  // Edit details of a resource
  editDetails(resourceId) {
    // Load workpack task details
    this.assetRecordService
      .txnrefList({
        refkey: resourceId,
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe((taskTxnData) => {
        const refsRes = JSON.parse(taskTxnData._body);
        if (refsRes.data) {
          this.txnRefList = refsRes.data || [];
          const executableTasks = _.filter(this.txnRefList, (task) => task.module === 'workpack-executable');
          if (executableTasks.length > 0) {
            this.runID = executableTasks[0].txnid;
            this.isExecutableVersion = true;
          }
          const workpackTasks = _.filter(this.txnRefList, (task) => task.module === 'workpack-task');
          let selectedTaskResourceId = [];
          let reference = "";
          let selectedWorkpackTitle = "";
          _.each(workpackTasks, (task) => {
            const transaction = {
              id: task.id,
              txn: task.txn,
              reference: task.reference,
              notes: task.notes,
              module: 'workpack-task'
            };
            this.selectedTaskDetails.push(transaction);
            selectedTaskResourceId.push(task.txn);
            reference = task.reference;
            selectedWorkpackTitle = task.notes;
            this.taskTemplates[reference] = {
              selectedWorkpackTitle,
              reference,
              data: transaction
            };
            this.changeTaskResourceType(reference);
          });

          _.each(this.txnRefList, (task) => {
            if (task.module === this.cmdbOperationType[7]) {
              this.watchList.push(task.txn);
              this.watchList = [...this.watchList];
            }
          });

          this.selectedTaskResourceId = selectedTaskResourceId;
          this.selectedWorkpackTitle = selectedWorkpackTitle;
        }
      });

    // Get resource details
    this.assetRecordService
      .getResource(this.userStorageData.tenantid, this.selectedResourceCRN)
      .subscribe((data) => {
        const hdrResponse = JSON.parse(data._body);
        this.selectedResource = hdrResponse;
        this.assetRecordService
          .getResourceValuesById(btoa(resourceId))
          .subscribe((res) => {
            this.crnDetails = JSON.parse(res._body).data;
            const notificationWatchlistWP = (this.crnDetails[0] && this.crnDetails[0].notificationwatchlistWP) || [];
            const ntfcsetupIds = Array.from(new Set(notificationWatchlistWP.map(e => e.ntfcsetupid)));
            this.selectedValue = ntfcsetupIds;
            this.originalCrnDetails = _.cloneDeep(this.crnDetails);
            this.resourceDetails.details = this.crnDetails;
            this.getTaskTemplatesOnEdit();
            this.loadReferences();
          });
      });

    // Call API to get the header and details of the assets
    this.assetRecordService
      .txnrefList({ txn: resourceId })
      .subscribe((txnData) => {
        const res = JSON.parse(txnData._body);
        if (res.status) {
          this.txnRefList = res.data || [];
        }
      });
  }

  // Get task templates on edit
  getTaskTemplatesOnEdit() {
    const parseJson = (str) => {
      try {
        return JSON.parse(str);
      } catch (error) {
        return "";
      }
    };
    _.each(this.resourceDetails.details, (detail) => {
      const fieldValue = parseJson(detail.fieldvalue);
      if (_.isArray(fieldValue)) {
        const taskTemplateDetail = _.find(fieldValue, (task) => task && task.mode === AppConstant.WORKPACK_CONFIG.WP_TASK_KEY);
        if (taskTemplateDetail) {
          this.selectedTaskResourceName = taskTemplateDetail.crn;
          this.taskResourceName = taskTemplateDetail.crn;
          this.getTaskTemplateDetail(taskTemplateDetail.crn);
          _.each(fieldValue, (task) => {
            if (task) this.selectedTaskResourceId.push(`${task.crn}/${task.resourceid}`);
          });
          this.selectedTaskResourceId = [...this.selectedTaskResourceId];
        }
      }
    });
  }

  // Get template assets
  getTemplateAssets() {
    this.selectedFields = [];
    const columns = [];
    _.map(this.filteredColumns, (item) => {
      columns.push(_.pick(item, [
        "fieldkey",
        "fieldname",
        "fieldtype",
        "assettype",
        "linkid",
        "isSelected",
        "referencekey",
        "ordernumber",
        "resourcetype",
        "operationtype",
        "crn"
      ]));
      if (item.isSelected) {
        this.selectedFields.push(_.pick(item, [
          "fieldkey",
          "fieldname",
          "fieldtype",
          "assettype",
          "linkid",
          "isSelected",
          "referencekey",
          "ordernumber",
          "resourcetype",
          "operationtype",
          "crn"
        ]));
      }
    });
    const resource = { [this.editResourceId]: true };
    _.each(this.selectedTaskResourceId, (rs) => {
      resource[rs] = true;
    });
    const filter = { resource };
    const request = {
      tenantid: this.userStorageData.tenantid,
      crn: this.selectedResourceCRN,
      fields: columns,
      filters: filter,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.assetRecordService.getResourceAssets(request).subscribe((res) => {
      const response = JSON.parse(res._body);
    });
  }

  // Notify new task entry
  notifyNewTaskEntry(data) {
    data.position = this.taskTemplatesList.length + 1;
    data.expected_result = "Ok / NOK";
    data.orchestrator_id = 0;
    data.workflow_id = 0;
    data.createdby = this.userStorageData.fullname;
    data.createddt = new Date();
    data.updatedby = this.userStorageData.fullname;
    data.updateddt = new Date();
    this.taskTemplatesList.push(data);
    this.hideModal();
  }

  // Show modal for adding/editing task
  showModal(obj): void {
    this.formTitle = "Add Task";
    this.isVisible = true;
  }

  // Hide modal
  hideModal(): void {
    this.formTitle = "Add Task";
    this.isVisible = false;
  }

  // Change task resource type
  changeTaskResourceType(details) {
    if (details) {
      this.taskResourceName = details;
      this.getTaskTemplateDetail(details);
    }
  }

  // Get task resource details
  getTaskResourceDetails() {
    this.assetRecordService
      .getResource(this.userStorageData.tenantid, this.selectedTaskResourceName)
      .subscribe((data) => {
        const response: IAssetHdr[] = JSON.parse(data._body);
      });
  }

  // Get task template detail
  getTaskTemplateDetail(crn: string) {
    this.selectedTaskResource = [];
    this.filteredColumns = [];
    this.assetRecordService
      .getResource(this.userStorageData.tenantid, crn)
      .subscribe((data) => {
        const response: IAssetHdr[] = JSON.parse(data._body);
        this.taskTemplates[crn].selectedTaskResource = response;
        this.selectedTaskResource = response;
      });
  }

  // Format tasks template
  formatTasksTemplate(response) {
    console.log(this.taskResourceFormattedHeader);
  }

  // Get resource detail
  getResourceDetail(crn: string) {
    this.selectedResource = [];
    this.filteredColumns = [];
    this.loading = true;
    this.assetRecordService
      .getResource(this.userStorageData.tenantid, crn)
      .subscribe((data) => {
        this.loading = false;
        const response: IAssetHdr[] = JSON.parse(data._body);
        this.selectedResource = response;
        this.filteredColumns = [];
        _.each(response, (item: any, idx) => {
          item.isSelected = true;
          if (item.fieldtype !== "Reference Asset") {
            this.filteredColumns.push(item);
          }
          if (idx + 1 === response.length) {
            this.resource[crn] = {
              filtered: this.filteredColumns,
              selected: response,
            };
          }
        });
        this.loadReferences();
      });
  }

  // Get all CRNs
  getAllCRNs(crns) {
    this.addFormLoading = true;
    const request = {
      crns: crns,
      tenantid: this.userStorageData.tenantid,
      status: "Active",
    };
    this.loading = true;
    this.assetRecordService.getAllDetail(request).subscribe((res) => {
      this.loading = false;
      const response = JSON.parse(res._body);
      if (response.status) {
        this.crnData = response.data;
        setTimeout(() => {
          this.formatData();
        }, 100);
      } else {
        setTimeout(() => {
          this.formatData();
        }, 100);
      }
    });
  }

  // Format data for display
  formatData() {
    this.recordData.forEach((item, idx) => {
      let obj: any = _.clone(item);
      if (obj.fieldtype === "Text") {
        obj.fieldvalue = "";
      }
      if (obj.fieldtype === "Select" || obj.fieldtype === "STATUS") {
        obj.fieldvalue = "";
        if (
          (obj.operationtype === this.cmdbOperationType[1] || obj.operationtype === this.cmdbOperationType[2]) &&
          (obj.fieldname === this.workpackDefaultAttr[3].fieldname || obj.fieldname === this.workpackDefaultAttr[0].fieldname)
        ) {
          obj.defaultval = "";
        } else {
          obj.defaultValues = obj.defaultval ? obj.defaultval.split(",") : ["Unknown"];
        }
      } else if (obj.fieldtype === "REFERENCE") {
        obj.defaultValues = [];
        obj.fieldvalue = null;
        _.map(this.crnData, (item) => {
          if (item.crn === obj.relation) {
            obj.defaultValues.push({
              name: item.fieldvalue,
              crn: item.crn,
              resourceid: Number(item.resourceid.split("/")[1]),
            });
          }
          return item;
        });
      } else if (obj.fieldtype === "DOCUMENT") {
        try {
          if (typeof obj.fieldvalue === "string") {
            obj.fieldvalue = JSON.parse(obj.fieldvalue);
          }
        } catch (error) { }
      } else {
        obj.fieldvalue = "";
      }
      this.addFormLoading = false;
      this.resourceData[idx] = obj;
      if (this.crnDetails) {
        if (this.crnDetails.length > 0) {
          if (this.crnDetails[0].dtl_operationtype === this.workpackOperationType[1]) {
            this.isPublished = true;
          }
        }
        const selectedKeyValue = _.find(this.crnDetails, (cd) => cd.fieldkey === this.resourceData[idx].fieldkey);
        if (selectedKeyValue && selectedKeyValue.resourceid) {
          this.resourceData[idx].resourceid = selectedKeyValue.resourceid;
        }
        if (selectedKeyValue && selectedKeyValue.id) {
          this.resourceData[idx].id = selectedKeyValue.id;
        }
        if (this.resourceData[idx].fieldtype === "REFERENCE") {
          this.resourceData[idx].fieldvalue = [];
          if (selectedKeyValue && selectedKeyValue.fieldvalue) {
            const fieldValue = JSON.parse(selectedKeyValue.fieldvalue);
            _.map(fieldValue, (item) => {
              const mappedData = _.find(this.resourceData[idx].defaultValues, (itm) => itm.name === item.name);
              this.resourceData[idx].fieldvalue.push(mappedData);
              this.resourceData[idx].fieldvalue = [...this.resourceData[idx].fieldvalue];
            });
          }
        } else if (this.resourceData[idx].fieldtype === "Date") {
          this.resourceData[idx].fieldvalue = selectedKeyValue ? selectedKeyValue.fieldvalue : "";
        } else {
          this.resourceData[idx].fieldvalue = selectedKeyValue ? selectedKeyValue.fieldvalue : "";
        }
        if (selectedKeyValue) {
          this.resourceData[idx].dtl_operationtype = selectedKeyValue.dtl_operationtype || this.workpackOperationType[0];
        }
      }
      if (this.resourceData[idx].fieldname === this.workpackDefaultAttr[0].fieldname) {
        if (this.userStorageData.userid === this.resourceData[idx].fieldvalue) {
        }
      }
      if (this.resourceData[idx].fieldname === this.workpackDefaultAttr[4].fieldname && this.userStorageData.userid === this.resourceData[idx].fieldvalue) {
        this.isReviewerLogin = true;
      }

      this.resourceData = [...this.resourceData];
      return obj;
    });

    // Find operation type
    if (this.resourceData.length > 0) {
      const idx = _.findIndex(this.executionStatusList[0], (status) => this.resourceData[0].dtl_operationtype === status);
      if (idx > -1 && this.isExecutableVersion) {
        this.executionStatus = this.executionStatusList[idx];
      }
      this.workpackStatus = this.resourceData[0].dtl_operationtype || this.workpackOperationType[0];
    }

    this.resourceData = [..._.orderBy(this.resourceData, ["ordernumber", "id", "asc"])];
    this.recordData = [..._.orderBy(this.recordData, ["ordernumber", "id", "asc"])];
    this.assignWorkflow(); // Load workflow data form
  }

  // Change position of a row
  changePosition(rowData, mode) {
    if (mode === "up") {
      // Logic for moving up
    }
    if (mode === "down") {
      // Logic for moving down
    }
  }

  // Handle right bar change event
  rightbarChanged(event) {
    this.isVisible = false;
  }

  // Close the current view
  close() {
    if (this.srcFrom === "executionlist") {
      this.router.navigate([`/workflow-executionlist`]);
    } else {
      this.router.navigate([`/workpackmanager`], { queryParams: { modelcrn: this.selectedResourceCRN } });
    }
  }

  // Open add view
  openAddView(data) {
    let selectedWrkPck = this.taskTemplates[data];
    this.selectedTaskResource = selectedWrkPck.selectedTaskResource;
    this.resourceDetailMenuVisible = true;
    this.isAddForm = true;
  }

  // Edit form with provided value
  editForm(value) {
    const data = { ...value };
    data.publishyn = value.publishyn === "Y";
    this.templateForm.patchValue(data);
  }

  // Disable past dates
  disabledDate = (current) => {
    return moment().add(-1, "days") >= current;
  };

  // Initialize form
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
      watchListWorkPack: [null, [Validators.required]],
    });
  }

  // Add record detail

  addRecordDetail(refresh?) {
    let assetdetails = [];
    // this.blockUI = true;
    const resourceTimeStamp = Date.now().toString();
    this.resourceData = _.filter(this.resourceData, (itm) => {
      if (
        itm.fieldtype != "Reference Asset" &&
        itm.fieldtype != "Reference Tag"
      ) {
        return itm;
      }
    });
    if (
      !this.resourceData[0].fieldvalue &&
      this.resourceData[0].fieldtype != "AUTOGEN"
    ) {
      this.messageService.error(
        "Please enter " + this.resourceData[0].fieldname + " value"
      );
      // this.blockUI = false;
      return false;
    }
    if (
      this.resourceData.length > 1 &&
      !this.resourceData[1].fieldvalue &&
      this.resourceData[0].fieldtype != "AUTOGEN"
    ) {
      this.messageService.error(
        "Please enter " + this.resourceData[1].fieldname + " value"
      );
      // this.blockUI = false;
      return false;
    }
    let self = this;
    let txnDetails = [];
    _.map(this.resourceData, (item) => {
      let txn = {
        txnid: item.id,
        txn: item.resourceid,
        reference: item.crn,
        refkey: item.fieldname,
        notes: false,
        status: "Active",
        createdby: this.userStorageData.fullname,
        createddt: new Date(),
      }
      if (item.fieldname == this.workpackDefaultAttr[4].fieldname || item.fieldname == this.workpackDefaultAttr[0].fieldname) {
        if (item.fieldvalue != undefined && item.fieldvalue != "") {
          txn.notes = true;
        }
        txnDetails.push(txn);
      }
      if (item.fieldvalue != undefined) {
        let obj: any = {
          crn: item.crn,
          fieldkey: item.fieldkey,
          fieldtype: item.fieldtype,
          hdrid: item.id,
          fieldvalue: item.fieldvalue,
          resourceid: this.resourceId
            ? this.resourceId
            : (item.crn + "/" + resourceTimeStamp).toString(),
          // id: self.edit ? item.id : undefined,
          status: "Active",
          createdby: this.userStorageData.fullname,
          createddt: new Date(),
          lastupdatedby: this.userStorageData.fullname,
          lastupdateddt: new Date(),
          tenantid: this.userStorageData.tenantid,
        };
        if (self.isEdit) {
          obj.id = item.id;
        }
        if (item.fieldtype == "REFERENCE" || item.fieldtype == "DOCUMENT") {
          obj.fieldvalue = _.isArray(obj.fieldvalue)
            ? JSON.stringify(obj.fieldvalue)
            : "";
        }
        if (item.fieldtype == "Date") {
          obj.fieldvalue = (obj.fieldvalue && obj.fieldvalue != "" && obj.fieldvalue != null && obj.fieldvalue != undefined)
            ? moment(obj.fieldvalue).format("DD/MMM/YY") : "";
        }
        if (item.fieldtype == "DateTime") {
          obj.fieldvalue = (obj.fieldvalue && obj.fieldvalue != "" && obj.fieldvalue != null && obj.fieldvalue != undefined)
            ? moment(obj.fieldvalue).format("DD/MMM/YY h:mm A") : "";
        }
        assetdetails.push(obj);
      }
      return item;
    });
    // task resource details mapping with txnref
    let taskDetails: any[] = _.map(this.selectedTaskDetails, (d) => {
      let selectedWrkPck = self.taskTemplates[d.reference];
      d.refkey = this.resourceId;
      d.notes = selectedWrkPck ? selectedWrkPck.selectedWorkpackTitle : this.selectedResourceCRN;
      return d;
    })
    let reqObj = {
      assetdetails: assetdetails,
      txnDetails: txnDetails,
      updatedAssets: [],
      taskDetails: taskDetails,
      ntfcsetupid: this.selectedValue
    };
    reqObj.assetdetails = _.map(reqObj.assetdetails, (dt) => {
      dt.dtl_operationtype = this.workpackStatus;
      if (this.executionStatus && this.isExecutableVersion) {
        dt.dtl_operationtype = this.executionStatus;//this.executionStatusList[0];    
      }
      return dt;
    })
    if (this.isEdit) {
      let updatedAssets = [];
      _.each(this.originalCrnDetails, (org) => {
        let current = _.find(assetdetails, (c: any) => {
          return (org.id == c.id)
        });
        if (current) {
          if (org.fieldvalue != current.fieldvalue) {
            updatedAssets.push(current);
          }
        }
      });
      reqObj.updatedAssets = updatedAssets;
    }
    if (this.isEdit) {
      reqObj.taskDetails = _.map(reqObj.taskDetails, (d) => {
        d.refkey = this.resourceId;
        d.status = "Active";
        d.lastupdatedby = this.userStorageData["fullname"];
        d.lastupdateddt = new Date();
        return d;
      });
      this.saveLoading = true;
      this.assetRecordService.bulkupdateDetail(reqObj, "isWorkflowNotification=true").subscribe(
        (res) => {
          this.saveLoading = false;
          // this.blockUI = false;
          if (this.workpackStatus == this.workpackOperationType[1]) {
            this.isPublished = true;
          }
          else {
            this.isPublished = false;
          }
          const response = JSON.parse(res._body);
          if (response.status) {
            this.messageService.success(response.message);
            this.isAddForm = false;
            this.refresh();
            this.loading = false;
          } else {
            this.loading = false;
            this.messageService.error(response.message);
          }
        },
        (err) => {
          // this.blockUI = false;
          this.loading = false;
          this.messageService.success("Unable to add recrod.");
        }
      );
    } else {
      reqObj.taskDetails = _.map(reqObj.taskDetails, (d) => {
        d.dtl_operationtype = this.cmdbOperationType[3];
        d.refkey = this.resourceId;
        d.status = "Active";
        d.createdby = this.userStorageData["fullname"];
        d.createddt = new Date();
        return d;
      })
      this.saveLoading = true;
      this.assetRecordService.bulkcreateDetail(reqObj).subscribe(
        (res) => {
          this.saveLoading = false;
          // this.blockUI = false;

          const response = JSON.parse(res._body);
          if (response.status) {
            this.messageService.success(response.message);
            this.isAddForm = false;
            this.loading = false;
            this.router.navigate([`/workpackmanager`], { queryParams: { modelcrn: this.selectedResourceCRN } });
          } else {
            this.loading = false;
            this.messageService.error(response.message);
          }
        },
        (err) => {
          // this.blockUI = false;
          this.loading = false;
          this.messageService.success("Unable to add recrod.");
        }
      );
    }
  }

  // Notify new entry
  notifyNewEntry(data: any[]) {
    this.resourceDetailMenuVisible = false;
    if (data && data.length > 0 && data[0].resourceid) {
      const nameField: any = _.find(data, (item) => item.fieldkey.includes("fk:name") || item.fieldkey.includes("fk:key"));
      const processData = {
        name: nameField.fieldvalue,
        crn: nameField.crn,
        resourceid: Number(nameField.resourceid.split("/")[1]),
        mode: AppConstant.WORKPACK_CONFIG.WP_TASK_KEY,
      };
      const resourceToMapIndex = _.findIndex(this.resourceData, (item) => item.fieldtype === "REFERENCE" && item.relation === nameField.crn);
      this.resourceData[resourceToMapIndex].defaultValues = _.map(this.resourceData[resourceToMapIndex].defaultValues, (d) => {
        d.mode = AppConstant.WORKPACK_CONFIG.WP_TASK_KEY;
        return d;
      });
      this.resourceData[resourceToMapIndex].defaultValues.push(processData);
      if (this.resourceData[resourceToMapIndex].fieldvalue) {
        this.resourceData[resourceToMapIndex].fieldvalue.push(processData);
      } else {
        this.resourceData[resourceToMapIndex].fieldvalue = [processData];
      }
      this.resourceData[resourceToMapIndex].fieldvalue = [...this.resourceData[resourceToMapIndex].fieldvalue];
      this.selectedTaskResourceId.push(data[0].resourceid);
      this.selectedTaskResourceId = [...this.selectedTaskResourceId];
    }
  }

  // Notify task entry
  notifyTaskEntry(data: any[]) {
    this.loading = true;
    this.resourceDetailMenuVisible = false;
    if (data && data.length > 0 && data[0].resourceid) {
      const transaction = {
        txn: data[0].resourceid,
        reference: data[0].crn,
        notes: this.selectedTask ? this.selectedTask.title : this.selectedResourceCRN,
        module: 'workpack-task'
      };
      this.selectedTaskDetails.push(transaction);
      this.selectedTaskResourceId.push(data[0].resourceid);
      this.selectedTaskResourceName = data[0].crn;
      this.selectedTaskResourceId = [...this.selectedTaskResourceId];
      // this.addRecordDetail();
      this.loading = false;
    }
  }

  // Get customer list
  getCustomerList() {
    this.tenantsService
      .allcustomers({
        tenantid: this.userStorageData.tenantid,
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

  // Get category list
  getCategoryList() {
    const condition = {
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

  // Get subcategory list
  getSubCategoryList() {
    const condition = {
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

  // Handle category change event
  onCategoryChange(event) {
    if (event !== "") {
      const existObj = _.find(this.categoryList, { keyvalue: event });
      this.addCategory = existObj === undefined;
    }
  }

  // Handle file upload event
  onFile(event, data) {
    const reader = new FileReader();
    const attachmentFile = event.target.files[0];
    this.addDocs(attachmentFile, data);
    reader.onload = (e) => { };
    reader.readAsDataURL(event.target.files[0]);
  }

  // Add documents
  addDocs(attachmentFile, rowData) {
    const formData = new FormData();
    const data = {
      tenantid: this.userStorageData.tenantid,
      lastupdateddt: new Date(),
      lastupdatedby: this.userStorageData.fullname,
      status: "Active",
      createdby: this.userStorageData.fullname,
      createddt: new Date(),
      crn: rowData.crn,
      mode: AppConstant.WORKPACK_CONFIG.DOCUMENT_DATATYPE,
    };
    if (attachmentFile) {
      formData.append("file", attachmentFile);
    } else {
      this.messageService.error("Please upload file");
      return false;
    }
    formData.append("formData", JSON.stringify(data));
    this.assetRecordService.createDocs(formData).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        rowData.fieldvalue = [JSON.parse(response.data.meta)];
      } else {
        this.messageService.error(response.message);
      }
    });
  }

  // Display preview list
  displayPreviewList(rowData): any[] {
    let returnValue: any[] = [];
    try {
      let parse = rowData.fieldvalue;
      if (typeof rowData.fieldvalue === "string") {
        parse = JSON.parse(rowData.fieldvalue);
      }
      if (Array.isArray(parse)) {
        _.each(parse, (data) => {
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

  // Remove image from the list
  removeImage(rawData, idx) {
    let parse = rawData.fieldvalue;
    try {
      if (typeof rawData.fieldvalue === "string") {
        parse = JSON.parse(rawData.fieldvalue);
      }
      if (Array.isArray(parse)) {
        parse.splice(idx, 1);
        rawData.fieldvalue = parse;
        rawData.fieldvalue = [...rawData.fieldvalue];
      }
    } catch (error) { }
  }

  // Download file
  downloadFile(rowData, data) {
    if (rowData.key) {
      this.assetRecordService
        .downloadDocs({ key: rowData.key })
        .subscribe((result) => {
          const response = JSON.parse(result._body);
          const buffer = Buffer.from(response.data.content.data);
          const typedArray = new Uint8Array(buffer);
          const stringChar = typedArray.reduce((data, byte) => data + String.fromCharCode(byte), "");
          downloadService(buffer, response.data.filename);
        });
    }
  }

  // Notify task edit entry
  notifyTaskEditEntry(data: any) {
    let crn = data.resource.split("/")[0]
    let selectedWrkPck = this.taskTemplates[crn];
    this.selectedTaskResource = selectedWrkPck.selectedTaskResource;
    this.selectedTaskEdit = data;
    this.isAddForm = false;
    this.viewResourceDetail(data);
    this.selectedTaskResourceID = null;
  }

  // View resource detail
  viewResourceDetail(data: Record<string, string>) {
    this.assetRecordService
      .getResourceValuesById(btoa(data.resource), `tagdetails=true`)
      .subscribe(
        (res) => {
          const response = JSON.parse(res._body);
          const details = response.data;
          let data: any = {
            details: [],
          };
          details.forEach((o: any) => {
            data[o["fieldkey"]] = o["fieldvalue"];
            data["header"] = this.selectedResource;
            data["details"].push(o);
          });
          this.resourceDetails = data;
          if (details.length > 0) {
            this.selectedTaskResourceID = details[0].resourceid;
          }
          this.referringAssetDetails = response.referringassets;
          this.resourceDetailMenuVisible = true;
        },
        (err) => {
          alert("Unable to fetch details. Try again.");
        }
      );
  }

  // Check if decimal exists
  isDecimalExist(decimalNumber) {
    return decimalNumber % 1 !== 0;
  }

  // Handle change event
  onChanged(event) {
    this.selectedWorkflowTask = null;
    this.isWorkflowVisible = false;
  }

  // Assign workflow
  assignWorkflow() {
    if (this.resourceId) {
      this.selectedWorkflowTask = this.resourceId;
      this.isWorkflowVisible = true;
    }
  }

  deleteTask(taskObj, status?) {
    if (status) {
      this.loading = true;
      let self = this;
      let reqObj = {
        status: AppConstant.STATUS.DELETED,
        lastupdatedby: this.userStorageData.fullname,
        lastupdateddt: new Date(),
        condition: {
          reference: taskObj.data.reference
        }
      };
      this.assetRecordService.updateTxn(reqObj).subscribe(
        (res) => {
          const response = JSON.parse(res._body);
          this.messageService.success(response.message);
          delete this.taskTemplates[taskObj.reference];
          this.selectedTaskDetails = _.filter(self.selectedTaskDetails, function (e) {
            if (e.reference != taskObj.data.reference) return e;
          });
          this.loading = false;
        },
        (err) => {
          this.loading = false;
        }
      );
    } else {
      this.modalService.confirm({
        nzTitle: `Are you sure you want to delete ${taskObj.selectedWorkpackTitle} ?`,
        nzContent: '',
        nzOnOk: () => {
          this.deleteTask(taskObj, true);
        },
        nzOnCancel: () => {
          console.log('Cancel');
        }
      });
    }
  }

  // Notify task selection
  notifyTaskSelection(event: any) {
    if (event) {
      this.taskTemplates[event.crn] = {
        selectedWorkpackTitle: event.title,
        data: event,
        reference: event.crn
      };
      this.selectedTaskResourceName = event.crn;
      this.selectedTask = event;
      this.changeTaskResourceType(event.crn);
    }
    this.isTreeVisible = false;
  }

  // Notify workflow update entry
  notifyWorkflowUpdateEntry(event) {
    this.isWorkflowVisible = false;
    setTimeout(() => {
      this.assignWorkflow();
    }, 1000);
  }

  // Add or edit watch list
  addEditWatchList(event) {
    setTimeout(() => {
      const list = this.watchList.map((w) => ({
        refkey: this.resourceId,
        txn: w,
        module: this.cmdbOperationType[7],
        status: AppConstant.STATUS.ACTIVE,
        createdby: this.userStorageData.fullname,
        createddt: new Date(),
        updatedby: this.userStorageData.fullname,
        updateddt: new Date(),
      }));
      const req = {
        refkey: this.resourceId,
        module: this.cmdbOperationType[7],
        list: list,
      };
      this.assetRecordService.updateWatchList(req).subscribe((taskTxnData) => {
        console.log(taskTxnData);
      });
    }, 100);
  }

  // Refresh the details
  refresh() {
    this.editDetails(this.resourceId);
  }
  getNotificationList() {
    let obj = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userStorageData.tenantid,
      module: AppConstant.REFERENCETYPE[5],
    } as any;
    this.notificationService.all(obj).subscribe(
      (result) => {
        let response = JSON.parse(result._body);
        if (response.status) {
          this.watchListWorkPack = response.data.map((item: any) => {
            return {
              label: item.module + "(" + item.event + ")",
              value: item.ntfcsetupid,
            };
          });
          this.selectedValue = this.watchListWorkPack.map((e) => {
            return e.value;
          });
        } else {
          this.watchListWorkPack = [];
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
