import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import * as _ from "lodash";

@Component({
  selector: "app-setupmaster-environments",
  templateUrl: "./setupmaster-environments.component.html",
  styleUrls: ["./setupmaster-environments.component.css"],
})
export class SetupmasterEnvironmentsComponent implements OnInit {
  @Input() tabIndex: number;
  visible: { [key: string]: boolean } = {};
  isVisible: string | null = null;
  userstoragedata = {} as any;
  showTab = 0;
  vmList = [];
  variableList = [];
  instanceList = [];
  screens = [];
  loading = true;
  totalCount;
  totalCountVirtualMachine;
  limit = 10;
  offset = 0;
  order = ["lastupdateddt", "desc"];
  pageIndex = 1;
  mode: string = "";
  isLimitChnaged: boolean = false;
  searchText: string = "";
  filterableValues = [];
  filterKey;
  showFilter = false;
  filteredValues = {};
  filterSearchModel = "";
  virtualmachinetableHeader = [
    { field: "instancename", header: "Instance Name", datatype: "string", isdefault:true, isfilter:true },
    { field: "ipaddress", header: "IP Address", datatype: "string", isdefault:true  },
    {
      field: "authenticationtype",
      header: "Authentication type",
      datatype: "string",
      isdefault:true, isfilter:true
    },
    { field: "createdby", header: "Created By", datatype: "string", isdefault:true },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true 
    },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault:true  },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true 
    },
    { field: "status", header: "Status", datatype: "string", isdefault:true  },
  ] as any;
  virtualmachinetableConfig = {
    edit: true,
    delete: true,
    loading: false,
    apisort: true,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    columnselection: true,
    pageSize: 10,
    count: 0,
    refresh: true,
    globalsearch: true,
    manualsearch: true,
    scroll: { x: "1400px" },
    title: "",
    widthConfig: [
      "100px",
      "200px",
      "100px",
      "200px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
    ],
  } as any;
  variabletableHeader = [
    { field: "keyname", header: "Key Name", datatype: "string", isdefault:true, isfilter:true  },
    { field: "environment", header: "Environment", datatype: "string", isdefault:true, isfilter:true  },
    { field: "variabletype", header: "Variable Type", datatype: "string", isdefault:true, isfilter:true  },
    { field: "createdby", header: "Created By", datatype: "string", isdefault:true  },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true 
    },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault:true  },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true 
    },
    { field: "status", header: "Status", datatype: "string", isdefault:true  },
  ] as any;
  variabletableConfig = {
    edit: true,
    delete: true,
    loading: false,
    apisort: true,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    columnselection: true,
    pageSize: 10,
    count: 0,
    refresh: true,
    globalsearch: true,
    manualsearch: true,
    scroll: { x: "1300px" },
    title: "",
    widthConfig: [
      "100px",
      "300px",
      "100px",
      "200px",
      "100px",
      "100px",
      "100px",
    ],
  } as any;
  selectedcolumns = [] as any;

  constructor(
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private httpService: HttpHandlerService,
    private routes: ActivatedRoute
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.vmList = [];
    this.variableList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.routes.queryParams.subscribe((params) => {
      if (params["tabIndex"] == "4") {
        this.handleQueryParams(params);
      };
    });
    this.selectedcolumns = [];
    this.selectedcolumns = this.variabletableHeader.filter((el) => {
      return el.isdefault == true;
    });
    this.selectedcolumns = [];
    this.selectedcolumns = this.virtualmachinetableHeader.filter((el) => {
      return el.isdefault == true;
    });
  }

  handleQueryParams(params: Params) {
    if (params['page'] && (parseInt(params['page']) !== this.pageIndex)) {
      this.pageIndex = parseInt(params['page'])
    };
    if (params['mode']) {
      if (params['mode'] == 'VARIABLE') {
        this.showTable('variabletable');
      } else {
        this.showTable('virtualmachinetable');
      };
    }
    if (params['limit'] && (parseInt(params['limit']) !== this.limit)) {
      const limit = parseInt(params['limit'])
      this.variabletableConfig.pageSize = limit;
      this.limit = limit;
    };
    if (this.pageIndex > 1) {
      this.offset = this.calculateOffset(this.pageIndex, this.limit);
    };
    this.removeQueryParam();
  }

  removeQueryParam() {
    const currentParams = { ...this.routes.snapshot.queryParams };
    const filteredParams = {};
    if (currentParams.hasOwnProperty('tabIndex')) {
      filteredParams['tabIndex'] = currentParams['tabIndex'];
    }
    this.router.navigate([], {
      relativeTo: this.routes,
      queryParams: filteredParams,
      queryParamsHandling: ''
    });
  }

  showTable(tableId: string): void {
    if (this.visible[tableId]) {
      this.visible[tableId] = false;
    } else {
      _.forOwn(this.visible, (value, key) => {
        this.visible[key] = false;
      });
      this.visible[tableId] = true;
    }
  }

  calculateOffset(currentPage: number, limit: number) {
    return (currentPage - 1) * limit;
  }

  ngOnInit() {
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tabIndex) {
      if (changes.tabIndex.currentValue == 4) {
        this.getAllList();
        this.getAllCustomVariablesList(this.limit, this.offset);
      }
    }
  }

  addEnvironment(environmentType: string): void {
    this.router.navigate(["cicd/setup/environments/create"], {
      queryParams: { type: environmentType },
    });
  }

  addCustomVariable() {
    this.router.navigate(["cicd/setup/customvariable/create"]);
  }

  getAllList() {
    this.loading = true;
    let queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    queryParams.set("status", AppConstant.STATUS.ACTIVE);
    if (
      Array.isArray(this.filteredValues[this.filterKey]) &&
      this.filteredValues[this.filterKey].length > 0
    ) {
      this.filteredValues[this.filterKey].forEach((value) => {
        if (this.filterKey === "authenticationtype") {
          queryParams.set("authenticationtype", value);
        } else if (this.filterKey === "instancename") {
          queryParams.set("instancename", value);
        }
      });
    }
    if (this.searchText != null) {
      queryParams.set("searchText",this.searchText)
    }
    let query =
      `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.ENVIRONMENTS.FINDALL
      }?${queryParams.toString()}` + `&order=${this.order}`;
    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      try {
        const response = JSON.parse(result._body);
        if (response.status) {
          this.loading = false;
          this.vmList = response.data.VIRTUAL_MACHINE ? response.data.VIRTUAL_MACHINE : [];
          this.virtualmachinetableConfig.manualpagination = true;
          this.totalCountVirtualMachine = this.vmList.length;
          this.virtualmachinetableConfig.count = "Total Records" + ":" + " " + this.totalCountVirtualMachine;
          _.map(this.vmList, (vm: any) => {
            if (vm.ipaddressisvariable) {
              vm.ipaddress = vm.ipaddressvariable;
            }
            if (vm.usernameisvariable) {
              vm.username = vm.usernamevariable;
            }
            if (vm.passwordisvariable) {
              vm.password = vm.passwordvariable;
            }
          });
        } else {
          this.loading = false;
          this.vmList = [];
        }
      } catch (error) {
        this.loading = false;
        this.vmList = [];
      }
    }, (error) => {
      this.loading = false;
      this.vmList = [];
    });
  }
  getAllCustomVariablesList(limit?, offset?) {
    this.loading = true;
    let queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    queryParams.set("status", AppConstant.STATUS.ACTIVE);
    queryParams.set("count", "true");
    queryParams.set("limit", limit || 0);
    queryParams.set("offset", offset || 0);
    if (
      Array.isArray(this.filteredValues[this.filterKey]) &&
      this.filteredValues[this.filterKey].length > 0
    ) {
      this.filteredValues[this.filterKey].forEach((value) => {
        if (this.filterKey === "variabletype") {
          queryParams.set("variabletype", value);
        } else if (this.filterKey === "environment") {
          queryParams.set("environment", value);
        } else if (this.filterKey === "keyname") {
          queryParams.set("keyname", value);
        }
      });
    }
    if (this.searchText != null) {
      queryParams.set("searchText",this.searchText)
    }
    let query =
      `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.CUSTOM_VARIABLES.FINDALL
      }?${queryParams.toString()}` + `&order=${this.order}`;
    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      const response = JSON.parse(result._body);
      if (response.status) {
        this.loading = false;
        this.variabletableConfig.manualpagination = true;
        this.totalCount = response.data.count;
        this.variabletableConfig.count = "Total Records" + ":" + " " + this.totalCount;
        this.variableList = response.data.rows;
        this.variableList.forEach(variable => {
          variable.isEditable = variable.variabletype === AppConstant.CICD.TYPE.provider;
        });
      } else {
        this.loading = false;
        this.totalCount = 0;
        this.variableList = [];
      }
    });
  }

  dataChanged(result) {
    if (result.edit) {
      const environmentType = result.data.type;
      const environmentId = result.data.id;
      this.router.navigate(["cicd/setup/environments/update/", environmentId], {
        queryParams: { type: environmentType },
      });
    }
    if (result.delete) {
      this.deleteEnvironment(result.data.id);
    }
    if (result.order) {
      this.order = result.order;
      this.getAllList();
    }
    if (result.searchText != "") {
      this.searchText = result.searchText;
      if (result.search) {
        this.getAllList();
      }
    }
    if(result.refresh){
      this.filteredValues = {};
      this.searchText = null;
      this.getAllList();
    }
    if (result.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = result.data.field;
      if (result.data.field == "instancename" || result.data.field == "authenticationtype") {
        let queryParams = new URLSearchParams();
        queryParams.set("tenantid", this.userstoragedata.tenantid);
        queryParams.set("status", AppConstant.STATUS.ACTIVE);
        let query =
          `${AppConstant.API_END_POINT}${
            AppConstant.API_CONFIG.API_URL.CICD.SETUP.ENVIRONMENTS.FINDALL
          }?${queryParams.toString()}` + `&order=${this.order}`;
        this.httpService.GET(query).subscribe((result) => {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.filterableValues = response.data.VIRTUAL_MACHINE
              ? response.data.VIRTUAL_MACHINE
              : [];
          } else {
            this.filterableValues = [];
          }
        });
      }
    }
  }
  variableDataChanged(result) {
    if (result.edit) {
      if (result.data.variabletype !== 'PROVIDER') {
        const queryParams = this.getQueryParams();
        this.router.navigate(["cicd/setup/customvariable/update/", result.data.id], {
          queryParams
        });
      }
    }
    if (result.delete) {
      if (result.data.variabletype !== 'PROVIDER') {
        this.deleteCustomVariable(result.data.id);
      }
    }
    if (result.order) {
      this.order = result.order;
      this.getAllCustomVariablesList(this.variabletableConfig.pageSize, 0);
    }
    if (result.pagination) {
      this.handlePagination(result);
    }
    if (result.searchText != "") {
      this.searchText = result.searchText;
      if (result.search) {
        this.getAllCustomVariablesList(this.variabletableConfig.pageSize, 0);
      }
    }
    if(result.refresh){
      this.filteredValues = {};
      this.searchText = null;
      this.getAllCustomVariablesList(this.variabletableConfig.pageSize, 0);
    }
    if (result.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = result.data.field;
      if (result.data.field == "variabletype" || result.data.field == "environment" || result.data.field == "keyname") {
        let queryParams = new URLSearchParams();
        queryParams.set("tenantid", this.userstoragedata.tenantid);
        queryParams.set("status", AppConstant.STATUS.ACTIVE);
        let query =
          `${AppConstant.API_END_POINT}${
            AppConstant.API_CONFIG.API_URL.CICD.SETUP.CUSTOM_VARIABLES.FINDALL
          }?${queryParams.toString()}` + `&order=${this.order}`;
        this.httpService.GET(query).subscribe((result) => {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.filterableValues = response.data.rows;
          } else {
            this.filterableValues = [];
          }
        });
      }
    }
  }

  handlePagination(result: any) {
    if (result.pagination.limit !== this.limit) {
      this.limit = result.pagination.limit;
      if (this.pageIndex == 1) {
        this.isLimitChnaged = true;
      };
    };
    const currentPageIndex = Math.floor((result.pagination.offset || 0) / result.pagination.limit) + 1;
    if ((this.pageIndex !== currentPageIndex) || this.isLimitChnaged) {
      this.pageIndex = currentPageIndex;
      this.getAllCustomVariablesList(result.pagination.limit, result.pagination.offset);
      this.isLimitChnaged = false;
    }
    this.variabletableConfig.pageSize = result.pagination.limit;
  };

  deleteEnvironment(id: number) {
    this.loading = true;
    const query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.ENVIRONMENTS.DELETE
      }${id}?lastUpdatedBy=${encodeURIComponent(this.userstoragedata.fullname)}`;
    this.httpService.DELETE(query).subscribe(
      (result) => {
        setTimeout(() => {
          this.loading = false;
        }, 250);
        this.getAllList();
        this.message.success(JSON.parse(result._body).message);
      },
      (error) => {
        setTimeout(() => {
          this.loading = false;
        }, 250);
        this.getAllList();
        console.log("Error, Try again later", error);
      }
    );
  }

  getFilterValue(event) {
    if (event && (this.filterKey === "authenticationtype" || this.filterKey === "instancename")) {
      this.filterableValues = this.vmList.filter((el) => 
        el.name.toLowerCase().includes(event)
      );
    } else {
      this.filterableValues = this.vmList;
    }
    if (event && (this.filterKey === "environment" || this.filterKey === "keyname" || this.filterKey == "variabletype")) {
      this.filterableValues = this.variableList.filter((el) => 
        el.name.toLowerCase().includes(event)
      );
    } else {
      this.filterableValues = this.variableList;
    }
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    if (this.filterKey == "authenticationtype" || this.filterKey == "instancename") {
      this.getAllList();
    }
    if (this.filterKey == "environment" || this.filterKey == "keyname"|| this.filterKey == "variabletype" ) {
      this.getAllCustomVariablesList(this.variabletableConfig.pageSize, 0);
    }
  }
  deleteCustomVariable(id: number) {
    this.loading = true;
    const query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.CUSTOM_VARIABLES.DELETE
      }${id}?lastUpdatedBy=${encodeURIComponent(this.userstoragedata.fullname)}`;
    this.httpService.DELETE(query).subscribe(
      (result) => {
        setTimeout(() => {
          this.loading = false;
        }, 250);
        this.getAllCustomVariablesList(this.limit, this.offset);
        this.message.success(JSON.parse(result._body).message);
      },
      (error) => {
        setTimeout(() => {
          this.loading = false;
        }, 250);
        this.getAllCustomVariablesList();
        console.log("Error, Try again later", error);
      }
    );
  }

  getQueryParams(): any {
    let queryParams: any = {
      page: this.pageIndex,
      tabIndex: 4
    };
    if (this.limit > 10) {
      queryParams.limit = this.limit;
    }
    return queryParams;
  }

}
