import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "../../../../../app.constant";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { WorkflowService } from "../workflow.service";

@Component({
  selector: "app-add-edit-workflow",
  templateUrl:
    "../../../../../presentation/web/base/server-utildetails/workflow-config/add-edit/workflow-add-edit.component.html",
})
export class AddEditWorkflowComponent implements OnInit {
  @Input() workflowObj: any;
  @Output() notifyWorkflowEntry: EventEmitter<any> = new EventEmitter();
  workflowForm: FormGroup;
  userstoragedata = {} as any;
  buttonText = AppConstant.BUTTONLABELS.SAVE;
  workflowErrObj = {
    aprvalwrkflowname: {
      required: "Please Enter Workflow Name",
    },
    userid: {
      required: "Please select the approver",
    },
  };
  disabled = false;
  loading = false;
  state = true;
  approverList = [];
  approverItems = [] as any;
  deletedItems = [] as any;
  constructor(
    private message: NzMessageService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private commonService: CommonService,
    private workflowService: WorkflowService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.clearForm();
  }

  ngOnInit() {
    this.getapproverList();
  }
  clearForm() {
    this.workflowForm = this.fb.group({
      aprvalwrkflowname: [null, Validators.compose([Validators.required])],
      status: [AppConstant.STATUS.ACTIVE, Validators.required],
      createdby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      approvers: this.fb.array([this.formApprovers()]),
    });
    this.workflowObj = {};
  }
  generateEditForm(data) {
    this.workflowForm = this.fb.group({
      aprvalwrkflowid: data.aprvalwrkflowid,
      aprvalwrkflowname: [
        data.aprvalwrkflowname,
        Validators.compose([Validators.required]),
      ],
      status: [data.status, Validators.required],
      createdby: data.createdby,
      createddt: data.createddt,
      lastupdatedby: _.isEmpty(this.userstoragedata)
        ? -1
        : this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      approvers: this.fb.array([]),
    });
    this.approverItems = this.workflowForm.get("approvers") as FormArray;
    if (data.approvers !== undefined) {
      data.approvers.forEach((element) => {
        this.approverItems.push(
          this.fb.group({
            wrkflowaprvrid: element.wrkflowaprvrid,
            aprvalwrkflowid: element.aprvalwrkflowid,
            userid: element.userid,
            aprvseqid: element.aprvseqid,
            createdby: element.createdby,
            createddt: element.createddt,
            lastupdatedby: this.userstoragedata.fullname,
            lastupdateddt: new Date(),
            status: element.status,
          })
        );
      });
    } else {
      this.approverItems.push(this.formApprovers());
    }
  }

  formApprovers(): FormGroup {
    return this.fb.group({
      userid: [null, Validators.required],
      aprvseqid: [null],
      createdby: this.userstoragedata.fullname,
      createddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
      status: [AppConstant.STATUS.ACTIVE],
    });
  }
  addApprover() {
    this.approverItems = this.workflowForm.get("approvers") as FormArray;
    let isEmptyExist = false;
    this.approverItems.value.forEach((element) => {
      console.log(element);
      if (!element.userid) {
        isEmptyExist = true;
      }
    });
    if (isEmptyExist) {
      this.message.info(this.workflowErrObj.userid.required);
    } else {
      this.approverItems.push(this.formApprovers());
    }
  }
  removeItem(i) {
    this.approverItems = this.workflowForm.get("approvers") as FormArray;
    const currentindex = this.approverItems.value.length;
    if (currentindex !== 1) {
      if (this.approverItems.value[i].wrkflowaprvrid) {
        this.approverItems.value[i].status = AppConstant.STATUS.INACTIVE;
        this.deletedItems.push(this.approverItems.value[i]);
      }
      this.approverItems.removeAt(i);
    }
  }
  getFormArray(): FormArray {
    return this.workflowForm.get("approvers") as FormArray;
  }
  checkDuplicate(event, i) {
    if (event != null) {
      this.approverItems = this.workflowForm.get("approvers") as FormArray;
      const length = this.approverItems.value.length;
      const valueList: any[] = [];
      if (length > 1) {
        for (const formGroup of this.approverItems.value) {
          let obj = { userid: formGroup.userid } as any;
          valueList.push(obj);
        }
        const isUnique = _.uniqWith(valueList, _.isEqual);
        const duplicateLength = isUnique.length;
        if (duplicateLength !== length) {
          this.message.error("Duplicate record exist");
          this.approverItems.controls[i].get("userid").setValue(null);
          return false;
        }
      }
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (
      !_.isUndefined(changes.workflowObj) &&
      !_.isEmpty(changes.workflowObj.currentValue)
    ) {
      this.workflowObj = changes.workflowObj.currentValue;
      console.log(this.workflowObj);
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.workflowObj);
    } else {
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }
  saveUpdate(data) {
    console.log(data);
    this.loading = true;
    //  this.disabled = true;
    let errorMessage: any;
    if (this.workflowForm.status === "INVALID") {
      let errorMessage = "" as any;
      errorMessage = this.commonService.getFormErrorMessageWithFormArray(
        this.workflowForm,
        this.workflowErrObj,
        "approvers"
      );
      this.message.remove();
      this.message.error(errorMessage);
      this.loading = false;
      return false;
    } else {
      data.approvers.forEach((element, i) => {
        element.aprvseqid = i + 1;
        return element;
      });
      data.approvers = data.approvers.concat(this.deletedItems);
      if (data.aprvalwrkflowid) {
        this.workflowService.update(data).subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.clearForm();
              this.notifyWorkflowEntry.next(response.data);
              this.loading = false;
              this.message.success(response.message);
            } else {
              this.loading = false;
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to add Workflow. Try again");
          }
        );
      } else {
        this.workflowService.create(data).subscribe(
          (result) => {
            let response = JSON.parse(result._body);
            if (response.status) {
              this.clearForm();
              this.notifyWorkflowEntry.next(response.data);
              this.loading = false;
              this.message.success(response.message);
            } else {
              this.loading = false;
              this.message.error(response.message);
            }
          },
          (err) => {
            this.message.error("Unable to add Workflow. Try again");
          }
        );
      }
    }
  }
  getapproverList() {
    this.loading = true;
    this.commonService
      .allUsers({ status: "Active", tenantid: this.userstoragedata.tenantid })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        this.loading = false;
        if (response.status) {
          this.approverList = response.data;
        } else {
          this.approverList = [];
        }
      });
  }

  formArrayData(data, label, value) {
    let array = [] as any;
    data.forEach((element) => {
      let obj = {} as any;
      obj.label = element[label];
      obj.value = element[value];
      array.push(obj);
    });
    return array;
  }
}
