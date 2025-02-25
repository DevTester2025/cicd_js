import { Component, OnInit } from "@angular/core";
import { NzMessageService, NzModalService } from "ng-zorro-antd";
import { AppConstant } from "src/app/app.constant";
import { LocalStorageService } from "src/app/modules/services/shared/local-storage.service";
import { ReleasesService } from "../releases.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpHandlerService } from "src/app/modules/services/http-handler.service";
import * as moment from "moment";
import { CicdService } from "../../cicd.service";
import * as _ from "lodash";
import { SrmService } from "src/app/business/srm/srm.service";
import downloadService from "src/app/modules/services/shared/download.service";
import { Buffer } from "buffer";
@Component({
  selector: "app-releases-list",
  templateUrl: "./releases-list.component.html",
  styleUrls: ["./releases-list.component.css"],
})
export class ReleasesListComponent implements OnInit {
  searchText: string;
  visible = false;
  status = AppConstant.CICD.status;
  schedule = AppConstant.CICD.schedule;
  selectedTemplate: string = null;
  dateRange: Date[] = null;
  selectedSchedule: string = null;
  selectedStatus: string = null;
  userstoragedata = {} as any;
  showTab = 1;
  releasesList = [];
  templateList = [];
  isVisible = false;
  screens = [];
  loading = true;
  createScript = false;
  totalCount;
  limit = 10;
  offset = 0;
  order = ["lastupdateddt", "desc"];
  pageIndex: number = 1;
  tabIndex: number = 1;
  filterValues: any = {};
  isEncrypted: boolean = false;
  isLimitChnaged: boolean = false;
  formData = {} as any;
  isdownload = false;
  tableHeader = [
    { field: "name", header: "Name", datatype: "string", isdefault: true },
    { field: "template.pipelinename", header: "Template", datatype: "string", isdefault: true },
    { field: "schedule", header: "Schedule", datatype: "string", isdefault: true },
    { field: "scheduleon", header: "Schedule On", datatype: "string", isdefault: true },
    { field: "createdby", header: "Created By", datatype: "string", isdefault: true },
    {
      field: "createddt",
      header: "Created On",
      datatype: "timestamp",
      format: "dd-MMM-yyyy hh:mm:ss",
      isdefault: true,
    },
    { field: "lastupdatedby", header: "Updated By", datatype: "string", isdefault: true },
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
    execute: true,
    edit: true,
    delete: true,
    loading: false,
    apisort: true,
    pagination: false,
    frontpagination: false,
    columnselection: true,
    manualpagination: false,
    pageSize: 10,
    count: 0,
    scroll: { x: "1300px" },
    title: "",
    publish: true,
    widthConfig: [
      "100px",
      "100px",
      "100px",
      "100px",
      "200px",
      "100px",
      "100px",
      "100px",
      "100px",
      "100px",
    ],
    tabledownload: false,
  } as any;
  selectedcolumns = [] as any;
  appScreens = {} as any;

  constructor(
    private message: NzMessageService,
    private localStorageService: LocalStorageService,
    private releasesService: ReleasesService,
    private modalService: NzModalService,
    private router: Router,
    private httpService: HttpHandlerService,
    private routes: ActivatedRoute,
    private cicdService: CicdService,
    private srmService: SrmService,
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.releasesList = [];
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.routes.queryParams.subscribe((params) => {
      this.tabIndex = params['tabIndex'];
      if (this.tabIndex == 1) {
        this.pageIndex = parseInt(params["page"]) || this.pageIndex;
        if (params['q']) {
          this.handeQueryParams(params);
        };
        if (params['limit']) {
          const limit = parseInt(params['limit'])
          this.tableConfig.pageSize = limit;
          this.limit = limit;
        };
      }
    });
    if (this.pageIndex > 1) {
      this.offset = this.calculateOffset(this.pageIndex, this.limit);
    }
    if (this.tableHeader && this.tableHeader.length > 0) {
      this.selectedcolumns = this.tableHeader
    }
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.RELEASES,
    });
    if (_.includes(this.appScreens.actions, "Download")) {
      this.tableConfig.tabledownload = true;
    }
    const isdefault = true;
    this.selectedcolumns = this.tableHeader.filter((el) => el.isdefault === isdefault);
  }

  handeQueryParams(params: any) {
    this.filterValues = JSON.parse(this.cicdService.decrypt(params['q']));
    if (this.filterValues.searchtext) {
      this.searchText = this.filterValues.searchtext;
    }
    if (this.filterValues.date && this.filterValues.date.length == 2) {
      this.dateRange = this.filterValues.date;
    }
    if (this.filterValues.status) {
      this.selectedStatus = this.filterValues.status;
    }
    if (this.filterValues.template) {
      this.selectedTemplate = this.filterValues.template;
    }
    if (this.filterValues.schedule) {
      this.selectedSchedule = this.filterValues.schedule;
    }
  };

  ngOnInit() {
    this.loading = false;
    this.getAllList(this.limit, this.offset);
  }

  calculateOffset(currentPage: number, limit: number) {
    return (currentPage - 1) * limit;
  }

  getAllList(limit?, offset?) {
    let queryParams = this.buildQueryParams(limit, offset);
    if (this.order && this.order[0] === "template.pipelinename") {
      this.order[0] = "template,pipelinename";
    }
    let query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.RELEASES.RELEASECONFIG}`;
    const headersString = encodeURIComponent(JSON.stringify(this.selectedcolumns));
    if (this.isdownload) {
        query += `?isdownload=${this.isdownload}&tenantid=${this.userstoragedata.tenantid}&headers=${headersString}`;
    }
    else{
      query += `?${queryParams.toString()}&order=${this.order}`;
    }
    this.loading = true;
    this.httpService.GET(query).subscribe((result) => {
      try {
        this.handleResponse(result);
      } catch (error) {
        this.releasesList = [];
        this.loading = false;
      }
    }, (error) => {
      this.releasesList = [];
      this.loading = false;
    });
  }
  buildQueryParams(limit, offset) {
    let queryParams = new URLSearchParams();
    queryParams.set("tenantid", this.userstoragedata.tenantid);
    queryParams.set("count", "true");
    queryParams.set("limit", limit || 0);
    queryParams.set("offset", offset || 0);
    queryParams.set("status", AppConstant.STATUS.ACTIVE);
    if (this.searchText) {
      queryParams.set("searchText", this.searchText);
      this.filterValues.searchtext = this.searchText;
    }
    if (this.dateRange && this.dateRange.length === 2) {
      queryParams.set("startdate", moment(this.dateRange[0]).format("YYYY-MM-DD"));
      queryParams.set("enddate", moment(this.dateRange[1]).format("YYYY-MM-DD"));
      this.filterValues.date = this.dateRange;
    }
    if (this.selectedStatus) {
      queryParams.set("status", this.selectedStatus);
      this.filterValues.status = this.selectedStatus;
    }
    if (this.selectedTemplate) {
      queryParams.set("templateid", this.selectedTemplate);
      this.filterValues.template = this.selectedTemplate;
    }
    if (this.selectedSchedule) {
      queryParams.set("schedule", this.selectedSchedule);
      this.filterValues.schedule = this.selectedSchedule;
    }
    return queryParams;
  }
  handleResponse(result) {
    const response = JSON.parse(result._body);
    this.loading = false;
    if (response.status) {
      if (this.isdownload) {
        console.log(response.data)
          const buffer = Buffer.from(response.data.content.data);
          downloadService(buffer, "Releases_List.xlsx");
          this.isdownload = false;
        this.loading = false;
      }
      else if (response.data.rows.length == 0 && !this.filterValues) {
        this.pageIndex = this.getLastPage(response.data.count, this.limit);
        this.offset = this.calculateOffset(this.pageIndex, this.limit);
        this.router.navigate([], {
          queryParams: {
            page: this.pageIndex,
            tabIndex: this.tabIndex,
          },
        });
        this.getAllList(this.limit, this.offset);
      } else {
        this.loading = false;
        this.processResponseData(response.data);
      }
    } else {
      this.totalCount = 0;
      this.releasesList = [];
    }
  }
  processResponseData(data) {
    this.tableConfig.manualpagination = true;
    this.totalCount = data.count;
    this.tableConfig.count = `Total Records: ${this.totalCount}`;
    this.releasesList = data.rows;
    this.releasesList.forEach(release => {
      this.updateTableConfig(release);
    });
  }
  updateTableConfig(release) {
    const inActive = release.status === AppConstant.STATUS.INACTIVE;
    release.isEditable = inActive;
    release.isExecutable = inActive;
    release.isDeletable = inActive;
  }

  getAllTemplateList() {
    let query: any =
      AppConstant.API_END_POINT +
      AppConstant.API_CONFIG.API_URL.CICD.PIPELINETEMPLATE.FINDALL +
      `?tenantid=${this.userstoragedata.tenantid}`;
    this.httpService.GET(query).subscribe((result) => {
      try {
        const response = JSON.parse(result._body);
        if (response.status) {
          this.templateList = response.data;
        } else {
          this.templateList = [];
        }
      } catch (error) {
        this.templateList = [];
        this.loading = false;
      }
    });
  }

  dataChanged(result) {
    if (result.edit) {
      const queryParams = this.getQueryParams();
      this.router.navigate(["cicd/release/update/", result.data.id], {
        queryParams
      });
    } else if (result.execute) {
      this.workflowtrigger(result)
    }
    if (result.delete) {
      this.deleteRelease(result.data.id);
    }
    if (result.pagination) {
      this.handleTablePagination(result);
    }
    if (result.searchText != "") {
      this.searchText = result.searchText;
      if (result.search) {
        this.getAllList(this.tableConfig.pageSize, 0);
      }
    }
    if(result.download){
      this.isdownload = true;
      this.getAllList(this.tableConfig.pageSize, 0);
    }
    if (result.order) {
      this.order = result.order;
      this.getAllList(this.tableConfig.pageSize, 0);
    }
    if (result.publish) {
      if (result.data.catalog && result.data.catalog.publishstatus === 'Published') {
        this.modalService.confirm({
          nzTitle: 'Are you sure you want to unpublish?',
          nzOkText: 'Yes',
          nzOkType: 'primary',
          nzOnOk: () => {
            const formdata = new FormData();
            this.formData.catalogid = result.data.catalog.catalogid;
            this.formData.publishstatus = AppConstant.STATUS.DELETED;
            this.formData.referenceid = result.data.referenceid;
            this.formData.tenantid = this.userstoragedata.tenantid;
            this.formData.lastupdatedby = this.userstoragedata.fullname;
            this.formData.lastupdateddt = new Date();
            this.formData.status = AppConstant.STATUS.DELETED;
            formdata.append("formData", JSON.stringify(this.formData));
            this.srmService.updateCatalog(formdata).subscribe((result)=> {
              let response =  JSON.parse(result._body);
              if (response.status) {
                this.message.success(response.message);
                this.getAllList();
              } else {
                this.message.error(response.message);
              }
            })
          },
          nzCancelText: 'No',
          nzOnCancel: () => console.log('Cancel')
        });
      } else {
      this.modalService.confirm({
        nzTitle: 'Are you sure you want to publish?',
        nzOkText: 'Yes',
        nzOkType: 'primary',
        nzOnOk: () => {
          this.router.navigate(["srm/catalog/create"], {
            queryParams: {
              referencetype: "CICD",
              referenceid: result.data.id,
              servicename: result.data.name,
            },
          });
        },
        nzCancelText: 'No',
        nzOnCancel: () => console.log('Cancel')
      });
      }
    } 
  }

  handleTablePagination(result: any) {
    if (result.pagination.limit > 10) {
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
    this.tableConfig.pageSize = result.pagination.limit;
    if (this.tabIndex == 1) {
      this.router.navigate([], {
        queryParams: {
          page: this.pageIndex,
          tabIndex: this.tabIndex,
        },
      });
    }
  }

  workflowtrigger(result: any) {
    this.modalService.confirm({
      nzTitle: "Confirm",
      nzContent: `Are you sure you want to trigger the workflow?`,
      nzOkText: "OK",
      nzCancelText: "Cancel",
      nzOnOk: () => {
        this.loading = true;
        this.releasesService
          .createWorkflowTrigger({ configId: result.data.id })
          .subscribe(
            (innerResult) => {
              this.loading = false;
              const resdata = JSON.parse(innerResult._body);
              if (resdata.code === 200) {
                this.message.success(resdata.message);
                this.router.navigate(["cicd/releases"], {
                  queryParams: {
                    tabIndex: 0,
                    page: 1
                  },
                });
              } else if (resdata.code === 204) {
                this.message.warning(resdata.message);
              }
            },
            (error) => {
              this.loading = false;
              console.log("Workflow Trigger ERROR", error);
            }
          );
      },
      nzOnCancel: () => {
        console.log("User cancelled the workflow trigger.");
      },
    });
  }

  getCurrentPageIndex(offset, limit) {
    const currentPageIndex = Math.floor(offset / limit);
    this.pageIndex = currentPageIndex + 1;
  }

  getLastPage(totalRecords: number, recordsPerPage: number): number {
    return Math.ceil(totalRecords / recordsPerPage);
  }

  deleteRelease(id: number) {
    const query = `${AppConstant.API_END_POINT}${AppConstant.API_CONFIG.API_URL.CICD.RELEASES.DELETE
      }${id}?lastUpdatedBy=${encodeURIComponent(this.userstoragedata.fullname)}&tenantid=${this.userstoragedata.tenantid}`;

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

  globalSearch() {
    this.offset = 0;
    this.getAllList(this.limit, this.offset);
  }

  refresh() {
    this.searchText = null;
    this.offset = this.calculateOffset(this.pageIndex, this.limit);
    this.getAllList(this.limit, this.offset);
    this.clearFilters();
  }

  showFilter(): void {
    this.getAllTemplateList();
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }
  applyFilters() {
    this.visible = false;
    this.offset = 0;
    this.pageIndex = 1;
    this.getAllList(this.limit, this.offset);
  }

  clearFilters() {
    this.selectedTemplate = null;
    this.selectedSchedule = null;
    this.selectedStatus = null;
    this.dateRange = null;
    this.filterValues = {};
    this.offset = 0;
    this.getAllList(this.limit, this.offset);
  }

  getQueryParams(): any {
    let queryParams: any = {
      tabIndex: this.tabIndex,
      page: this.pageIndex
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
}
