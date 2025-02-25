const SUB_TENANT = "Customer";
export const AWSAppConstant = Object.freeze({
  // URL's
  AWS: {
    TAG_ASSETS: [
      "ASSET_INSTANCE",
      "ASSET_SECURITYGROUP",
      "ASSET_SUBNET",
      "ASSET_VOLUME",
      "ASSET_VPC",
      "VIRTUAL_MACHINES"
    ],
    VMACTION : "/base/assets/instance/{action}",
    IGW: {
      CREATE: "/aws/internetgateway/create",
      FINDALL: "/aws/internetgateway/list",
      UPDATE: "/aws/internetgateway/update",
      FINDBYID: "/aws/internetgateway/",
    },
    COSTVISUAL: {
      CREATE: "/aws/costvisual/create",
      FINDALL: "/aws/costvisual/list",
      UPDATE: "/aws/costvisual/update",
      FINDBYID: "/aws/costvisual/",
    },
    LB: {
      CREATE: "/aws/lb/create",
      FINDALL: "/aws/lb/list",
      UPDATE: "/aws/lb/update",
      FINDBYID: "/aws/lb/",
    },
    DEPLOYMENTS: {
      CREATE: "/aws/deployments/create",
      FINDALL: "/aws/deployments/list",
      UPDATE: "/aws/deployments/update",
      FINDBYID: "/aws/deployments/",
    },
    AMI: {
      CREATE: "/aws/ami/create",
      FINDALL: "/aws/ami/list",
      UPDATE: "/aws/ami/update",
      FINDBYID: "/aws/ami/",
    },
    VPC: {
      CREATE: "/aws/vpc/create",
      FINDALL: "/aws/vpc/list",
      UPDATE: "/aws/vpc/update",
      FINDBYID: "/aws/vpc/",
    },
    SUBNET: {
      CREATE: "/aws/sn/create",
      FINDALL: "/aws/sn/list",
      UPDATE: "/aws/sn/update",
      FINDBYID: "/aws/sn/",
    },
    SECURITYGROUP: {
      CREATE: "/aws/sg/create",
      FINDALL: "/aws/sg/list",
      UPDATE: "/aws/sg/update",
      FINDBYID: "/aws/sg/",
    },
    SGRULES: {
      CREATE: "/aws/sgrule/create",
      FINDALL: "/aws/sgrule/list",
      UPDATE: "/aws/sgrule/update",
      FINDBYID: "/aws/sgrule/",
    },
    ZONES: {
      CREATE: "/aws/zone/create",
      FINDALL: "/aws/zone/list",
      UPDATE: "/aws/zone/update",
      FINDBYID: "/aws/zone/",
    },
    VOLUMES: {
      CREATE: "/aws/volumes/create",
      FINDALL: "/aws/volumes/list",
      UPDATE: "/aws/volumes/update",
      FINDBYID: "/aws/volumes/",
      BULKUPDATE: "/aws/volumes/bulkupdate",
    },
    TAGS: {
      CREATE: "/aws/tags/create",
      FINDALL: "/aws/tags/list",
      UPDATE: "/aws/tags/update",
      FINDBYID: "/aws/tags/",
      BULKUPDATE: "/aws/tags/bulkupdate",
    },
    SOLUTIONS: {
      CREATE: "/aws/solution/create",
      FINDALL: "/aws/solution/list",
      UPDATE: "/aws/solution/update",
      FINDBYID: "/aws/solution/",
      BULKUPDATE: "/aws/solution/bulkupdate",
    },
    KEYS: {
      CREATE: "/aws/key/create",
      FINDALL: "/aws/key/list",
      UPDATE: "/aws/key/update",
      FINDBYID: "/aws/key/",
      BULKUPDATE: "/aws/key/bulkupdate",
    },
    INSTANCETYPE: {
      CREATE: "/aws/insttype/create",
      FINDALL: "/aws/insttype/list",
      UPDATE: "/aws/insttype/update",
      FINDBYID: "/aws/insttype/",
    },
  },

  // Validations
  VALIDATIONS: {
    LB: {
      LBNAME: {
        required: "Please Enter load balancer name",
      },
      LISTENERS: {
        required: "Please select listeners",
      },
      SUBNET: {
        required: "Please select subnet",
      },
      POLICY: {
        required: "Please select security policy",
      },
      SG: {
        required: "Please select security group",
      },
      HCUNHEALTHYTHERSHOLD: {
        required: "Please enter unhealthy thershold value",
        min: "UnHealthy Thershold Valid values: 2 to 60",
        max: "UnHealthy Thershold Valid values: 2 to 60",
      },
      HCHEALTHYTHERSHOLD: {
        required: "Please enter healthy thershold value",
        min: "Healthy Thershold Valid values: 2 to 60",
        max: "Healthy Thershold Valid values: 2 to 60",
      },
      ARN: {
        required: "Please enter ARN value",
        pattern: "Invalid arn format",
      },
      PORT: {
        required: "Please enter Port",
        min: "Port range: 1 to 65535",
        max: "Port range: 1 to 65535",
      },
      INTERVAL: {
        required: "Please enter interval",
        min: "Health Check Interval Valid values: 5 to 300",
        max: "Health Check Interval Valid values: 5 to 300",
      },
      TIMEOUT: {
        required: "Please enter timeout",
        min: "Response Timeout Valid values: 2 to 60",
        max: "Response Timeout Valid values: 2 to 60",
      },
    },
    GENERICREQUEST: {
      ADDEDITFORM: {
        SUBJECT: {
          required: "Please Enter Request Subject",
          minlength: "Request Subject atleast 1 character",
          maxlength: "Request Subject not more than 50 character",
        },
        DESCRIPTION: {
          required: "Please Enter Request Description",
          minlength: "Request Description atleast 1 character",
          maxlength: "Request Description not more than 1000 character",
        },
        DEPARTMENT: {
          required: "Please Select Department",
        },
        ICP: {
          required: "Please Select Project",
        },
        ASSIGNEE: {
          required: "Please Select Request Assignee",
        },
        CUSTOMER: {
          required: "Please Select " + SUB_TENANT,
        },
        IRN: {
          required: "Please Enter Internal Reference Number",
          minlength: "Internal Reference Number atleast 1 character",
          maxlength: "Internal Reference Number not more than 50 character",
        },
        STARTDEPLOYDATE: {
          required: "Please Select Start Date of Deployment",
        },
        DECOMMISIONDATE: {
          required: "Please Select Decommissioning Date",
        },
        PRIORITY:{
          required: "Please Select Priority",
        },
        REPORTER:{
          required: "Please Select Reporter",
        },
        WORKFLOW: {
          required: "Please Select Workflow",
        },
      },
    },
    SOLUTIONREQUEST: {
      SERVICE: {
        required: "Please select service",
      },
      SUBJECT: {
        required: "Please enter title",
      },
      DEPARTMENT: {
        required: "Please select department",
      },
      EMAILYN: {
        required: "Please select email ",
      },
      DEPLOYSTDATE: {
        required: "Please enter deployment start date",
      },
      DECOMMDATE: {
        required: "Please enter decommissioning date ",
      },
      BUDGETYN: {
        required: "Please select budget available",
      },
      URGENTYN: {
        required: "",
      },
      CLIENT: {
        required: "Please select customer",
      },
      PLANNED_PUBLISH_DATE: {
        required: "Please enter planned publish date",
      },
      PLANNED_END_DATE: {
        required: "Please Select planned end date",
      },
      REFERENCENO: {
        required: "Please enter reference number",
      },
      NOTES: {
        required: "Please enter notes",
      },
      WATCHLIST:{
        required: "Please select watchlist",
      }
    },
    AWSAMI: {
      ADD: "Add Image",
      UPDATE: "Update Image",
      AMINAME: {
        required: "Please Enter AMI Name",
        minlength: "AMI Name atleast 1 character",
        maxlength: "AMI Name not more than 100 character",
      },
      AMIID: {
        minlength: "AWS AMI ID atleast 1 character",
        maxlength: "AWS AMI ID not more than 50 character",
      },
      PLATFORM: {
        required: "Please Select Platform",
      },
      NOTES: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 100 character",
      },
    },
    AWSVPC: {
      VPCNAME: {
        required: "Please Enter AMI Name",
        minlength: "AMI Name atleast 1 character",
        maxlength: "AMI Name not more than 100 character",
      },
      VPCID: {
        minlength: "AWS AMI ID atleast 1 character",
        maxlength: "AWS AMI ID not more than 50 character",
      },
      VPCIP: {
        required: "Please Select Platform",
      },
      NOTES: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 100 character",
      },
    },
    AWSKEYS: {
      KEYNAME: {
        required: "Please Enter Key Name",
        minlength: "Key Name atleast 1 character",
        maxlength: "Key Name not more than 50character",
      },
    },
    AWSSUBNET: {
      SUBNETNAME: {
        required: "Please Enter Subnet Name",
        minlength: "Subnet Name atleast 1 character",
        maxlength: "Subnet Name not more than 50character",
      },
      CIDR: {
        required: "Please Enter CIDR",
      },
      ZONE: {
        required: "Please Select Zone",
      },
      NOTES: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 100 character",
      },
    },
    TICKETS: {
      CUSTOMERNAME: {
        required: "Please Select Customer",
      },
      CATEGORY: {
        required: "Please Select or Enter Category",
      },
      INCIDENTNo: {
        required: "Please Enter Incident Number",
        minlength: "Incident Number atleast 1 character",
        maxlength: "Incident Number not more than 50 character",
      },
      TITLE: {
        required: "Please Enter Title",
        minlength: "Title atleast 1 character",
        maxlength: "Title not more than 500 character",
      },
      DISPLAYTITLE: {
        minlength: "Title atleast 1 character",
        maxlength: "Title not more than 50 character",
      },
      SEVERITY: {
        required: "Please Select Severity",
      },
      URGENCY: {
        required: "Please Select Urgency",
      },
      IMPACT: {
        required: "Please Select Impact",
      },
      NOTES: {
        minlength: "Title atleast 1 character",
        maxlength: "Title not more than 500 character",
      },
    },
  },
  COLUMNS: {
    TICKETMANAGEMENT: [
      {
        field: "customername",
        header: "Customer",
        datatype: "string",
        isdefault: true,
      },
      {
        field: "category",
        header: "Category",
        datatype: "string",
        isdefault: true,
      },
      {
        field: "incidentno",
        header: "Incident No.",
        datatype: "string",
        isdefault: true,
      },
      {
        field: "incidentdate",
        header: "Incident Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
      },
      { field: "title", header: "Title", datatype: "string", isdefault: true },
      {
        field: "displaytitle",
        header: "Display Title",
        datatype: "string",
        isdefault: false,
      },
      {
        field: "impact",
        header: "Impact",
        datatype: "string",
        isdefault: false,
      },
      {
        field: "urgency",
        header: "Urgency",
        datatype: "string",
        isdefault: false,
      },
      {
        field: "severity",
        header: "Severity",
        datatype: "string",
        isdefault: true,
      },
      {
        field: "contacttype",
        header: "Contact Type",
        datatype: "string",
        isdefault: false,
      },
      {
        field: "product",
        header: "Product",
        datatype: "string",
        isdefault: false,
      },
      {
        field: "assignmentgroup",
        header: "Assignment Group",
        datatype: "string",
        isdefault: false,
      },
      {
        field: "assignmentto",
        header: "Assignment To",
        datatype: "string",
        isdefault: false,
      },
      { field: "notes", header: "Notes", datatype: "html", isdefault: false },
      {
        field: "dpublishyn",
        header: "Publish to Dashboard",
        datatype: "string",
        isdefault: false,
      },
      {
        field: "incidentclosedt",
        header: "Incident Close Date",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: false,
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
      {
        field: "incidentstatus",
        header: "Incident Status",
        datatype: "string",
        isdefault: true,
      },
      {
        field: "status",
        header: "Status",
        datatype: "string",
        isdefault: false,
      },
    ],
    SSLMONITORING: [
      {
        field: "name",
        header: "Name",
        datatype: "string",
        isdefault: true,
      },
      {
        field: "status",
        header: "Status",
        datatype: "string",
        isdefault: true,
      },
      {
        field: "urlcount",
        header: "Url Count",
        datatype: "number",
        isdefault: true,
        isDisableSort: true,
      },
      {
        field: "expireSoon",
        header: "Expire Soon",
        datatype: "html",
        isdefault: true,
        isDisableSort: true,
      },
      {
        field: "createdby",
        header: "Created By",
        datatype: "string",
        isdefault: false,
      },
      {
        field: "createddt",
        header: "Created On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy hh:mm:ss",
        isdefault: false,
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
    ]
  },
});
