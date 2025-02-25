import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { AppConstant } from "../../../../../app.constant";
import { LocalStorageService } from "../../../../../modules/services/shared/local-storage.service";
import { Ecl2Service } from "../../../ecl2/ecl2-service";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd";
import { CommonService } from "../../../../../modules/services/shared/common.service";
import { NzNotificationService } from "ng-zorro-antd";
import * as _ from "lodash";
import { TagService } from "src/app/business/base/tagmanager/tags.service";
import { TagValueService } from "src/app/business/base/tagmanager/tagvalue.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
@Component({
  selector: "app-firewallvsrx",
  templateUrl:
    "../../../../../presentation/web/deployments/ecl2/firewall/firewallvsrx/firewallvsrx.component.html",
})
export class FirewallvsrxComponent implements OnInit, OnChanges {
  subtenantLable = AppConstant.SUBTENANT;

  @Input() tagsOnly: boolean; // If true only tags can be added / edited.
  @Input() vsrxid: string;
  @Input() mode: string;
  @Input() assetData: any;

  @Input() vsrxObj: any;
  @Output() notifyNewEntry: EventEmitter<any> = new EventEmitter();
  gettingVsrx = false;
  natObj = {};
  proxyNATObj = {};
  securityPolicyObj = {};
  edit = false;
  firewallInterfaceObj: any = {};
  userstoragedata: any;
  buttonText: any;
  addTenant: any = false;
  ecl2firewallvsrxForm: FormGroup;
  singleinterfaceForm: FormGroup;
  firewallvsrxForm: FormGroup;
  allowedaddresspairs: FormArray;
  internetserviceList: any = [];
  qosList: any = [];
  formdata: any = {};
  disabled = false;
  loading = false;
  selectedIndex = 0;
  networkList: any = [];
  ecl2zoneList: any = [];
  firewallplanList: any = [];
  firewallInterfaceList: any = [];
  interfaceObj: any = {};
  childrenVisible = false;
  vsrxinterfaceid: any;
  interfaceZoneList: any = [];
  interfaceServiceList: any = [];
  advancedRuleList: any = [];
  formTitle = "Update Interface";
  securityzonevisible = false;
  securityZoneObj: any = {};
  customerList: any = [];
  modal: any;
  firewallErrObj = {
    vsrxname: AppConstant.VALIDATIONS.ECL2.FIREWALL.FIREWALLNAME,
    zoneid: AppConstant.VALIDATIONS.ECL2.FIREWALL.ZONE,
    customerid: AppConstant.VALIDATIONS.ECL2.COMMON.CUSTOMER,
    vsrxplanid: AppConstant.VALIDATIONS.ECL2.FIREWALL.FIREWALLPLAN,
    description: AppConstant.VALIDATIONS.ECL2.FIREWALL.DESCRIPTION,
    networkid: AppConstant.VALIDATIONS.ECL2.FIREWALL.NETWORK,
    ipaddress: AppConstant.VALIDATIONS.ECL2.FIREWALL.IPADDRESS,
    defaultgateway: AppConstant.VALIDATIONS.ECL2.FIREWALL.DEFAULTGATEWAY,
  };
  interfaceErr = {
    networkid: AppConstant.VALIDATIONS.ECL2.FIREWALL.NETWORK,
    ipaddress: AppConstant.VALIDATIONS.ECL2.FIREWALL.IPADDRESS,
  };

  // Tag Picker related
  tagTableHeader = [
    { field: "tagname", header: "Name", datatype: "string" },
    { field: "tagvalue", header: "Value", datatype: "string" },
  ] as any;
  tagTableConfig = {
    edit: false,
    delete: false,
    globalsearch: false,
    loading: false,
    pagination: false,
    pageSize: 1000,
    title: "",
    widthConfig: ["30px", "25px", "25px", "25px", "25px"],
  } as any;
  tagPickerVisible = false;
  tags = [];
  tagsClone = [];
  tagsList = [];

  constructor(
    private localStorageService: LocalStorageService,
    private tagService: TagService,
    private httpService: HttpHandlerService,
    private tagValueService: TagValueService,
    private commonService: CommonService,
    private notificationService: NzNotificationService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private ecl2Service: Ecl2Service
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.buttonText = AppConstant.BUTTONLABELS.SAVE;
  }
  ngOnInit() {
    this.clearForm();
    this.getLookupList();
    this.getZoneList();
    if (this.assetData) {
      this.addTenant = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.vsrxObj) &&
      !_.isEmpty(changes.vsrxObj.currentValue) &&
      !_.isUndefined(changes.vsrxObj.currentValue.vsrxid)
    ) {
      this.selectedIndex = 0;
      this.vsrxObj = changes.vsrxObj.currentValue;
      this.getTagValues();
      this.natObj = this.vsrxObj;
      this.proxyNATObj = this.vsrxObj;
      this.securityPolicyObj = this.vsrxObj;
      this.firewallInterfaceObj = this.vsrxObj;
      this.edit = true;
      this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
      this.generateEditForm(this.vsrxObj);
    } else if (changes.vsrxid && changes.mode.currentValue == "standalone") {
      console.log("INSIDE ELSE IF:::::::::");
      this.gettingVsrx = true;
      this.getVsrxObject();
    } else {
      this.selectedIndex = 0;
      this.edit = false;
      this.tagsClone = [];
      this.tagsList = [];
      this.tags = [];
      this.clearForm();
      this.buttonText = AppConstant.BUTTONLABELS.SAVE;
    }
  }

  getVsrxObject() {
    this.httpService
      .GET(
        AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.OTHER.ECL2VSRXGETBYID +
          this.vsrxid
      )
      .subscribe((res) => {
        const response = JSON.parse(res._body);

        if (response) {
          this.selectedIndex = 0;
          this.vsrxObj = response.data;
          this.getTagValues();
          this.natObj = this.vsrxObj;
          this.proxyNATObj = this.vsrxObj;
          this.securityPolicyObj = this.vsrxObj;
          this.firewallInterfaceObj = this.vsrxObj;
          this.edit = true;
          this.buttonText = AppConstant.BUTTONLABELS.UPDATE;
          this.generateEditForm(this.vsrxObj);
        } else {
        }
      });
  }

  clearForm() {
    this.firewallvsrxForm = this.fb.group({
      vsrxname: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      zoneid: [null, Validators.required],
      customerid: [null, Validators.required],
      vsrxplanid: [null, Validators.required],
      description: [
        "",
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      vsrxinterfacename: [""],
      networkid: ["", Validators.required],
      ipaddress: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(30),
        ]),
      ],
      defaultgateway: [
        "",
        Validators.compose([Validators.minLength(1), Validators.maxLength(30)]),
      ],
      interfacezone: ["trust"],
      unit: [0],
      services: ["any-service"],
      status: [""],
    });
    this.singleinterfaceForm = this.fb.group({
      vsrxinterfacename: [""],
      networkid: ["", Validators.required],
      ipaddress: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(30),
        ]),
      ],
      addresspairip: [""],
      type: ["Not Specified"],
      macaddress: [""],
      vrid: [""],
    });
  }
  editConfiguration(event, type) {
    let ip = _.find(this.vsrxObj.ecl2vsrxinterface, function (item: any) {
      if (item.slotname === "interface_1") {
        return item;
      }
    });
    event.urlipaddress = ip.ipaddress;
    event.ecl2vsrx = {} as any;
    event.ecl2vsrx.username = this.vsrxObj.username;
    event.ecl2vsrx.password = this.vsrxObj.password;
    this.securityZoneObj = event;
    this.modal = type;
    this.formTitle = "Security Zone";
    this.securityzonevisible = true;
  }
  editInterface(event) {
    this.interfaceObj = event;
    this.formTitle = "Attach Network";
    this.vsrxinterfaceid = event.vsrxinterfaceid;
    this.childrenVisible = true;
  }
  onChanged(val) {
    this.childrenVisible = val;
    this.securityzonevisible = val;
  }
  onRegionChange(event) {
    const customerCondition = {
      tenantid: this.userstoragedata.tenantid,
      ecl2region: event.region,
      status: AppConstant.STATUS.ACTIVE,
    };
    this.getCustomerList(customerCondition);
  }
  getCustomerList(condition) {
    this.commonService.allCustomers(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.customerList = response.data;
        this.loading = false;
      } else {
        this.customerList = [];
        this.loading = false;
      }
    });
  }
  onCustomerChange(event) {
    const condition = {
      tenantid: this.userstoragedata.tenantid,
      region: event.ecl2region,
      customerid: event.customerid,
      status: AppConstant.STATUS.ACTIVE,
    };
    const networkcondition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      customerid: event.customerid,
    };
    this.getNetworkList(networkcondition);
    this.getFirewallPlans(condition);
  }
  generateEditForm(data) {
    this.firewallplanList.push(data.ecl2vsrxplan);
    this.ecl2zoneList.push(data.ecl2zones);
    this.customerList.push(data.customer);
    this.firewallInterfaceList = _.map(
      data.ecl2vsrxinterface,
      function (item: any) {
        if (
          !_.isEmpty(item.ecl2networks) &&
          !_.isEmpty(item.ecl2networks.ecl2subnets)
        ) {
          item.ecl2networks.networkname =
            item.ecl2networks.networkname +
            "(" +
            _.map(item.ecl2networks.ecl2subnets, function (obj) {
              return obj.subnetcidr;
            }) +
            ")";
        }
        return item;
      }
    );
    this.ecl2firewallvsrxForm = this.fb.group({
      vsrxname: [
        data.vsrxname,
        Validators.compose([
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
      vsrxplanid: [data.ecl2vsrxplan, Validators.required],
      zoneid: [data.ecl2zones, Validators.required],
      customerid: [data.customer, Validators.required],
      description: [
        data.description,
        Validators.compose([
          Validators.minLength(1),
          Validators.maxLength(100),
        ]),
      ],
    });
    const networkcondition = {
      tenantid: this.userstoragedata.tenantid,
      status: AppConstant.STATUS.ACTIVE,
      zoneid: data.zoneid,
    };
    this.getNetworkList(networkcondition);
  }
  attachNetwork(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.singleinterfaceForm.status === "INVALID") {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.singleinterfaceForm,
        this.interfaceErr
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      let networkDetails = [] as any;
      const slotname = this.interfaceObj.slotname;
      let selectedzone = {} as any;
      selectedzone = _.find(this.ecl2zoneList, {
        zoneid: this.interfaceObj.zoneid,
      });
      networkDetails = [
        {
          name: data.vsrxinterfacename,
          network_id: data.networkid.ecl2networkid,
          fixed_ips: [{ ip_address: data.ipaddress }],
        },
      ];
      // networkDetails[0].allowed_address_pairs = [{
      //   ipaddress: data.addresspairip,
      //   macaddress: data.macaddress,
      //   type: data.type,
      //   vrid: data.vrid
      // }];
      const interfaces = {} as any;
      for (let i = 0; i < networkDetails.length; i++) {
        interfaces[slotname] = networkDetails[0];
      }
      this.formdata.interfaces = interfaces;
      this.formdata.ecl2vsrxid = this.vsrxObj.ecl2vsrxid;
      this.formdata.tenantid = this.userstoragedata.tenantid;
      this.formdata.ecl2vsrxinterface = {};
      this.formdata.ecl2vsrxinterface.vsrxinterfaceid = this.vsrxinterfaceid;
      this.formdata.vsrxid = this.vsrxObj.vsrxid;
      this.formdata.ecl2vsrxinterface.vsrxinterfacename =
        data.vsrxinterfacename;
      this.formdata.ecl2vsrxinterface.networkid = data.networkid.networkid;
      // this.formdata.ecl2vsrxinterface.allowedaddresspairs = JSON.stringify(networkDetails[0].allowed_address_pairs[0]);
      this.formdata.ecl2vsrxinterface.lastupdatedby =
        this.userstoragedata.fullname;
      this.formdata.ecl2vsrxinterface.lastupdateddt = new Date();
      this.formdata.region = this.vsrxObj.ecl2zones.region;
      this.formdata.ecl2tenantid = this.vsrxObj.customer.ecl2tenantid;
      this.formdata.ecl2vsrxinterface.ipaddress = data.ipaddress;

      this.ecl2Service.updateecl2vsrx(this.formdata).subscribe(
        (res) => {
          const response = JSON.parse(res._body);
          if (response.status) {
            this.loading = false;
            this.disabled = false;
            this.childrenVisible = false;
            response.data.ecl2networks = data.networkid;
            let existData = {} as any;
            existData = _.find(this.firewallInterfaceList, {
              vsrxinterfaceid: response.data.vsrxinterfaceid,
            });
            const index = _.indexOf(this.firewallInterfaceList, existData);
            this.firewallInterfaceList[index] = response.data;
            this.firewallInterfaceList = [...this.firewallInterfaceList];
            this.clearForm();
            this.message.success(response.message);
          } else {
            this.loading = false;
            this.disabled = false;
            this.childrenVisible = false;
            this.notificationService.error("Error", response.message, {
              nzStyle: {
                right: "460px",
                background: "#fff",
              },
              nzDuration: AppConstant.MESSAGEDURATION,
            });
          }
        },
        (err) => {
          this.loading = false;
          this.disabled = false;
          this.notificationService.error(
            "Error",
            "Sorry! Something gone wrong"
          );
        }
      );
    }
  }
  getLookupList() {
    const condition = {
      keylist: [
        AppConstant.LOOKUPKEY.INTERFACEZONE,
        AppConstant.LOOKUPKEY.INTERFACESERVICES,
        AppConstant.LOOKUPKEY.SECURITYRULEACTION,
      ],
      status: AppConstant.STATUS.ACTIVE,
    };
    this.commonService.allLookupValues(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        response.data.forEach((element) => {
          if (element.lookupkey === AppConstant.LOOKUPKEY.INTERFACEZONE) {
            this.interfaceZoneList.push(element);
          } else if (
            element.lookupkey === AppConstant.LOOKUPKEY.INTERFACESERVICES
          ) {
            this.interfaceServiceList.push(element);
          }
        });
      } else {
        this.interfaceZoneList = [];
      }
    });
  }
  getZoneList() {
    this.ecl2Service
      .allecl2Zones({ status: AppConstant.STATUS.ACTIVE })
      .subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response) {
          this.ecl2zoneList = response.data;
        } else {
          this.ecl2zoneList = [];
        }
      });
  }
  getNetworkList(condition) {
    this.ecl2Service.allecl2nework(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.networkList = response.data;
      } else {
        this.networkList = [];
      }
    });
  }
  getFirewallPlans(condition) {
    this.ecl2Service.allecl2vasrxplans(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.firewallplanList = response.data;
      } else {
        this.firewallplanList = [];
      }
    });
  }
  securityEntry(event) {
    this.securityzonevisible = false;
  }
  saveOrUpdate(data) {
    this.loading = true;
    this.disabled = true;
    let errorMessage: any;
    if (this.firewallvsrxForm.status === "INVALID" && this.edit === false) {
      this.loading = false;
      this.disabled = false;
      errorMessage = this.commonService.getFormErrorMessage(
        this.firewallvsrxForm,
        this.firewallErrObj
      );
      this.message.remove();
      this.message.error(errorMessage);
      return false;
    } else {
      this.formdata = {
        tenantid: this.userstoragedata.tenantid,
        vsrxname: data.vsrxname,
        availabilityzone: data.zoneid.zonename.substring(
          4,
          data.zoneid.zonename.length
        ),
        vsrxplanid: data.vsrxplanid.vsrxplanid,
        ecl2vsrxplanid: data.vsrxplanid.ecl2vsrxplanid,
        description: data.description,
        zoneid: data.zoneid.zoneid,
        region: data.zoneid.region,
        customerid: data.customerid.customerid,
        ecl2tenantid: data.customerid.ecl2tenantid,
        // status: (data.status === true) ? AppConstant.STATUS.ACTIVE : AppConstant.STATUS.INACTIVE,
        lastupdatedby: this.userstoragedata.fullname,
        lastupdateddt: new Date(),
      };
      if (this.edit === false) {
        this.formdata.interfaces = {
          vsrxinterfacename: data.vsrxinterfacename,
          networkid: data.networkid.networkid,
          ecl2networkid: data.networkid.ecl2networkid,
          ipaddress: data.ipaddress,
          defaultgateway: data.defaultgateway,
          createddt: new Date(),
          createdby: this.userstoragedata.fullname,
          lastupdatedby: this.userstoragedata.fullname,
          lastupdateddt: new Date(),
        };

        let matchingsubnet: any;
        matchingsubnet = _.find(
          data.networkid.ecl2subnets,
          function (item: any) {
            if (item.gatewayip === data.defaultgateway) {
              return item;
            }
          }
        );
        if (!_.isEmpty(matchingsubnet)) {
          let unallocatedupdate: any;
          const allocatedips = [];
          allocatedips.push(data.ipaddress);
          unallocatedupdate = matchingsubnet.unallocatedips;
          let removalip: any;
          removalip = _.remove(unallocatedupdate, function (item: any) {
            if (item === data.ipaddress) {
              return item;
            }
          });
          if (matchingsubnet.enabledhcp === "Y") {
            allocatedips.push(JSON.parse(matchingsubnet.allocationpools).start);
            _.remove(unallocatedupdate, function (item: any) {
              if (item === JSON.parse(matchingsubnet.allocationpools).start) {
                return item;
              }
            });
          }
          this.formdata.ecl2subnets = {
            subnetid: matchingsubnet.subnetid,
            allocatedips: allocatedips,
            unallocatedips: unallocatedupdate,
          };
        }
      }

      if (
        !_.isUndefined(this.vsrxObj) &&
        !_.isUndefined(this.vsrxObj.vsrxid) &&
        !_.isEmpty(this.vsrxObj)
      ) {
        this.formdata.vsrxid = this.vsrxObj.vsrxid;
        this.formdata.ecl2vsrxid = this.vsrxObj.ecl2vsrxid;
        this.ecl2Service.updateecl2vsrx(this.formdata).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.loading = false;
              this.disabled = false;
              response.data.ecl2zones = data.zoneid;
              response.data.ecl2vsrxplan = data.vsrxplanid;
              response.data.customer = data.customerid;
              this.notifyNewEntry.next(response.data);
              this.message.success(response.message);
            } else {
              this.loading = false;
              this.disabled = false;
              this.notificationService.error("Error", response.message, {
                nzStyle: {
                  right: "460px",
                  background: "#fff",
                },
                nzDuration: AppConstant.MESSAGEDURATION,
              });
            }
          },
          (err) => {
            this.loading = false;
            this.disabled = false;
            this.message.error("Sorry! Something gone wrong");
          }
        );
      } else {
        this.formdata.createddt = new Date();
        this.formdata.createdby = this.userstoragedata.fullname;
        this.formdata.status = AppConstant.STATUS.ACTIVE;
        this.ecl2Service.createeclvsrx(this.formdata).subscribe(
          (res) => {
            const response = JSON.parse(res._body);
            if (response.status) {
              this.clearForm();
              this.loading = false;
              this.disabled = false;
              response.data.ecl2zones = data.zoneid;
              response.data.ecl2vsrxplan = data.vsrxplanid;
              response.data.customer = data.customerid;
              _.map(response.data.ecl2vsrxinterface, function (obj: any) {
                if (obj.networkid === data.networkid.networkid) {
                  return (obj.ecl2networks = data.networkid);
                }
              });
              this.notifyNewEntry.next(response.data);
              // this.message.success(response.message);
              this.notificationService.create(
                "info",
                "Firewall Created",
                "Firewall (" +
                  response.data.ecl2vsrxid +
                  ") has set as username : <b>" +
                  response.data.username +
                  "</b> and password : <b>" +
                  response.data.password +
                  "</b> Do not forget write down these",
                {
                  nzStyle: {
                    right: "460px",
                  },
                  nzDuration: 0,
                }
              );
            } else {
              this.loading = false;
              this.disabled = false;
              this.notificationService.error("Error", response.message, {
                nzStyle: {
                  right: "460px",
                  background: "#fff",
                },
                nzDuration: AppConstant.MESSAGEDURATION,
              });
            }
          },
          (err) => {
            this.loading = false;
            this.disabled = false;
            this.message.error("Sorry! Something gone wrong");
          }
        );
      }
    }
  }

  getTagValues() {
    this.tagValueService
      .all({
        resourceid: Number.isInteger(this.vsrxObj.vsrxid)
          ? this.vsrxObj.vsrxid
          : Number(this.vsrxObj.vsrxid),
        resourcetype: AppConstant.TAGS.TAG_RESOURCETYPES[6],
        status: AppConstant.STATUS.ACTIVE,
      })
      .subscribe(
        (result) => {
          let response = JSON.parse(result._body);
          if (response.status) {
            this.tagsList = this.tagService.prepareViewFormat(response.data);
            this.tags = this.tagService.decodeTagValues(
              response.data,
              "picker"
            );
            this.tagsClone = response.data;
            console.log(this.tagsList);
          } else {
            this.tagsClone = [];
            this.tags = [];
            this.tagsList = [];
            // this.message.error(response.message);
          }
        },
        (err) => {
          // this.message.error('Unable to get tag group. Try again');
        }
      );
  }

  updateTags() {
    let formdata = {
      tenantid: this.userstoragedata.tenantid,
      region: this.ecl2firewallvsrxForm.value.zoneid.region,
      ecl2tenantid: this.ecl2firewallvsrxForm.value.customerid.ecl2tenantid,
      lastupdatedby: this.userstoragedata.fullname,
      lastupdateddt: new Date(),
    };

    formdata["vsrxid"] = this.vsrxObj.vsrxid;
    formdata["ecl2vsrxid"] = this.vsrxObj.ecl2vsrxid;

    let tagsobj = {};

    this.tagsClone.forEach((o) => {
      tagsobj[o["tag"]["tagname"]] = o["tagvalue"];
    });

    formdata["tags"] = tagsobj;

    this.ecl2Service.updateecl2vsrx(formdata).subscribe(
      (res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.tagValueService.bulkupdate(this.tagsClone).subscribe(
            (result) => {
              let response = JSON.parse(result._body);
              if (response.status) {
                this.loading = false;
                this.message.info(response.message);
              } else {
                this.loading = false;
                this.message.error(response.message);
              }
            },
            (err) => {
              this.loading = false;
              this.message.error("Unable to remove tag. Try again");
            }
          );
        } else {
          this.loading = false;
          this.disabled = false;
          this.notificationService.error("Error", response.message, {
            nzStyle: {
              right: "460px",
              background: "#fff",
            },
            nzDuration: AppConstant.MESSAGEDURATION,
          });
        }
      },
      (err) => {
        this.loading = false;
        this.disabled = false;
        this.message.error("Sorry! Something gone wrong");
      }
    );
  }

  tagDrawerChanges(e) {
    this.tagPickerVisible = false;
  }

  onTagChangeEmit(e: any) {
    if (e["mode"] == "combined") {
      this.tagPickerVisible = false;
      this.tagsClone = e.data;
      this.tagsList = this.tagService.prepareViewFormat(e.data);
    }
  }
}
