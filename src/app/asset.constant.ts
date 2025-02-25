export const AssetConstant = Object.freeze({
  COLUMNS: {
    SYNTHETICS_LIST: [
      { field: "type", header: "Type", datatype: "string", isdefault: true },
      { field: "name", header: "Name", datatype: "string", isdefault: true },
      { field: "endpoint", header: "Endpoint", datatype: "string" },
      { field: "recurring", header: "Recurring", datatype: "string", isdefault: true },
      { field: "lastrunstatus", header: "Last run status", datatype: "string", isdefault: true },
      { field: "status", header: "Status", datatype: "string", isdefault: true },
      { field: "lastupdatedby", header: "Updated by", datatype: "string" },
      { field: "lastupdateddt", header: "Updated Date", datatype: "timestamp", format: "dd-MMM-yyyy", },
    ],
    ASSET_INSTANCE: [
      {
        field: "instancename",
        header: "Instance Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        width: "20%",
        linkid: "instancerefid"
      },
      {
        field: "accountref",
        header: "Account Id",
        isfilter: true,
        datatype: "string",
        isdefault: false,
        linkid: "instancerefid"
      },
      {
        field: "zone",
        header: "Zone",
        datatype: "string",
        isdefault: true,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "instancetyperefid",
        header: "Instance Type",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "costs",
        header: "Cost (Monthly)",
        datatype: "number",
        isdefault: true,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "instancerefid",
        header: "Instance Id",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "customer",
        header: "Customer",
        datatype: "string",
        isdefault: false,
        width: "15%",
        linkid: "instancerefid"
      },
      {
        field: "privateipv4",
        header: "Private IP",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "publicipv4",
        header: "Public IP",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "ssmsgentid",
        header: "SSM Agent ID",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "publicdns",
        header: "Public DNS",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      // {
      //   field: "aminame",
      //   header: "Image Name",
      //   datatype: "string",
      //   isdefault: false,
      //   width: "100%",
      // },
      {
        field: "imagerefid",
        header: "Image ID",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "platform",
        header: "Platform",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "orchstatus",
        header: "Connection Status",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      // {
      //   field: "notes",
      //   header: "Notes",
      //   datatype: "string",
      //   isdefault: false,
      //   width: "50%",
      // },
      {
        field: "vcpu",
        header: "CPU",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "memory",
        header: "Memory",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "securitygrouprefid",
        header: "Security Group Id",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "subnetrefid",
        header: "Subnet Id",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "volumerefid",
        header: "Volume Id",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "networkrefid",
        header: "VPC Id",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: false,
        width: "10%",
        linkid: "instancerefid"
      },
      {
        field: "promagentstat",
        header: "Status",
        datatype: "vmstatus",
        isDisableSort: true,
        isdefault: true,
      },
      {
        field: "cloudstatus",
        header: "Cloud Status",
        datatype: "string",
        isdefault: true,
        linkid: "instancerefid"
      },
    ],
    ASSET_VPC: [
      {
        field: "vpcname",
        header: "VPC Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        linkid: "awsvpcid"
      },
      {
        field: "awsvpcid",
        header: "VPC Id",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        linkid: "awsvpcid"
      },
      {
        field: "ipv4cidr",
        header: "IPV4 CIDR",
        datatype: "string",
        isdefault: true,
        linkid: "awsvpcid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        linkid: "awsvpcid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        linkid: "awsvpcid"
      },
    ],
    ASSET_SUBNET: [
      {
        field: "subnetname",
        header: "Subnet Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        linkid: "awssubnetd"
      },
      {
        field: "awssubnetd",
        header: "Subnet Id",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        linkid: "awssubnetd"
      },
      {
        field: "ipv4cidr",
        header: "IPV4 CIDR",
        datatype: "string",
        isdefault: true,
        linkid: "awssubnetd"
      },
      {
        field: "awsvpcid",
        header: "VPC Id",
        datatype: "string",
        isdefault: false,
        linkid: "awssubnetd"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        linkid: "awssubnetd"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        linkid: "awssubnetd"
      },
    ],
    ASSET_SECURITYGROUP: [
      {
        field: "securitygroupname",
        header: "Security Group",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        width: "20%",
        linkid: "awssecuritygroupid"
      },
      {
        field: "awssecuritygroupid",
        header: "Security Group Id",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        width: "20%",
        linkid: "awssecuritygroupid"
      },
      {
        field: "awsvpcid",
        header: "VPC ID",
        datatype: "string",
        isdefault: false,
        width: "20%",
        linkid: "awssecuritygroupid"
      },
      {
        field: "notes",
        header: "Notes",
        datatype: "string",
        isdefault: false,
        width: "20%",
        linkid: "awssecuritygroupid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        width: "20%",
        linkid: "awssecuritygroupid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        width: "20%",
        linkid: "awssecuritygroupid"
      },
    ],
    ASSET_LB: [
      {
        field: "lbname",
        header: "LB Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "securitypolicy",
        header: "Security Policy",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "hcinterval",
        header: "Interval",
        datatype: "string",
        isdefault: true,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "hctimeout",
        header: "Timeout",
        datatype: "string",
        isdefault: true,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "hcport",
        header: "Port",
        datatype: "string",
        isdefault: false,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "hchealthythreshold",
        header: "Healthy Threshold",
        datatype: "string",
        isdefault: false,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "hcunhealthythreshold",
        header: "Unhealthy Threshold",
        datatype: "string",
        isdefault: false,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "certificatearn",
        header: "Certificate ACM",
        datatype: "string",
        isdefault: false,
        width: "40%",
        linkid: "lbname"
      },
      {
        field: "awssubnetd",
        header: "Subnet Id",
        datatype: "string",
        isdefault: false,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "awssecuritygroupid",
        header: "Security Group Id",
        datatype: "string",
        isdefault: false,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        width: "20%",
        linkid: "lbname"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        width: "20%",
        linkid: "lbname"
      },
    ],
    ASSET_IG: [
      {
        field: "gatewayname",
        header: "Gateway Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "awsinternetgatewayid"
      },
      {
        field: "awsinternetgatewayid",
        header: "AWS Gateway Id",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "awsinternetgatewayid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        link: "awsinternetgatewayid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        link: "awsinternetgatewayid"
      },
    ],
    ASSET_S3: [
      {
        field: "assetname",
        header: "Asset Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "assetid"
      },
      {
        field: "region",
        header: "Region",
        datatype: "string",
        isdefault: false,
        link: "assetid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        link: "assetid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        format: "dd-MMM-yyyy",
        datatype: "timestamp",
        isdefault: true,
        link: "assetid"
      },
    ],
    ASSET_RDS: [
      {
        field: "assetname",
        header: "Asset Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "assetid"
      },
      {
        field: "region",
        header: "Region",
        datatype: "string",
        isdefault: false,
        link: "assetid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        link: "assetid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        link: "assetid"
      },
    ],
    ASSET_ECS: [
      {
        field: "assetname",
        header: "Asset Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "assetid"
      },
      {
        field: "region",
        header: "Region",
        datatype: "string",
        isdefault: false,
        link: "assetid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        link: "assetid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        link: "assetid"
      },
    ],
    ASSET_VOLUME: [
      {
        field: "awsvolumeid",
        header: "Volume Id",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "sizeingb",
        header: "Size (GB)",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "encryptedyn",
        header: "Encrypted",
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "instancename",
        header: "Instance Name",
        datatype: "string",
        isdefault: false,
        link: "awsvolumeid"
      },
      {
        field: "instancetyperefid",
        header: "Instance Type",
        datatype: "string",
        isdefault: false,
        link: "awsvolumeid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        link: "awsvolumeid"
      },
    ],
    ASSET_SGS: [
      {
        field: "awsvolumeid",
        header: "Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "sizeingb",
        header: "Gateway ID",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "encryptedyn",
        header: "Status",
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "instancename",
        header: "Alarm State",
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "instancetyperefid",
        header: "Gateway Type",
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        link: "awsvolumeid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        link: "awsvolumeid"
      },
    ],
    ASSET_EKS: [
      {
        field: "assetname",
        header: "Asset Name",
        isfilter: true,
        datatype: "string",
        isdefault: true,
        link: "assetid"
      },
      {
        field: "region",
        header: "Region",
        datatype: "string",
        isdefault: false,
        link: "assetid"
      },
      {
        field: "lastupdatedby",
        header: "Updated By",
        datatype: "string",
        isdefault: true,
        link: "assetid"
      },
      {
        field: "lastupdateddt",
        header: "Updated On",
        datatype: "timestamp",
        format: "dd-MMM-yyyy",
        isdefault: true,
        link: "assetid"
      },
    ],
  },
  ASSET_DTL_KEYS: [
    "/fk:key",
    "/fk:name",
    "/fk:created",
    "/fk:updated",
    "/fk:private_ip",
    "/fk:public_ip",
    "/fk:instance_id",
  ],
  AWS_CRN: "crn:ops:aws_virtual_machine",
  VM_CRN: "crn:ops:virtual_machine",
  ASSET_TYPE_CRN: "crn:ops:aws_ec2_instance_type/fk:name",
  ASSET_TYPE_KEY: "/fk:aws_ec2_instance_type",
  ASSET_TYPE_VALUE: "crn:ops:aws_ec2_instance_type",
  KPI: {
    TICKETSGROUPANDFILTERS: [
      {
        title: "Customer",
        value: "customerid",
        cangroup: true,
        groupattr: "customerid",
        selectedvalues: [],
        type: "TICKETS",
        filterable: true
      },
      {
        title: "Priority",
        value: "severity",
        cangroup: true,
        groupattr: "severity",
        selectedvalues: [],
        type: "TICKETS",
        filterable: true
      },
      {
        title: "Category",
        value: "category",
        cangroup: true,
        groupattr: "category",
        selectedvalues: [],
        type: "TICKETS",
        filterable: true
      },
      {
        title: "Published?",
        value: "publishyn",
        cangroup: true,
        groupattr: "publishyn",
        selectedvalues: [],
        type: "TICKETS",
        filterable: false
      },
      {
        title: "Status",
        value: "incidentstatus",
        cangroup: true,
        groupattr: "incidentstatus",
        selectedvalues: [],
        type: "TICKETS",
        filterable: true
      },
    ],
    ASSETGROUPANDFILTERS: [
      {
        title: "Customer",
        value: "customerid",
        cangroup: true,
        groupattr: "customerid",
        type: "ASSET",
        selectedvalues: [],
        filterable: true
      },
      {
        title: "Provider",
        value: "cloudprovider",
        cangroup: true,
        groupattr: "cloudprovider",
        type: "ASSET",
        selectedvalues: [],
        filterable: false
      },
      {
        title: "Instance",
        value: "instancename",
        cangroup: false,
        groupattr: "instancename",
        type: "ASSET",
        selectedvalues: [],
        filterable: true
      },
      {
        title: "Instance Id",
        value: "instancerefid",
        cangroup: false,
        groupattr: "instancerefid",
        type: "ASSET",
        selectedvalues: [],
        filterable: true
      },
      {
        title: "Region",
        value: "region",
        cangroup: true,
        groupattr: "region",
        type: "ASSET",
        selectedvalues: [],
        filterable: true
      },
      {
        title: "Instance Type",
        value: "instancetyperefid",
        cangroup: true,
        groupattr: "instancetyperefid",
        type: "ASSET",
        selectedvalues: [],
        filterable: true
      },
      {
        title: "Cloud Status",
        value: "cloudstatus",
        cangroup: true,
        groupattr: "cloudstatus",
        type: "ASSET",
        selectedvalues: [],
        filterable: false
      },
      // {
      //   title: "Tag",
      //   value: "tagid",
      //   cangroup: false,
      //   groupattr: "tagid",
      //   type: "ASSET",
      //   selectedvalues: [],
      //   filterable: true
      // },
      // {
      //   title: "Tag Value",
      //   value: "tagvalue",
      //   cangroup: false,
      //   groupattr: "tagvalue",
      //   type: "ASSET",
      //   selectedvalues: [],
      //   filterable: true
      // },
    ],
    MONITORGROUPANDFILTERS: [
      {
        title: "Customer",
        value: "_customer",
        cangroup: true,
        groupattr: "_customer",
        type: "MONITORING",
        selectedvalues: [],
        filterable: true
      },
      {
        title: "Priority",
        value: "severity",
        cangroup: true,
        groupattr: "severity",
        type: "MONITORING",
        selectedvalues: [],
        filterable: false
      },
      {
        title: "Alert Type",
        value: "referencetype",
        cangroup: true,
        groupattr: "referencetype",
        type: "MONITORING",
        selectedvalues: [],
        filterable: false
      },
      {
        title: "Levels",
        value: "level",
        cangroup: true,
        groupattr: "level",
        type: "MONITORING",
        selectedvalues: [],
        filterable: true
      },
      {
        title: "Metric",
        value: "metric",
        cangroup: true,
        groupattr: "metric",
        type: "MONITORING",
        selectedvalues: [],
        filterable: false
      },
      {
        title: "Tag",
        value: "tagid",
        cangroup: false,
        groupattr: "tagid",
        type: "MONITORING",
        selectedvalues: [],
        filterable: true
      },
      {
        title: "Tag Value",
        value: "tagvalue",
        cangroup: false,
        groupattr: "tagvalue",
        type: "MONITORING",
        selectedvalues: [],
        filterable: true
      },
    ],
    CMDBGROUPANDFILTERS: [
      // {
      //   title: "Resource Type",
      //   value: "crn",
      //   cangroup: true,
      //   groupattr: "crn",
      //   type: "CMDB",
      //   selectedvalues: [],
      //   filterable: true
      // },
      {
        title: "Attribute",
        value: "attribute",
        cangroup: true,
        groupattr: "attribute",
        type: "CMDB",
        selectedvalues: [],
      },
      {
        title: "Tag",
        value: "tagid",
        cangroup: false,
        groupattr: "tagid",
        type: "CMDB",
        selectedvalues: [],
        filterable: true
      },
      {
        title: "Tag Value",
        value: "tagvalue",
        cangroup: false,
        groupattr: "tagvalue",
        type: "CMDB",
        selectedvalues: [],
        filterable: true
      },
    ],
    USERGROUPANDFILTERS: [
      {
        title: "User",
        value: "userid",
        cangroup: false,
        groupattr: "userid",
        selectedvalues: [],
        type: "USERS",
        filterable: true
      },
      {
        title: "Role",
        value: "roleid",
        cangroup: true,
        groupattr: "rolename",
        selectedvalues: [],
        type: "USERS",
        filterable: true
      },
      {
        title: "Department",
        value: "department",
        cangroup: true,
        groupattr: "department",
        selectedvalues: [],
        type: "USERS",
        filterable: true
      }
    ],
    CUSTOMERGROUPANDFILTERS: [
      {
        title: "Customer",
        value: "customerid",
        cangroup: false,
        groupattr: "customerid",
        selectedvalues: [],
        type: "CUSTOMERS",
        filterable: true
      },
      {
        title: "Accounts",
        value: "customerid",
        cangroup: true,
        groupattr: "customername",
        selectedvalues: [],
        type: "CUSTOMERS",
        filterable: true
      },
      // {
      //   title: "Role",
      //   value: "rolename",
      //   cangroup: true,
      //   groupattr: "rolename",
      //   selectedvalues: [],
      //   type: "CUSTOMERS",
      //   filterable: true
      // }
    ],
    DATAMANAGEMENTGROUPANDFILTERS: [
      {
        title: "Resource Type",
        value: "resourcetype",
        cangroup: true,
        groupattr: "resourcetype",
        selectedvalues: [],
        type: "DATAMANAGEMENT",
        filterable: true
      },
      {
        title: "Attribute Type",
        value: "fieldtype",
        cangroup: true,
        groupattr: "fieldtype",
        selectedvalues: [],
        type: "DATAMANAGEMENT",
        filterable: false
      },
      {
        title: "Is ReadOnly",
        value: "readonly",
        cangroup: true,
        groupattr: "readonly",
        selectedvalues: [],
        type: "DATAMANAGEMENT",
        filterable: false
      },
      // {
      //   title: "Default Fields",
      //   value: "showbydefault",
      //   cangroup: true,
      //   groupattr: "showbydefault",
      //   selectedvalues: [],
      //   type: "DATAMANAGEMENT",
      //   filterable: true
      // }
    ],
    SLAGROUPANDFILTERS: [
      {
        title: "Template",
        value: "slaname",
        cangroup: false,
        groupattr: "slaname",
        selectedvalues: [],
        type: "SLA",
        filterable: false
      },
      {
        title: "Customer",
        value: "customerid",
        cangroup: true,
        groupattr: "customerid",
        selectedvalues: [],
        type: "SLA",
        filterable: true
      }
    ],
    TAGSGROUPANDFILTERS: [
      {
        title: "Resource Type",
        value: "resource",
        cangroup: true,
        groupattr: "resource",
        selectedvalues: [],
        type: "TAGS",
        filterable: true
      },
      {
        title: "Data Type",
        value: "tagtype",
        cangroup: true,
        groupattr: "tagtype",
        selectedvalues: [],
        type: "TAGS",
        filterable: false
      }
    ],
    SYNTHETICS: [
      {
        title: "Synthetics",
        value: "canaryname",
        cangroup: true,
        groupattr: "canaryname",
        selectedvalues: [],
        type: "SYNTHETICS",
        filterable: true
      },
      {
        title: "URLS",
        value: "url",
        cangroup: true,
        groupattr: "url",
        selectedvalues: [],
        type: "SYNTHETICS",
        filterable: true
      },
      //#OP_T428 
      {
        title: "Regions",
        value: "zonename",
        cangroup: true,
        groupattr: "zonename",
        selectedvalues: [],
        type: "SYNTHETICS",
        filterable: true
      }
    ],
    SSLGROUPANDFILTERS: [
      {
        title: "SSL name",
        value: "name",
        cangroup: true,
        groupattr: "name",
        selectedvalues: [],
        type: "SSL",
        filterable: true
      },
      {
        title: "URLS",
        value: "urls",
        cangroup: true,
        groupattr: "urls",
        selectedvalues: [],
        type: "SSL",
        filterable: true
      }
    ]
  },
});
