import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import { DatePipe } from "@angular/common";
import { AppConstant } from "src/app/app.constant";
import { CicdService } from "../cicd.service";
import * as _ from "lodash";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-pipeline-template",
  templateUrl: "./pipeline-template.component.html",
  styleUrls: ["./pipeline-template.component.css"],
})
export class PipelineTemplateComponent implements OnInit {
  visible = false;
  searchText: string;
  status = AppConstant.CICD.status;
  pipelineName: string = "";
  selectedDate: Date[] = [];
  selectedStatus: string = null;
  userstoragedata = {} as any;
  templateList = [];
  screens = [];
  appScreens = {} as any;
  loading = false;
  totalCount;
  limit = 10;
  offset = 0;
  order = ["lastupdateddt", "desc"];
  pageIndex = 1;
  filterValues: any = {};
  isVisible = false;
  isEncrypted: boolean = false;
  isLimitChnaged: boolean = false;
  isdownload = false;
  tableHeader = [
    {
      field: "pipelinename",
      header: "Pipeline Name",
      datatype: "string",
      isdefault: true, 
      isfilter: true,
    },
    {
      field: "createdby",
      header: "Created By",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    {
      field: "lastupdatedby",
      header: "Updated By",
      datatype: "string",
      isdefault: true,
    },
    {
      field: "lastupdateddt",
      header: "Updated On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "status", header: "Status", datatype: "string", isdefault: true },
  ] as any;
  tableConfig = {
    edit: true,
    view: true,
    delete: false,
    clone: false,
    loading: false,
    apisort: true,
    columnselection: true,
    refresh: true,
    globalsearch: true,
    manualsearch: true,
    pagination: false,
    frontpagination: false,
    manualpagination: false,
    pageSize: 10,
    count: 0,
    scroll: { x: "1000px" },
    title: "",
    tabledownload: false,
    widthConfig: [
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
  defaultTemplateList = [] as any;
  defaulttemplate = null;
  filterableValues = [];
  filterKey;
  showFilter = false;
  filteredValues = {};
  filterSearchModel = "";
  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private httpService: HttpHandlerService,
    private datePipe: DatePipe,
    private routes: ActivatedRoute,
    private cicdService: CicdService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.templateList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.routes.queryParams.subscribe((params) => {
      this.handleQueryParams(params);
    });
    if (this.pageIndex > 1) {
      this.offset = this.calculateOffset(this.pageIndex, this.limit);
    }
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.PIPELINE_TEMPLATE,
    });
    if (_.includes(this.appScreens.actions, "Clone")) {
      this.tableConfig.clone = true;
    }
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader;
    }
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    this.selectedcolumns = [];
    this.selectedcolumns = this.tableHeader.filter((el) => {
      return el.isdefault == true;
    });
  }

  handleQueryParams(params: any) {
    if (this.filterValues.searchtext) {
      this.searchText = this.filterValues.searchtext;
    }
    if (params["page"]) {
      this.pageIndex = parseInt(params["page"]);
    }
    if (params["q"]) {
      this.filterValues = JSON.parse(this.cicdService.decrypt(params["q"]));
      if (
        this.filterValues.pipelinename &&
        this.filterValues.pipelinename !== ""
      ) {
        this.pipelineName = this.filterValues.pipelinename;
      }
      if (this.filterValues.status && this.filterValues.status !== "") {
        this.selectedStatus = this.filterValues.status;
      }
      if (this.filterValues.date && this.filterValues.date.length == 2) {
        this.selectedDate = this.filterValues.date;
      }
    }

    if (params["limit"]) {
      const limit = parseInt(params["limit"]);
      this.tableConfig.pageSize = limit;
      this.limit = limit;
    }
  }

  ngOnInit() {
    this.loading = false;
    this.getAllTemplateList(this.limit, this.offset);
    this.getDefaultTemplate();
  }

  calculateOffset(currentPage: number, limit: number) {
    return (currentPage - 1) * limit;
  }

  getAllTemplateList(limit?, offset?) {
    let query: string =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.PIPELINETEMPLATE.FINDALL;

    const headersString = encodeURIComponent(
      JSON.stringify(this.selectedcolumns)
    );

    query += `?tenantid=${this.userstoragedata.tenantid}&isdefault=0&status=${AppConstant.STATUS.ACTIVE}`;

    if (this.isdownload) {
      query += `&isdownload=true&headers=${headersString}`;
    } else {
      query += `&count=true&limit=${limit || 10}&offset=${offset || 0}`;
    }
    if(this.searchText){
      query += `&searchText=${this.searchText}`
    }
    if (
      Array.isArray(this.filteredValues[this.filterKey]) &&
      this.filteredValues[this.filterKey].length > 0
    ) {
      this.filteredValues[this.filterKey].forEach((value) => {
        if (this.filterKey === "pipelinename") {
          query += `&pipelinename=${value}`;
        }
      });
    }
    if (this.pipelineName && this.pipelineName !== "") {
      query += `&pipelinename=${this.pipelineName}`;
      this.filterValues.pipelinename = this.pipelineName;
    }
    if (this.selectedStatus && this.selectedStatus !== "") {
      query += `&status=${this.selectedStatus}`;
      this.filterValues.status = this.selectedStatus;
    }
    if (this.selectedDate && this.selectedDate.length == 2) {
      const startDate = this.datePipe.transform(
        this.selectedDate[0],
        "yyyy-MM-dd"
      );
      const endDate = this.datePipe.transform(
        this.selectedDate[1],
        "yyyy-MM-dd"
      );
      query += `&startDate=${startDate}&endDate=${endDate}`;
      this.filterValues.date = this.selectedDate;
    }
    this.loading = true;
    this.httpService.GET(query).subscribe(
      (result) => {
        try {
          const response = JSON.parse(result._body);
          if (response.status) {
            if (this.isdownload) {
              const buffer = Buffer.from(response.data.content.data);
              downloadService(buffer, "Pipeline_Template.xlsx");
              this.isdownload = false;
              this.loading = false;
            } else {
              this.handleResponse(response);
            }
          } else {
            this.totalCount = 0;
            this.templateList = [];
            this.loading = false;
          }
        } catch (error) {
          this.templateList = [];
          this.loading = false;
        }
      },
      (error) => {
        this.templateList = [];
        this.loading = false;
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
        },
      });
      this.getAllTemplateList(this.limit, this.offset);
      this.totalCount = response.data.count;
      this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
    } else {
      this.loading = false;
      this.totalCount = response.data.count;
      this.tableConfig.manualpagination = true;
      this.tableConfig.count = "Total Records" + ":" + " " + this.totalCount;
      this.templateList = response.data.rows;
      this.templateList.forEach((k) => {
        k.isEditable = k.status === AppConstant.STATUS.INACTIVE;
        k.isViewable = k.status === AppConstant.STATUS.INACTIVE;
        k.isCloneable = k.status === AppConstant.STATUS.INACTIVE;
      });
    }
  }

  dataChanged(e) {
    if (e.pagination) {
      if (e.pagination.limit > 10) {
        this.limit = e.pagination.limit;
        if (this.pageIndex == 1) {
          this.isLimitChnaged = true;
        }
      }
      const currentPageIndex =
        Math.floor((e.pagination.offset || 0) / e.pagination.limit) + 1;
      if (this.pageIndex !== currentPageIndex || this.isLimitChnaged) {
        this.pageIndex = currentPageIndex;
        this.getAllTemplateList(e.pagination.limit, e.pagination.offset);
        this.isLimitChnaged = false;
      }
      this.router.navigate([], {
        queryParams: {
          page: this.pageIndex,
        },
      });
      this.tableConfig.pageSize = e.pagination.limit;
    } else if (e.edit) {
      const queryParams = this.getQueryParams();
      this.router.navigate(["cicd/pipelinetemplate/update/" + e.data.id], {
        queryParams,
      });
    } else if (e.view) {
      const queryParams = this.getQueryParams();
      this.router.navigate(["cicd/pipelinetemplate/view/" + e.data.id], {
        queryParams,
      });
    } else if (e.clone) {
      const queryParams = this.getQueryParams();
      this.router.navigate(["cicd/pipelinetemplate/copy/" + e.data.id], {
        queryParams,
      });
    } else if (e.download) {
      this.isdownload = true;
      this.getAllTemplateList(this.tableConfig.pageSize, 0);
    } else if(e.refresh){
      this.filteredValues = {};
      this.searchText = null;
      this.getAllTemplateList(this.tableConfig.pageSize, 0);
    }else if (e.filter) {
      this.filterableValues = [];
      this.showFilter = true;
      this.filterKey = e.data.field;
      if (e.data.field == "pipelinename") {
        let query: string =
          AppConstant.API_END_POINT +
          AppConstant.API_CONFIG.API_URL.CICD.PIPELINETEMPLATE.FINDALL;
        query += `?tenantid=${this.userstoragedata.tenantid}&isdefault=0&status=${AppConstant.STATUS.ACTIVE}&count=true`;
        this.httpService.GET(query).subscribe(
          (result) => {
            const response = JSON.parse(result._body);
            if (response.status) {
              this.filterableValues = response.data.rows;
            } else {
              this.filterableValues = [];
            }
          },
          (error) => {
            this.filterableValues = [];
          }
        );
      }
    } else if (e.searchText != "") {
      this.searchText = e.searchText;
      if (e.search) {
        this.getAllTemplateList(this.tableConfig.pageSize, 0);
      }
    }
  }

  createTemplate() {
    this.router.navigate(["cicd/pipelinetemplate/createpipelinetemplate"]);
  }
  getQueryParams(): any {
    let queryParams: any = {
      page: this.pageIndex,
    };
    if (!_.isEmpty(this.filterValues)) {
      if (this.isEncrypted) {
        this.filterValues = this.cicdService.decrypt(this.filterValues);
        this.isEncrypted = false;
      } else {
        this.filterValues = this.cicdService.encrypt(
          JSON.stringify(this.filterValues)
        );
        this.isEncrypted = true;
      }
      queryParams.q = this.filterValues;
    }
    if (this.limit > 10) {
      queryParams.limit = this.limit;
    }
    return queryParams;
  }

  getLastPage(totalRecords: number, recordsPerPage: number): number {
    return Math.ceil(totalRecords / recordsPerPage);
  }

  openModel(): void {
    this.isVisible = true;
  }

  handleCancel($event: MouseEvent): void {
    this.isVisible = false;
  }

  getDefaultTemplate() {
    let query: string =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.PIPELINETEMPLATE.FINDALL;
    query += `?tenantid=${this.userstoragedata.tenantid}&isdefault=1`;
    this.httpService.GET(query).subscribe(
      (result) => {
        try {
          const response = JSON.parse(result._body);
          if (response.status) {
            this.defaultTemplateList = response.data;
          } else {
            this.defaultTemplateList = [];
          }
        } catch (error) {
          this.defaultTemplateList = [];
        }
      },
      (error) => {
        this.defaultTemplateList = [];
      }
    );
  }
  navigateToTemplate(id): void {
    this.isVisible = false;
    const queryParams = this.getQueryParams();
    this.router.navigate([`cicd/pipelinetemplate/defaulttemplate/${id}`], {
      queryParams,
    });
  }
  getFilterValue(event) {
    if (this.filterKey == "pipelinename") {
      if (event) {
        this.filterableValues = this.templateList.filter((el) => {
          return el.pipelinename.toLowerCase().includes(event);
        });
      } else {
        this.filterableValues = this.templateList;
      }
    } 
  }

  setFilterValue(event) {
    this.showFilter = false;
    this.filteredValues[this.filterKey] = event;
    this.getAllTemplateList();
  }
}