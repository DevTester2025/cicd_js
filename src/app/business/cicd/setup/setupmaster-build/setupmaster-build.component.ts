import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import * as moment from "moment";
import { CicdService } from "../../cicd.service";
import * as _ from "lodash";
@Component({
  selector: 'app-setupmaster-build',
  templateUrl: './setupmaster-build.component.html',
  styleUrls: ['./setupmaster-build.component.css']
})
export class SetupmasterBuildComponent implements OnInit {
  @Input() tabIndex: number;
  searchText: string = "";
  visible = false;
  status = AppConstant.CICD.status;
  dateRange: Date[] = null;
  selectedStatus: string = null;
  isVisible: string | null = null;
  userstoragedata = {} as any;
  showTab = 0;
  buildList = [];
  screens = [];
  loading = true;
  totalCount;
  limit = 10;
  offset = 0;
  order = ["lastupdateddt", "desc"];
  pageIndex = 1;
  filterValues: any = {};
  isEncrypted: boolean = false;
  isLimitChnaged: boolean = false;
  params: Params;
  filterableValues = [];
  filterKey;
  filteredValues = {};
  showFilter = false;
  filterSearchModel = "";
  buildtableHeader = [
    { field: "name", header: "Name", datatype: "string", isdefault:true, isfilter:true},
    { field: "instancename", header: "Instance Name", datatype: "string", isdefault:true, isfilter:true },
    { field: "ipaddress", header: "IP Address", datatype: "string", isdefault:true },
    { field: "createdby", header: "Created By", datatype: "string", isdefault:true },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true
    },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault:true },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault:true
    },
    { field: "status", header: "Status", datatype: "string", isdefault:true, isfilter:true },
  ] as any;
  buildtableConfig = {
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
  selectedcolumns = [] as any;

  constructor(
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private httpService: HttpHandlerService,
    private routes: ActivatedRoute,
    private cicdService: CicdService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.buildList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.routes.queryParams.subscribe((params) => {
      this.params = params;
      if (params["tabIndex"] == "2") {
        this.handleQueryParams(params);
      }
    });
    this.selectedcolumns = [];
    this.selectedcolumns = this.buildtableHeader.filter((el) => {
      return el.isdefault == true;
    });
  }

  handleQueryParams(params: Params) {
    if (params['page'] && (parseInt(params['page']) !== this.pageIndex)) {
      this.pageIndex = parseInt(params["page"])
    };
    if (params['q']) {
      this.filterValues = JSON.parse(this.cicdService.decrypt(params['q']));
      if (this.filterValues.searchtext) {
        this.searchText = this.filterValues.searchtext;
      }
      if (this.filterValues.date && this.filterValues.date.length === 2) {
        this.dateRange = this.filterValues.date;
      }
      if (this.filterValues.Status) {
        this.selectedStatus = this.filterValues.status;
      }
    };
    if (params['limit'] && (parseInt(params['limit']) !== this.limit)) {
      const limit = parseInt(params['limit'])
      this.buildtableConfig.pageSize = limit;
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

  ngOnInit() {
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tabIndex) {
      if (changes.tabIndex.currentValue == 2) {
        this.getAllList(this.limit, this.offset);
      }
    }
  }

  calculateOffset(currentPage: number, limit: number) {
    return (currentPage - 1) * limit;
  }

  addBuild() {
    this.router.navigate(["cicd/setup/build/create"]);
  }

  getAllList(limit?, offset?) {
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
        if (this.filterKey === "instancename") {
          queryParams.set("instancename", value);
        } else if (this.filterKey === "name") {
          queryParams.set("name", value);
        }else if (this.filterKey === "status") {
          queryParams.set("status", value);
        } 
      });
    }
    if (this.searchText != null) {
      queryParams.set("searchText", this.searchText);
      this.filterValues.searchtext = this.searchText;
    }
    if (this.dateRange && this.dateRange.length === 2) {
      queryParams.set(
        "startDate",
        moment(this.dateRange[0]).format("YYYY-MM-DD")
      );
      queryParams.set(
        "endDate",
        moment(this.dateRange[1]).format("YYYY-MM-DD")
      );
      this.filterValues.date = this.dateRange;
    }
    if (this.selectedStatus) {
      queryParams.set("status", this.selectedStatus);
      this.filterValues.status = this.selectedStatus;
    } else {
      queryParams.set("status", AppConstant.STATUS.ACTIVE);
    }


    let query =
      `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.BUILD.FINDALL
      }?${queryParams.toString()}` + `&order=${this.order}`;
    this.loading = true;

    this.httpService.GET(query).subscribe(
      (result) => {
        try {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.handleResponse(response);
          } else {
            this.loading = false;
            this.totalCount = 0;
            this.buildList = [];
          }
        } catch (error) {
          this.loading = false;
          this.totalCount = 0;
          this.buildList = [];
        }
      },
      (error) => {
        this.loading = false;
        this.totalCount = 0;
        this.buildList = [];
      }
    );
  }

  handleResponse(response: any) {
    if (response.data.rows.length == 0) {
      this.pageIndex = this.getLastPage(response.data.count, this.limit);
      this.offset = this.calculateOffset(this.pageIndex, this.limit);
      this.router.navigate([], {
        queryParams: {
          page: this.pageIndex,
          tabIndex: 2,
        },
      });
      this.getAllList(this.limit, this.offset);
    } else {
      this.loading = false;
      this.buildtableConfig.manualpagination = true;
      this.totalCount = response.data.count;
      this.buildtableConfig.count =
        "Total Records" + ":" + " " + this.totalCount;
      this.buildList = response.data.rows;
      this.buildList.forEach((k) => {
        k.isEditable = k.status === AppConstant.STATUS.INACTIVE;
        k.isDeletable = k.status === AppConstant.STATUS.INACTIVE;
      });
    }
  }

  dataChanged(result) {
    if (this.params['tabIndex'] == '2') {
      if (result.edit) {
        const queryParams = this.getQueryParams();
        this.router.navigate(["cicd/setup/build/update/", result.data.id], {
          queryParams
        });
      }
      if (result.delete) {
        this.deleteBuild(result.data.id);
      }
      if (result.order) {
        this.order = result.order;
        this.getAllList(this.buildtableConfig.pageSize, 0);
      }
      if (result.pagination) {
        this.handlePagination(result);
      }
      if (result.searchText != "") {
        this.searchText = result.searchText;
        if (result.search) {
          this.getAllList(this.buildtableConfig.pageSize, 0);
        }
      }
      if(result.refresh){
        this.filteredValues = {};
        this.searchText = null;
        this.getAllList(this.buildtableConfig.pageSize, 0);
      }
      if (result.filter) {
        this.filterableValues = [];
        this.showFilter = true;
        this.filterKey = result.data.field;
        if (result.data.field == "name" || result.data.field == "instancename" || result.data.field == "status") {
          let queryParams = new URLSearchParams();
          queryParams.set("tenantid", this.userstoragedata.tenantid);
          queryParams.set("status", AppConstant.STATUS.ACTIVE);
          let query =
            `${AppConstant.API_END_POINT}${
              AppConstant.API_CONFIG.API_URL.CICD.SETUP.BUILD.FINDALL
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
    };
  };

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
      this.getAllList(result.pagination.limit, result.pagination.offset);
      this.isLimitChnaged = false;
    }
    this.buildtableConfig.pageSize = result.pagination.limit;
  }

  deleteBuild(id: number) {
    this.loading = true;
    const query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.SETUP.BUILD.DELETE
      }${id}?lastUpdatedBy=${encodeURIComponent(this.userstoragedata.fullname)}`;
    this.httpService.DELETE(query).subscribe(
      (result) => {
        setTimeout(() => {
          this.loading = false;
        }, 250);
        this.getAllList(this.limit, this.offset);
        this.message.success(JSON.parse(result._body).message);
      },
      (error) => {
        setTimeout(() => {
          this.loading = false;
        }, 250);
        this.getAllList(this.limit, this.offset);
        console.log("Error, Try again later", error);
      }
    );
  }
  getFilterValue(event) {
    if (event && (this.filterKey === "name" || this.filterKey === "instancename" || this.filterKey === "status")) {
      this.filterableValues = this.buildList.filter((el) => 
        el.name.toLowerCase().includes(event)
      );
    } else {
      this.filterableValues = this.buildList;
    }
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getAllList();
  }

  getQueryParams(): any {
    let queryParams: any = {
      page: this.pageIndex,
      tabIndex: 2
    };
    if (!_.isEmpty(this.filterValues)) {
      if (this.isEncrypted) {
        this.filterValues = this.cicdService.decrypt(this.filterValues);
        this.isEncrypted = false;
      } else {
        this.filterValues = this.cicdService.encrypt(JSON.stringify(this.filterValues));
        this.isEncrypted = true;
      }
      queryParams.q = this.filterValues;
    };
    if (this.limit > 10) {
      queryParams.limit = this.limit;
    }
    return queryParams;
  }

  getLastPage(totalRecords: number, recordsPerPage: number): number {
    return Math.ceil(totalRecords / recordsPerPage);
  }

}
