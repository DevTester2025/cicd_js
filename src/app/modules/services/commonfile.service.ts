import { Injectable } from "@angular/core";
import { WazuhConstant } from "src/app/wazuh.constants";

@Injectable()
export class CommonFileService {
  private sidenav_items = {} as any;
  private asset_items = {} as any;
  private wazuh_dashboard_url = {} as any;
  private filter_items = {} as any;

  addSideNavItem(item) {
    this.sidenav_items = item;
  }

  getSideNavItems() {
    return this.sidenav_items;
  }
  addAssetItem(item) {
    this.asset_items = item;
  }

  getAssetItem() {
    return this.asset_items;
  }
  addFilters(item) {
    this.filter_items = item;
  }

  getFilters() {
    return this.filter_items;
  }

  wazuh_updateDate(wazuh_url, agentid, dateRange?) {
    let static_url = { ...WazuhConstant.DASHBOARD_URL };
    Object.keys(static_url).forEach(
      (key) => {
        static_url[key] = static_url[key].replace("{{agent_id}}", agentid);
        this.wazuh_dashboard_url[key] = wazuh_url.keyvalue + static_url[key];
      }
    );
  }

  getWazuhUrl() {
    return this.wazuh_dashboard_url;
  }
}
