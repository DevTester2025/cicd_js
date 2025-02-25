import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppConstant } from 'src/app/app.constant';
import { SSLService } from '../sslservice';
import { LocalStorageService } from 'src/app/modules/services/shared/local-storage.service';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';
import * as _ from "lodash";
import { CommonService } from "src/app/modules/services/shared/common.service";


@Component({
  selector: 'app-addedit-ssl',
  templateUrl: './addedit-ssl.component.html',
  styles: [
    `
    #grouptable th {
      border: 1px solid #dddddd30;
      padding: 8px;
      border-style: groove;
    }
    #grouptable td {
      border: 1px solid #dddddd30;
      padding: 6px;
      border-style: groove;
    }

    #grouptable th {
      padding-top: 12px;
      padding-bottom: 12px;
      text-align: left;
      background-color: #1c2e3cb3;
      color: white;
    }`
  ]
})
export class AddeditSslComponent implements OnInit {
  @Output() notifyEntry: EventEmitter<any> = new EventEmitter();
  @Input() monitoringObj: any = {};
  @Input() view = false;
  loading = false;
  monitoringname = '';
  notes = '';
  listofurls = [];
  deletedurls = [];
  button = 'Save';
  userstoragedata: any;
  fileList: UploadFile[] = [];
  uploading = false;
  file;
  edit = false;
  instanceList = [];
  instancename: '';
  tabIndex = 0 as number;
  isChangelogs = false;
  screens = [];
  appScreens = {} as any;
  constructor(private sslService: SSLService, private localStorageService: LocalStorageService,
    private message: NzMessageService, private commonService: CommonService
  ) {
    this.userstoragedata = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.USER
    );
    this.screens = this.localStorageService.getItem(
      AppConstant.LOCALSTORAGE.SCREENS
    );
    this.appScreens = _.find(this.screens, {
      screencode: AppConstant.SCREENCODES.SSL,
    });
    if (_.includes(this.appScreens.actions, "Change Logs")) {
      this.isChangelogs = true;
    }
  }

  ngOnInit() {
    this.getInstances();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !_.isUndefined(changes.monitoringObj) &&
      !_.isEmpty(changes.monitoringObj.currentValue)
    ) {
      this.edit = true;
      this.button = AppConstant.BUTTONLABELS.UPDATE;
      this.monitoringname = this.monitoringObj.name;
      this.notes = this.monitoringObj.notes;
      // this.listofurls = this.monitoringObj.monitoringssldtls;
      this.getSSLDetail();
      if (changes.view && changes.view.currentValue == true) {
        this.edit = false;
        this.view = changes.view.currentValue;
      }
    } else {
      this.button = AppConstant.BUTTONLABELS.SAVE;
      this.monitoringname = '';
      this.notes = '';
      this.listofurls = [{
        url: '',
        instancerefid: null
      }];
      this.instanceList = [];
    }
  }

  beforeUpload = (file: UploadFile): boolean => {
    console.log(this.fileList.length)
    if (this.fileList.length > 0) {
      this.fileList = []; this.fileList.push(file);
    } else {
      this.fileList.push(file);
    }
    return false;
  }
  addRow() {
    this.listofurls.push({
      url: '',
      instancerefid: null
    })
  }

  deleteRow(i) {
    this.listofurls[i].status = AppConstant.STATUS.DELETED;
    this.deletedurls.push(this.listofurls[i]);
    this.listofurls.splice(i, 1);
    this.listofurls = [...this.listofurls];
  }

  getSSLDetail() {
    this.sslService.byId(this.monitoringObj.id).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.listofurls = response.data.monitoringssldtls;
      } else {
        this.listofurls = [];
      }
    });
  }

  isUrlValid(url) {
    var res = url.match(/(https?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (res == null) {
      return false;
    } else {
      let givenURL;
      try {
        givenURL = new URL(url);
      } catch (error) {
        console.log("error is", error);
        return false;
      }
      return true;
    }



  }
  importFile(data) {
    this.loading = true;
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    this.fileList.forEach((file: any) => {
      console.log(file)
      formData.append('file', file);
    });
    formData.append('formData', JSON.stringify(data));
    this.sslService.import(formData).subscribe((res) => {
      const response = JSON.parse(res._body);
      if (response.status) {
        this.message.success(response.message);
        this.loading = false;
        this.notifyEntry.emit(response.data);
      } else {
        this.message.error(response.message);
      }
      this.fileList = [];
    })
  }

  saveOrUpdate() {
    let data = {
      name: this.monitoringname,
      tenantid: this.userstoragedata.tenantid,
      notes: this.notes,
      status: AppConstant.STATUS.ACTIVE,
      monitoringssldtls: [],
      createdby: this.userstoragedata.fullname
    }
    if (this.monitoringname == '') {
      this.message.error('Please enter monitoring name');
      return false;
    }
    if (this.instanceList.length == 0) {
      this.message.error('Please select instance');
      return false;
    }
    // if (this.instancename == '') {
    //   this.message.error('Please select instance');
    // }
    if ((this.fileList != undefined && this.fileList.length == 0) && this.listofurls.length == 0) {
      this.message.error('Please import or enter monitoring urls');
      return false;
    }
    if (!this.edit && this.fileList != undefined && this.fileList.length == 1) {
      this.importFile(data);
      return false;
    }
    if (this.edit) {
      data['id'] = this.monitoringObj.id;
      data['lastupdateddt'] = new Date();
      data['lastupdatedby'] = this.userstoragedata.fullname;
    }
    if (this.listofurls.length > 0) {
      let urlValidity = [];
      this.listofurls.map((e) => {
        urlValidity.push(this.isUrlValid(e.url));
      })
      let validity = _.find(urlValidity, function (e) { return e == false });
      if (validity != undefined) {
        this.message.error('Please enter valid url');
        return false;
      }
    }
    if (this.listofurls.length > 0) {
      data.monitoringssldtls = this.listofurls.map((e) => {
        let obj = {
          tenantid: this.userstoragedata.tenantid,
          url: e.url,
          instancerefid: e.instancerefid,
          status: AppConstant.STATUS.ACTIVE,
          createdby: this.userstoragedata.fullname,
          createddt: new Date()
        }
        if (this.edit) {
          obj['sslhdrid'] = this.monitoringObj.id;
          obj['id'] = e.id;
          obj['instancerefid'] = e.instancerefid
        }
        return obj
      })
    }
    if (this.edit) {
      data.monitoringssldtls = data.monitoringssldtls.concat(this.deletedurls);
      this.sslService.update(data).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.notifyEntry.emit(response.data);
        } else {
          this.message.error(response.message);
        }
        this.loading = false;
      })
    } else {
      this.sslService.create(data).subscribe((res) => {
        const response = JSON.parse(res._body);
        if (response.status) {
          this.message.success(response.message);
          this.notifyEntry.emit(response.data);
        } else {
          this.message.error(response.message);
        }
        this.loading = false;
      })
    }
  }
  getInstances() {
    this.loading = true;
    let condition = {} as any;
    condition = {
      status: AppConstant.STATUS.ACTIVE,
      tenantid: this.userstoragedata.tenantid,
    };
    this.commonService.allInstances(condition).subscribe((res) => {
      const response = JSON.parse(res._body);
      console.log(response);
      if (response.status) {
        this.instanceList = _.map(response.data, function (itm) {
          return {
            instancename: itm.instancename,
            instancerefid: itm.instancerefid
          }
        });
        this.loading = false;
      } else {
        this.instanceList = [];
        this.loading = false;
      }
    });
  }
  tabChanged(e) {
    this.tabIndex = e.index;
  }

}
