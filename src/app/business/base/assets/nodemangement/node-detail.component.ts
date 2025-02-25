import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "src/app/app.constant";
import { CommonService } from "src/app/modules/services/shared/common.service";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { SSMService } from "./ssm.service";
@Component({
  selector: "app-cloudmatiq-nodedetail",
  templateUrl:
    "../../../../presentation/web/base/assets/nodemangement/node-detail.component.html",
  styles: [],
})
export class NodeDetailComponent implements OnInit {
  userstoragedata = {} as any;
  complainceList = [];
  @Input() instanceref;
  complaincetableHeader = [
    {
      field: "Title",
      header: "Title",
      datatype: "string",
    },
    { field: "Id", header: "ID", datatype: "string" },
    { field: "ComplianceType", header: "Compliance Type", datatype: "string" },
    {
      field: "Severity",
      header: "Severity",
      datatype: "string",
    },
    { field: "Status", header: "Status", datatype: "string" },
    { field: "ExecutionType", header: "Execution type", datatype: "string" },
  ];
  atableHeader = [
    {
      field: "AssociationName",
      header: "Association name",
      datatype: "string",
    },
    { field: "Name", header: "Document name", datatype: "string" },
    {
      field: "DocumentVersion",
      header: "Document version",
      datatype: "string",
    },
    { field: "Status", header: "Association status", datatype: "string" },
  ];
  atableConfig = {
    refresh: true,
    edit: false,
    delete: false,
    view: false,
    globalsearch: true,
    pagination: true,
    loading: false,
    pageSize: 10,
    title: "",
  };
  nodetabIndex = 0;
  instanceObj = {} as any;
  assList = [];
  meta = {} as any;
  instanceRes = {} as any;
  totalCount = null;
  constructor(
    private localStorageService: LocalStorageService,
    private ssmService: SSMService,
    private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
  }
  ngOnInit() {}
  nodeTabChanged(event) {
    this.nodetabIndex = event.index;
    if (event.index == 0) {
      this.getInstanceByID();
    }
    if (event.index == 1) {
      this.getAssociationDetails();
    }
    if (event.index == 2) {
      this.getCompliances();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.instanceref && changes.instanceref.currentValue) {
      this.nodeTabChanged({ index: 0 });
    }
  }
  dataChanged(event) {
    if (event.refresh) {
      this.nodeTabChanged({ index: this.nodetabIndex });
    }
  }
  getInstanceByID() {
    this.meta = {};
    this.commonService
      .getInstance(
        this.instanceref.instancerefid,
        `?asstdtls=${true}&cloudprovider=${
          this.instanceref.cloudprovider
        }&costyn=${true}&tagyn=${false}&getbycolumn=${
          this.instanceref.instancereftype
        }&tenantid=${this.userstoragedata.tenantid}`
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.instanceRes = response.data;
          this.prepareServerMeta(response.data);
        }
      });
  }
  prepareServerMeta(data: object) {
    let details;
    let ssmdata = JSON.parse(data["ssmagent"]);
    details = {
      Info: [
        {
          title: "Customer Name",
          value:
            data["customer"] != null
              ? data["customer"]["customername"] || "-"
              : "-",
        },
        {
          title: "Tenant Id",
          value:
            data["customer"] != null
              ? data["customer"]["awsaccountid"] || "-"
              : "-",
        },
        { title: "Instance Name", value: data["instancename"] },
        { title: "Instance Id", value: data["instancerefid"] },
        { title: "Region", value: data["region"] },
        {
          title: "Zone",
          value:
            data["awszones"] != null
              ? data["awszones"]["zonename"] || "-"
              : "-",
        },
        { title: "Status", value: "Active" },
      ],
      Image: [
        {
          title: "Image Name",
          value: data["awsimage"] ? data["awsimage"]["aminame"] || "-" : "-",
        },
        {
          title: "Image ID",
          value: data["awsimage"] ? data["awsimage"]["awsamiid"] || "-" : "-",
        },
        {
          title: "Platform",
          value: data["awsimage"] ? data["awsimage"]["platform"] || "-" : "-",
        },
        {
          title: "Notes",
          value: data["awsimage"] ? data["awsimage"]["notes"] || "-" : "-",
        },
      ],
      Specification: [
        { title: "Instance Type", value: data["instancetyperefid"] },
        {
          title: "CPU",
          value: data["awsinstance"] ? data["awsinstance"]["vcpu"] || "-" : "-",
        },
        {
          title: "Memory",
          value: data["awsinstance"]
            ? data["awsinstance"]["memory"] || "-"
            : "-",
        },
      ],
      "IP Addresses": [
        { title: "Private IP", value: data["privateipv4"] },
        { title: "Public IP", value: data["publicipv4"] || "-" },
      ],
    };
    if (ssmdata != null) {
      details["SSM Agent"] = [
        { title: "Agent Version", value: ssmdata["AgentVersion"] || "-" },
        { title: "Platform", value: ssmdata["PlatformType"] || "-" },
        {
          title: "Operating System",
          value: ssmdata["PlatformName"] || "-",
        },
        { title: "Status", value: data["ssmagentstatus"] || "-" },
      ];
    }
    this.meta = details;
  }
  getAssociationDetails() {
    if (this.instanceref != null) {
      let condition = {
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
        region: this.instanceref.region,
        instancerefid: this.instanceref.instancerefid,
      } as any;
      if (
        this.instanceref.accountid != null &&
        this.instanceref.accountid != undefined
      ) {
        condition["accountid"] = this.instanceref.accountid;
      }
      this.ssmService.associationStatus(condition).subscribe(
        (result) => {
          this.atableConfig.loading = false;
          let response = JSON.parse(result._body);
          if (response.status) {
            this.assList = response.data;
            this.totalCount = this.assList.length;
          }
        },
        (err) => {
          this.atableConfig.loading = false;
        }
      );
    }
  }
  getCompliances() {
    if (this.instanceref != null) {
      let condition = {
        tenantid: this.userstoragedata.tenantid,
        status: AppConstant.STATUS.ACTIVE,
        region: this.instanceref.region,
        instancerefid: this.instanceref.instancerefid,
      } as any;
      if (
        this.instanceref.accountid != null &&
        this.instanceref.accountid != undefined
      ) {
        condition["accountid"] = this.instanceref.accountid;
      }
      this.ssmService.complaincebyId(condition).subscribe(
        (result) => {
          this.atableConfig.loading = false;
          let response = JSON.parse(result._body);
          if (response.status) {
            this.complainceList = _.map(response.data, (itm) => {
              itm = _.merge(itm, itm.ExecutionSummary);
              return itm;
            });
            this.totalCount = this.complainceList.length;
          }
        },
        (err) => {
          this.atableConfig.loading = false;
        }
      );
    }
  }
}
