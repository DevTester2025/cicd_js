import { environment } from "../environments/environment";
import { ECLAppConstant } from "./ecl.constant";
import { AWSAppConstant } from "./aws.constant";
import { ALIBABAAppConstant } from "./alibaba.constant";

const SUB_TENANT = "Customer";

export const AppConstant = Object.freeze({
  API_END_POINT: environment.baseURL,
  WEB_END_POINT: environment.weburl,
  DashBoradURL: environment.dashboardURL,
  DashBoardAPIURL: environment.dashboardAPIURL,
  WebHooksURL: environment.webHooksBaseUrl,
  ORCH_END_POINT: environment.orchURL,
  MODULES_LIST: [
    {
      label: "Template",
      value: "Template",
      events: [
        { label: "Created", value: "Created" },
        { label: "Edited", value: "Edited" },
        { label: "Deleted", value: "Deleted" },
      ],
    },
    {
      label: "Deployment",
      value: "Deployment",
      events: [
        { label: "Success", value: "Success" },
        { label: "Failed", value: "Failed" },
      ],
    },
    {
      label: "Asset",
      value: "Asset",
      events: [
        { label: "Resize", value: "Resize" },
        { label: "Data Collection Failure", value: "Data Collection Failure" },
        { label: "New", value: "New" },
        { label: "Modified", value: "Modified" },
        { label: "Deleted", value: "Deleted" },
      ],
    },
    {
      label: "Catalog",
      value: "Catalog",
      events: [
        { label: "Published", value: "Published" },
        { label: "Unpublished", value: "Unpublished" },
        { label: "Changed", value: "Changed" },
      ],
    },
    {
      label: "Service Request",
      value: "Service Request",
      events: [
        { label: "Created", value: "Created" },
        { label: "Approved", value: "Approved" },
        { label: "Rejected", value: "Rejected" },
      ],
    },
    {
      label: "Tag Updates",
      value: "Tag Updates",
      events: [{ label: "Tag Updates", value: "Tag Updates" }],
    },
    {
      label: "Asset Sync",
      value: "Asset Sync",
      events: [{ label: "Asset Sync", value: "Asset Sync" }],
    },
    {
      label: "Users",
      value: "Users",
      events: [
        { label: "Created", value: "Created" },
        { label: "Role Change", value: "Role Change" },
        { label: "Deleted", value: "Deleted" },
      ],
    },
    {
      label: "Role",
      value: "Role",
      events: [
        { label: "Created", value: "Created" },
        { label: "Edited", value: "Edited" },
        { label: "Deleted", value: "Deleted" },
      ],
    },
    {
      label: "Budget",
      value: "Budget",
      events: [{ label: "Over run", value: "Over Run" }],
    },
    {
      label: "Alert Config",
      value: "Alert Config",
      events: [],
    },
    {
      label: "Orchestration",
      value: "Orchestration",
      events: [],
    },
  ],
  SUBTENANT: SUB_TENANT,
  APP_NAME: "ESKO",
  TMS_SCRIPT_FILENAME: "D:\\\\SDLTMS11.3\\\\Customise-TMS.ps1",
  LOCALSTORAGE: {
    STR_PREFIX: "cloudmatiq-",
    TN_LOOKUP: "cloudmatiq-tn-lookup",
    TOKEN: "token",
    USER: "user",
    ISAUTHENTICATED: "isAuthenticated",
    SCREENS: "screens",
    SESSION_TYPE: "styp",
  },
  BUTTONLABELS: {
    SAVE: "Save",
    UPDATE: "Update",
    SHARE: "Share",
    SUBMIT: "Submit",
    SHOW: "Show",
    REFRESH: "Refresh",
    CLONE: "Clone",
  },
  SCREENCODES: {
    INBOX: "001",
    SERVICE_CATALOG_REQUEST: "002",
    SERVICE_CATALOG_MANAGEMENT: "003",
    ASSET_MANAGEMENT: "004",
    SOLUTION_TEMPLATE_MANAGEMENT: "005",
    TAG_MANAGER: "006",
    SERVER_UTILIZATION: "007",
    UILIZATION_MONITORING: "008",
    SCRIPTS: "009",
    ORCHESTRATION: "010",
    ASSET_BILLING: "011",
    BUDGET: "012",
    RECOMMENDATION: "013",
    RESIZE_REQUESTS: "014",
    RIGHTSIZE_HISTORY: "015",
    RIGHTSIZE_GROUPS: "016",
    APPROVAL_WORKFLOW: "017",
    MAINTENANCE_WINDOW: "018",
    RECOMMENDATION_SETUP: "019",
    NETWORK: "020",
    FIREWALL: "021",
    LOAD_BALANCERS: "022",
    INTERNET_GATEWAY: "023",
    COMMON_FUNCTION_GATEWAY: "024",
    OTHER_CLOUD_ASSETS: "025",
    INTER_CONNECTIVITY: "026",
    VIRTUAL_MACHINE: "027",
    SERVER_LIST: "028",
    CUSTOMER: "029",
    MANAGE_USERS: "030",
    ACCESS_MANAGEMENT: "031",
    PRICE_SETUP: "032",
    NOTIFICATION_SETUP: "033",
    PARAMETERS: "034",
    TENANTS: "035",
    TCO_CALCULATOR: "036",
    ASSET_RECORD_MANAGEMENT: "038",
    EVENTLOG: "039",
    RECORD_TYPE: "040",
    ALER_CONFIG: "041", //#OP_T620
    SLA_MGMT: "042",
    SNOW_TICKETS: "043",
    OPS_ANALYSER: "044",
    TACTICAL_OVERVIEW: "045", //#OP_T620
    KPI_REPORTING: "046",
    SYNTHETICS: "048",
    NODE_MGMT: "049",
    WORKPACKTEMPLATE: "050",
    WORKFLOW: "051",
    WORKPACKEXECUTION: "053",
    SSL: "052",
    PRODUCTS: "054",
    CICD: "058",
    COMPLIANCE_REPORT: "063",
    PIPELINE_TEMPLATE: "056",
    RELEASES: "057",
    SETUP: "055",
    PATCHING: "065",
  },
  API_CONFIG: {
    API_URL: {
      LOGIN: "/users/login",
      VERIFYOTP: "/users/verifyotp",
      RESENDOTP: "/users/resendotp",
      FORGOT_PASSWOD: "/users/forgotpassword",
      RESET_PASSWORD: "/users/resetpassword",
      BASE: {
        MONITORING: {
          SUMMARY: "/monitoring/get-summary-metrics",
        },
        EVENTLOG: {
          CREATE: "/eventlog/create",
          FINDALL: "/eventlog/list",
          FINDBYID: "/eventlog/",
          UPDATE: "/eventlog/update",
          DELETE: "/eventlog/delete/",
        },
        LOOKUP: {
          FINDALL: "/base/lookup/list",
          UPDATE: "/base/lookup/update",
          CREATE: "/base/lookup/create",
        },
        SCRIPTS: {
          CREATE: "/scripts/create",
          FINDALL: "/scripts/list",
          UPDATE: "/scripts/update",
          FINDBYID: "/scripts/",
        },
        ORCHESTRATION: {
          CREATE: "/orchestration/create",
          FINDALL: "/orchestration/list",
          UPDATE: "/orchestration/update",
          FINDBYID: "/orchestration/",
          RUN: "/orchestration/run",
          CHECK_CONNECTION: "/orch/connectivity/check",
          DRYRUN: "/orchestration/dry-run",
        },
        ORCHESTRATION_SCHEDULE_LOGS: {
          LIST: "/orchestration/logs/list",
        },
        ORCHESTRATION_SCHEDULE_HDR: {
          LIST: "/orchestration/schedule/header/list",
        },
        ORCHESTRATION_SCHEDULE: {
          LIST: "/orchestration/schedule/list",
          UPDATE: "/orchestration/schedule/update/",
          DELETE: "/orchestration/schedule/delete/",
        },
        ALERTCONFIGS: {
          CREATE: "/base/alertconfigs/create",
          FINDALL: "/base/alertconfigs/list",
          UPDATE: "/base/alertconfigs/update",
          FINDBYID: "/base/alertconfigs/",
          INSTANCEFILTER: "/base/alertconfigs/getfilterinstance",
        },
        REQUESTMANAGEMENT: {
          CREATE: "/base/requestmanagement/create",
          FINDALL: "/base/requestmanagement/list",
          UPDATE: "/base/requestmanagement/update",
          FINDBYID: "/base/requestmanagement/",
        },
        REQUESTAPPROVER: {
          CREATE: "/base/requestmanagementapprover/create",
          FINDALL: "/base/requestmanagementapprover/list",
          UPDATE: "/base/requestmanagementapprover/update",
          FINDBYID: "/base/requestmanagementapprover/",
        },
        WAZHU: {
          GETDATA: "/base/wazuh/getdata",
          GETAGENT: "/base/wazuh/getagent",
          GETTOKEN: "/base/wazuh/authenticate",
          UPDATEWAZUHAGENT: "/base/wazuh/updatewazuhagent",
        },
        CLOUD_ASSET: {
          CREATE: "/cloudasset/create",
          FINDALL: "/cloudasset/list",
          UPDATE: "/cloudasset/update",
          FINDBYID: "/cloudasset/",
        },
        INCIDENTS: {
          CREATE: "/incidents/create",
          FINDALL: "/incidents/list",
          UPDATE: "/incidents/update",
          FINDBYID: "/incidents/",
          DELETE: "/incidents/delete/",
        },
        KPITREPORTING: {
          CREATE: "/tenants/kpi/report/configheader/create",
          FINDALL: "/tenants/kpi/report/configheader/list",
          UPDATE: "/tenants/kpi/report/configheader/update",
          FINDBYID: "/tenants/kpi/report/configheader/",
          DELETE: "/tenants/kpi/report/configheader/delete/",
          DETAILS: {
            FINDALL: "/tenants/kpi/report/configdetail/list",
            FINDBYID: "/tenants/kpi/report/configdetail/",
            UPDATE: "/tenants/kpi/report/configdetail/update",
          },
          CUSTOMER: {
            FINDALL: "/tenants/customer/kpi/list",
            UPDATE: "/tenants/customer/kpi/update",
            BULKUPDATE: "/tenants/customer/kpi/bulkupdate",
            BULKCREATE: "/tenants/customer/kpi/bulkcreate",
          },
        },
        ASSETS: {
          LISTBYFILTERS: "/base/assets/filterby",
          COUNT: "/base/assets/count",
          TOTALCOST: "/base/assets/totalcost",
          PRODUCTLIST: "/base/assets/productlist",
          ADDPRODUCT: "/base/assets/product/add",
          UPDATE: "/base/assets/product/update",
          DOWNLOAD: "/cloudmatiq/base/download",
        },
        SSM: {
          GETBASELINES: "/ssm/baselines",
          PATCHCOMPLIANCE: "/ssm/patchcompliance",
          INVDASHBOARD: "/ssm/inventory",
          PMDASHBOARD: "/ssm/patchmanager",
          CREATEINV: "/ssm/createinventory",
          CREATEPB: "/ssm/createbaseline",
          DELETEPB: "/ssm/deletebaseline",
          DEFAULTPB: "/ssm/baselines/makedefault",
          FINDALL: "/ssm/list",
          UPDATEPB: "/ssm/updatebaseline",
          CONFIGPB: "/ssm/configpatching",
          ASS_STATUS: "/ssm/associationstatus",
          FINDALLASS: "/ssm/associations",
          FINDALLINSPROFILE: "/ssm/instanceprofiles",
          UPDATEROLE: "/ssm/updaterole",
          SYNC: "/ssm/synchronization",
          FINDALLCMDS: "/ssm/listcommands",
          COMPLAINCE_BYID: "/ssm/compliance",
          COMPLIANCESUMMARY: "/ssm/compliancesummary",
          COMMAND_DESC: "/ssm/command",
          ASS_DESC: "/ssm/association",
          ALL_MW: "/ssm/maintenancewindows",
        },
        PROMETHEUS: {
          VMSTATUS: "/prometheus/vmstatus",
          VMUPTIME: "/prometheus/uptime",
          KPISUMMARY: "/prometheus/kpisummary",
          COUNT: "/prometheus/alertcount",
          DATEWISECOUNT: "/prometheus/datewisealertcount",
          DATALIST: "/prometheus/datalist",
        },
        ASSETRECORDS: {
          RESOURCETYPE: "/base/assetrecords/resourcetype",
          RESOURCE: "/base/assetrecords/resources/{type}", // type is crn
          RESOURCEDETAILS: "/base/assetrecords/resourcedetails",
          RESOURCEFIELDVALUES: "/base/assetrecords/resource/fieldvalues",
          RESOURCEFILTER: "/base/assetrecords/filter",
          RESOURCEDETAILSBYID: "/base/assetrecords/resource/{id}",
          FINDALL: "/base/assetrecords/list",
          CREATE: "/base/assetrecords/create",
          UPDATE: "/base/assetrecords/update",
          CLONE: "/base/assetrecords/clone",
          BULKUPDATE: "/base/assetrecords/bulkupdate",
          FINDBYID: "/base/assetrecords/",
          CREATEDTL: "/base/assetrecords/resourcedetails/create",
          UPDATEDTL: "/base/assetrecords/resourcedetails/update",
          FINDALLDTL: "/base/assetrecords/resourcedetails/list",
          CREATECMD: "/base/assetrecords/comments/create",
          UPDATECMD: "/base/assetrecords/comments/update",
          FINDALLCMD: "/base/assetrecords/comments/list",
          FINDALLHISTORY: "/base/assetrecords/history/list",
          CREATEHISTORY: "/base/assetrecords/history/create",
          FINDALLDOCS: "/base/assetrecords/documents/list",
          DOWNLOADDOCS: "/base/assetrecords/documents/download",
          CREATEDOCS: "/base/assetrecords/documents/create",
          DELETEDOCS: "/base/assetrecords/documents/delete",
          BULKCREATEDTL: "/base/assetrecords/resourcedetails/bulkcreate",
          BULKUPDATEDTL: "/base/assetrecords/resourcedetails/bulkupdate",
          RESOURCECHART: "/base/assetrecords/chart",
          ASSETLIST: "/base/assets/filterby",
          EXTERNALREFLIST: "/base/assetrecords/externalref/list",
          QUERYBUILD: "/base/assetrecords/parentresource",
          QUERYBUILDQ: "/base/assetrecords/builder",
          COPYRESOURCEDETAILS: "/base/assetrecords/resourcedetails/copy",
          TXNREFLIST: "/base/assetrecords/resourcedetails/txnref",
          UPDATETXN: "/base/assetrecords/resourcedetails/updatetxn",
          REPORTBUILDER: {
            TXNREFLIST: "/base/assetrecords/resourcedetails/txnref",
            FINDALL: "/base/assetrecords/query/list",
            CREATE: "/base/assetrecords/query/create",
            UPDATE: "/base/assetrecords/query/update",
            FINDBYID: "/base/assetrecords/query/",
            REPORT: "/base/assetrecords/query/report",
          },
          UPDATE_WATCHLIST: "/base/workpack/watchlist/update",
          BULKCREATE_TXNREF: "/base/assets/txnref/bulkcreate",
          WORKPACK_RELATION: "/base/workpack/workflowrelation/list",
        },
        ASSETMAPPING: {
          BULKUPDATE: "/tenants/assetmapping/bulkupdate",
          LIST: "/tenants/assetmapping/list",
          BULKCREATE: "/tenants/assetmapping/bulkcreate",
          UPDATE: "/tenants/assetmapping/update",
          CREATE: "/tenants/assetmapping/create",
        },
        EXPTRMAPPING: {
          LIST: "/tenants/exptrmapping/list",
          ORCH_LIST: "/tenants/exptrorchmap/list",
          CREATE_MAPPING: "/tenants/exptrmapping/create",
          UPDATE_MAPPING: "/tenants/exptrmapping/update",
        },
        TAGS: {
          CREATE: "/tags/create",
          FINDALL: "/tags/list",
          UPDATE: "/tags/update",
          FINDBYID: "/tags/",
        },
        COSTSETUP: {
          CREATE: "/costvisual/create",
          FINDALL: "/costvisual/list",
          UPDATE: "/costvisual/update",
          FINDBYID: "/costvisual/",
        },
        BUDGETSETUP: {
          CREATE: "/nm/asst/budget/create",
          FINDALL: "/nm/asst/budget/list",
          UPDATE: "/nm/asst/budget/update",
          FINDBYID: "/nm/asst/budget/",
          DOWNLOAD: "/nm/asst/budget/download",
        },
        BILLING: {
          FINDALL: "/nm/asst/billing/list",
          FILTER_VALUES: "/nm/asst/billing/filter-values",
          RESOURCE_BILLING: "/nm/asst/billing/resource-billing",
          SUMMARY: "/nm/asst/billing/summary",
        },
        DAILYBILLING: {
          FINDALL: "/nm/asst/daily/billing/list",
        },
        NOTIFICATIONSETUP: {
          CREATE: "/notificationsetup/create",
          FINDALL: "/notificationsetup/list",
          UPDATE: "/notificationsetup/update",
          FINDBYID: "/notificationsetup/",
          TEMPLATELIST : "/base/template/list",
        },
        ASSET_UTILS: {
          CREATE: "/nm/asstutl/create",
          FINDALL: "/nm/asstutl/list",
          UPDATE: "/nm/asstutl/update",
          FINDBYID: "/nm/asstutl/",
        },
        PREDICTIONSETUP: {
          CREATE: "/nm/recommendation/create",
          BULK_CREATE: "/nm/recommendation/bulkcreate",
          FINDALL: "/nm/recommendation/list",
          UPDATE: "/nm/recommendation/update",
          BULK_UPDATE: "/nm/recommendation/bulkupdate",
          FINDBYID: "/nm/recommendation/",
        },
        RIGHTSIZEGROUP: {
          CREATE: "/nm/rightsizegroup/create",
          FINDALL: "/nm/rightsizegroup/list",
          UPDATE: "/nm/rightsizegroup/update",
          FINDBYID: "/nm/rightsizegroup/",
        },
        RECOMMENTATION_SETUP: {
          CREATE: "/nm/recommendationsetup/create",
          FINDALL: "/nm/recommendationsetup/list",
          UPDATE: "/nm/recommendationsetup/update",
          FINDBYID: "/nm/recommendationsetup/",
        },
        TAGGROUPS: {
          CREATE: "/taggroup/create",
          FINDALL: "/taggroup/list",
          UPDATE: "/taggroup/update",
          FINDBYID: "/taggroup/",
        },
        TAGVALUE: {
          CREATE: "/tagvalues/create",
          FINDALL: "/tagvalues/list",
          UPDATE: "/tagvalues/update",
          BULKUPDATE: "/tagvalues/bulkupdate",
          BULKCREATE: "/tagvalues/bulkcreate",
          FINDBYID: "/tagvalues/",
        },
        SCREENS: {
          FINDALL: "/screens/list",
        },
        SCREENACTIONS: {
          FINDALL: "/screens/list",
        },
        ROLEACCESS: {
          FINDALL: "/role/access/list",
        },
        CONTACTPOINTS: {
          FINDALL: "/base/contactpoints/list",
          CREATE: "/base/contactpoints/create",
          UPDATE: "/base/contactpoints/update",
          FINDBYID: "/base/contactpoints/"
        }
      },
      MONITORING: {
        SYNTHETICS: {
          CREATE: "/monitoring/synthetics/create",
          GET_LIST: "/monitoring/synthetics",
          MONITORING_LIST: "/monitoring/synthetics/monitoring/list",
          GET_ALL_LIST: "/monitoring/synthetics/list",
          GET_DETAIL_LIST: "/monitoring/synthetics/detail/list",
          GET_BY_ID: "/monitoring/synthetics/",
          GET_ARTIFACTS_BY_ID: "/monitoring/synthetics/{id}/artifacts",
          DELETE_BY_ID: "/monitoring/synthetics/delete/",
        },
        SSL: {
          IMPORT: "/monitoring/ssl/import",
          CREATE: "/monitoring/ssl/create",
          FINDALL: "/monitoring/ssl/list",
          UPDATE: "/monitoring/ssl/update",
          FINDBYID: "/monitoring/ssl/",
          MONITORINGUPDATE: "/monitoring/ssl/detailupdate",
        },
      },
      PARAMETERS: {
        CREATE: "/parameters/create",
        FINDALL: "/parameters/list",
        UPDATE: "/parameters/update",
        FINDBYID: "/parameters/",
      },
      DEPLOYMENTS: {
        CREATE: "/deployments/create",
        FINDALL: "/deployments/list",
        UPDATE: "/deployments/update",
        FINDBYID: "/deployments/",
        DEPLOY: "/deployments/deploy",
        LOG: "/deployments/log",
        ECL2FINDALL: "/deployments/ecl2/list",
        ECL2INSTANCERESIZE: "/deployments/ecl2/resize",
        AWSINSTANCERESIZE: "/deployments/aws/resize",
        AWS: AWSAppConstant.AWS,
        ECL2: ECLAppConstant.ECL2,
        ALIBABA: ALIBABAAppConstant.ALIBABA,
        VMWARE: {
          LISTBYFILTERS: "/vmware/filterby",
          SYNC: "/vmware/synchronization",
        },
      },
      SOLUTIONS: {
        CREATE: "/solutions/create",
        FINDALL: "/solutions/list",
        UPDATE: "/solutions/update",
        FINDBYID: "/solutions/",
        GRAPH: "/solutions/graph/",
        ECL2BYID: "/solutions/elc2/",
        CLONE: "/solutions/clone",
        ALIBABABYID: "/solutions/ali/",
        COSTS: {
          FINDALL: "/solutions/costs/list",
          CREATE: "/solutions/costs/create",
          BULKCREATE: "/solutions/costs/bulkcreate",
          UPDATE: "/solutions/costs/update",
        },
      },
      RESIZE_REQUEST: {
        CREATE: "/srm/upgraderequest/create",
        BULK_CREATE: "/srm/upgraderequest/bulkcreate",
        BULK_UPDATE: "/srm/upgraderequest/bulkupdate",
        FINDALL: "/srm/upgraderequest/list",
        UPDATE: "/srm/upgraderequest/update",
        FINDBYID: "/srm/upgraderequest/",
      },
      SCHEDULE_REQUEST: {
        CREATE: "/srm/schedulerequest/create",
        FINDALL: "/srm/schedulerequest/list",
        UPDATE: "/srm/schedulerequest/update",
        FINDBYID: "/srm/schedulerequest/",
      },
      DASHBOARDCONFIG: {
        HDR: {
          FINDALL: "/base/dashboardconfigheader/list",
          CREATE: "/base/dashboardconfigheader/create",
          UPDATE: "/base/dashboardconfigheader/update",
          FINDBYID: "/base/dashboardconfigheader/",
          DELETE: "/base/dashboardconfigheader/delete/",
          BULKUPDATE: "/base/dashboardconfigheader/bulkupdate",
        },
        DTL: {
          FINDALL: "/base/dashboardconfigdetail/list",
          CREATE: "/base/dashboardconfigdetail/create",
          UPDATE: "/base/dashboardconfigdetail/update",
          FINDBYID: "/base/dashboardconfigdetail/",
          BULKUPDATE: "/base/dashboardconfigdetail/bulkupdate",
        },
      },
      TENANTS: {
        FINDALL: "/tenants/list",
        CREATE: "/tenants/create",
        UPDATE: "/tenants/update",
        FINDBYID: "/tenants/",
        DASHBOARD: "/tenants/dashboard",
        TENANTSETTINGS: {
          FINDALL: "/tenants/tenantsettings/list",
          CREATE: "/tenants/tenantsettings/create",
          UPDATE: "/tenants/tenantsettings/update",
          FINDBYID: "/tenants/tenantsettings/",
        },
        REGIONS: {
          FINDALL: "/tenants/region/list",
        },
        SOLUTIONS: {
          FINDALL: "/solutions/list",
        },
        SLA: {
          CREATE: "/tenants/sla/create",
          UPDATE: "/tenants/sla/update",
          BULKUPDATE: "/tenants/sla/bulkupdate",
          SLATEMPLATES: {
            CREATE: "/tenants/slatemplates/create",
            UPDATE: "/tenants/slatemplates/update",
            FINDBYID: "/tenants/slatemplates/",
            FINDALL: "/tenants/slatemplates/list",
            DELETE: "/tenants/slatemplates/delete/",
          },
          SERVICECREDITS: {
            CREATE: "/tenants/servicecredits/create",
            UPDATE: "/tenants/servicecredits/update",
            FINDBYID: "/tenants/servicecredits/",
            FINDALL: "/tenants/servicecredits/list",
            DELETE: "/tenants/servicecredits/delete/",
          },
          KPIUPTIME: {
            CREATE: "/tenants/kpiuptime/create",
            UPDATE: "/tenants/kpiuptime/update",
            FINDBYID: "/tenants/kpiuptime/",
            FINDALL: "/tenants/kpiuptime/list",
            DELETE: "/tenants/kpiuptime/delete/",
          },
          KPITICKETS: {
            CREATE: "/tenants/kpitickets/create",
            UPDATE: "/tenants/kpitickets/update",
            FINDBYID: "/tenants/kpitickets/",
            FINDALL: "/tenants/kpitickets/list",
            DELETE: "/tenants/kpitickets/delete/",
          },
        },
        CLIENT: {
          CREATE: "/customers/create",
          UPDATE: "/customers/update",
          FINDBYID: "/customers/",
          FINDALL: "/customers/list",
          UPLOAD: "/customers/upload",
          SLA: "/customers/sla/create",
          INCIDENTSLA: {
            UPDATE: "/tenants/customer/incidentsla/update",
          },
          AVAILABILITYSLA: {
            UPDATE: "/tenants/customer/availabilitysla/update",
          },
          SERVICECREDITS: {
            UPDATE: "/tenants/customer/servicecredits/update",
          },
        },
        CUSTOMER_ACCOUNT: {
          CREATE: "/customer-account/create",
          UPDATE: "/customer-account/update",
          FINDBYID: "/customer-account/",
          FINDALL: "/customer-account/list",
        },
        USERS: {
          FINDALL: "/users/list",
          CREATE: "/users/create",
          UPDATE: "/users/update",
          FINDBYID: "/users/",
          RESETTOTP: "/users/resettotp",
        },
        USERROLES: {
          FINDALL: "/users/role/list",
          CREATE: "/users/role/create",
          UPDATE: "/users/role/update",
          FINDBYID: "/users/role/",
        },
        INSTANCE: {
          FINDALL: "/instances/list",
          CREATE: "/instances/create",
          UPDATE: "/instances/update",
          FINDBYID: "/instances/",
          CHART: "/instances/chart",
        },
        WORKFLOW: {
          FINDALL: "/tenant/workflow/list",
          CREATE: "/tenant/workflow/create",
          UPDATE: "/tenant/workflow/update",
          FINDBYID: "/tenant/workflow/",
          DELETE: "/tenant/workflow/delete",
        },
        WORKFLOWAPPROVER: {
          FINDALL: "/tenant/workflowapprover/list",
          CREATE: "/tenant/workflowapprover/create",
          UPDATE: "/tenant/workflowapprover/update",
          FINDBYID: "/tenant/workflowapprover/",
          BULK_UPDATE: "/tenant/workflowapprover/bulkupdate",
        },
        WORKFLOWACTION: {
          FINDALL: "/tenant/workflowactions/list",
          CREATE: "/tenant/workflowactions/create",
          BULKCREATE: "/tenant/workflowactions/bulkcreate",
          UPDATE: "/tenant/workflowactions/update",
          FINDBYID: "/tenant/workflowactions/",
          BULKUPDATE: "/tenant/workflowactions/bulkupdate",
        },
        WORKPACK: {
          DOWNLOAD: "/base/workpack/export",
          EXECUTE: "/base/workpack/execute",
          EXECUTIONLIST: "/base/workpack/execute/list",
        },
      },
      NOTIFICATIONS: {
        CREATE: "/notifications/create",
        FINDALL: "/notifications/list",
        UPDATE: "/notifications/update",
        FINDBYID: "/notifications/",
        UPDATETXN: "/synthetics/updatetxn/",
        BULKRESOLVE: "/notifications/resolve/bulkupdate",
      },
      SRM: {
        CATALOG: {
          FINDALL: "/srm/catalog/list",
          CREATE: "/srm/catalog/create",
          UPDATE: "/srm/catalog/update",
          FINDBYID: "/srm/catalog/",
        },
        SERVICE: {
          FINDALL: "/srm/sr/list",
          CREATE: "/srm/sr/create",
          UPDATE: "/srm/sr/update",
          FINDBYID: "/srm/sr/",
          COUNT: "/srm/sr/count",
        },
        ACTION: {
          FINDALL: "/srm/sractions/list",
          UPDATE: "/srm/sractions/update",
        },
        MAIN_WINDOW: {
          CREATE: "/srm/maintwindow/create",
          BULK_CREATE: "/srm/maintwindow/bulkcreate",
          BULK_UPDATE: "/srm/maintwindow/bulkupdate",
          FINDALL: "/srm/maintwindow/list",
          UPDATE: "/srm/maintwindow/update",
          FINDBYID: "/srm/maintwindow/",
        },
        MAIN_WINDOW_MAP: {
          FINDALL: "/srm/maintwindowmap/list",
          CREATE: "/srm/maintwindowmap/create",
          FINDBYID: "/srm/maintwindowmap/",
          UPDATE: "/srm/maintwindowmap/update",
        },
        WORKFLOW: {
          CREATE: "/srm/workflowconfig/create",
          FINDALL: "/srm/workflowconfig/list",
          UPDATE: "/srm/workflowconfig/update",
          FINDBYID: "/srm/workflowconfig/",
        },
        WORKFLOW_APPROVER: {
          CREATE: "/srm/workflowapprover/create",
          FINDALL: "/srm/workflowapprover/list",
          UPDATE: "/srm/workflowapprover/update",
          FINDBYID: "/srm/workflowapprover/",
        },
      },
      OTHER: {
        AWSZONES: "/aws/zone/list",
        AWSASSETSYNC: "/aws/common/synchronization",
        ECL2ZONES: "/ecl2/zone/list",
        ECL2ASSETMETAUPDATE: "/ecl2/common/metadata",
        AWSASSETMETAUPDATE: "/aws/common/metadata",
        AWSTAGUPDATE: "/aws/common/synctags",
        ECL2NETWORKGETBYID: "/ecl2/network/",
        ECL2GATEWAYGETBYID: "/ecl2/gateway/",
        ECL2LBGETBYID: "/ecl2/loadbalancer/",
        ECL2VSRXGETBYID: "/ecl2/vsrx/",
        ECL2CFGGETBYID: "/ecl2/commonfunctiongateway/",
        ECL2INSTANCETYPELIST: "/ecl2/instancetype/list",
      },
      NM: {
        SERVER_UTL: {
          REPORT: "/nm/asstutl/report",
          DATACOLS_REPORT: "/nm/asstutl/daily/datacollection",
        },
      },
      COMMENTS: {
        FINDALL: "/base/commentdoc/list",
        CREATE: "/base/commentdoc/create",
        UPDATE: "/base/commentdoc/update",
        UPLOAD: "/base/commentdoc/upload",
        DOWNLOAD: "/base/commentdoc/download",
        FINDBYID: "/base/commentdoc/",
      },
      HISTORY: {
        FINDALL: "/base/history/list",
        CREATE: "/base/history/create",
        UPDATE: "/base/history/update",
      },
      CICD: {
        RELEASES: {
          RELEASEWORKFLOW: "/cicd/releaseworkflow",
          RELEASECONFIG: "/cicd/releaseconfig",
          WORKFLOWTRIGGER: "/cicd/releaseconfig/trigger",
          RERUNWORKFLOW: "/cicd/releaseworkflow/rerun",
          CANCELWORKFLOW: "/cicd/releaseworkflow/cancel",
          GETLOG: "/cicd/releaseworkflow/",
          GETLOGDETAILS: "/cicd/releaseworkflow/log/",
          CREATE: "/cicd/releaseconfig/create",
          GETBYID: "/cicd/releaseconfig/",
          UPDATE: "/cicd/releaseconfig/update/",
          DELETE: "/cicd/releaseconfig/delete/",
          SETUPMASTER: "/cicd/pipelinetemplate/setupmaster",
        },
        PIPELINETEMPLATE: {
          CREATE: "/cicd/pipelinetemplate/create",
          FINDALL: "/cicd/pipelinetemplate",
          FINDBYID: "/cicd/pipelinetemplate/",
          UPDATE: "/cicd/pipelinetemplate/update/",
          RUNNER: "/cicd/provider/runner",
          NODE_BY_ID: "/cicd/pipelinetemplate/nodedetail/",
          UPDATE_NODE: "/cicd/pipelinetemplate/nodedetail/update",
        },
        SETUP: {
          PROVIDER: {
            FINDALL: "/cicd/provider",
            CREATE: "/cicd/provider/create",
            GETBYID: "/cicd/provider/",
            UPDATE: "/cicd/provider/update/",
            DELETE: "/cicd/provider/delete/",
            SYNCREPO: "/cicd/provider/sync/",
          },
          CONTAINER_REGISTRY: {
            FINDALL: "/cicd/containerregistry",
            CREATE: "/cicd/containerregistry/create",
            GETBYID: "/cicd/containerregistry/",
            UPDATE: "/cicd/containerregistry/update/",
            DELETE: "/cicd/containerregistry/delete/",
          },
          TESTTOOL: {
            FINDALL: "/cicd/testtool",
            CREATE: "/cicd/testtool/create",
            GETBYID: "/cicd/testtool/",
            UPDATE: "/cicd/testtool/update/",
            DELETE: "/cicd/testtool/delete/",
          },
          ENVIRONMENTS: {
            FINDALL: "/cicd/environments",
            CREATE: "/cicd/environments/create",
            GETBYID: "/cicd/environments/",
            UPDATE: "/cicd/environments/update/",
            DELETE: "/cicd/environments/delete/",
          },
          CUSTOM_VARIABLES: {
            FINDALL: "/cicd/customvariable",
            CREATE: "/cicd/customvariable/create",
            GETBYID: "/cicd/customvariable/",
            UPDATE: "/cicd/customvariable/update/",
            DELETE: "/cicd/customvariable/delete/",
          },
          BUILD: {
            FINDALL: "/cicd/build",
            CREATE: "/cicd/build/create",
            GETBYID: "/cicd/build/",
            UPDATE: "/cicd/build/update/",
            DELETE: "/cicd/build/delete/",
          },
        },
        DASHBOARD: {
          COUNT: "/cicd/dashboard/count",
          PIPELINE_STATUS_COUNT: "/cicd/dashboard/pipelinestatus",
          PIPELINE_DTATUS_DAILY: "/cicd/dashboard/pipelinestatusdaily"
        }
      }
    },
  },
  LOOKUPKEY: {
    CLOUDPROVIDER: "CLOUDPROVIDER",
    NETWORKPLANE: "NETWORKPLANE",
    SEGMENTATIONTYPE: "SEGMENTATIONTYPE",
    LBPLAN: "LBPLAN",
    VSID: "VSID",
    VOLUMESIZE: "VOLUMESIZE",
    GATEWAYSERVICETYPE: "SERVICETYPE",
    REGION: "REGION",
    TRANSPORTTTYPE: "TRANSPORTTTYPE",
    LOGFACILITY: "LOGFACILITY",
    LOGLEVEL: "LOGLEVEL",
    DATEFORMAT: "DATEFORMAT",
    TIMEZONE: "TIMEZONE",
    TCPLOGGING: "TCPLOGGING",
    ACLLOGGING: "ACLLOGGING",
    INTERFACEZONE: "INTERFACEZONE",
    INTERFACESERVICES: "INTERFACESERVICES",
    SECURITYRULEACTION: "SECURITYRULEACTION",
    SOURCENATTO: "SOURCENATTO",
    ORCH_CATEGORY: "ORCH_CATEGORY",
    VSRX_SERVICES: "VSRX_SERVICES",
    CITRIX_VMAC_TRACKING: "CITRIX_VMAC_TRACKING",
    CITRIX_IPS_IPTYPE: "CITRIX_IPS_IPTYPE",
    CITRIX_IPS_ICMP_RES: "CITRIX_IPS_ICMP_RES",
    CITRIX_IPS_ARP_RES: "CITRIX_IPS_ARP_RES",
    DISKSTORAGE: "DISKSTORAGE",
    ALI_REGION: "ALI_REGION",
    DIRECTION: "DIRECTION",
    SG_PROTOCOL: "SG_PROTOCOL",
    INSTANCE_CHARGE_TYPE: "INSTANCE_CHARGE_TYPE",
    NETCHARGE_TYPE: "NETCHARGE_TYPE",
    PLATFORM: "PLATFORM",
    LB_INS_SPEC: "LB_INS_SPEC",
    LB_HEALTHCHECK: "LB_HEALTHCHECK",
    LB_PROTOCOL: "LB_PROTOCOL",
    LB_CERTIFICATE: "LB_CERTIFICATE",
    TAG_REGEX: "TAG_REGEX",
    TAG_GROUP_STRUCTURE: "TAG_STRUCTURE",
    DEPARTMENT: "DEPARTMENT",
    PRICING_MODEL: "PRICING_MODEL",
    ASSET_UNIT: "ASSET_UNIT",
    CURRENCY: "CURRENCY",
    COST_TYPES: "COST_TYPES",
    VMWARE_VERSION: "VMWARE_VERSIONS",
    VMWARE_REGIONS: "VMWARE_REGIONS",
    MONTHLY: "Monthly",
    SCHEDULE_TIME: "SCHEDULE_TIME",
    WAZUH_CRED: "SM_WAZUH",
    VM_ASSET_TYPES: "VM_ASSET_TYPES",
    TICKET_CATEGORY: "TICKET_CATEGORY",
    TICKET_SUBCATEGORY: "TICKET_SUBCATEGORY",
    TICKET_SEVERITY: "TICKET_SEVERITY",
    TICKET_STATUS: "TICKET_STATUS",
    TICKET_PRODUCT: "TICKET_PRODUCT",
    TICKET_URGENCY: "TICKET_URGENCY",
    TICKET_IMPACT: "TICKET_IMPACT",
    TICKET_CONTACTTYPE: "TICKET_CONTACTTYPE",
    TICKET_ASSIGN_GROUP: "TICKET_ASSIGN_GROUP",
    MONITORING_LEVELS: "MONITORINGLEVELS",
    DREPORT_WGT_FOLDER: "DREPORT_WGT_FOLDER",
    DREPORT_WGT: "DREPORT_WGT",
    DURATION: "DURATION",
    PROJECTTYPE: "PROJECTTYPE",
    SRSTATUS: "SRSTATUS",
    PRIORITY: "PRIORITY",
    COMPLIANCE_MODULES: "COMPLIANCE_MODULES"
  },

  PARAM_TYPES: [
    "string",
    "password",
    "list",
    "date",
    "number",
    "boolean",
    "range",
  ],
  TAGS: {
    TAG_TYPES: [
      "text",
      "number",
      "date",
      "list",
      "boolean",
      "range",
      "cmdb",
      "cmdb_record",
    ],
    TAG_RESOURCETYPES: [
      "SOLUTION",
      "SOLUTION_ASSET",
      "GROUP",
      "SOLUTION_DEPLOYMENT",
      "ASSET_NETWORK",
      "ASSET_LB",
      "ASSET_FIREWALL",
      "ASSET_IG",
      "ASSET_INSTANCE",
      "ASSET_VPC",
      "ASSET_SUBNET",
      "ASSET_SECURITYGROUP",
      "ASSET_VOLUME",
    ],
    TAG_RESOURCETYPES_VALUES: ["SOLUTION", "SOLUTION_ASSET"],
  },
  CLOUDPROVIDER: {
    AWS: "AWS",
    ECL2: "ECL2",
    ALIBABA: "Alibaba",
    VMWARE: "VMware",
    SENTIA: "Sentia",
    EQUINIX: "Equinix",
    NUTANIX: "Nutanix",
  },
  ASSETTYPES: {
    AWS: [
      {
        title: "Amazon Elastic Compute Cloud - Compute",
        value: "ASSET_INSTANCE",
      },
      { title: "Amazon Virtual Private Cloud", value: "ASSET_VPC" }, // 1
      { title: "Subnet", value: "ASSET_SUBNET" }, // 2
      { title: "Security Group", value: "ASSET_SECURITYGROUP" }, // 3
      { title: "Load Balancer", value: "ASSET_LB" }, // 4
      { title: "Internet Gateway", value: "ASSET_IG" }, // 5
      { title: "AWS Storage Gateway", value: "ASSET_SGS" }, // 6
      { title: "Amazon Simple Storage Service", value: "ASSET_S3" }, // 7
      { title: "Amazon Relational Database Service", value: "ASSET_RDS" }, // 8
      { title: "Amazon Elastic Kubernetes Service", value: "ASSET_EKS" }, // 9
      { title: "Amazon Elastic Container Service", value: "ASSET_ECS" }, // 10
    ],
    ECL2: [
      { title: "Virtual Server", value: "ASSET_INSTANCE" },
      { title: "Network", value: "ASSET_NETWORK" },
      { title: "Load Balancer", value: "ASSET_LB" },
      { title: "Firewall", value: "ASSET_FIREWALL" },
      { title: "Internet Connectivity", value: "ASSET_IG" },
      { title: "Common Function Gateway", value: "ASSET_CFG" },
      { title: "Storage", value: "ASSET_VOLUME" },
    ],
    VMWARE: [
      {
        title: "Clusters",
        value: "CLUSTERS",
      },
      {
        title: "Datacenters",
        value: "DATACENTERS",
      },
      {
        title: "Hosts",
        value: "VM_HOSTS",
      },
      {
        title: "Virtual Machines",
        value: "VIRTUAL_MACHINES",
      },
    ],
  },
  ASSET_TYPES: {
    AWS: ["S3", "RDS"],
  },
  FORMSTATUS: {
    VALID: "VALID",
    INVALID: "INVALID",
  },
  VALIDATIONS: {
    SAVE: "Save",
    UPDATE: "Update",
    MODE: {
      VIEW: "View",
      COPY: "Copy",
    },
    AWS: AWSAppConstant.VALIDATIONS,
    ECL2: ECLAppConstant.VALIDATIONS,
    ALIBABA: ALIBABAAppConstant.VALIDATIONS,
    USER: {
      ADD: "Add",
      EDIT: "Update User",
      TENANT: {
        required: "Please Select Tenant",
      },
      ROLE: {
        required: "Please Select Role",
      },
      FULLNAME: {
        required: "Please Enter Full Name",
        minlength: "Full Name atleast 1 character",
        maxlength: "Full Name not more than 45 character",
      },
      EMAIL: {
        required: "Please Enter Email ID",
        pattern: "Please Enter a Valid Email ID",
      },
      DEPARTMENT: {
        required: "Please Enter Department",
      },
      MOBILENO: {
        pattern: "Please Enter a Valid Mobile No",
        minlength: "Mobile No atleast 10 character",
        maxlength: "Mobile No not more than 15 character",
      },
      PHONENO: {
        pattern: "Please Enter a Valid Phone No",
        minlength: "Phone No atleast 8 character",
        maxlength: "Phone No not more than 15 character",
      },
      PASSWORD: {
        required: "Please Enter Password",
        minlength: "Password atleast 6 character",
        maxlength: "Password not more than 25 character",
      },
      ROLENAME: {
        required: "Please Enter Role Name",
        minlength: "Role Name atleast 1 character",
        maxlength: "Role Name not more than 45 character",
      },
      ROLES: {
        ADMIN: "csdm_admin",
        ADD: "Add Role",
        EDIT: "Edit Role",
        PERMISSIONS: {
          required: "Please Select Permissions",
        },
        ACTIONS: {
          required: "Please Fill the Screen Permissions",
        },
      },
    },
    CUSTOMER: {
      ADD: "Add ",
      EDIT: "Update ",
      CUSTOMERNAME: {
        required: "Please Enter Name",
        minlength: SUB_TENANT + " atleast 1 character",
        maxlength: SUB_TENANT + " not more than 50 character",
      },
      CUSTOMERCODE: {
        minlength: "Customer Code should be atleast 3 character",
        maxlength: "Customer Code should not more than 30 character",
      },
      EMAIL: {
        pattern: "Please Enter a Valid Email ID",
      },
      PHONENO: {
        minlength: "Mobile No atleast 10 character",
        maxlength: "Mobile No not more than 12 character",
      },
      MOBILENO: {
        pattern: "Please Enter a Valid Mobile No",
        minlength: "Mobile No atleast 10 character",
        maxlength: "Mobile No not more than 12 character",
      },
      CONTACTPERSON: {
        minlength: "Mobile No atleast 1 character",
        maxlength: "Mobile No not more than 30 character",
      },
      ADDRESS: {
        minlength: "Mobile No atleast 1 character",
        maxlength: "Mobile No not more than 500 character",
      },
      POSTCODE: {
        minlength: "Mobile No atleast 1 character",
        maxlength: "Mobile No not more than 12 character",
      },
      REGION: {
        required: "Please select region",
      },
      CONTRACT: {
        required: "Please enter contract id",
      },
      SYNC: "Asset sync started. Please check back in a while.",
    },
    DEPLOYMENT: {
      SHOWMORE: "Show more ...",
      HIDE: "Hide",
      NOTES: "Show History",
    },
    SCRIPT: {
      SCRIPTNAME: {
        required: "Please Enter Script Name",
        minlength: "Script Name atleast 1 character",
        maxlength: "Script Name not more than 50 character",
        pattern: "Please Enter Valid Script name, it should not contain spaces",
        cannotContainSpace: "Script name should not contain space",
      },
      SCRIPTTYPE: {
        required: "Please Select Script Type",
      },
      COMMENTBLOACK: {
        minlength: "Script Name atleast 1 character",
        maxlength: "Script Name not more than 50 character",
      },
      NOTES: {
        minlength: "Script Name atleast 1 character",
        maxlength: "Script Name not more than 100 character",
      },
    },
    //#OP_T428
    SYNTHETICS: {
      name: {
        required: "Please Enter Synthetic Name",
        minlength: "Synthetic Name atleast 1 character",
        maxlength: "Synthetic Name not more than 21 character",
        pattern:
          "Please Enter Valid Synthetic name, it should not contain spaces",
        cannotContainSpace: "Synthetic name should not contain space",
      },
      type: {
        required: "Please Enter Monitoring type",
      },
      region: {
        required: "Please Select Region",
      },
      memoryinmb: {
        required: "Please Enter Memory(MB)",
        min: "Memory is atleast 960 MB",
        max: "Memory is not more than 3008 MB",
      },
      timeout: {
        required: "Please Enter Timeout in Seconds",
        min: "Timeout is atleast 3 seconds",
        max: "Timeout is not more than 840 seconds",
      },
      recurring: {
        required: "Please check the Recurring",
      },
      rate_in_min: {
        min: "Frequency value must be above or equal to 1 minute",
        max: "Frequency value must be below or equal to 60 minutes",
      },
      cron: {
        pattern: "Please enter valid cron expression",
      },
    },
    TAG: {
      TAGNAME: {
        required: "Please Enter Tag Name",
        minlength: "Tag Name atleast 1 character",
        maxlength: "Tag Name not more than 50 character",
        pattern: "Only spaces and characters are allowed",
      },
      TAGTYPE: {
        required: "Please specify tag Data Type",
      },
      RESOURCETYPE: {
        required: "Please Specify Tag Classification",
      },
      DESCRIPTION: {
        minlength: "Description must be atleast 1 character",
        maxlength: "Description must not be more than 1000 character",
      },
    },
    COSTSETUP: {
      cloudprovider: { required: "Please select cloud provider" },
      region: { required: "Please select region" },
      resourcetype: { required: "Please select asset" },
      plantype: { required: "Please select plan type" },
      unit: { required: "Please select unit" },
      currency: { required: "Please select currency" },
      pricingmodel: { required: "Please select pricing model" },
      priceperunit: { required: "Please enter price per unit" },
    },
    BUDGETSETUP: {
      startdt: { required: "Please select start date" },
      enddt: { required: "Please select end date" },
      cloudprovider: { required: "Please select cloud provider" },
      customer: { required: "Please select customer" },
      resourcetype: { required: "Please select resource type" },
      instancerefid: { required: "Please select resource" },
      currency: { required: "Please select currency" },
      budgetamount: { required: "Please enter budget amount" },
    },
    NOTIFICATION: {
      module: { required: "Please select module" },
      event: { required: "Please select event" },
      notes: { required: "Please enter notes" },
      ntftype: { required: "Please select notification type" },
      template: { required: "Please enter template" },
      receivers: { required: "Please select receivers" },
      RESLOVEDMSG: "Resolved the notification successfully",
      RESLOVEDERRMSG: "Unable to update the notification"
    },
    TAGGROUP: {
      GROUPNAME: {
        required: "Please Enter Tag Name",
        minlength: "Tag Name atleast 1 character",
        maxlength: "Tag Name not more than 50 character",
      },
      RESOURCETYPE: {
        required: "Please Specify Tag Classification",
      },
      TAGS: {
        required: "Please Specify Tags",
      },
    },
    TENANT: {
      TENANTNAME: {
        required: "Please Enter Tenant Name",
        minlength: "Tenant Name atleast 1 character",
        maxlength: "Tenant Name not more than 50 character",
      },
      EMAIL: {
        required: "Please Enter Email ID",
        pattern: "Please Enter a Valid Email ID",
      },
      MOBILENO: {
        required: "Please Enter Primary Phone Number",
        pattern: "Please Enter a Valid Phone Number",
        minlength: " Primary Phone Number atleast 10 character",
        maxlength: " Primary Phone Number not more than 12 character",
      },
      SECPHONENO: {
        minlength: " Secondary Phone Number atleast 10 character",
        maxlength: "Secondary Phone Number not more than 12 character",
      },
      ADDRESS: {
        minlength: "Address atleast 1 character",
        maxlength: "Address not more than 2000 character",
      },
      CONTACTPERSON: {
        minlength: "Address atleast 1 character",
        maxlength: "Address not more than 30 character",
      },
      DESIGNATION: {
        minlength: "Address atleast 1 character",
        maxlength: "Address not more than 45 character",
      },
      POSTCODE: {
        minlength: "Pincode atleast 3 character",
        maxlength: "Pincode not more than 11 character",
      },
      SMTPMAIL: {
        pattern: "Please Enter a Valid Email ID",
      },
    },
    INTEGRATION: {
      CLOUD: {
        required: "Please Select Tools",
      },      
    },
    ADDERRMSG: "Unable to add. Try again",
    UPDATEERRMSG: "Unable to update. Try again",
    DELETEERRMSG: "Unable to delete. Try again",
    COMMONERR: "Sorry! Something gone wrong",
    REPORT: {
      REPORTNAME: {
        required: "Please enter report name",
      },
    },
    CICDPROVIDERS: {
      NAME: {
        required: "Provider Name is required",
        minlength: "Minimum length is 3 characters",
        maxlength: "Maximum length is 50 characters"
      },
      BRANCH: {
        required: "Branch is required",
        minlength: "Minimum length is 3 characters",
        maxlength: "Maximum length is 45 characters"
      },
      USERNAME: {
        required: "Username is required",
        minlength: "Minimum length is 3 characters",
        maxlength: "Maximum length is 45 characters"
      },
      ACCESSTOKEN: {
        required: "Accesstoken is required",
        minlength: "Minimum length is 10 characters",
        maxlength: "Maximum length is 200 characters"
      },
      URL: {
        required: "URL is required",
        minlength: "Minimum length is 10 characters",
        maxlength: "Maximum length is 500 characters",
        pattern: "Enter a valid URL"
      },
      INSTANCENAME: {
        minlength: "Minimum length is 3 characters",
        maxlength: "Maximum length is 45 characters",
      },
      IPADDRESS: {
        required: "IP address is required",
        minlength: "Minimum length is 3 characters",
        maxlength: "Maximum length is 45 characters",
      },
      PASSWORD: {
        required: "Password is required",
        minlength: "Minimum length is 3 characters",
        maxlength: "Maximum length is 150 characters",
      },
      BUILDSCRIPT: {
        required: "Build script is required",
      },
      ORGANIZATION: {
        required: "Organization script is required",
        minlength: "Minimum length is 3 characters",
        maxlength: "Maximum length is 45 characters",
      },
    },
    ALERTNOTIFICATION: {
      ALERTTYPE: {
        required: "Please select alert type",
      },
      NOTIFIERS: {
        required: "Please select notifiers",
      }, 
      CONDITION: {
        required: "Please select condition",
      },
      METRICS: {
        required: "Please select metrics",
      }, 
      THRESHOLD: {
        required: "Please enter threshold",
      }, 
      LEVEL: {
        required: "Please select level",
      }
    },
    ROLLBACK_RETRIES: {
      RETRYTIMEINTERVAL: {
        required: "Please enter retry time interval",
        minlength: "Minimum length is 300 characters",
      },
      RETRYCOUNT: {
        required: "Please enter retry count",
        minlength: "Minimum length is 2 characters",
      },
      NOTIFIERS: {
        required: "Please select notifiers",
      }, 
      ROLLBACKMETHOD: {
        required: "Please select rollback method",
      }, 
      ROLLBACKOPTION: {
        required: "Please select rollback Option",
      },
      ORCHESTRATOR: {
        required: "Please select orchestration",
      }
    },
    NOTIFICATIONSMSG: {
      EVENTTYPE: {
        required: "Please select event type",
      },
      REMEDIATIONTYPE: {
        required: "Please select remediation type",
      },
      NOTIFIERS: {
        required: "Please select notifiers",
      },
      SCRIPT: {
        required: "Please select script",
      },
      ORCHESTRATION: {
        required: "Please select orchestration",
      }
    },
    SETTINGSMSG: {
      storagetype: {
        required: "Please select storage type",
      },
      username: {
        required: "Please select username",
      },
      password: {
        required: "Please enter password",
      },
      ip: {
        required: "Please enter ip",
      },
      provider: {
        required: "Please select provider",
      },
      region: {
        required: "Please select region",
      },
      endpoint: {
        required: "Please enter endpoint",
      },
      folder: {
        required: "Please enter folder",
      },
      accesskey: {
        required: "Please enter accesskey",
      },
      secretkey: {
        required: "Please enter secretkey",
      },
      action: {
        required: "Please select action",
      },
      orchestration: {
        required: "Please select orchestration",
      },
      type: {
        required: "Please select type",
      },
      frequency: {
        required: "Please enter frequency",
      },
      customers: {
        required: "Please select customers",
      },
      accounts: {
        required: "Please select accounts",
      },
      tag: {
        required: "Please select tag",
      },
      tagvalue: {
        required: "Tag value is required",
      },
      instance: {
        required: "Please select instance",
      }
    },
    INTEGRATIONMSG: {
      TOOLS: {
        required: "Please select tools",
      }
    },
    CMDBMSG: {
      RESOURCETYPE: "Input resource type is required",
      ATTRIBUTES: "Input attributes are required",
      OUTGOING: "Output resource type or attributes are required"
    }
  },
  SOLUTIONCOSTS: {
    ADD: "Add Costs",
    VALIDATIONS: {
      COSTTYPE: {
        required: "Please Select Cost type",
      },
      PRICE: {
        required: "Please Enter Price",
      },
    },
  },
  STATUS: {
    PENDING: "Pending",
    PUBLISHED: "Published",
    UNPUBLISHED: "Unpublished",
    DELETED: "Deleted",
    UNPUBLISH: "Unpublish",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    CLOSED: "Completed",
    WIP: "Work In Progress",
    DRAFT: "Draft",
    DEPLOYED: "Deployed",
    CLOSEREQ: "Close Request",
    REJECTED: "Rejected",
    NOC: "NOC",
    FAILED: "Failed",
    COMPLETED: "Completed",
    APPROVED: "Approved",
  },
  CURRENCY: {
    "€": "eur",
    $: "usd",
    "£": "GBP",
  },
  MESSAGES: {
    ADDED: "Added successfully",
    UPDATED: "Updated successfully",
    DELETED: "Deleted Successfully",
    CLONED: "Cloned Successfully",
  },
  ORCHESTRATION: {
    RETRIGGER_ORCH: "Orchestration Retriggered",
    ORCH_VALIDATION: "Please select the orchestration nodes to validate"
  },
  ERRORMESSAGE: {
    ERROR: "Unable to connect. Try again",
  },
  ORCHRUNVALIDATION: {
    TITLE: "Title allows only 100 characters",
    GROUP: "Group allows only 100 characters",
  },
  FIELDVALUES: {
    FIELDKEY: "Key",
    FIELDNAME: "Name",
    FIELDTYPE: "AUTOGEN",
    FIELDTYPETEXT: "Text",
  },
  CRNPREFIX: {
    CRN: "crn:ops:",
    KEY: "/fk:key",
    NAME: "/fk:name",
  },
  TENANTKEYS: {
    PREFIX: "admin_",
    EMAILHOST: "EMAIL_HOSTNAME",
    EMAILPORT: "EMAIL_PORT",
    EMAILID: "EMAIL_ID",
    EMAILPASSWORD: "EMAIL_PASSWORD",
    SMSGATEWAYURL: "SMS_GATEWAYURL",
    SMSUSERID: "SMS_USERID",
    SMSPASSWORD: "SMS_PASSWORD",
    SMSACCESSTOKEN: "SMS_ACCESSTOKEN",
    LDAPHOST: "LDAP_HOSTNAME",
    LDAPUSERID: "LDAP_USERID",
    LDAPPASSWORD: "LDAP_PASSWORD",
    CERSSL: "CER_SSL",
    CERTLS: "CER_TLS",
    CLOUDDETAILS: "CLOUD_DETAILS",
    CHARACTERTICS: "CHARACTERTICS",
    INTEGRATION: "TENANT_INTEGRATION"
  },
  MESSAGEDURATION: 0,
  ECLSTATUS: {
    APPROVED: "approved",
    REGISTERING: "registering",
  },
  AWS_BILLING_RESOURCETYPES: [
    // { title: 'Total Billing Cost', value: 'TOTAL_BILLING_COST' },
    { title: "Instances", value: "ASSET_INSTANCE" },
    {
      title: "Amazon Elastic Compute Cloud - Compute",
      value: "Amazon Elastic Compute Cloud - Compute",
    },
    { title: "AmazonCloudWatch", value: "AmazonCloudWatch" },
    {
      title: "Amazon Virtual Private Cloud",
      value: "Amazon Virtual Private Cloud",
    },
    {
      title: "Amazon Simple Storage Service",
      value: "Amazon Simple Storage Service",
    },
    { title: "AWS Backup", value: "AWS Backup" },
    { title: "AWS Storage Gateway", value: "AWS Storage Gateway" },
    {
      title: "Amazon Relational Database Service",
      value: "Amazon Relational Database Service",
    },
    { title: "AWS Directory Service", value: "AWS Directory Service" },
    { title: "Amazon CloudFront", value: "Amazon CloudFront" },
    {
      title: "AWS Key Management Service",
      value: "AWS Key Management Service",
    },
    { title: "Amazon WorkSpaces", value: "Amazon WorkSpaces" },
    {
      title: "Amazon Simple Email Service",
      value: "Amazon Simple Email Service",
    },
    {
      title: "Amazon Simple Notification Service",
      value: "Amazon Simple Notification Service",
    },
    { title: "Amazon Route 53", value: "Amazon Route 53" },
    {
      title: "Amazon EC2 Container Service",
      value: "Amazon EC2 Container Service",
    },
    { title: "Amazon Glacier", value: "Amazon Glacier" },
    {
      title: "Amazon Elastic Container Service for Kubernetes",
      value: "Amazon Elastic Container Service for Kubernetes",
    },
  ],
  ECL2_BILLING_RESOURCETYPES: [
    // { title: 'Total Billing Cost', value: 'TOTAL_BILLING_COST' },
    { title: "Virtual Server", value: "VIRTUAL_SERVER" },
    { title: "Storage", value: "ASSET_VOLUME" },
    { title: "Network", value: "ASSET_NETWORK" },
    { title: "Load Balancer", value: "ASSET_LOADBALANCER" },
    { title: "Internet Connectivity", value: "ASSET_INTERNETCONNECTIVITY" },
    { title: "Instances", value: "ASSET_INSTANCE" },
    { title: "Image Storage", value: "ASSET_IMAGESTORAGE" },
    { title: "Firewall", value: "ASSET_FIREWALL" },
    { title: "Middleware", value: "ASSET_MIDDLEWARE" },
    { title: "Dedicated Hypervisor", value: "ASSET_DEDICATEDHYPERVISOR" },
    { title: "Baremetal Server", value: "ASSET_BAREMETALSERVER" },
    { title: "Backup", value: "ASSET_BACKUP" },
    { title: "Discount", value: "ASSET_DISCOUNT" },
  ],

  ALERT_LEVELS: {
    SYSTEM: [
      { title: "High", value: "High", count: 0 },
      { title: "Medium", value: "Medium", count: 0 },
      { title: "Low", value: "Low", count: 0 },
    ],
    SECURITY: [
      { title: "High", value: "High", count: 0 },
      { title: "Medium", value: "Medium", count: 0 },
      { title: "Low", value: "Low", count: 0 },
    ],
    SSL: [
      { title: "High", value: "High", count: 0 },
      { title: "Medium", value: "Medium", count: 0 },
      { title: "Low", value: "Low", count: 0 },
    ],
    SYNTHETICS: [
      { title: "High", value: "High", count: 0 },
      { title: "Medium", value: "Medium", count: 0 },
      { title: "Low", value: "Low", count: 0 },
    ],
    PRIORITY: [
      { title: "Priority 1", value: "Priority 1" },
      { title: "Priority 2", value: "Priority 2" },
      { title: "Priority 3", value: "Priority 3" },
      { title: "Priority 4", value: "Priority 4" },
    ],
    EVENTS: [
      { title: "High", value: "High", count: 0 },
      // { title: "Normal", value: "Normal",count:0 },
      { title: "Medium", value: "Medium", count: 0 },
      { title: "Low", value: "Low", count: 0 },
    ],
    LEVELS: [
      { title: "Level 1 (Ignored)", value: 0 },
      { title: "Level 2 (System low priority notification)", value: 2 },
      { title: "Level 3 (Successful/Authorized events)", value: 3 },
      { title: "Level 4 (System low priority error)", value: 4 },
      { title: "Level 5 (User generated error)", value: 5 },
      { title: "Level 6 (Low relevance attack)", value: 6 },
      { title: "Level 7 ('Bad word' matching)", value: 7 },
      { title: "Level 8 (First time seen)", value: 8 },
      { title: "Level 9 (Error from invalid source)", value: 9 },
      { title: "Level 10 (Multiple user generated errors)", value: 10 },
      { title: "Level 11 (Integrity checking warning)", value: 11 },
      { title: "Level 12 (High importance event)", value: 12 },
      { title: "Level 13 (Unusual error (high importance))", value: 13 },
      { title: "Level 14 (High importance security event)", value: 14 },
      { title: "Level 15 (Severe attack)", value: 15 },
    ],
  },
  CUSTOMER_SLA: ["INCIDENTSLA", "AVAILABILITYSLA", "SERVICECREDITS"],
  KPI_REPORING: {
    TICKETS: "TICKETS",
    MONITORING: "MONITORING",
    ASSET: "ASSET",
    CMDB: "CMDB",
    CMDB_SAVEDQUERY: "CMDB_SAVEDQUERY",
    USERS: "USERS",
    CUSTOMERS: "CUSTOMERS",
    DATAMANAGEMENT: "DATAMANAGEMENT",
    SLA: "SLA",
    TAGS: "TAGS",
    SYNTHETICS: "SYNTHETICS",
    SSL: "SSL",
  },
  METRICS: [
    { title: "CPU", value: "CPU" },
    { title: "RAM", value: "RAM" },
    { title: "DISK", value: "DISK" },
  ],
  ACT_CLOUDPROVIDER: [
    { title: "AWS", value: "AWS" },
    { title: "Sentia", value: "Sentia" },
    { title: "Equinix", value: "Equinix" },
  ],
  AWS_CLOUDSTATUS: [
    { title: "Pending", value: "pending" },
    { title: "Running", value: "running" },
    { title: "Shutting-down", value: "shutting-down" },
    { title: "Stopped", value: "stopped" },
    { title: "Terminated", value: "terminated" },
  ],
  CHART_TYPES: [
    { label: "Bar", value: "bar" },
    { label: "Stacked bar", value: "stackedbar" },
    { label: "Line", value: "line" },
    { label: "Scatter", value: "scatter" },
    // { label: "Timeline", value: "rangeBar" },
  ],
  TABLE_HEADERS: {
    users: [
      {
        field: "x",
        header: "Created Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "Users Count", datatype: "string", show: true },
      {
        header: "Role",
        field: "rolename",
        datatype: "string",
        show: false,
      },
      {
        header: "Department",
        field: "department",
        datatype: "string",
        show: false,
      },
    ],
    tickets: [
      {
        field: "x",
        header: "Incident Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "Incident Count", datatype: "string", show: true },
      {
        header: "Customer",
        field: "customername",
        datatype: "string",
        show: false,
      },
      {
        header: "Priority",
        field: "severity",
        datatype: "string",
        show: false,
      },
      {
        header: "Category",
        field: "category",
        datatype: "string",
        show: false,
      },
      {
        header: "Published?",
        field: "publishyn",
        datatype: "string",
        show: false,
      },
      {
        header: "Status",
        field: "incidentstatus",
        datatype: "string",
        show: false,
      },
    ],
    monitoring: [
      {
        field: "x",
        header: "Event Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "Event Count", datatype: "string", show: true },
      {
        header: "Customer",
        field: "customername",
        datatype: "string",
        show: false,
      },
      {
        header: "Priority",
        field: "severity",
        datatype: "string",
        show: false,
      },
      {
        header: "Alert Type",
        field: "referencetype",
        datatype: "string",
        show: false,
      },
      {
        header: "Levels",
        field: "level",
        datatype: "string",
        show: false,
      },
      {
        header: "Metric",
        field: "metric",
        datatype: "string",
        show: false,
      },
      {
        header: "Tag",
        field: "tagid",
        datatype: "string",
        show: false,
      },
      {
        header: "Tag Value",
        field: "tagvalue",
        datatype: "string",
        show: false,
      },
    ],
    assets: [
      {
        field: "x",
        header: "Created Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "Asset Count", datatype: "string", show: true },
      {
        header: "Customer",
        field: "customername",
        datatype: "string",
        show: false,
      },
      {
        header: "Provider",
        field: "cloudprovider",
        datatype: "string",
        show: false,
      },
      {
        header: "Instance",
        field: "instancename",
        datatype: "string",
        show: false,
      },
      {
        header: "Instance Id",
        field: "instancerefid",
        datatype: "string",
        show: false,
      },
      {
        header: "Region",
        field: "region",
        datatype: "string",
        show: false,
      },
      {
        header: "Instance Type",
        field: "instancetyperefid",
        datatype: "string",
        show: false,
      },
      {
        header: "Cloud Status",
        field: "cloudstatus",
        datatype: "string",
        show: false,
      },
    ],
    cmdb: [
      {
        field: "x",
        header: "Attribute",
        datatype: "string",
        show: true,
      },
      { field: "y0", header: "Asset Count", datatype: "string", show: true },
    ],
    datamanagement: [
      {
        field: "x",
        header: "Created Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "Resource Count", datatype: "string", show: true },
      {
        header: "Attribute Type",
        field: "fieldtype",
        datatype: "string",
        show: false,
      },
      {
        header: "Resource Type",
        field: "resourcetype",
        datatype: "string",
        show: false,
      },
      {
        header: "Category",
        field: "category",
        datatype: "string",
        show: false,
      },
      {
        header: "Is ReadOnly?",
        field: "readonly",
        datatype: "string",
        show: false,
      },
    ],
    customer: [
      {
        field: "x",
        header: "Created Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "Customers Count", datatype: "string", show: true },
      {
        header: "Accounts",
        field: "customername",
        datatype: "string",
        show: false,
      },
    ],
    sla: [
      {
        field: "x",
        header: "Created Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "SLA Count", datatype: "string", show: true },
      {
        header: "Customer",
        field: "customername",
        datatype: "string",
        show: false,
      },
    ],
    tag: [
      {
        field: "x",
        header: "Created Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "Tags Count", datatype: "string", show: true },
      {
        header: "Resource Type",
        field: "resourcetype",
        datatype: "string",
        show: false,
      },
      {
        header: "Tag Type",
        field: "tagtype",
        datatype: "string",
        show: false,
      },
    ],
    synthetics: [
      {
        field: "x",
        header: "Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "Count", datatype: "string", show: true },
      {
        header: "Synthetic",
        field: "canaryname",
        datatype: "string",
        show: false,
      },
    ],
    ssl: [
      {
        field: "x",
        header: "Expiry Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        show: true,
      },
      { field: "y", header: "Url count", datatype: "string", show: true },
      {
        header: "SSL Name",
        field: "name",
        datatype: "string",
        show: true,
      },
      {
        header: "URLS",
        field: "urls",
        datatype: "string",
        show: true,
      },
    ],
  },
  CATALOG_PARAMTYPE: "Catalog",
  WORKPACK_CONFIG: {
    DOCUMENT_DATATYPE: "DOCUEMNT_DATATYPE",
    WP_TASK_KEY: "WORKPACK_TASK",
  },
  RESOURCETYPE_MODULE: ["cmdb", "workpack"],
  WORKPACK_DEFAULT_ATTR: [
    {
      fieldname: "Installer/Executor",
      fieldkey: "/fk:executor",
      fieldtype: "Select",
      showbydefault: 1,
      status: "Active",
      operationtype: "workpack-execution",
    },
    {
      fieldname: "Execution Date",
      fieldkey: "/fk:executiondate",
      fieldtype: "Date",
      showbydefault: 1,
      status: "Active",
      operationtype: "workpack-execution",
    },
    {
      fieldname: "Execution Result",
      fieldkey: "/fk:executionresult",
      fieldtype: "Select",
      defaultval: "OK, NOK, N/A",
      showbydefault: 1,
      status: "Active",
      operationtype: "workpack-execution",
    },
    {
      fieldname: "Executor Remarks",
      fieldkey: "/fk:executorremarks",
      fieldtype: "Textarea",
      showbydefault: 1,
      status: "Active",
      operationtype: "workpack-execution",
    },
    {
      fieldname: "Reviewer",
      fieldkey: "/fk:reviewer",
      fieldtype: "Select",
      showbydefault: 1,
      status: "Active",
      operationtype: "workpack-review",
    },
    {
      fieldname: "Review Date",
      fieldkey: "/fk:reviewdate",
      fieldtype: "Date",
      showbydefault: 1,
      status: "Active",
      operationtype: "workpack-review",
    },
    {
      fieldname: "Review Result",
      fieldkey: "/fk:reviewresult",
      fieldtype: "Select",
      defaultval: "OK, NOK, N/A",
      showbydefault: 1,
      status: "Active",
      operationtype: "workpack-review",
    },
    {
      fieldname: "Reviewer Remarks",
      fieldkey: "/fk:reviewerremarks",
      fieldtype: "Textarea",
      showbydefault: 1,
      status: "Active",
      operationtype: "workpack-review",
    },
  ],
  CMDB_OPERATIONTYPE: [
    "cmdb",
    "workpack-execution",
    "workpack-review",
    "workpack-template",
    "workpack-task",
    "workpack-executable",
    "task-executable",
    "workpack-watchlist",
    "asset-product-map",
  ],
  WORKPACK_OPERATIONTYPE: ["Draft", "Published"],
  WORKPACK_EXECUTIONSTATUS: [
    "Execution Completed",
    "Execution Inprogress",
    "Execution Failed",
    "Execution Rejected",
  ],
  ENVIRONMENT_FILTERS: [
    {
      fieldkey: "crn:ops:environment/fk:key",
      fieldname: "Key",
      fieldtype: "AUTOGEN",
      isSelected: true
    },
    {
      fieldkey: "crn:ops:environment/fk:name",
      fieldname: "Name",
      fieldtype: "Text",
      isSelected: true
    },
    {
      fieldkey: "crn:ops:environment/fk:created",
      fieldname: "Created",
      fieldtype: "DateTime",
      isSelected: true
    },
    {
      fieldkey: "crn:ops:environment/fk:updated",
      fieldname: "Updated",
      fieldtype: "DateTime",
      isSelected: true
    }
  ],
  SYSTEM: [
    { title: "High", value: "High" },
    { title: "Medium", value: "Medium" },
    { title: "Low", value: "Low" },
    { title: "Normal", value: "Normal" },
  ],
  TXNSTATUS: [
    { title: "Resolved", value: "Resolved" },
    { title: "In Progress", value: "In Progress" },
  ],
  pageCount: [10, 25, 50, 75, 100],
  PLATFORM: [
    { title: "Windows", value: "Windows", count: 0 },
    { title: "Linux", value: "Linux", count: 0 },
  ],
  CICD: {
    STATUS: {
      COMPLETED: 'COMPLETED',
      INPROGRESS: 'INPROGRESS',
      PENDING: 'PENDING',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
      VARIABLE_TYPE: ['PROVIDER', 'CLOUDMATIQ'],
    },
    PROVIDER: {
      GITHUB: 'GITHUB',
      BITBUCKET: 'BITBUCKET',
      GITLAB: 'GITLAB',
    },
    Status: [
      { value: "PENDING", label: "PENDING" },
      { value: "INPROGRESS", label: "INPROGRESS" },
      { value: "COMPLETED", label: "COMPLETED" },
      { value: "FAILED", label: "FAILED" },
      { value: "CANCELLED", label: "CANCELLED" },
    ],
    status: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
    schedule: [
      { value: "SCHEDULE", label: "SCHEDULE" },
      { value: "ONCOMMIT", label: "ONCOMMIT" },
      { value: "MANUAL", label: "MANUAL" },
    ],
    provider: [
      { value: "GITHUB", label: "GITHUB" },
      { value: "BITBUCKET", label: "BITBUCKET" },
      { value: "GITLAB", label: "GITLAB" },
    ],
    CONTAINER_REGISTRY:[
      'DOCKERHUB'
    ],
    TESTING_TOOLS:[
      'SONARQUBE'
    ],
    environments:[
      'VIRTUAL_MACHINE',
      'environment'
    ],
    TESTTOOLS: {
      MODES: [
        { value: "Production", label: "Production" },
        { value: "Development", label: "Development" },
        { value: "QA-Testing", label: "QA-Testing" },
        { value: "Performance", label: "Performance" },
        { value: "Maintainance", label: "Maintainance" },
      ]
    },
    ENVIRONMENTS: {
      AUTHENTICATIONTYPE: [
        { value: "PASSWORD", label: "PASSWORD" },
        { value: "KEY_FILE", label: "KEY BASED TYPE (Not configured)" },
      ],
      VARIABLETYPE: [
        { value: "CLOUDMATIQ", label: "CLOUDMATIQ" },
        { value: "PROVIDER", label: "PROVIDER" },
      ],
      KEYTYPE: [
        { value: "SECRETS", label: "SECRETS" },
        { value: "VARIABLES", label: "VARIABLES" },
      ],
      LOOKUPKEY: {
        CICD_ENVIRONMENTS: "CICD_ENVIRONMENTS",
      },
    },
    ERRORMSG: {
      createpipeline: 'Please enter the pipeline name',
      selectRunner: 'Please select the runner',
      WatchList: 'Please select the notification watchlist',
      Piplinevalidation:'Please select the nodes to validate'
    },
    TYPE: {
      provider: 'PROVIDER',
      environment: 'ENVIRONMENTS',
      schedule: 'MANUAL',
      orchestration: 'ORCHESTRATION'
    },
    dashboardChartfilter: [
      { value: "ALL", label: "All" },
      { value: "COMPLETED", label: "Success" },
      { value: "FAILED", label: "Failed" },
    ],
    dashboardProgressBarfilter: [
      { value: "7", label: "Last 07 Days" },
      { value: "30", label: "Last 30 Days" },
      { value: "182", label: "Last 6 Months" },
      { value: "365", label: "Last 12 Months" },
    ],
    variableFields: {
      "usernameisvariable": ["usernamevariable", "username"],
      "accesstokenisvariable": ["accesstokenvariable", "accesstoken"],
      "passwordisvariable": ["passwordvariable", "password"],
      "ipaddressisvariable": ["ipaddressvariable", "ipaddress"],
      "urlisvariable": ["urlvariable", "url"],
    },
    variablesLabels: {
      "usernamevariable": "Username Variable",
      "accesstokenvariable": "Access Token Variable",
      "passwordvariable": "Password Variable",
      "ipaddressvariable": "Ipaddress Variable",
      "urlvariable": "URL Variable",
    },
    variables: [
      "usernamevariable",
      "accesstokenvariable",
      "passwordvariable",
      "ipaddressvariable",
      "urlvariable",
    ],
    isVariables: [
      "usernameisvariable",
      "accesstokenisvariable",
      "passwordisvariable",
      "ipaddressisvariable",
      "urlisvariable",
    ],
    PROPERTYNAMES: [
      "ConfigDetail",
      'releasesetupdetailconfig',
      "pipelinetemplatedetails",
      'templatedetailconfig',
      'releasetemplatedetails'
    ],
    REFERENCETYPE: {
      CONTAINER_REGISTRY: "CONTAINER_REGISTRY",
      TESTING_TOOL: "TESTING_TOOL",
      BUILD_SCRIPT: "BUILD_SCRIPT",
    },
    MODULE: {
      cicd: 'CICD',
      DR: "DR"
    },
    pageChangeCount : [5,10, 25, 50, 75, 100],
    ANSIREGEX: /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g,
  },
  REQUEST_STATUS: [
    { title: "In Progress", value: "In Progress" },
    { title: "Pending", value: "Pending" },
    { title: "Completed", value: "Completed" },
  ],
  WORKFLOW_MODULE: [
    { title: "Request management", value: "Request management" },
    { title: "Workpack", value: "Workpack" },
    { title: "Orchestration", value: "Orchestration" },
    { title: "CICD", value: "CICD" },
    { title: "Solution", value: "Solution" },
  ],
  APPROVAL_STATUS: [
    { title: "Pending", value: "Pending" },
    { title: "Approved", value: "Approved" },
    { title: "Executed", value: "Executed" },
    { title: "Completed", value: "Completed" },
    { title: "Rejected", value: "Rejected" },
  ],
  REQUEST_TYPE: [
    { title: "Generic", value: "Generic" },
    { title: "Ad-Hoc Request", value: "Ad-Hoc Request" },
  ],
  REQUEST_DOCUMENT: "Request/",
  EMITTYPE: ["Response", "Close"],
  REFERENCETYPE: ["ServiceRequest","ServiceCatalog","Workflow","Pipeline Template","Service Catalog Request","Workpack Execution","Releases","Orchestration","Tenants","Roles","Users","Environments-Virtual Machine","Variables","Github","Docker Hub","Build-Virtual Machine","Sonarqube","Scripts","Products","Ticket","Alert","Maintainance Window","SSL","Solution Template","Parameters","Customer"],
  REQUEST_TXNTYPE: ["REQUEST_MANAGEMENT"],
  DATE_FORMAT: "DD-MMM-YYYY hh:mm:ss A",
  WORKPACK_HOFFIX: "crn:ops:hotfix_workpack_template",
  WORKPACK_MODEL: "crn:ops:workpack_model_1",
  CMDB_ENVIRONMENT: "crn:ops:environment",
  REQUEST_HISTORY: ["Approval", "Execution","Approved","Executed"],
  MODULE: ["CICD","Request"],
  REQUEST_REFERENCE_TYPES: ["Solution","Orchestration","Workpack","CICD"],
  GENERIC: "Generic",
  HISTORY_KEYWORDS: {
    Add: "Notes Added",
    Create: "Create",
    Update: "Notes Updated",
    Upload: "File Uploaded",
    Download: "File Downloaded",
    Delete: "Comment Deleted",
    DeleteDoc: "Document Deleted",
    Approve: "Approve",
    Execute: "Execute",
    Reject: "Reject"
  },
  DECOMMISSIONINGERR: "Decommissioning date should be greater than or equal to Start date of deployment",
  TENANT_LOGIN : {
    TWOFA: "TWOFACTORYN",
    TWOFA_VALUE: "true"
 },
 DEFAULTTEMPLATEOBJ: {
    version: "1.0",
    diagram: "UML",
    indicators: [],
    links: [
      {
        from: "OmVUXivR9C4X6Bx7pJI1H",
        to: "2C8BlSA4qEtVklg7HE9QT",
        points: [
          {
            x: 220,
            y: 70,
          },
          {
            x: 290,
            y: 70,
          },
        ],
      },
      {
        from: "2C8BlSA4qEtVklg7HE9QT",
        to: "S7QRTrKQKw3V0JhM7phNg",
        points: [
          {
            x: 350,
            y: 70,
          },
          {
            x: 450,
            y: 70,
          },
        ],
      },
      {
        from: "u2gEAps5NZHGTXKC1VXkB",
        to: "pb1q7AwJNnlGXSdi3fK2K",
        points: [
          {
            x: 660,
            y: 70,
          },
          {
            x: 740,
            y: 70,
          },
        ],
      },
      {
        from: "pb1q7AwJNnlGXSdi3fK2K",
        to: "nvHBmWIcEVCbat-_8oX2k",
        points: [
          {
            x: 800,
            y: 70,
          },
          {
            x: 870,
            y: 70,
          },
        ],
      },
      {
        from: "nvHBmWIcEVCbat-_8oX2k",
        to: "NUHHNTeMDY20AFqkdV7XZ",
        points: [
          {
            x: 930,
            y: 70,
          },
          {
            x: 1040,
            y: 70,
          },
        ],
      },
      {
        from: "S7QRTrKQKw3V0JhM7phNg",
        to: "u2gEAps5NZHGTXKC1VXkB",
        points: [
          {
            x: 510,
            y: 70,
          },
          {
            x: 600,
            y: 70,
          },
        ],
      },
    ],
    nodes: [
      {
        name: "PROVIDER",
        params: {
          id: "OmVUXivR9C4X6Bx7pJI1H",
          label: "cicd_dev",
          x: 190,
          y: 70,
          data: {
            branch: "main",
            name: "Dev_Tester",
            username: "DevTester2025",
            url: "www.github.com",
            referenceid: 3,
            type: "GITHUB",
          },
        },
        data: {
          branch: "main",
          name: "Dev_Tester",
          username: "DevTester2025",
          url: "www.github.com",
          referenceid: 3,
          type: "GITHUB",
        },
      },
      {
        name: "CONTAINER_REGISTRY",
        params: {
          id: "2C8BlSA4qEtVklg7HE9QT",
          label: "DEV_DOCKERHUB",
          x: 320,
          y: 70,
          data: {
            name: "DEV_DOCKERHUB",
            usernamevariable: null,
            usernameisvariable: false,
            username: "devtester2025",
            accesstokenvariable: null,
            accesstokenisvariable: false,
            url: "https://hub.docker.com/",
            urlvariable: null,
            urlisvariable: false,
            referenceid: 1,
            type: "DOCKERHUB",
            imagename: "cicd_dev",
          },
        },
        data: {
          name: "DEV_DOCKERHUB",
          usernamevariable: null,
          usernameisvariable: false,
          username: "devtester2025",
          accesstokenvariable: null,
          accesstokenisvariable: false,
          url: "https://hub.docker.com/",
          urlvariable: null,
          urlisvariable: false,
          referenceid: 1,
          type: "DOCKERHUB",
          imagename: "cicd_dev",
        },
      },
      {
        name: "TESTING_TOOL",
        params: {
          id: "S7QRTrKQKw3V0JhM7phNg",
          label: "DEV_SONARQUBE",
          x: 480,
          y: 70,
          data: {
            name: "DEV_SONARQUBE",
            urlvariable: null,
            urlisvariable: false,
            url: "http://13.51.7.24:9000/",
            organization: "test",
            accesstokenvariable: null,
            accesstokenisvariable: false,
            accesstoken: "sqp_e3502cd244a813520d59a3b4a9ce500400701144",
            referenceid: 1,
            type: "SONARQUBE",
          },
        },
        data: {
          name: "DEV_SONARQUBE",
          urlvariable: null,
          urlisvariable: false,
          url: "http://13.51.7.24:9000/",
          organization: "test",
          accesstokenvariable: null,
          accesstokenisvariable: false,
          accesstoken: "sqp_e3502cd244a813520d59a3b4a9ce500400701144",
          referenceid: 1,
          type: "SONARQUBE",
        },
      },
      {
        name: "ENVIRONMENTS",
        params: {
          id: "NUHHNTeMDY20AFqkdV7XZ",
          label: "CICD_VM",
          x: 1070,
          y: 70,
          data: {
            ipaddress: "13.51.7.24",
            username: "ubuntu",
            usernamevariable: null,
            usernameisvariable: false,
            ipaddressvariable: null,
            ipaddressisvariable: false,
            password: "CmCICD#2024#",
            passwordvariable: null,
            passwordisvariable: false,
            instancename: "CICD_VM",
            referenceid: 1,
            type: "VIRTUAL_MACHINE",
            port: "3000",
          },
        },
        data: {
          ipaddress: "13.51.7.24",
          username: "ubuntu",
          usernamevariable: null,
          usernameisvariable: false,
          ipaddressvariable: null,
          ipaddressisvariable: false,
          password: "CmCICD#2024#",
          passwordvariable: null,
          passwordisvariable: false,
          instancename: "CICD_VM",
          referenceid: 1,
          type: "VIRTUAL_MACHINE",
          port: "3000",
        },
      },
      {
        name: "BUILD",
        params: {
          id: "u2gEAps5NZHGTXKC1VXkB",
          label: "DEV_BUILD",
          x: 630,
          y: 70,
          data: {
            name: "DEV_BUILD",
            instancename: null,
            ipaddress: "13.51.7.24",
            username: "ubuntu",
            password: "CmCICD#2024#",
            buildscript:
              "cd ~/projects/script_test/javaproject/Spring-Boot-main\nsudo mvn clean\nsudo mvn install",
            referenceid: 1,
            type: "BUILD_SCRIPT",
          },
        },
        data: {
          name: "DEV_BUILD",
          instancename: null,
          ipaddress: "13.51.7.24",
          username: "ubuntu",
          password: "CmCICD#2024#",
          buildscript:
            "cd ~/projects/script_test/javaproject/Spring-Boot-main\nsudo mvn clean\nsudo mvn install",
          referenceid: 1,
          type: "BUILD_SCRIPT",
        },
      },
      {
        name: "APPROVAL_WORKFLOW",
        params: {
          id: "pb1q7AwJNnlGXSdi3fK2K",
          label: "CICD Test",
          x: 770,
          y: 70,
          data: {
            name: "CICD Test",
            "approverlevel 1": "Sankara Narayanan",
            referenceid: 33,
            type: "APPROVAL_WORKFLOW",
          },
        },
        data: {
          name: "CICD Test",
          "approverlevel 1": "Sankara Narayanan",
          referenceid: 33,
          type: "APPROVAL_WORKFLOW",
        },
      },
      {
        name: "ORCHESTRATION",
        params: {
          id: "nvHBmWIcEVCbat-_8oX2k",
          label: "Patching-9-instances",
          x: 900,
          y: 70,
          data: {
            name: "Patching-9-instances",
            referenceid: 3,
            type: "ORCHESTRATION",
          },
        },
        data: {
          name: "Patching-9-instances",
          referenceid: 3,
          type: "ORCHESTRATION",
        },
      },
    ],
    deletedNode: [
      {
        nodeid: "BIdytS4HrO_gdZIg0ZThH",
      },
      {
        nodeid: "GsnVyNbqh9eHti8JpA03B",
      },
      {
        nodeid: "UemqGmqI_tcE_GSPWPPMG",
      },
    ],
    pipelinetemplatedetails: [
      {
        id: 157,
        tenantid: 7,
        position: 1,
        referencetype: "PROVIDER",
        referenceid: 3,
        templateid: 30,
        providerjobname: "GITHUB",
        status: "Active",
        description: null,
        createdby: "Barathan",
        createddt: "2024-08-20T08:17:59.000Z",
        lastupdatedby: null,
        lastupdateddt: "2024-08-20T08:17:59.000Z",
        templatedetailconfig: {
          id: 157,
          tenantid: 7,
          templatedetailid: 157,
          scriptcontent: null,
          setupdetails: {
            name: "Dev_Tester",
            username: "DevTester2025",
            url: "www.github.com",
          },
          variabledetails: null,
          status: "Active",
          descriptio: null,
          createdby: "Barathan",
          createddt: "2024-08-20T08:17:59.000Z",
          lastupdatedby: null,
          lastupdateddt: "2024-08-20T08:17:59.000Z",
        },
        nodeid: "OmVUXivR9C4X6Bx7pJI1H",
      },
      {
        id: 158,
        tenantid: 7,
        position: 2,
        referencetype: "CONTAINER_REGISTRY",
        referenceid: 1,
        templateid: 30,
        providerjobname: "DOCKERHUB",
        status: "Active",
        description: null,
        createdby: "Barathan",
        createddt: "2024-08-20T08:17:59.000Z",
        lastupdatedby: null,
        lastupdateddt: "2024-08-20T08:17:59.000Z",
        templatedetailconfig: {
          id: 158,
          tenantid: 7,
          templatedetailid: 158,
          scriptcontent: null,
          setupdetails: {
            name: "DEV_DOCKERHUB",
            usernamevariable: null,
            usernameisvariable: false,
            username: "devtester2025",
            accesstokenvariable: null,
            accesstokenisvariable: false,
            url: "https://hub.docker.com/",
            urlvariable: null,
            urlisvariable: false,
            imagename: "cicd_dev",
          },
          variabledetails: null,
          status: "Active",
          description: null,
          createdby: "Barathan",
          createddt: "2024-08-20T08:17:59.000Z",
          lastupdatedby: null,
          lastupdateddt: "2024-08-20T08:17:59.000Z",
        },
        nodeid: "2C8BlSA4qEtVklg7HE9QT",
      },
      {
        id: 159,
        tenantid: 7,
        position: 3,
        referencetype: "TESTING_TOOL",
        referenceid: 1,
        templateid: 30,
        providerjobname: "SONARQUBE",
        status: "Active",
        description: null,
        createdby: "Barathan",
        createddt: "2024-08-20T08:17:59.000Z",
        lastupdatedby: null,
        lastupdateddt: "2024-08-20T08:17:59.000Z",
        templatedetailconfig: {
          id: 159,
          tenantid: 7,
          templatedetailid: 159,
          scriptcontent: null,
          setupdetails: {
            name: "DEV_SONARQUBE",
            urlvariable: null,
            urlisvariable: false,
            url: "http://13.51.7.24:9000/",
            organization: "test",
            accesstokenvariable: null,
            accesstokenisvariable: false,
            accesstoken: "sqp_e3502cd244a813520d59a3b4a9ce500400701144",
          },
          variabledetails: null,
          status: "Active",
          description: null,
          createdby: "Barathan",
          createddt: "2024-08-20T08:17:59.000Z",
          lastupdatedby: null,
          lastupdateddt: "2024-08-20T08:17:59.000Z",
        },
        nodeid: "S7QRTrKQKw3V0JhM7phNg",
      },
      {
        id: 160,
        tenantid: 7,
        position: 7,
        referencetype: "ENVIRONMENTS",
        referenceid: 1,
        templateid: 30,
        providerjobname: "VIRTUAL_MACHINE",
        status: "Active",
        description: null,
        createdby: "Barathan",
        createddt: "2024-08-20T08:17:59.000Z",
        lastupdatedby: null,
        lastupdateddt: "2024-08-20T08:17:59.000Z",
        templatedetailconfig: {
          id: 160,
          tenantid: 7,
          templatedetailid: 160,
          scriptcontent: null,
          setupdetails: {
            ipaddress: "13.51.7.24",
            username: "ubuntu",
            usernamevariable: null,
            usernameisvariable: false,
            ipaddressvariable: null,
            ipaddressisvariable: false,
            password: "CmCICD#2024#",
            passwordvariable: null,
            passwordisvariable: false,
            instancename: "CICD_VM",
            port: "3000",
          },
          variabledetails: null,
          status: "Active",
          description: null,
          createdby: "Barathan",
          createddt: "2024-08-20T08:17:59.000Z",
          lastupdatedby: null,
          lastupdateddt: "2024-08-20T08:17:59.000Z",
        },
        nodeid: "NUHHNTeMDY20AFqkdV7XZ",
      },
      {
        id: 161,
        tenantid: 7,
        position: 4,
        referencetype: "BUILD",
        referenceid: 1,
        templateid: 30,
        providerjobname: "BUILD_SCRIPT",
        status: "Active",
        description: null,
        createdby: "Barathan",
        createddt: "2024-08-20T08:17:59.000Z",
        lastupdatedby: null,
        lastupdateddt: "2024-08-20T08:17:59.000Z",
        templatedetailconfig: {
          id: 161,
          tenantid: 7,
          templatedetailid: 161,
          scriptcontent: null,
          setupdetails: {
            name: "DEV_BUILD",
            instancename: null,
            ipaddress: "13.51.7.24",
            username: "ubuntu",
            password: "CmCICD#2024#",
            buildscript:
              "cd ~/projects/script_test/javaproject/Spring-Boot-main\nsudo mvn clean\nsudo mvn install",
          },
          variabledetails: null,
          status: "Active",
          description: null,
          createdby: "Barathan",
          createddt: "2024-08-20T08:17:59.000Z",
          lastupdatedby: null,
          lastupdateddt: "2024-08-20T08:17:59.000Z",
        },
        nodeid: "u2gEAps5NZHGTXKC1VXkB",
      },
      {
        id: 162,
        tenantid: 7,
        position: 6,
        referencetype: "ORCHESTRATION",
        referenceid: 3,
        templateid: 30,
        providerjobname: "ORCHESTRATION",
        status: "Active",
        description: null,
        createdby: "Barathan",
        createddt: "2024-08-20T08:17:59.000Z",
        lastupdatedby: null,
        lastupdateddt: "2024-08-20T08:17:59.000Z",
        templatedetailconfig: {
          id: 162,
          tenantid: 7,
          templatedetailid: 162,
          scriptcontent: null,
          setupdetails: {
            name: "Patching-9-instances",
          },
          variabledetails: null,
          status: "Active",
          description: null,
          createdby: "Barathan",
          createddt: "2024-08-20T08:17:59.000Z",
          lastupdatedby: null,
          lastupdateddt: "2024-08-20T08:17:59.000Z",
        },
        nodeid: "nvHBmWIcEVCbat-_8oX2k",
      },
      {
        id: 163,
        tenantid: 7,
        position: 5,
        referencetype: "APPROVAL_WORKFLOW",
        referenceid: 63,
        templateid: 30,
        providerjobname: "APPROVAL_WORKFLOW",
        status: "Active",
        description: null,
        createdby: "Barathan",
        createddt: "2024-08-20T08:17:59.000Z",
        lastupdatedby: null,
        lastupdateddt: "2024-08-20T08:17:59.000Z",
        templatedetailconfig: {
          id: 163,
          tenantid: 7,
          templatedetailid: 163,
          scriptcontent: null,
          setupdetails: {
            name: "mail_template",
            approverlevel1: "Pooja Dharshini",
          },
          variabledetails: null,
          status: "Active",
          description: null,
          createdby: "Barathan",
          createddt: "2024-08-20T08:17:59.000Z",
          lastupdatedby: null,
          lastupdateddt: "2024-08-20T08:17:59.000Z",
        },
        nodeid: "h6AIXQHigNg98oEjz5LUh",
      },
    ],
},
COMPLIANCEREPORT: [
  {
    title: "PCI DSS",
    score: 85,
    active: false,
    desc: "Global security standard for entities that process, store or transmit payment cardholder data.",
    values: [
      {
        control: "Requirement 10",
        number: 18681,
        subcontrols: [
          { id: '10.2.4', instancename: "CM-DRBD-WINDOWS-03", details: 'Invalid logical access attempts', compliancestatus: "Failed", number: 10901, logs: [
            {
              timestamp: "2024-09-09T03:33:43.689Z",
              description: "Windows logon success",
              level: 3,
              name: "CM-DRBD-WINDOWS-03",
              rule: "10.2.5",
            },
            {
              timestamp: "2024-09-15T15:30:02.579Z",
              description: "Windows logon success",
              level: 3,
              name: "CM-DRBD-WINDOWS-03",
              rule: "10.2.5",
            },
            {
              timestamp: "2024-09-14T03:33:43.689Z",
              description: "Windows logon success",
              level: 3,
              name: "CM-DRBD-WINDOWS-03",
              rule: "10.2.5",
            },
            {
              timestamp: "2024-09-09T05:01:26.101Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "10.2.4, 10.2.5, 11.4",
            },
            {
              timestamp: "2024-09-06T15:30:04.579Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "10.2.4, 10.2.5",
            },
            {
              timestamp: "2024-09-16T09:57:05.390Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows1",
              rule: "10.2.4, 10.2.5",
            },
            {
              timestamp: "2024-09-16T09:57:05.390Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows1",
              rule: "10.2.4, 10.2.5",
            },
          ]},
          { id: '10.2.7',instancename: "demo-Orchestration", details: 'Creation and deletion of system level objects',compliancestatus: "Passed", number: 294 , logs: [
            {
              timestamp: "2024-09-09T03:49:58.168Z",
              description: "Listened ports status (netstat) changed (new port opened or closed)",
              level: 7,
              name: "demo-Orchestration",
              rule: "10.2.7, 10.6.1",
            },
            {
              timestamp: "2024-09-06T06:57:21.536Z",
              description: "New dpkg (Debian Package) installed",
              level: 7,
              name: "demo-VPM-Server",
              rule: "10.6.1, 10.2.7",
            },
          ]},
          { id: '10.2.6',instancename: "demo-Infra", details: 'Initialization, stopping, or pausing of the audit logs',compliancestatus: "Passed", number: 22, logs: [
            {
              timestamp: "2024-09-09T03:31:12.656Z",
              description: "Wazuh agent started",
              level: 3,
              name: "demo-CICD-Server",
              rule: "10.6.1, 10.2.6",
            },
            {
              timestamp: "2024-09-05T15:30:43.755Z",
              description: "Wazuh agent stopped",
              level: 3,
              name: "demo-Infra",
              rule: "	10.6.1, 10.2.6",
            },
            {
              timestamp: "2024-09-05T15:30:43.755Z",
              description: "Wazuh agent disconnected",
              level: 3,
              name: "demo-Orchestration",
              rule: "	10.6.1, 10.2.6",
            },
          ]},
          { id: '10.2.2',instancename: "CM-DRBD-WINDOWS-03" , details: ' All actions taken by any individual with root or administrative privileges', compliancestatus: "Passed", number: 8, logs: [
            {
              timestamp: "2024-09-06T12:57:43.136Z",
              description: "Successful sudo to ROOT executed.",
              level: 3,
              name: "ip-172-31-32-7",
              rule: "10.2.5, 10.2.2",
            }
          ]},
          { id: '10.6',instancename: "demo-opsmaster-wazuh-windows1" , details: 'Review logs and security events for all system components to identify anomalies or suspicious activity', compliancestatus: "Passed", number: 6, logs: [
            {
              timestamp: "2024-09-09T05:14:52.197Z",
              description: "Service startup type was changed",
              level: 3,
              name: "demo-opsmaster-wazuh-windows1",
              rule: "10.6",
            }
          ]},
          { id: '10.6.1', instancename: "demo-VPM-Server" ,details: 'Review the following at least daily: All security events. Logs of all system components that store, process, or transmit CHD and/or SAD, or that could. impact the security of CHD and/or SAD. Logs of all critical system components. Logs of all servers and system components that perform security functions (for example, firewalls, intrusion detection systems/intrusion prevention systems (IDS/IPS), authentication servers, ecommerce redirection servers, etc.)', compliancestatus: "Passed", number: 3, logs: [
            {
              timestamp: "2024-09-19T03:45:41.828Z",
              description: "Dpkg (Debian Package) half configured",
              level: 5,
              name: "demo-VPM-Server",
              rule: "10.6.1",
            },
            {
              timestamp: "2024-09-19T06:35:39.247Z",
              description: "Dpkg (Debian Package) removed",
              level: 7,
              name: "demo-VPM-Server",
              rule: "10.6.1, 10.2.7",
            },
            {
              timestamp: "2024-09-19T06:35:39.249Z",
              description: "Dpkg (Debian Package) half configured",
              level: 7,
              name: "demo-VPM-Server",
              rule: "10.6.1, 10.2.7",
            }
          ]},
          { id: '10.5.2',instancename: "demo-CICD-Server" , details: 'Protect audit trail files from unauthorized modifications', compliancestatus: "Passed", number: 2, logs: [
            {
              timestamp: "2024-09-09T03:31:49.166Z",
              description: "Log file rotated",
              level: 3,
              name: "demo-CICD-Server",
              rule: "10.5.2, 10.5.5",
            },
            {
              timestamp: "2024-09-05T03:31:49.166Z",
              description: "Microsoft Event log cleared",
              level: 9,
              name: "Centos",
              rule: "10.5.2",
            }
          ] },
        ],
      },
      {
        control:
          "Requirement 11",
        number: 3559,
        subcontrols: [
          { id: '11.5',instancename: "CM-DRBD-WINDOWS-03" , details: 'Deploy a change detection mechanism',compliancestatus: "Passed", number: 0, logs:[]},
          { id: '11.4',instancename: "demo-Infra" , details: 'Intrusion detection and/or intrusion prevention techniques', compliancestatus: "Failed", number: 3559, logs:[
            {
              timestamp: "2024-09-09T05:23:00.610Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "6.5, 11.4",
            },
            {
              timestamp: "2024-09-05T03:31:49.166Z",
              description: "High amount of POST requests in a small period of time (likely bot)",
              level: 10,
              name: "demo-Infra",
              rule: "6.5, 11.4",
            },
            {
              timestamp: "2024-09-05T03:31:49.166Z",
              description: "Multiple web server 400 error codes from same source ip.",
              level: 10,
              name: "demo-Infra",
              rule: "6.5, 11.4",
            }
          ] },
          { id: '11.2.1',instancename: "CM-DRBD-WINDOWS-03" , details: 'Perform quarterly internal vulnerability scans', compliancestatus: "Passed", number: 0, logs:[]},
          { id: '11.2.3',instancename: "CM-DRBD-WINDOWS-03" , details: 'Perform internal and external scans, and rescans', compliancestatus: "Passed", number: 0, logs:[] }
        ],
      },
      {
        control:
          "Requirement 6",
        number: 2786,
        subcontrols: [
          { id: '6.5',instancename: "demo-Infra-Grafana" , details: 'Address common coding vulnerabilities in software development processes',compliancestatus: "Failed", number: 2786, logs: [
            {
              timestamp: "2024-09-09T05:23:00.610Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra-Grafana",
              rule: "6.5, 11.4",
            },
            {
              timestamp: "2024-09-05T03:31:49.166Z",
              description: "High amount of POST requests in a small period of time (likely bot)",
              level: 10,
              name: "demo-Infra",
              rule: "6.5, 11.4",
            },
            {
              timestamp: "2024-09-05T03:31:49.166Z",
              description: "Multiple web server 400 error codes from same source ip.",
              level: 10,
              name: "demo-Infra",
              rule: "6.5, 11.4",
            }
          ] },
          { id: '6.2',instancename: "CM-DRBD-WINDOWS-03" , details: 'Ensure that all system components and software are protected from known vulnerabilities',compliancestatus: "Passed", number: 0,logs:[] },
          { id: '6.5.1',instancename: "demo-VPM-Server" , details: 'Injection flaws, particularly SQL injection', compliancestatus: "Passed",number: 0, logs:[]},
          { id: '6.5.2',instancename: "demo-Orchestration" , details: 'Buffer overflows',compliancestatus: "Passed", number: 0, logs:[] },
          { id: '6.5.5',instancename: "demo-CICD-Server	" , details: 'Improper error handling', compliancestatus: "Passed",number: 0, logs:[] },
          { id: '6.5.7',instancename: "CM-DRBD-WINDOWS-03" , details: 'Cross-site scripting (XSS)',compliancestatus: "Passed", number: 0, logs:[] }
        ],
      },
      {
        control: "Requirement 2",
        number: 5,
        subcontrols: [
          { id: '2.2',instancename: "demo-Orchestration" , details: 'Develop configuration standards for all system components', compliancestatus: "Passed",number: 5, logs: [
            {
              timestamp: "2024-09-06T10:29:44.558Z",
              description: "SCA summary: CIS Ubuntu Linux 22.04 LTS Benchmark v1.0.0: Score less than 50% (42)",
              level: 7,
              name: "demo-Orchestration",
              rule: "2.2",
            },
            {
              timestamp: "2024-09-06T03:31:49.166Z",
              description: "CIS Ubuntu Linux 22.04 LTS Benchmark v1.0.0: Ensure password expiration warning days is 7 or more.: Status changed from failed to passed",
              level: 3,
              name: "demo-Orchestration",
              rule: "2.2",
            },
            {
              timestamp: "2024-09-05T03:31:49.166Z",
              description: "OpenSCAP: Set Password Maximum Age (not passed)",
              level: 7,
              name: "demo-Orchestration",
              rule: "2.2",
            }
          ] },
          { id: '2.2.2',instancename: "CM-DRBD-WINDOWS-03" , details: 'Enable only necessary services, protocols, daemons', compliancestatus: "Passed", number: 0, logs:[] },
          { id: '2.2.3',instancename: "CM-DRBD-WINDOWS-01" , details: 'Implement additional security features for any required services, protocols', compliancestatus: "Passed", number: 0, logs:[] }
        ],
      },
      {
        control:
          "Requirement 8",
        number: 1,
        subcontrols: [
          { id: '8.1.2',instancename: "demo-opsmaster-wazuh-windows2" , details: 'Control addition, deletion, and modification of user IDs, credentials, and other identifier objects',compliancestatus: "Passed", number: 1, logs: [
            {
              timestamp: "2024-09-09T03:31:29.169Z",
              description: "User account changed",
              level: 8,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "10.2.5, 8.1.2",
            }
          ]},
          { id: '8.1.4',instancename: "CM-DRBD-WINDOWS-03" , details: 'Remove/disable inactive user accounts within 90 days',compliancestatus: "Passed", number: 0, logs:[] },
          { id: '8.1.5',instancename: "demo-CICD-Server	" , details: 'Manage IDs used by third parties to access, support, or maintain system components via remote access', compliancestatus: "Passed",number: 0, logs:[] },
          { id: '8.1.6',instancename: "demo-opsmaster-wazuh-windows2" , details: 'Limit repeated access attempts by locking out the user ID after not more than six attempts', compliancestatus: "Passed",number: 0, logs:[] },
          { id: '8.1.8',instancename: "demo-Infra-Grafana" , details: 'If a session has been idle for more than 15 minutes, require the user to reauthenticate to re-activate the terminal or session', compliancestatus: "Passed",number: 0, logs:[] }
        ],
      },
      {
        control: "Requirement 1",
        number: 0,
        subcontrols: [
          { id: '1.1.1',instancename: "CM-DRBD-WINDOWS-02" , details: 'A formal process for approving and testing all network connections and changes to the firewall and router configurations',compliancestatus: "Passed", number: 0, logs:[] },
          { id: '1.3.4',instancename: "	demo-VPM-Server" , details: 'Do not allow unauthorized outbound traffic from the cardholder data environment to the Internet',compliancestatus: "Passed", number: 0, logs:[] },
          { id: '1.4',instancename: "CM-DRBD-WINDOWS-03" , details: 'Install personal firewall software or equivalent functionality on any portable computing devices (including company and/or employee-owned) that connect to the Internet when outside the network (for example, laptops used by employees), and which are also used to access the CDE. Firewall (or equivalent) configurations include:Specific configuration settings are defined. Personal firewall (or equivalent functionality) is actively running. Personal firewall (or equivalent functionality) is not alterable by users of the portable computing devices', compliancestatus: "Passed",number: 0, logs:[] },
        ]
      },
      { control: "Requirement 4", number: 0, subcontrols: [
        { id: '4.1',instancename: "demo-Infra-NX" , details: 'Use strong cryptography and security protocols (for example, SSL/TLS, IPSEC, SSH, etc.) to safeguard sensitive cardholder data during transmission over open, public networks, including the following:Only trusted keys and certificates are accepted. The protocol in use only supports secure versions or configurations. The encryption strength is appropriate for the encryption methodology in use',compliancestatus: "Passed", number: 0, logs:[] }
      ] },
      {
        control: "Requirement 5",
        number: 0,
        subcontrols: [
          { id: '5.1',instancename: "demo-opsmaster-wazuh-ubuntu" , details: 'Deploy anti-virus software on all systems commonly affected by malicious software (particularly personal computers and servers)', compliancestatus: "Passed",number: 0, logs:[] },
          { id: '5.2',instancename: "CM-DRBD-WINDOWS-01" , details: 'Ensure that all anti-virus mechanisms are maintained as follows:Are kept current. Perform periodic scans. Generate audit logs which are retained per PCI DSS Requirement 10.7.', compliancestatus: "Passed",number: 0, logs:[] }
        ]
      },
    ],
  },
  {
    title: "GDPR",
    score: 85,
    active: false,
    desc: "General Data Protection Regulation (GDPR) sets guidelines for processing of personal data.",
    values: [
      {
        control:
          "Requirement IV",
        number: 18989,
        subcontrols: [
          { id: 'IV_35.7.d',instancename: "demo-CICD-Server" , details: 'Capabilities for identification, blocking and forensic investigation of data breaches by malicious actors, through compromised credentials, unauthorized network access, persistent threats and verification of the correct operation of all components.Network perimeter and endpoint security tools to prevent unauthorized access to the network, prevent the entry of unwanted data types and malicious threats. Anti-malware and anti-ransomware to prevent malware and ransomware threats from entering your devices.A behavioral analysis that uses machine intelligence to identify people who do anomalous things on the network, in order to give early visibility and alert employees who start to become corrupt', compliancestatus: "Passed",number: 12551, logs:[
            {
              timestamp: "2024-09-17T03:32:58.219Z",
              description: "Host-based anomaly detection event (rootcheck)",
              level: 7,
              name: "demo-CICD-Server",
              rule: "IV_35.7.d",
            },
            {
              timestamp: "2024-09-17T03:32:58.217Z",
              description: "Host-based anomaly detection event (rootcheck)",
              level: 7,
              name: "demo-CICD-Server",
              rule: "IV_35.7.d",
            },
            {
              timestamp: "2024-09-17T03:32:58.195Z",
              description: "Host-based anomaly detection event (rootcheck)",
              level: 7,
              name: "demo-CICD-Server",
              rule: "IV_35.7.d",
            },
            {
              timestamp: "2024-09-17T05:02:53.316Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "IV_35.7.d",
            }
          ] },
          { id: 'IV_32.2',instancename: "demo-opsmaster-wazuh-windows2" , details: 'Account management tools that closely monitor actions taken by standard administrators and users who use standard or privileged account credentials are required to control access to data', compliancestatus: "Failed",number: 7934, logs:[
            {
              timestamp: "2024-09-17T04:59:58.610Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "IV_32.2, IV_35.7.d",
            },
            {
              timestamp: "2024-09-17T04:59:58.612Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "IV_32.2, IV_35.7.d",
            }
          ] },
          { id: 'IV_24.2',instancename: "demo-opsmaster-wazuh-windows2" , details: 'Be able to demonstrate compliance with the GDPR by complying with data protection policies', compliancestatus: "Passed",number: 0, logs:[] },
          { id: 'IV_28',instancename: "demo-ops-wazuh" , details: 'Ensure data protection during processing, through technical and organizational measures', compliancestatus: "Passed",number: 0, logs:[] },
          { id: 'IV_30.1.g',instancename: "demo-VPM-Server" , details: 'It is necessary to keep all processing activities documented, to carry out an inventory of data from beginning to end and an audit, in order to know all the places where personal and sensitive data are located, processed, stored or transmitted', compliancestatus: "Passed",number: 0, logs:[] },
        ]
      },
      { control: "Requirement II", number: 3, 
        subcontrols: [
          { id: 'II_5.1.f',instancename: "demo-CICD-Server" , details: 'Ensure the ongoing confidentiality, integrity, availability and resilience of processing systems and services, verifying its modifications, accesses, locations and guarantee the safety of them.File sharing protection and file sharing technologies that meet the requirements of data protection', compliancestatus: "Passed",number: 3, logs:[
            {
              timestamp: "2024-09-09T03:31:49.166Z",
              description: "Log file rotated.",
              level: 3,
              name: "demo-CICD-Server",
              rule: "II_5.1.f, IV_35.7.d",
            },
            {
              timestamp: "2024-09-05T03:31:29.169Z",
              description: "Registry Entry Deleted",
              level: 5,
              name: "ip-10-0-0-180.us-west-1.compute.internal",
              rule: "II_5.1.f",
            },
            {
              timestamp: "2024-09-05T03:31:43.215Z",
              description: "Integrity checksum changed",
              level: 7,
              name: "Ubuntu",
              rule: "II_5.1.f",
            }
          ] },
        ]
      },
      {
        control:
          "Requirement III",
        number: 0,
        subcontrols: [
          { id: 'III_14.2.c',instancename: "demo-CICD-Server" , details: 'Restrict the processing of personal data temporarily', compliancestatus: "Passed",number: 0, logs:[] },
          { id: 'III_17',instancename: "CM-DRBD-WINDOWS-01" , details: 'Permanently erase personal information of a subject',compliancestatus: "Passed", number: 0, logs:[] },]
      },
    ],
  },
  {
    title: "TSC",
    score: 75,
    active: false,
    desc: "Trust Services Criteria for Security, Availability, Processing Integrity, Confidentiality, and Privacy",
    values: [
      {
        control:
          "Requirement CC7",
        number: 21258,
        subcontrols: [
          { id: 'CC7.2',instancename: "demo-Infra" , details: 'The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors affecting the entitys ability to meet its objectives; anomalies are analyzed to determine whether they represent security events', compliancestatus: "Failed",number: 12251, logs:[
            {
              timestamp: "2024-09-17T06:31:36.692Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T06:35:14.912Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T06:35:28.688Z",
              description: "High amount of POST requests in a small period of time (likely bot)",
              level: 10,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T06:31:28.688Z",
              description: "High amount of POST requests in a small period of time (likely bot)",
              level: 10,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T06:33:08.662Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "CC6.1, CC6.8, CC7.2, CC7.3",
            }
          ] },
          { id: 'CC7.3',instancename: "demo-opsmaster-wazuh-windows2" , details: 'The entity evaluates security events to determine whether they could or have resulted in a failure of the entity to meet its objectives (security incidents) and, if so, takes actions to prevent or address such failures.', compliancestatus: "Failed", number: 12251, logs:[
            {
              timestamp: "2024-09-17T06:50:07.364Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T05:50:07.364Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T06:50:13.273Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T04:50:13.273Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T06:52:55.998Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
          ] },
          { id: 'CC7.1',instancename: "demo-opsmaster-wazuh-windows2" , details: 'To meet its objectives, the entity uses detection and monitoring procedures to identify (1) changes to configurations that result in the introduction of new vulnerabilities, and (2) susceptibilities to newly discovered vulnerabilities.',compliancestatus: "Failed", number: 4255, logs:[
            {
              timestamp: "2024-09-17T06:55:24.159Z",
              description: "Multiple web server 400 error codes from same source ip.",
              level: 10,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T06:55:18.153Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            }
          ] },
          { id: 'CC7.4',instancename: "demo-Infra" , details: 'The entity responds to identified security incidents by executing a defined incident-response program to understand, contain, remediate, and communicate security incidents, as appropriate.', compliancestatus: "Passed", number: 0, logs:[] },
        ]
      },
      { control: "Requirement CC6", number: 20871,
        subcontrols: [
          { id: 'CC6.8',instancename: "demo-Infra" , details: 'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software to meet the entity’s objectives.', compliancestatus: "Failed", number: 12239, logs:[
            {
              timestamp: "2024-09-17T07:20:16.747Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T07:20:13.650Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T07:20:14.325Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "CC6.1, CC6.8, CC7.2, CC7.3",
            }
          ] },
          { id: 'CC6.1',instancename: "demo-Infra" , details: 'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events to meet the entitys objectives.', compliancestatus: "Failed",number: 12135, logs:[
            {
              timestamp: "2024-09-17T07:20:16.747Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T07:20:13.650Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T07:20:14.325Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "CC6.1, CC6.8, CC7.2, CC7.3",
            }
          ] },
          { id: 'CC6.6',instancename: "demo-opsmaster-wazuh-windows1" , details: 'The entity implements logical access security measures to protect against threats from sources outside its system boundaries.',compliancestatus: "Failed", number: 4252, logs:[
            {
              timestamp: "2024-09-17T07:23:29.392Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra-Grafana",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T07:23:29.391Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra-Grafana",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T07:23:27.418Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra-Grafana",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
          ] },
        ]
       },
      { control: "Requirement CC8", number: 20963, 
        subcontrols: [
          { id: 'CC8.1',instancename: "demo-Infra-Grafana" , details: 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures to meet its objectives',compliancestatus: "Failed", number: 4255, logs:[
            {
              timestamp: "2024-09-17T07:23:29.391Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
            {
              timestamp: "2024-09-17T07:23:27.418Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra-Grafana",
              rule: "CC6.6, CC7.1, CC8.1, CC6.1, CC6.8, CC7.2, CC7.3",
            },
          ] },
        ]
      },
      {
        control:
          "Requirement PI1",
        number: 0,
        subcontrols: [
          { id: 'PI1.4',instancename: "demo-opsmaster-wazuh-windows2" , details: 'The entity implements policies and procedures to make available or deliver output completely, accurately, and timely in accordance with specifications to meet the entity’s objectives.', compliancestatus: "Passed",number: 0, logs:[] },
          { id: 'PI1.5',instancename: "demo-Infra" , details: 'The entity implements policies and procedures to store inputs, items in processing, and outputs completely, accurately, and timely in accordance with system specifications to meet the entity’s objectives.',compliancestatus: "Passed", number: 0, logs:[] },
        ]
      },
      {
        control:
          "Requirement A1",
        number: 0,
        subcontrols: [
          { id: 'A1.1',instancename: "demo-Infra-Grafana" , details: 'The entity maintains, monitors, and evaluates current processing capacity and use of system components (infrastructure, data, and software) to manage capacity demand and to enable the implementation of additional capacity to help meet its objectives.',compliancestatus: "Passed", number: 0, logs:[] },
          { id: 'A1.2',instancename: "CM-DRBD-WINDOWS-03" , details: 'The entity authorizes, designs, develops or acquires, implements, operates, approves, maintains, and monitors environmental protections, software, data backup processes, and recovery infrastructure to meet its objectives.',compliancestatus: "Passed", number: 0, logs:[] },
        ]
      },
      {
        control:
          "Requirement CC5",
        number: 0,
        subcontrols: [
          { id: 'CC5.1',instancename: "demo-opsmaster-wazuh-windows2" , details: 'The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels.',compliancestatus: "Passed", number: 0, logs:[] },
          { id: 'CC5.2',instancename: "demo-Infra" , details: 'The entity also selects and develops general control activities over technology to support the achievement of objectives.',compliancestatus: "Passed", number: 0, logs:[] },
        ]
      }
    ],
  },
  {
    title: "HIPAA",
    score: 55,
    active: false,
    desc: "Health Insurance Portability and Accountability Act of 1996 (HIPAA) provides data privacy and security provisions for safeguarding medical information.",
    values: [
      {
        control:
          "Requirement 164.312.b",
        number: 7437,
        subcontrols: [
          { id: '164.312.b',instancename: "demo-opsmaster-wazuh-windows2" , details: 'Implement hardware, software, and/or procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information',compliancestatus: "Failed", number: 7986, logs:[
            {
              timestamp: "2024-09-17T04:59:59.722Z",
              description: "Logon failure - Unknown user or bad password.",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "164.312.b",
            },
            {
              timestamp: "2024-09-17T04:59:58.612Z",
              description: "Logon failure - Unknown user or bad password.",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "164.312.b",
            },
            {
              timestamp: "2024-09-17T04:59:58.610Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "164.312.b",
            },
            {
              timestamp: "2024-09-16T10:57:26.594Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "164.312.b",
            },
            {
              timestamp: "2024-09-16T10:57:26.814Z",
              description: "Logon failure - Unknown user or bad password.",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "164.312.b",
            },
          ] },
          { id: '164.312.a.1',instancename: "demo-opsmaster-wazuh-windows1" , details: 'Implement technical policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have access', compliancestatus: "Passed",number: 0, logs:[]},
          { id: '164.312.a.2.I',instancename: "demo-Infra-Grafana" , details: 'Assign a unique name and/or number for identifying and tracking user identity', compliancestatus: "Passed",number: 0, logs:[]},
          { id: '164.312.a.2.II',instancename: "CM-DRBD-WINDOWS-03" , details: 'Establish (and implement as needed) procedures for obtaining necessary electronic protected health information during an emergency.', compliancestatus: "Passed",number: 0, logs:[]},
        ]
      },
      {
        control:
          "Requirement 164.312.a",
        number: 2,
        subcontrols: [
          { id: '164.312.a.2.I',instancename: "demo-opsmaster-wazuh-windows2" , details: 'Assign a unique name and/or number for identifying and tracking user identity', compliancestatus: "Passed",number: 1, logs:[
            {
              timestamp: "2024-09-09T03:31:29.169Z",
              description: "User account changed",
              level: 8,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "164.312.a.2.I, 164.312.a.2.II, 164.312.b",
            }
          ] },
          { id: '164.312.a.2.II',instancename: "demo-CICD-Server" , details: 'Establish (and implement as needed) procedures for obtaining necessary electronic protected health information during an emergency',compliancestatus: "Passed", number: 1, logs:[
            {
              timestamp: "2024-09-05T08:24:52.782Z",
              description: "New group added to the system",
              level: 8,
              name: "demo-CICD-Server",
              rule: "164.312.b, 164.312.a.2.I, 164.312.a.2.II",
            }
          ] },
          { id: '164.312.a.2.III',instancename: "demo-Infra-Grafana" , details: 'Implement electronic procedures that terminate an electronic session after a predetermined time of inactivity',compliancestatus: "Passed", number: 0, logs:[] },
          { id: '164.312.a.2.IV',instancename: "demo-opsmaster-wazuh-windows2" , details: 'Implement a mechanism to encrypt and decrypt electronic protected health information',compliancestatus: "Passed", number: 0, logs:[] },
        ]
      },
      {
        control:
          "Requirement 164.312.c",
        number: 0,
        subcontrols: [
          { id: '164.312.c.1',instancename: "CM-DRBD-WINDOWS-03" , details: 'Implement policies and procedures to protect electronic protected health information from improper alteration or destruction.', compliancestatus: "Passed",number: 0, logs:[] },
          { id: '164.312.c.2',instancename: "CM-DRBD-WINDOWS-03" , details: 'Implement electronic mechanisms to corroborate that electronic protected health information has not been altered or destroyed in an unauthorized manner', compliancestatus: "Passed",number: 0, logs:[] },
        ]
      },
      {
        control:
          "Requirement 164.312.d",
        number: 0,
        subcontrols: [
          { id: '164.312.d',instancename: "demo-Infra" , details: 'Implement procedures to verify that a person or entity seeking access to electronic protected health information is the one claimed', compliancestatus: "Passed",number: 0, logs:[] },
        ]
      },
      {
        control:
          "Requirement 164.312.e",
        number: 0,
        subcontrols: [
          { id: '164.312.e.1',instancename: "demo-VPM-Server" , details: 'Implement technical security measures to guard against unauthorized access to electronic protected health information that is being transmitted over an electronic communications network',compliancestatus: "Passed", number: 0, logs:[] },
          { id: '164.312.e.2.I',instancename: "demo-ops-wazuh" , details: 'Implement security measures to ensure that electronically transmitted electronic protected health information is not improperly modified without detection until disposed of',compliancestatus: "Passed", number: 0, logs:[] },
          { id: '164.312.e.2.II',instancename: "CM-DRBD-WINDOWS-03" , details: 'Implement a mechanism to encrypt electronic protected health information whenever deemed appropriate',compliancestatus: "Passed", number: 0, logs:[] },
        ]
      }
    ],
  },
  {
    title: "NIST",
    score: 55,
    active: false,
    desc: "National Institute of Standards and Technology Special Publication 800-53 (NIST 800-53) sets guidelines for federal information systems.",
    values: [
      { control: "Requirement AC", number: 7490 ,
        subcontrols: [
          { id: 'AC.7',instancename: "demo-opsmaster-wazuh-windows2" , details: 'UNSUCCESSFUL LOGON ATTEMPTS - Enforces a limit of consecutive invalid logon attempts by a user during a time period', compliancestatus: "Failed",number: 7944, logs:[
            {
              timestamp: "2024-09-17T07:45:34.574Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "AC.7, AU.14",
            },
            {
              timestamp: "2024-09-17T07:45:33.293Z",
              description: "Logon failure - Unknown user or bad password",
              level: 5,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "AC.7, AU.14",
            },
            {
              timestamp: "2024-09-17T07:45:28.587Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "AC.7, AU.14, SI.4",
            },
            {
              timestamp: "2024-09-16T11:36:34.041Z",
              description: "Multiple Windows logon failures",
              level: 10,
              name: "demo-opsmaster-wazuh-windows2",
              rule: "AC.7, AU.14, SI.4",
            }
          ] },
          { id: 'AC.2',instancename: "CM-DRBD-WINDOWS-02" , details: 'ACCOUNT MANAGEMENT - Identifies and selects the following types of information system accounts to support organizational missions/business functions.', compliancestatus: "Passed",number: 0, logs:[] },
          { id: 'AC.6',instancename: "CM-DRBD-WINDOWS-01" , details: 'LEAST PRIVILEGE - The organization employs the principle of least privilege, allowing only authorized accesses for users (or processes acting on behalf of users) which are necessary to accomplish assigned tasks in accordance with organizational missions and business functions.',compliancestatus: "Passed", number: 0, logs:[] },
        ]
      },
      { control: "Requirement SA", number: 3737, 
        subcontrols: [
          { id: 'SA.11',instancename: "demo-Infra" , details: 'DEVELOPER SECURITY TESTING AND EVALUATION - The organization requires the developer of the information system, system component, or information system service to create and implement a security assessment plan',compliancestatus: "Failed", number: 4183, logs:[
            {
              timestamp: "2024-09-17T08:14:48.980Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "SA.11, SI.4",
            },
            {
              timestamp: "2024-09-17T07:14:48.980Z",
              description: "Web server 400 error code",
              level: 5,
              name: "demo-Infra",
              rule: "SA.11, SI.4",
            },
            {
              timestamp: "2024-09-17T08:09:46.676Z",
              description: "High amount of POST requests in a small period of time (likely bot).",
              level: 10,
              name: "demo-Infra",
              rule: "SA.11, SI.4",
            },
            {
              timestamp: "2024-09-16T08:30:12.630Z",
              description: "Multiple web server 400 error codes from same source ip.",
              level: 10,
              name: "demo-Infra",
              rule: "SA.11, SI.4",
            },
          ] },
        ]
      },
      { control: "Requirement AU", number: 64,
        subcontrols: [
          { id: 'AU.6',instancename: "CM-DRBD-WINDOWS-03" , details: 'AUDIT REVIEW, ANALYSIS, AND REPORTING - Reviews and analyzes information system audit records.',compliancestatus: "Passed", number: 48, logs:[
            {
              timestamp: "2024-09-17T06:43:18.431Z",
              description: "Listened ports status (netstat) changed (new port opened or closed).",
              level: 7,
              name: "ip-172-31-32-7",
              rule: "AU.14, AU.6",
            },
            {
              timestamp: "2024-09-17T06:39:12.149Z",
              description: "Dpkg (Debian Package) half configured.",
              level: 7,
              name: "ip-172-31-32-7",
              rule: "AU.6, AU.14",
            },
          ] },
          { id: 'AU.5',instancename: "demo-Orchestration" , details: 'RESPONSE TO AUDIT PROCESSING FAILURES - The information system alerts organization-defined personnel or roles in the event of an audit processing failure and takes organization-defined actions to be taken (e.g., shut down information system, overwrite oldest audit records, stop generating audit records)',compliancestatus: "Failed", number: 22, logs:[
            {
              timestamp: "2024-09-17T05:21:15.813Z",
              description: "Wazuh agent disconnected.",
              level: 3,
              name: "demo-Orchestration",
              rule: "AU.6, AU.14, AU.5",
            },
            {
              timestamp: "2024-09-17T03:31:12.716Z",
              description: "Wazuh agent started.",
              level: 3,
              name: "demo-Orchestration",
              rule: "AU.6, AU.14, AU.5",
            },
            {
              timestamp: "2024-09-16T15:30:41.943Z",
              description: "Wazuh agent stopped.",
              level: 3,
              name: "demo-Orchestration",
              rule: "AU.6, AU.14, AU.5",
            },
          ] },
          { id: 'AU.8',instancename: "demo-opsmaster-wazuh-windows2" , details: 'TIME STAMPS - Uses internal system clocks to generate time stamps for audit records and records time stamps for audit records.',compliancestatus: "Passed", number: 0, logs:[] },
          { id: 'AU.9',instancename: "demo-Orchestration" , details: 'PROTECTION OF AUDIT INFORMATION - The information system protects audit information and audit tools from unauthorized access, modification, and deletion.', compliancestatus: "Passed",number: 0, logs:[] }
        ]
       },
      {
        control: "Requirement IA",
        number: 1,
        subcontrols: [
          { id: 'IA.4',instancename: "demo-CICD-Server" , details: 'IDENTIFIER MANAGEMENT - The organization manages information system identifiers by: Receiving authorization from organization-defined personnel or roles to assign an individual, group, role, or device identifier. Selecting an identifier that identifies an individual, group, role, or device. Assigning the identifier to the intended individual, group, role, or device. Preventing reuse of identifiers for a organization-defined time period. Disabling the identifier after organization-defined time period of inactivity.',compliancestatus: "Passed", number: 1, logs:[
            {
              timestamp: "2024-09-05T08:24:52.782Z",
              description: "New group added to the system.",
              level: 8,
              name: "demo-CICD-Server",
              rule: "AU.14, AC.7, AC.2, IA.4",
            },
          ] },
        ]
      },
      {
        control: "Requirement CA",
        number: 0,
        subcontrols: [
          { id: 'CA.3',instancename: "CM-DRBD-WINDOWS-01" , details: 'SYSTEM INTERCONNECTIONS - Authorizes connections from the information system to other information systems through the use of Interconnection Security Agreements, Documents, for each interconnection, the interface characteristics, security requirements, and the nature of the information communicated and Reviews and updates Interconnection Security Agreements', compliancestatus: "Passed",number: 0, logs:[] },
        ]
      },
      { control: "Requirement CM", number: 0,
        subcontrols: [
          { id: 'CM.1',instancename: "demo-Infra-Grafana" , details: 'CONFIGURATION MANAGEMENT POLICY AND PROCEDURES - Develops, documents, and disseminates to a configuration management policy. Revies and updates the current configuration management policy and procedures.',compliancestatus: "Passed", number: 0, logs:[] },
        ]
       },
      { control: "Requirement SC", number: 0,
        subcontrols: [
          { id: 'SC.2',instancename: "demo-Orchestration" , details: 'APPLICATION PARTITIONING - The information system separates user functionality (including user interface services) from information system management functionality.',compliancestatus: "Passed", number: 0, logs:[] },
        ]
       },
      { control: "Requirement SI", number: 0, 
        subcontrols: [
          { id: 'SI.2',instancename: "demo-opsmaster-wazuh-windows2" , details: 'FLAW REMEDIATION - The organization identifies, reports, and corrects information system flaws; tests software and firmware updates related to flaw remediation for effectiveness and potential side effects before installation; installs security-relevant software and firmware updates within organizationdefined time period of the release of the updates and incorporates flaw remediation into the organizational configuration management process.', compliancestatus: "Passed",number: 0, logs:[] },
        ]
      }
    ],
  },
  {
    title: "Risk Score",
    score: 66,
    active: false,
    desc: "",
    values: [],
  }
],
NODE_ICONS: {
  StartNode: "fa-play-circle",
  EndNode: "fa-stop-circle",
  DecisionNode: "fa-random",
  MachineNode: "fa-server",
  SessionNode: "fa-terminal",
  CopyNode: "fa-copy",
  ActivityNode: "fa-file",
  PatchNode: "fa-wrench",
  RestartNode: "fa-refresh",
  WaitNode: "fa-clock-o",
  PROVIDER:"../assets/images/github.svg",
  CONTAINER_REGISTRY:"../assets/images/docker.svg",
  TESTING_TOOL:"../assets/images/sonarqube.svg",
  ENVIRONMENTS:"../assets/images/vm.svg",
  BUILD:"../assets/images/build.svg",
  ORCHESTRATION:"../assets/images/orch.svg",
  APPROVAL_WORKFLOW:"../assets/images/workflow.svg",
  ROLLBACK:"../assets/images/rollback.svg",
  RETRY:"../assets/images/retry.svg",
  "DECISION MAKING":"../assets/images/decisionmaking.svg"
},
ORCHNODE_FIELDS: {
  StartNode: ['name'],
  EndNode: ['name'],
  SessionNode: ["name", "Type", "authentication_type", "ip_type"],
  ActivityNode: [
    "name",
    "filename",
    "retries",
    "scriptexectype",
    "scripttype",
    "waittime",
    "failedretries",
    "failedwaittime",
  ],
  PatchNode: ["name", "retries", "timeout", "scan"],
  DecisionNode: ["name"],
  MachineNode: ["name", "OperatingSystem"],
  CopyNode: [
    "name",
    "filename",
    "retries",
    "scriptexectype",
    "scripttype",
    "waittime",
  ],
  WaitNode: ["name", "waittime"],
  RestartNode: ["name"],
},
NODE_FIELDS: {
  GITHUB: ["name","branch", "username", "url", "accesstoken"],
  DOCKERHUB: ["name", "username", "url", "imagename", "accesstoken"],
  SONARQUBE: ["name", "url","accesstoken"],
  COMMON_FIELD: ["name"],
  ENVIRONMENTS: ["ipaddress", "username", "password", "port"],
  BUILD: [
    "name",
    "ipaddress",
    "username",
    "password",
    "buildscript",
    "instancename",
  ],
},
ORCH_SESSIONNODE: [{
  NODE_NAME: [
    "SessionNode",
    "GITHUB",
    "DOCKERHUB",
    "SONARQUBE",
    "VIRTUAL_MACHINE",
    "BUILD",
    "JUNIT",
    "SELENIUM",
    "JMETER",
    "ORCHESTRATION",
    "APPROVAL_WORKFLOW",
    "ROLLBACK",
    "RETRY",
    "DECISION MAKING",
  ],
  SESSIONNODE_FIELDS: ["ipaddress", "userid", "password", "manual", "aws_param_store",]
}],
NODE_STATUS:['PASS','FAIL','OTHERS'],
SPECIfIC_NODEFIELD : [
    "urlvariable",
    "accesstokenvariable",
    "usernamevariable",
    "ipaddressvariable",
    "passwordvariable",
],
CICD_REFERENCE : ["PROVIDER", "CONTAINER REGISTRY", "BUILDS", "ENVIRONMENTS", "TESTS" , "VARIABLES"],
CICD_RESOUCE_TYPE : ["Incoming", "Outgoing"],
CICD_NODES: ["PROVIDER", "CONTAINER_REGISTRY", "TESTING_TOOL", "ENVIRONMENTS", "ORCHESTRATION", "APPROVAL_WORKFLOW", "BUILD", "OTHERS"],
NODES_VALIDATION_MSG: {
  VALIDATION_PASS: "Pipeline node connections are valid, Node sequence validation passed!",
  VALIDATION_FAIL: "Pipeline validation failed! Check the node connections",
  TESTING_TOOL: "TESTING_TOOL must only follow PROVIDER, BUILD, or APPROVAL_WORKFLOW nodes",
  BUILD: "BUILD must only follow PROVIDER or APPROVAL_WORKFLOW nodes",
  CONTAINER_REGISTRY: "CONTAINER REGISTRY must follow BUILD or either TESTING_TOOL nodes",
  ORCHESTRATION: "ORCHESTRATION must follow only APPROVAL_WORKFLOW nodes",
  ENVIRONMENT: "ENVIRONMENT must follow only CONTAINER REGISTRY, ORCHESTRATION or APPROVAL_WORKFLOW nodes",
  OTHERS: "OTHERS must follow only ENVIRONMENT, ORCHESTRATION or APPROVAL_WORKFLOW nodes"
}
});
