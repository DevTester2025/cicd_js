import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { HttpHandlerService } from "../../modules/services/http-handler.service";
import { AppConstant } from "../../app.constant";
import { environment } from "../../../environments/environment";
import * as _ from "lodash";

@Injectable()
export class DeploymentsService {
  endpoint: string;
  serviceURL: any;
  constructor(private httpHandler: HttpHandlerService) {
    this.endpoint = AppConstant.API_END_POINT;
    this.serviceURL = AppConstant.API_CONFIG.API_URL.DEPLOYMENTS;
  }
  create(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.CREATE, data);
  }
  deploy(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.DEPLOY, data);
  }
  ecl2deploy(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2.DEPLOY,
      data
    );
  }
  update(data): Observable<any> {
    return this.httpHandler.POST(this.endpoint + this.serviceURL.UPDATE, data);
  }
  all(data,query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.FINDALL;
    if (query) url = url + query;
    return this.httpHandler.POST(url, data);
  }
  byId(id): Observable<any> {
    return this.httpHandler.GET(this.endpoint + this.serviceURL.FINDBYID + id);
  }
  allTemplates(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + AppConstant.API_CONFIG.API_URL.TENANTS.SOLUTIONS.FINDALL,
      data
    );
  }
  viewlog(data, query?): Observable<any> {
    let url = this.endpoint + this.serviceURL.LOG;
    if (query) url = url + query;
    return this.httpHandler.POST(url, data);
  }
  allecl2(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.ECL2FINDALL,
      data
    );
  }
  getCostVisualList(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint +
        AppConstant.API_CONFIG.API_URL.DEPLOYMENTS.AWS.COSTVISUAL.FINDALL,
      data
    );
  }
  getDataViewFormat(data) {
    let formattedData: any[] = [];
    formattedData = [
      {
        displayorder: 0,
        title: "Solution",
        value: [
          { displayorder: 0, text: "Name", value: data.solutionname },
          { displayorder: 1, text: "Provider", value: data.cloudprovider },
        ],
      },
      {
        displayorder: 1,
        title: "Client",
        value: [
          { displayorder: 0, text: "Name", value: "-" },
          { displayorder: 1, text: "Phone", value: "-" },
          { displayorder: 2, text: "Address", value: "-" },
        ],
      },
      {
        displayorder: 2,
        title: "AMI Details",
        value: [
          { displayorder: 0, text: "Name", value: "-" },
          { displayorder: 1, text: "Platform", value: "-" },
        ],
      },
      {
        displayorder: 3,
        title: "VPC",
        value: [
          { displayorder: 0, text: "VPC name", value: "-" },
          { displayorder: 1, text: " IPv4 CIDR", value: "-" },
        ],
      },
      {
        displayorder: 4,
        title: "Instance Type",
        value: [
          {
            displayorder: 0,
            text: "Instance Type",
            value: _.isEmpty(data.awsinsttype)
              ? "-"
              : data.awsinsttype.instancetypename,
          },
          {
            displayorder: 1,
            text: "vCPUs",
            value: _.isEmpty(data.awsinsttype) ? "-" : data.awsinsttype.vcpu,
          },
          {
            displayorder: 2,
            text: "Memory (GiB)",
            value: _.isEmpty(data.awsinsttype) ? "-" : data.awsinsttype.memory,
          },
          {
            displayorder: 3,
            text: "Instance Storage (GB)",
            value: _.isEmpty(data.awsinsttype) ? "-" : data.awsinsttype.storage,
          },
        ],
      },
      {
        displayorder: 5,
        title: "Security Groups",
        value: [
          {
            displayorder: 0,
            text: "Security group name",
            value: _.isEmpty(data.awssg) ? "-" : data.awssg.securitygroupname,
          },
        ],
      },
      {
        displayorder: 6,
        title: "Instance Details",
        value: [
          { displayorder: 0, text: "Number of instances", value: "-" },
          { displayorder: 1, text: "Subnet", value: "-" },
          { displayorder: 2, text: "Monitoring", value: "-" },
          { displayorder: 3, text: "Termination protection", value: "-" },
          { displayorder: 4, text: "Shutdown behavior", value: "-" },
        ],
      },
      {
        displayorder: 7,
        title: "Load Balancer",
        value: [
          { displayorder: 0, text: "Name", value: "-" },
          { displayorder: 2, text: "Port", value: "-" },
          { displayorder: 3, text: "Timeout", value: "-" },
          { displayorder: 4, text: "Interval", value: "-" },
          { displayorder: 5, text: "Unhealthy threshold", value: "-" },
          { displayorder: 5, text: "Healthy threshold", value: "-" },
        ],
      },
      {
        displayorder: 8,
        title: "Tags",
        value: [
          { displayorder: 0, text: "Key", value: "-" },
          { displayorder: 1, text: "Value", value: "-" },
        ],
      },
    ];
    // ami
    if (!_.isEmpty(data.awssolution) && !_.isNull(data.awssolution.awsami)) {
      formattedData[2].value = [
        {
          displayorder: 0,
          text: "Name",
          value: _.isEmpty(data.awssolution.awsami)
            ? "-"
            : data.awssolution.awsami.aminame,
        },
        {
          displayorder: 1,
          text: "Platform",
          value: _.isEmpty(data.awssolution.awsami)
            ? "-"
            : data.awssolution.awsami.platform,
        },
      ];
    }
    // vpc
    if (!_.isEmpty(data.awssolution) && !_.isNull(data.awssolution.awsvpc)) {
      formattedData[3].value = [
        {
          displayorder: 0,
          text: "VPC name",
          value: _.isEmpty(data.awssolution.awsvpc)
            ? "-"
            : data.awssolution.awsvpc.vpcname,
        },
        {
          displayorder: 1,
          text: " IPv4 CIDR",
          value: _.isEmpty(data.awssolution.awsvpc)
            ? "-"
            : data.awssolution.awsvpc.ipv4cidr,
        },
      ];
    }

    if (
      !_.isEmpty(data.awssolution) &&
      !_.isNull(data.awssolution.awsinsttype)
    ) {
      formattedData[4].value = [
        {
          displayorder: 0,
          text: "Instance Type",
          value: _.isEmpty(data.awssolution.awsinsttype)
            ? "-"
            : data.awssolution.awsinsttype.instancetypename,
        },
        {
          displayorder: 1,
          text: "vCPUs",
          value: _.isEmpty(data.awssolution.awsinsttype)
            ? "-"
            : data.awssolution.awsinsttype.vcpu,
        },
        {
          displayorder: 2,
          text: "Memory (GiB)",
          value: _.isEmpty(data.awssolution.awsinsttype)
            ? "-"
            : data.awssolution.awsinsttype.memory,
        },
        {
          displayorder: 3,
          text: "Instance Storage (GB)",
          value: _.isEmpty(data.awssolution.awsinsttype)
            ? "-"
            : data.awssolution.awsinsttype.storage,
        },
      ];
      if (!_.isEmpty(data.awssolution) && !_.isNull(data.awssolution.awssg)) {
        formattedData[5].value = [
          {
            displayorder: 0,
            text: "Security group name",
            value: _.isEmpty(data.awssolution.awssg)
              ? "-"
              : data.awssolution.awssg.securitygroupname,
          },
        ];
      }
      if (!_.isEmpty(data.awssolution) && !_.isNull(data.awssolution)) {
        formattedData[6].value = [
          {
            displayorder: 0,
            text: "Number of instances",
            value: _.isEmpty(data.awssolution)
              ? "-"
              : data.awssolution.noofservers,
          },
          {
            displayorder: 1,
            text: "Subnet",
            value: _.isEmpty(data.awssolution)
              ? "-"
              : data.awssolution.noofservers,
          },
          {
            displayorder: 2,
            text: "Monitoring",
            value: _.isEmpty(data.awssolution)
              ? "-"
              : data.awssolution.monitoringyn == "Y"
              ? "Yes"
              : "No",
          },
          {
            displayorder: 3,
            text: "Termination protection",
            value: _.isEmpty(data.awssolution)
              ? "-"
              : data.awssolution.terminationprotectionyn == "Y"
              ? "Yes"
              : "No",
          },
          {
            displayorder: 4,
            text: "Shutdown behavior",
            value: _.isEmpty(data.awssolution)
              ? "-"
              : data.awssolution.shutdownbehaviour,
          },
        ];
      }
      // lb
      if (!_.isEmpty(data.awslb) && !_.isNull(data.awslb)) {
        formattedData[7].value = [
          {
            displayorder: 0,
            text: "Name",
            value: _.isEmpty(data.awslb) ? "-" : data.awslb.lbname,
          },
          {
            displayorder: 2,
            text: "Port",
            value: _.isEmpty(data.awslb) ? "-" : data.awslb.hcport,
          },
          {
            displayorder: 3,
            text: "Timeout",
            value: _.isEmpty(data.awslb) ? "-" : data.awslb.hcinterval,
          },
          {
            displayorder: 4,
            text: "Interval",
            value: _.isEmpty(data.awslb) ? "-" : data.awslb.hctimeout,
          },
          {
            displayorder: 5,
            text: "Unhealthy threshold",
            value: _.isEmpty(data.awslb)
              ? "-"
              : data.awslb.hcunhealthythreshold,
          },
          {
            displayorder: 6,
            text: "Healthy threshold",
            value: _.isEmpty(data.awslb) ? "-" : data.awslb.hchealthythreshold,
          },
        ];
      }
      // if (!_.isEmpty(data.awssolution) && !_.isNull(data.awssolution.awstags)) {
      //   formattedData[8].value = [
      //     { displayorder: 0, text: 'Key', value: _.isNull(data.awssolution.awstags) ? '-' : data.awssolution.awstags.tagkey },
      //     { displayorder: 1, text: 'Value', value: _.isNull(data.awssolution.awstags) ? '-' : data.awssolution.awstags.tagvalue }
      //   ];
      // }
    }
    return formattedData;
  }
  // AWS Deployments
  allawsdeployments(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.DEPLOYMENTS.FINDALL,
      data
    );
  }

  // AWS Loadbalancers

  allawsloadbalancers(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.LB.FINDALL,
      data
    );
  }
  loadbalancerbyId(id): Observable<any> {
    return this.httpHandler.GET(
      this.endpoint + this.serviceURL.AWS.LB.FINDBYID + id
    );
  }

  // AWS AMI

  allawsami(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.AMI.FINDALL,
      data
    );
  }
  createami(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.AMI.CREATE,
      data
    );
  }
  updateami(data): Observable<any> {
    return this.httpHandler.POST(
      this.endpoint + this.serviceURL.AWS.AMI.UPDATE,
      data
    );
  }

  // Virtual Machine headers

  getCommonImageHeader() {
    return [
      { field: "aminame", header: "Image Name", datatype: "string" },
      { field: "awsamiid", header: "Image Id", datatype: "string" },
      { field: "platform", header: "Platform", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
      { field: "status", header: "Status", datatype: "string" },
    ];
  }
  getAWSImageHeader() {
    return [
      { field: "aminame", header: "AMI Name", datatype: "number" },
      { field: "awsamiid", header: "AWS AMI Id", datatype: "string" },
      { field: "platform", header: "Platform", datatype: "number" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
      { field: "status", header: "Status", datatype: "string" },
    ];
  }
  getECL2ImageHeader() {
    return [
      { field: "imagename", header: "Image Name", datatype: "string" },
      { field: "ecl2imageid", header: "ECL2 Image Id", datatype: "string" },
      { field: "platform", header: "Platform", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
      { field: "status", header: "Status", datatype: "string" },
    ];
  }
  getALIImageHeader() {
    return [
      { field: "imagename", header: "Image Name", datatype: "string" },
      { field: "aliimageid", header: "Alibaba Image Id", datatype: "string" },
      { field: "platform", header: "Platform", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
      { field: "status", header: "Status", datatype: "string" },
    ];
  }

  getVSRXHeader() {
    return [
      { field: "vsrxname", header: "Name", datatype: "string" },
      { field: "description", header: "Description", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
      { field: "status", header: "Status", datatype: "string" },
    ];
  }
  getFWHeader() {
    return [
      { field: "firewallname", header: "Name", datatype: "string" },
      { field: "description", header: "Description", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
      { field: "status", header: "Status", datatype: "string" },
    ];
  }
  getAWSLBHeader() {
    return [
      { field: "lbname", header: "Load Balancer Name", datatype: "string" },
      { field: "hcport", header: "Port", datatype: "number" },
      { field: "hcinterval", header: "Interval", datatype: "number" },
      {
        field: "hchealthythreshold",
        header: "Healthy Threshold",
        datatype: "number",
      },
      {
        field: "hcunhealthythreshold",
        header: "Unhealthy Threshold",
        datatype: "number",
      },
      { field: "status", header: "Status", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
    ];
  }
  getECLLBHeader() {
    return [
      { field: "lbname", header: "Load Balancer Name", datatype: "string" },
      {
        field: "loadbalancerplan",
        header: "Load Balancer Plan",
        datatype: "number",
      },
      {
        field: "availabilityzone",
        header: "Available Zone",
        datatype: "number",
      },
      { field: "status", header: "Status", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
    ];
  }
  getAlibabaLBHeader() {
    return [
      { field: "lbname", header: "Load Balancer Name", datatype: "string" },
      { field: "specification", header: "Specification", datatype: "string" },
      { field: "notes", header: "Notes", datatype: "string" },
      { field: "status", header: "Status", datatype: "string" },
      { field: "lastupdatedby", header: "Updated By", datatype: "string" },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
      },
    ];
  }
}
