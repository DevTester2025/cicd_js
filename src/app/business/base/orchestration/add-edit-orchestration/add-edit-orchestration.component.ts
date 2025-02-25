import {
  Component,
  OnInit,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  AfterViewInit,
} from "@angular/core";
import { AppConstant } from "../../../../app.constant";
import { LocalStorageService } from "../../../../modules/services/shared/local-storage.service";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { OrchestrationService } from "../orchestration.service";
import { Router, ActivatedRoute } from "@angular/router";

import * as _ from "lodash";
import { ScriptService } from "src/app/business/tenants/scripts/script.service";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "src/app/modules/services/shared/common.service";
@Component({
  selector: "app-add-edit-orchestration",
  templateUrl:
    "../../../../presentation/web/base/orchestration/add-edit-orchestration/add-edit-orchestration.component.html",
})
export class AddEditOrchestrationComponent implements OnInit, AfterViewInit {
  @Input() orchestrationObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  orchestrationForm: FormGroup;
  edit = false;
  isconfirmed = false;
  buttonText = "Save";
  formdata: any = {};
  userstoragedata: any = {};
  loading = false;
  orchestrationErrObj = {};
  scriptList = [];
  categoryList = [];
  disabled = false;
  orchObj;
  orchflowObj;
  id : any;
  tabIndex = 0 as number;
  flowrigamiObj;
  clone = false;
  isValidateVisible = false;
  exportObj;
  constructor(
    private orchestrationService: OrchestrationService,
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private message: NzMessageService,
    private scriptService: ScriptService,
    private routes: ActivatedRoute,
    public router: Router,
    private commonService: CommonService
  ) {
    this.orchestrationForm = fb.group({
      orchname: [null, Validators.compose([Validators.required])],
    });
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.getCategoryList();
    this.routes.params.subscribe((params) => {
      if (params && params["id"]) {
        this.id = params["id"];
        this.getOrchestrationDetails(this.id);
        if (params["mode"] == "clone") this.clone = true;
      } else {
        this.getScriptsList();
      }
    });
  }
  ngAfterViewInit(): void { }

  loadOrchestration() {
    let scripts = this.scriptList.map((o) => {
      return {
        label: o["scriptname"],
        value: o["filename"].split("/").pop(),
        params: o["parameters"] || [],
      };
    });

    let options = {};

    if (scripts.length > 0) {
      options["listItems"] = scripts;
      options["categoryItems"] = this.categoryList;
    }

    const script = document.createElement("script");
    script.src = "assets/libs/flowrigami.js";
    script.onload = (e) => {
      let container = document.getElementById("flowrigami");
      let Flowrigami = (window as any).Flowrigami;
      this.flowrigamiObj = new Flowrigami(container, options);

      if (this.orchflowObj) {
        if (this.clone) this.orchflowObj.workflowsettings["name"] = "";
        this.flowrigamiObj.diagramApi.import(JSON.stringify(this.orchflowObj));
      }
    };
    script.async = false;
    document.head.appendChild(script);
  }

  ngOnInit() { }

  getCategoryList() {
    let condition = {} as any;
    condition = {
      lookupkey: AppConstant.LOOKUPKEY.ORCH_CATEGORY,
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach(element => {
          this.categoryList.push({
            label: element.keyvalue, value: element.lookupid
          });
        });
      } else {
        this.categoryList = [{ label: "All", value: 'all' }]
      }
    });
  }
  getScriptsList() {
    this.scriptService
      .all({
        status: AppConstant.STATUS.ACTIVE,
        tenantid: this.userstoragedata.tenantid,
      })
      .subscribe((result) => {
        let response = {} as any;
        response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.scriptList = response.data;
          this.loadOrchestration();
        } else {
          this.loading = false;
          this.scriptList = [];
          this.loadOrchestration();
        }
      });
  }
  saveOrchestration() {
    let exportObj = JSON.parse(this.flowrigamiObj.diagramApi.export()) || {};
    if (_.isEmpty(exportObj["workflowsettings"]["name"])) {
      this.message.error("Please enter Orchestration Name");
      return false;
    }
    this.disabled = true;

    let isValid = true;
    let errMsg = "";

    exportObj.nodes.forEach(element => {
      if (element.name == "SessionNode") {
        if (element["data"]["ip_type"] == "privateip") {
          element["data"]["ipaddress"] = `{{sys_${element["data"]["name"].toLowerCase()}_ip_private}}`;
          element["params"]["data"]["ipaddress"] = `{{sys_${element["data"]["name"].toLowerCase()}_ip_private}}`;
        } else if (element["data"]["ip_type"] == "publicip") {
          element["data"]["ipaddress"] = `{{sys_${element["data"]["name"].toLowerCase()}_ip}}`;
          element["params"]["data"]["ipaddress"] = `{{sys_${element["data"]["name"].toLowerCase()}_ip}}`;
        } else if (!element["data"]["ipaddress"]) {
          errMsg = "IP address not available in session node.";
          isValid = false;
        }
      }
    });
    let orchData = {
      orchname: exportObj["workflowsettings"]["name"],
      orchdesc: exportObj["workflowsettings"]["description"],
      orchflow: JSON.stringify(exportObj),
      categoryid: exportObj["workflowsettings"]["category"] ? Number(exportObj["workflowsettings"]["category"]) : 0,
      module: exportObj["workflowsettings"]["module"],
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
      lastupdateddt: new Date(),
      lastupdatedby: this.userstoragedata.fullname,
    };
    let scripts = [];
    let params = [];

    let nodes =
      exportObj && exportObj["nodes"] ? exportObj["nodes"] : ([] as any[]);

    nodes.forEach((element) => {
      if (element["name"] == "ActivityNode") {
        let scriptData = this.scriptList.find(
          (s) =>
            s["filename"].split("/").pop() ==
            element["params"]["data"]["filename"]
        );

        if (scriptData && scriptData["scriptid"]) {
          scripts.push({
            scriptid: scriptData["scriptid"] || null,
            scriptname: element["params"]["data"]["filename"],
            exectype: element["params"]["data"]["scriptexectype"],
          });
          if (
            element["params"]["data"] &&
            element["params"]["data"]["Params"] &&
            element["params"]["data"]["Params"].length > 0
          ) {
            element["params"]["data"]["Params"].forEach((p) => {
              params.push(p);
            });
          }
        } else {
          isValid = false;
          errMsg = "Script not attached to script node.";
        }
      }
      if (element["name"] == "SessionNode") {
        if (
          element["data"] &&
          element["data"]["name"] &&
          element["data"]["ipaddress"] &&
          element["data"]["ipaddress"].includes("{{") &&
          !element["data"]["ipaddress"].includes("{{sys_")
        ) {
          let key = element["data"]["ipaddress"] as string;
          key.replace("{{", "").replace("}}", "");
          params.push({
            key: key.replace("{{", "").replace("}}", ""),
            value: "",
          });
        }
      }
    });

    if (!isValid) {
      this.message.warning(errMsg);
      this.disabled = false;
      return false;
    }

    orchData["scripts"] = JSON.stringify(scripts);
    orchData["params"] = JSON.stringify(params);

    let initScripts = scripts.filter((o) => o["exectype"] == "boottime");

    if (initScripts.length > 1) {
      this.message.error("Only one boot script is allowed");
      return false;
    }

    if (this.orchflowObj && !this.clone) {
      orchData["orchid"] = this.orchObj["orchid"];
      this.loading = true;
      this.orchestrationService.update(orchData).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.info(response.message);
          this.getOrchestrationDetails(response.data.orchid);
          this.loading = false;
          this.disabled = false;
        } else {
          this.message.error(response.message);
          this.loading = false;
          this.disabled = false;
        }
      });
    } else {
      orchData["createdby"] = this.userstoragedata.fullname;
      orchData["createddt"] = new Date();
      this.loading = true;
      this.orchestrationService.create(orchData).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.info(response.message);
          this.getOrchestrationDetails(response.data.orchid);
          this.loading = false;
          this.disabled = false;
        } else {
          this.message.warning(response.message);
          this.loading = false;
          this.disabled = false;
        }
      });
    }
  }

  getOrchestrationDetails(id: string) {
    this.orchestrationService.byId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.orchObj = response.data;
        this.orchObj.refid = response.data.orchid;
        this.orchObj.reftype = AppConstant.REFERENCETYPE[7];
        this.orchflowObj = JSON.parse(response.data.orchflow);
        this.getScriptsList();
      } else {
        this.getScriptsList();
      }
    });
  }

  routeBack() {
    this.router.navigate(["orchestration"]);
  }

  clearForm() {
    this.orchestrationForm.reset();
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }

  validate() {
    this.exportObj = JSON.parse(this.flowrigamiObj.diagramApi.export()) || {};
    if (!this.exportObj.nodes || this.exportObj.nodes.length === 0) {
      this.message.warning(AppConstant.ORCHESTRATION.ORCH_VALIDATION);
      return;
    }
    this.isValidateVisible = true;
  }
}
