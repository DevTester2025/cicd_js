import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import * as _ from "lodash";
import { AppConstant } from "../../../app.constant";
import { LocalStorageService } from "../../services/shared/local-storage.service";

@Component({
  selector: "app-cloudmatiq-summary-view",
  templateUrl: "../summary/summary-view.component.html",
})
export class SummaryViewComponent implements OnInit, OnChanges {
  @Input() viewData: any = {};
  @Input() summaryTitle: string;
  @Output() closeSummary: EventEmitter<any> = new EventEmitter();

  lbList;
  sList;
  slasList = [] as any;
  paramquery: any = {};
  instancesTableHeader = [
    { field: "instancename", header: "Instance", datatype: "string" },
    { field: "lb.lbname", header: "Load Balancer", datatype: "string" },
    {
      field: "awsinsttype.instancetypename",
      header: "Instance Type",
      datatype: "string",
    },
    { field: "subnetsummary", header: "Subnet", datatype: "string" },
    { field: "vpcsummary", header: "VPC", datatype: "string" },
    { field: "amisummary", header: "AMI", datatype: "string" },
    { field: "volumessummary", header: "Volumes", datatype: "string" },
    { field: "sgsummary", header: "Security Groups", datatype: "string" },
  ];

  instanceTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 50,
    scroll: { x: "720px" },
    title: "",
    widthConfig: [
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "50px",
    ],
  };
  slaTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 10,
    scroll: { x: "620px" },
    title: "",
    widthConfig: [],
  };
  lbTableHeader = [
    { field: "lbname", header: "Load Balancer", datatype: "string" },
    { field: "vpcsummary", header: "VPC", datatype: "string" },
    { field: "subnetsummary", header: "Subnet", datatype: "string" },
    { field: "sgsummary", header: "Security Group", datatype: "string" },
    {
      field: "hchealthythreshold",
      header: "HC Healthy Threshold",
      datatype: "string",
    },
    {
      field: "hcunhealthythreshold",
      header: "HC Un Healthy Threshold",
      datatype: "string",
    },
    { field: "hctimeout", header: "HC Timeout", datatype: "string" },
    { field: "hcport", header: "HC Port", datatype: "string" },
    { field: "hcinterval", header: "HC Interval", datatype: "string" },
  ];
  slaTableHeader = [
    { field: "priorities", header: "Priority", datatype: "string" },
    {
      field: "responsetimemins",
      header: "Response Time (mins)",
      datatype: "string",
    },
    { field: "uptimeprcnt", header: "Uptime (%)", datatype: "string" },
    {
      field: "replacementhrs",
      header: "Replacement (hrs)",
      datatype: "string",
    },
    { field: "workinghrs", header: "Working (hrs)", datatype: "string" },
    { field: "creditsprcnt", header: "Credits (%)", datatype: "string" },
    { field: "notes", header: "Notes", datatype: "string" },
  ];

  lbTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 50,
    scroll: { x: "720px" },
    title: "",
    widthConfig: [
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
      "50px",
    ],
  };

  screens = [];
  appScreens = {} as any;
  showcosts = true;
  constructor(private localStorageService: LocalStorageService) {
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    // this.appScreens = _.find(this.screens, {
    //   screencode: AppConstant.SCREENCODES.SERVICE_CATALOG_MANAGEMENT,
    // });
    // if (_.includes(this.appScreens.actions, "Create")) {
    //   this.showcosts = true;
    // }
  }

  ngOnInit() {
    this.paramquery = {
      paramtype: "Template",
      templateid: this.viewData.solutionid,
      status: AppConstant.STATUS.ACTIVE,
      cloudprovider: this.viewData.cloudprovider,
    };
    this.slasList = [];
    this.sList = [];
    this.lbList = [];
    if (this.viewData.ecl2solutions) {
      let sData = this.viewData.ecl2solutions;
      let lbList = [];
      for (let i = 0; i < sData.length; i++) {
        let volumes = sData[i].volumes;
        let ami = sData[i].ecl2images;
        let ecl2networks = sData[i].ecl2networks;
        if (ecl2networks) {
          let network = [];
          let subnet = [];
          let port = [];
          network = _.map(ecl2networks, function (o: any) {
            return o.networkname;
          });
          sData[i].networksummary = `VPC:[${network}]`;
          ecl2networks.forEach((element) => {
            if (element.ecl2subnets) {
              subnet = _.map(element.ecl2subnets, function (o: any) {
                return `${o.subnetname} - ${o.subnetcidr}`;
              });
              sData[i].subnetsummary = subnet;
            }
            if (element.ecl2ports) {
              port = _.map(element.ecl2ports, function (o: any) {
                return o.portname;
              });
              sData[i].portsummary = `Port:[${port}]`;
            }
          });
        }
        if (ami) {
          sData[i].amisummary = `${ami.imagename.substring(0, 7)} ; ${
            ami.ecl2imageid == undefined ? "" : ami.ecl2imageid
          } ; ${ami.platform}`;
        }
        if (volumes) {
          let vd = [];
          vd.push(volumes.volumename);
          vd.push(volumes.size);
          sData[i].volumessummary = `Volumes:[${vd.join(";")}]`;
        }
      }
      if (this.viewData.ecl2loadbalancers.length > 0) {
        let lbdata = this.viewData.ecl2loadbalancers;
        for (let j = 0; j < lbdata.length; j++) {
          let lb = lbdata[j];
          if (lb) {
            lbList.push(lb);
          }
        }
      }

      if (lbList.length > 0) {
        this.lbTableHeader = [
          { field: "lbname", header: "Load Balancer", datatype: "string" },
          {
            field: "loadbalancerplan",
            header: "Load Balancer Plan",
            datatype: "string",
          },
          { field: "availabilityzone", header: "Zone", datatype: "string" },
          { field: "description", header: "Description", datatype: "string" },
          { field: "status", header: "Status", datatype: "string" },
        ];
        this.lbTableConfig = {
          edit: false,
          delete: false,
          globalsearch: false,
          loading: false,
          pagination: false,
          pageSize: 50,
          scroll: { x: "720px" },
          title: "",
          widthConfig: ["100px", "100px", "100px", "100px", "100px"],
        };
        this.lbList = lbList;
      } else {
        this.lbList = [];
      }

      if (sData.length > 0) {
        this.instancesTableHeader = [
          { field: "instancename", header: "Instance", datatype: "string" },
          {
            field: "ecl2instancetype.instancetypename",
            header: "Instance Type",
            datatype: "string",
          },
          { field: "amisummary", header: "AMI", datatype: "string" },
          { field: "volumessummary", header: "Volumes", datatype: "string" },
          { field: "networksummary", header: "VPC", datatype: "string" },
          { field: "subnetsummary", header: "Subnet", datatype: "string" },
          { field: "portsummary", header: "Port", datatype: "string" },
        ];

        this.instanceTableConfig = {
          edit: false,
          delete: false,
          globalsearch: false,
          loading: false,
          pagination: false,
          pageSize: 50,
          scroll: { x: "720px" },
          title: "",
          widthConfig: ["100px", "100px", "100px", "100px", "100px", "100px"],
        };
        this.sList = sData;
      } else {
        this.sList = [];
      }
    }
    if (this.viewData.awssolutions) {
      let sData = this.viewData.awssolutions;
      let lbList = [];
      for (var i = 0; i < sData.length; i++) {
        let awsvpc = sData[i].awsvpc;
        let subnet = sData[i].awssubnet;
        let volumes = sData[i].volumes;
        let ami = sData[i].awsami;
        let awssg = sData[i].awssg;
        let lb = sData[i].lb;
        if (lb) {
          let rules = lb.lbsecuritygroup.awssgrules;
          let rd = [];
          if (rules.length > 0) {
            rules.forEach((r) => {
              rd.push(r.protocol);
              rd.push(r.portrange);
              rd.push(r.source);
            });
          }
          if (Array.isArray(lb.listeners)) {
            lb.listeners = lb.listeners.join(";");
          } else {
            lb.listeners = "";
          }
          lb.sgsummary = `${awssg.securitygroupname} ; ${
            awssg.awssecuritygroupid == undefined
              ? ""
              : awssg.awssecuritygroupid
          } ; Rules:[${rd.join(";")}]`;
          lb.vpcsummary = `${awsvpc.vpcname} ; ${awsvpc.vpcname} ; ${awsvpc.ipv4cidr}`;
          lb.subnetsummary = `${lb.lbsubnet.subnetname} ; ${
            lb.lbsubnet.ipv4cidr
          } ; ${lb.lbsubnet.subnetd == undefined ? "" : lb.lbsubnet.subnetd}`;
          lbList.push(lb);
        }
        if (awsvpc) {
          sData[
            i
          ].vpcsummary = `${awsvpc.vpcname} ; ${awsvpc.vpcname} ; ${awsvpc.ipv4cidr}`;
        }
        if (subnet) {
          sData[i].subnetsummary = `${subnet.subnetname} ; ${
            subnet.ipv4cidr
          } ; ${subnet.subnetd == undefined ? "" : subnet.subnetd}`;
        }
        if (ami) {
          sData[i].amisummary = `${ami.aminame} ; ${
            ami.awsamiid == undefined ? "" : ami.awsamiid
          } ; ${ami.platform}`;
        }
        if (awssg) {
          let rules = awssg.awssgrules;
          let rd = [];
          if (rules.length > 0) {
            rules.forEach((r) => {
              rd.push(r.protocol);
              rd.push(r.portrange);
              rd.push(r.source);
            });
          }
          sData[i].sgsummary = `${awssg.securitygroupname} ; ${
            awssg.awssecuritygroupid == undefined
              ? ""
              : awssg.awssecuritygroupid
          } ; Rules:[${rd.join(";")}]`;
        }
        if (volumes) {
          let vd = [];
          if (volumes.length > 0) {
            volumes.forEach((v) => {
              vd.push(v.volumetype);
              vd.push(v.sizeingb);
            });
          }
          sData[i].volumessummary = `Volumes:[${vd.join(";")}]`;
        }
      }
      if (lbList.length > 0) {
        this.lbList = lbList;
      } else {
        this.lbList = [];
      }
      this.sList = sData;
    }
    if (
      !_.isEmpty(this.viewData) &&
      !_.isUndefined(this.viewData.slas) &&
      this.viewData.slas.length > 0
    ) {
      let slas = [];
      slas = this.viewData.slas;
      slas.forEach((element) => {
        element.priorities = "Priority " + element.priority;
      });
      this.slasList = slas;
    } else {
      this.slasList = [];
    }
  }

  ngOnChanges(changes: SimpleChanges) {}
  close() {
    this.closeSummary.next(false);
  }
}
