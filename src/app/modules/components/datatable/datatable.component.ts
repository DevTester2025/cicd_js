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
import { AppConstant } from "src/app/app.constant";

@Component({
  selector: "app-cloudmatiq-data-table",
  styles: [
    `
      .data-table .ant-input-group-addon {
        cursor: pointer;
      }
      .disabled {
        pointer-events: none;
        opacity: 0.5;
      }
      :host ::ng-deep .progress-low .ant-progress-circle-path {
      stroke: #52c41a !important;
      }
      :host ::ng-deep .progress-medium .ant-progress-circle-path {
      stroke: #faad14 !important;
      }
      :host ::ng-deep .progress-high .ant-progress-circle-path {
      stroke: #f56c6c !important;
      }
      :host ::ng-deep .progress-critical .ant-progress-circle-path {
      stroke: #f5222d !important;
      }  
    `,
  ],
  templateUrl: "../datatable/datatable.component.html",
})
export class DatatableComponent implements OnInit, OnChanges {
  @Input() searchText: string | null = ''
  sortby: any;
  pageSize: number;
  asc = 0;
  desc = 1;
  @Input() totalCount: any;
  @Input() tableData: any[] = [];
  @Input() tableHeader: any[] = [];
  @Input() selectedcolumns: any[] = [];
  @Input() tableConfig: any = {};
  @Input() tableLoading = false;
  @Input() noResult;
  @Input() widthConfig: any;
  @Input() currentPageIndex: number;
  @Output() dataChanged: EventEmitter<any> = new EventEmitter();
  @Output() dataRow: EventEmitter<any> = new EventEmitter<any>();
  pageIndex = 1;
  sortValue = null;
  sortName = null;
  originalData = [];
  columns: any[] = [];
  lodash = _;
  selectedResources = [];
  editSelectId: string | null = "Unknown";
  pageCount = AppConstant.pageCount;
  constructor() {}
  ngOnInit() {
    this.pageSize = 10;
    if (this.selectedcolumns.length == 0)
      this.selectedcolumns = this.tableHeader;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.tableData) &&
      !_.isEmpty(changes.tableData.currentValue)
    ) {
      this.originalData = changes.tableData.currentValue;
    } else {
      this.originalData = this.tableData;
    }

    if (!this.tableConfig.manualpagination) {
      this.pageIndex = 1;
    }

    if (changes.currentPageIndex) {
      this.onPageChange(this.currentPageIndex)
    }
    if (changes.searchText && changes.searchText.currentValue !== changes.searchText.previousValue) {
      this.globalSearch(this.searchText);
    }
  }
  handleModal(data, column, value){
    this.dataRow.emit({ row: data, column: column, record: value });
  }
  onSortingChange(event) {
    if (event != null) {
      this.sortby = event;
      this.dataChanged.next({
        pageNo: this.pageIndex,
        order: [[event, this.asc == 1 ? "asc" : "desc"]],
      });
    } else {
      this.dataChanged.next({ order: null });
    }
  }
  onClickOrder(sort, order) {
    this.sortby = sort;
    this.asc = order;
    this.desc = order;
    if (this.sortby != null) {
      let asc = this.asc;
      let desc = this.desc;
      if (asc === 1) {
        this.asc = 0;
        this.desc = 1;
      }
      if (desc === 1) {
        this.desc = 0;
        this.asc = 1;
      }
      this.search();
      this.dataChanged.next({
        pageNo: this.pageIndex,
        order: [this.sortby, this.asc == 1 ? "asc" : "desc"],
      });
    } else {
      this.dataChanged.next({
        pageNo: this.pageIndex,
        order: null,
      });
    }
  }
  onPageChange(pageIndex: number) {
    this.pageIndex = pageIndex;
    const pagination = {
      limit: this.tableConfig.pageSize,
      offset: (pageIndex - 1) * this.tableConfig.pageSize,
    };
    this.dataChanged.next({ pagination: pagination,searchText: this.searchText });
  }
  onPageSizeChange(size:number){
    this.pageSize = size;
    const pagination = {
      limit: this.pageSize,
    }
    this.dataChanged.next({ pagination: pagination,searchText: this.searchText });
  }
  onCurrentPageChange(event) {
    console.log(event);
  }
  sort(sort: { key: string; value: string }): void {
    try {
      this.sortName = sort.key;
      this.sortValue = sort.value;
      this.search();
    } catch (error) {
      console.log("Error sorting data.", error);
    }
  }
  rollback(data) {
    const obj = {
      rollback: true,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  editRow(data) {
    const obj = {
      edit: true,
      delete: false,
      view: false,
      virtual: false,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  refresh() {
    const obj = {
      refresh: true,
    };
    //#OP_T428
    this.pageIndex = this.currentPageIndex || 1;
    this.searchText = "";
    this.globalSearch(this.searchText, false);
    this.dataChanged.next(obj);
  }
  downloadCsv(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      download: true,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  openFilterFor(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      filter: true,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  viewRow(data) {
    const obj = {
      edit: false,
      delete: false,
      view: true,
      virtual: false,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  revise(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      data: data,
      sync: false,
      revise: true,
    };
    this.dataChanged.next(obj);
  }
  logRow(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      log: true,
      virtual: false,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  showTimeLine(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      timeline: true,
      virtual: false,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  deleteRow(data) {
    const obj = {
      edit: false,
      delete: true,
      view: false,
      virtual: false,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  clone(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      clone: true,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  showMonitoring(data) {
    const obj = {
      monitoring: true,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  executeRow(data) {
    const obj = {
      edit: false,
      execute: true,
      view: false,
      virtual: false,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  showchart(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      data: data,
      sync: false,
      chart: true,
    };
    this.dataChanged.next(obj);
  }
  sync() {
    const obj = {
      overallsync: true,
    };
    this.dataChanged.next(obj);
  }
  rightSizeAsset(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      data: data,
      sync: false,
      chart: false,
      rightsize: true,
    };
    this.dataChanged.next(obj);
  }
  taggingCompliance(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      data: data,
      sync: false,
      chart: false,
      rightsize: false,
      taggingcompliance: true,
    };
    this.dataChanged.next(obj);
  }
  syncRow(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      data: data,
      sync: true,
    };
    this.dataChanged.next(obj);
  }
  retry(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      data: data,
      sync: false,
      retry: true
    };
    this.dataChanged.next(obj);
  }
  accept(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      sync: false,
      accept: true,
      data: data
    };
    this.dataChanged.next(obj);
  }
  remediation(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      sync: false,
      remediation: true,
      data: data
    };
    this.dataChanged.next(obj);
  }
  checkConn(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      data: data,
      checkConn: true,
    };
    this.dataChanged.next(obj);
  }
  restore(data) {
    const obj = {
      data: data,
      delete: false,
      restore: true,
    };
    this.dataChanged.next(obj);
  }
  downloadRow(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      data: data,
      download: true,
    };
    this.dataChanged.next(obj);
  }
  showasset(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      data: data,
      sync: false,
      showasset: true,
    };
    this.dataChanged.next(obj);
  }
  toCMDB(data) {
    const obj = {
      data: data,
      tocmdb: true,
    };
    this.dataChanged.next(obj);
  }
  toAsset(data) {
    const obj = {
      data: data,
      toasset: true,
    };
    this.dataChanged.next(obj);
  }
  changeLink(data) {
    this.dataChanged.next({ data: data, assetlink: true });
  }
  toTemplate(data) {
    const obj = {
      data: data,
      totemplate: true,
    };
    this.dataChanged.next(obj);
  }
  virtualRow(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: true,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  showLog(data) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      log: true,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  tableRowCheckedChanges(data, idx) {
    const obj = {
      edit: false,
      delete: false,
      view: false,
      virtual: false,
      rowselection: true,
      data: data,
    };
    if (this.tableConfig.singleselect) {
      this.tableData.forEach((val, i) => {
        if (idx !== i) val.checked = false;
      });
      obj.data = this.tableData[idx];
      setTimeout(() => {
        this.tableData[idx].checked = true;
      }, 200);
    }
    this.dataChanged.next(obj);
  }
  search(): void {
    if (this.searchText !== "" && this.searchText !== undefined && this.searchText != null) {
      const data = this.tableData.filter((item) => item);
      if (this.sortName) {
        this.tableData = data.sort((a, b) =>
          this.sortValue === "ascend"
            ? a[this.sortName] > b[this.sortName]
              ? 1
              : -1
            : b[this.sortName] > a[this.sortName]
            ? 1
            : -1
        );
      } else {
        this.tableData = data;
      } 
    }else {
      const data = this.originalData.filter((item) => item);
      if (this.sortName) {
        // tslint:disable-next-line:max-line-length
        this.tableData = data.sort((a, b) =>
          this.sortValue === "ascend"
            ? a[this.sortName] > b[this.sortName]
              ? 1
              : -1
            : b[this.sortName] > a[this.sortName]
            ? 1
            : -1
        );
      } else {
        this.tableData = data;
      }
    }
  }
  globalSearch(searchText: any, sendToComponent?) {
    if (this.tableConfig.manualsearch) {
      sendToComponent
        ? this.dataChanged.next({ searchText: searchText, search: true })
        : this.dataChanged.next({ searchText: null });
    } else {
      if (searchText !== "" && searchText !== undefined && searchText != null) {
        const self = this;
        this.tableData = [];
        this.originalData.map(function (item) {
          for (const key in item) {
            if (item.hasOwnProperty(key)) {
              const element = item[key];
              const regxExp = new RegExp("\\b" + searchText, "gi");
              if (regxExp.test(element)) {
                if (!_.some(self.tableData, item)) {
                  self.tableData.push(item);
                }
              }
            }
          }
        });
      } else {
        this.tableData = this.originalData;
      }
      this.search();
      this.totalCount = this.tableData.length;
      this.dataChanged.emit({ search: true, totalCount: this.totalCount });
    }
  }
  
  applySelectedColumns() {
    this.selectedcolumns = this.tableHeader.filter((el) => {
      return el.isdefault;
    });
    this.dataChanged.next({
      selectedcolumns: this.selectedcolumns,
      applycolumnfilter: true,
    });
  }
  onOrderChange(event, mode) {
    this.pageIndex = event;
    const pagination = {
      limit: 10,
      offset: (event - 1) * 10,
    };
    this.dataChanged.next({ reorder: event, mode: mode });
  }
  startEdit(field, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editSelectId = field.id;
  }
  orderChangeEvent(event, data) {
    console.log("model change", event, data);
  }
  cancelOrderEdit(data) {
    data.ordernumber = data.old_ordernumber;
    this.editSelectId = null;
  }
  confirmOrderUpdate(data) {
    if (data.old_ordernumber != data.ordernumber) {
      this.dataChanged.next({ reorder: data, mode: "" });
    }
    this.editSelectId = null;
  }
  publish(data) {
    const obj = {
      publish: true,
      data: data,
    };
    this.dataChanged.next(obj);
  }
  getProgressScore(score: number) {
    if (score >= 80) {
      return 'progress-low';
    } else if (score >= 60 && score < 80) {
      return 'progress-medium';
    } else if (score >= 30 && score < 60) {
      return 'progress-high';
    } else {
      return 'progress-critical';
    }
  }
  getRiskScore(score: number) {
    if (score < 30) {
      return 'progress-low';
    } else if (score >= 30 && score < 60) {
      return 'progress-medium';
    } else if (score >= 60 && score < 80) {
      return 'progress-high';
    } else {
      return 'progress-critical';
    }
  }  
}
