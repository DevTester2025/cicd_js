import { Component, OnInit, Input } from "@angular/core";
import { TreeNode } from "primeng/primeng";
import { SolutionService } from "../../../tenants/solutiontemplate/solution.service";
import { Router, ActivatedRoute } from "@angular/router";
import * as _ from "lodash";
@Component({
  selector: "app-solutiongraph",
  templateUrl:
    "../../../../presentation/web/tenant/solutiontemplate/solutiongraph/solutiongraph.component.html",
})
export class SolutiongraphComponent implements OnInit {
  @Input() graphical: any = {};
  graphicalDetails = {} as any;
  graphdata: any = [];
  solutionData: any = [];
  solutionid: any;
  serverDetails = [];
  lbDetails = [];
  constructor(
    private solutionService: SolutionService,
    private routes: ActivatedRoute
  ) {
    // this.routes.params.subscribe(params => {
    //   if (params.sid !== undefined) {
    //     this.solutionid = params.sid;
    //     this.getSolutionGraph(this.solutionid);
    //   }
    // });
  }

  ngOnInit() {
    if (_.isEmpty(this.solutionid)) {
      if (this.graphical.cloudprovider == "ECL2") {
        this.getECL2SolutionGraph(this.graphical.solutionid);
      } else {
        this.getSolutionGraph(this.graphical.solutionid);
      }
    }
  }
  getECL2SolutionGraph(id) {
    this.solutionService.ecl2byId(id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.graphicalDetails = response.data;
        let instance = [] as any;
        let loadbalancer = [] as any;
        let ecl2networks = [] as any;
        let networkobj = {} as any;
        let network = [] as any;
        if (!_.isEmpty(this.graphicalDetails.ecl2solutions)) {
          instance = _.map(
            this.graphicalDetails.ecl2solutions,
            function (obj: any) {
              return {
                label: obj.instancename,
                type: "person",
                data: { avatar: "instance.png" },
                expanded: true,
                children: _.map(obj.ecl2networks, function (data: any) {
                  let ecl2subnet = [] as any;
                  let ecl2port = [] as any;
                  if (!_.isEmpty(data.ecl2subnets)) {
                    ecl2subnet = _.map(
                      data.ecl2subnets,
                      function (subnet: any) {
                        return {
                          label: subnet.subnetname,
                          type: "person",
                          data: { avatar: "subnet.png" },
                        };
                      }
                    );
                  }
                  if (!_.isEmpty(data.ecl2ports)) {
                    ecl2port = _.map(data.ecl2ports, function (port: any) {
                      return {
                        label: port.portname,
                        type: "person",
                        data: { avatar: "subnet.png" },
                      };
                    });
                  }
                  let subnetandport = [] as any;
                  subnetandport = ecl2subnet.concat(ecl2port);
                  networkobj = {
                    label: data.networkname,
                    type: "person",
                    data: { avatar: "vpc.png" },
                    expanded: true,
                    children: ecl2subnet.concat(ecl2port),
                  };
                  return networkobj;
                }),
              };
            }
          );
        }
        if (!_.isEmpty(this.graphicalDetails.ecl2loadbalancers)) {
          loadbalancer = _.map(
            this.graphicalDetails.ecl2loadbalancers,
            function (lb: any) {
              return {
                label: lb.lbname,
                type: "person",
                data: { avatar: "lb.png" },
              };
            }
          );
        }
        let instanceandlb = [] as any;
        instanceandlb = instance.concat(loadbalancer);
        this.graphdata = [
          {
            label: this.graphicalDetails.solutionname,
            type: "person",
            data: { avatar: "solution.png" },
            expanded: true,
            children: !_.isEmpty(instanceandlb) ? instanceandlb : [],
          },
        ];
      } else {
        this.graphicalDetails = {};
      }
    });
  }

  getSolutionGraph(id) {
    let response = {} as any;
    this.solutionService.graph(id).subscribe((data) => {
      response = JSON.parse(data._body);
      if (response.status) {
        this.graphicalDetails = response.data;
        this.lbDetails = _.isEmpty(this.graphicalDetails.lb)
          ? []
          : this.graphicalDetails.lb;
        this.serverDetails = _.isEmpty(this.graphicalDetails.awssolutions)
          ? []
          : this.graphicalDetails.awssolutions;
        let solutions = [] as any;
        let instances = [] as any;
        let lbinstances = [] as any;
        let lbservers = [];
        solutions.loadbalancers = [];
        let formdata = [] as any;
        let solutionname = this.graphicalDetails.solutionname;
        instances = _.map(this.serverDetails, function (item: any) {
          return {
            label: item.instancename,
            refid: item.awssolutionid,
            type: "person",
            data: { avatar: "instance.png" },
            expanded: true,
            children: [
              {
                label: item.awsvpc.vpcname,
                type: "person",
                data: { avatar: "vpc.png" },
              },
              {
                label: item.awssubnet.subnetname,
                type: "person",
                data: { avatar: "subnet.png" },
              },
            ],
          };
        });
        if (!_.isEmpty(this.lbDetails)) {
          _.map(this.lbDetails, function (item: any) {
            lbinstances = _.map(item.awssolution, function (obj: any) {
              return {
                label: obj.instancename,
                refid: obj.awssolutionid,
                type: "person",
                data: { avatar: "instance.png" },
                expanded: true,
                children: [
                  {
                    label: obj.awsvpc.vpcname,
                    type: "person",
                    data: { avatar: "vpc.png" },
                  },
                  {
                    label: obj.awssubnet.subnetname,
                    type: "person",
                    data: { avatar: "subnet.png" },
                  },
                ],
              };
            });
            if (!_.isUndefined(item.lbsubnet)) {
              lbinstances.push({
                label: item.lbsubnet.subnetname,
                type: "person",
                data: { avatar: "subnet.png" },
              });
            }
            solutions.loadbalancers.push(
              !_.isEmpty(item.lbname)
                ? {
                    label: item.lbname,
                    type: "person",
                    data: { avatar: "lb.png" },
                    expanded: true,
                    children: !_.isEmpty(lbinstances) ? lbinstances : [],
                  }
                : []
            );
          });
        } else {
          solutions.push(instances);
        }

        let servers = _.map(instances, function (obj: any) {
          return obj.refid;
        });
        let lbassservers = _.map(lbinstances, function (obj: any) {
          return obj.refid;
        });
        lbassservers = _.compact(lbassservers);
        let differenceList = [];
        if (servers.length != lbassservers.length) {
          differenceList = _.difference(servers, lbassservers);
          if (differenceList.length != 0) {
            differenceList.forEach((obj) => {
              _.map(instances, function (items: any) {
                if (obj == items.refid) {
                  solutions.loadbalancers.push(items);
                }
              });
            });
          }
        }
        this.graphdata = [
          {
            label: solutionname,
            type: "person",
            data: { avatar: "solution.png" },
            expanded: true,
            children: _.isEmpty(solutions.loadbalancers)
              ? solutions[0]
              : solutions.loadbalancers,
          },
        ];
      } else {
        this.graphicalDetails = {};
      }
    });
  }
}
