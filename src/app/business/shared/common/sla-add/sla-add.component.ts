import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChange,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../../modules/services/shared/common.service";
import * as _ from "lodash";
import { AppConstant } from "../../../../app.constant";
@Component({
  selector: "app-sla-add",
  templateUrl:
    "../../../../presentation/web/shared/common/sla-add/sla-add.component.html",
})
export class AddSLAComponent implements OnInit, OnChanges {
  @Input() createMode = true;
  @Input() slaList = [] as any;

  @Output() addorupdateSLA: EventEmitter<any> = new EventEmitter();

  slaForm: FormGroup;
  slaObj = {} as any;
  index;
  lookupList: any = [];
  constructor(
    private fb: FormBuilder,
    private lsService: LocalStorageService,
    private message: NzMessageService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.lookupList = this.slaList;
    this.clearForm();
  }
  clearForm() {
    this.slaForm = this.fb.group({
      responsetimemins: [null, Validators.required],
      uptimeprcnt: [null, Validators.required],
      replacementhrs: [null, Validators.required],
      workinghrs: [null, Validators.required],
      priority: [null, Validators.required],
      notes: [""],
      creditsprcnt: [null, Validators.required],
      createdby: [this.lsService.getItem("user").fullname],
      createddt: [new Date()],
      lastupdatedby: [this.lsService.getItem("user").fullname],
      lastupdateddt: [new Date()],
      tenantid: [this.lsService.getItem("user").tenantid],
    });
  }

  onChange(event) {
    let selectedValue = _.find(this.lookupList, function (obj: any) {
      if (obj.priority == event) {
        return obj;
      }
    });
    this.slaForm = this.fb.group({
      responsetimemins: [
        _.isEmpty(selectedValue) ? null : selectedValue.responsetimemins,
      ],
      uptimeprcnt: [
        _.isEmpty(selectedValue) ? null : selectedValue.uptimeprcnt,
        Validators.required,
      ],
      replacementhrs: [
        _.isEmpty(selectedValue) ? null : selectedValue.replacementhrs,
        Validators.required,
      ],
      workinghrs: [
        _.isEmpty(selectedValue) ? null : selectedValue.workinghrs,
        Validators.required,
      ],
      priority: [
        _.isEmpty(selectedValue) ? null : selectedValue.priority,
        Validators.required,
      ],
      notes: [_.isEmpty(selectedValue) ? "" : selectedValue.notes],
      creditsprcnt: [
        _.isEmpty(selectedValue) ? null : selectedValue.creditsprcnt,
        Validators.required,
      ],
    });
  }
  ngOnChanges(changes: SimpleChanges) {}

  addSLA() {
    if (this.slaForm.valid) {
      let data = this.slaForm.value;
      data.createdby = this.lsService.getItem("user").fullname;
      data.createddt = new Date();
      data.lastupdatedby = this.lsService.getItem("user").fullname;
      data.lastupdateddt = new Date();
      data.tenantid = this.lsService.getItem("user").tenantid;
      data.status = "Active";

      if (this.slaObj != undefined && this.index != undefined) {
        data.slaid = this.slaObj.slaid;
        this.lookupList[this.index] = data;
        this.lookupList = _.filter(this.lookupList, function (i) {
          return i;
        });
        this.slaList = this.lookupList;
      } else {
        let valueChanges = _.map(this.lookupList, function (obj: any) {
          if (data.priority == obj.priority) {
            obj = data;
          }
          return obj;
        });
        let existValue = _.find(valueChanges, { priority: data.priority });
        this.lookupList =
          existValue == undefined ? [...valueChanges, data] : valueChanges;
        this.slaList = this.lookupList;
      }
      this.clearForm();
      // this.slaList.push(data);
      // this.slaForm.reset();
    } else {
      this.message.error("Please fill in all the required fields");
    }
  }

  deleteSLA(data) {
    let deletedRow = data;
    deletedRow.status = "Deleted";
    this.lookupList.splice(this.lookupList.indexOf(data), 1);
    this.lookupList = [...this.lookupList];
    this.slaList = [...this.lookupList, deletedRow];
  }

  SLAChanged() {
    this.addorupdateSLA.next(this.slaList);
  }
  editSLA(data) {
    this.index = this.slaList.indexOf(data);
    this.slaObj = data;
    this.slaForm = this.fb.group({
      responsetimemins: [data.responsetimemins, Validators.required],
      uptimeprcnt: [data.uptimeprcnt, Validators.required],
      replacementhrs: [data.replacementhrs, Validators.required],
      workinghrs: [data.workinghrs, Validators.required],
      priority: [data.priority, Validators.required],
      notes: [data.notes],
      creditsprcnt: [data.creditsprcnt, Validators.required],
    });
  }
}
