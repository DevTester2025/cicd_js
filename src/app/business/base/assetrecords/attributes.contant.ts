export const AssetAttributesConstant = Object.freeze({
  COLUMNS: {
    VIRTUAL_MACHINES: [
      {
        field: "instancename",
        referencekey : "vm_name",
        header: "Instance Name",
        datatype: "string",
        linkid: "instancerefid"
      },
      {
        field: "region",
        referencekey : "vm_region",
        header: "Region",
        datatype: "string",
        linkid: "instancerefid"
      },
      {
        field: "instancerefid",
        referencekey : "vm_instanceid",
        header: "Instance Id",
        datatype: "string",
        linkid: "instancerefid"
      },
      {
        field: "['customer','customername']",
        referencekey : "vm_customername",
        header: "Customer",
        datatype: "object",
        linkid: "instancerefid"
      },
      {
        field: "platform",
        referencekey : "vm_platform",
        header: "Platform",
        datatype: "string",
        linkid: "instancerefid"
      },
    ],
    CLUSTERS: [
      {
        datatype: "string",
        field: "clustername",
        referencekey : "cl_clustername",
        header: "Cluster Name",
        linkid:'clusterrefid'
      },
      {
        datatype: "string",
        field: "clusterrefid",
        referencekey : "cl_clusterrefid",
        header: "Cluster ID",
        linkid:'clusterrefid'
      },
      {
        datatype: "string",
        field: "drsstate",
        referencekey : "cl_drsstate",
        header: "DRS State",
        linkid:'clusterrefid'
      },
      {
        datatype: "string",
        field: "hastate",
        referencekey : "cl_hastate",
        header: "HA state",
        linkid:'clusterrefid'
      },
      {
        datatype: "object",
        field: "['customer','customername']",
        referencekey : "cl_customername",
        header: "Customer",
        linkid:'clusterrefid'
      },
    ],
    DATACENTERS: [
      {
        datatype: "string",
        field: "dcname",
        referencekey : "dc_dcname",
        header: "Datacenter Name",
        linkid: "dcrefid"
      },
      {
        datatype: "string",
        field: "dcrefid",
        referencekey : "dc_dcrefid",
        header: "Datacenter ID",
        linkid: "dcrefid"
      },
      {
        datatype: "object",
        field: "['customer','customername']",
        referencekey : "dc_customername",
        header: "Customer",
        linkid: "dcrefid"
      },
    ],
    VM_HOSTS: [
      {
        datatype: "string",
        field: "hostname",
        referencekey : "hs_hostname",
        header: "Host Name",
        linkid: "hostrefid"
      },
      {
        datatype: "string",
        field: "hostrefid",
        referencekey : "hs_hostrefid",
        header: "Host ID",
        linkid: "hostrefid"
      },
      {
        datatype: "string",
        field: "hoststate",
        referencekey : "hs_hoststate",
        header: "Host State",
        linkid: "hostrefid"
      },
      {
        datatype: "string",
        field: "powerstate",
        referencekey : "hs_powerstate",
        header: "Power State",
        linkid: "hostrefid"
      },
      {
        datatype: "object",
        field: "['customer','customername']",
        referencekey : "hs_customername",
        header: "Customer",
        linkid: "hostrefid"
      },
    ],
    ASSET_INSTANCE: [
      {
        field: "instancename",
        referencekey : "ai_instancename",
        header: "Instance Name",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "['awszones','zonename']",
        referencekey : "ai_zonename",
        header: "Zone",
        datatype: "object",
        linkid: "instancerefid",
      },
      {
        field: "instancetyperefid",
        referencekey : "ai_instancetyperefid",
        header: "Instance Type",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "costs",
        referencekey : "ai_costs",
        header: "Cost (Monthly)",
        datatype: "number",
        linkid: "instancerefid",
      },
      {
        field: "instancerefid",
        referencekey : "ai_instancerefid",
        header: "Instance Id",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "['customer','customername']",
        referencekey : "ai_customername",
        header: "Customer",
        datatype: "object",
        linkid: "instancerefid",
      },
      {
        field: "privateipv4",
        referencekey : "ai_privateipv4",
        header: "Private IP",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "publicipv4",
        referencekey : "ai_publicipv4",
        header: "Public IP",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "publicdns",
        referencekey : "ai_publicdns",
        header: "Public DNS",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "imagerefid",
        referencekey : "ai_imagerefid",
        header: "Image ID",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "platform",
        referencekey : "ai_platform",
        header: "Platform",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "['awsinstance','vcpu']",
        referencekey : "ai_vcpu",
        header: "CPU",
        datatype: "object",
        linkid: "instancerefid",
      },
      {
        field: "['awsinstance','memory']",
        referencekey : "ai_memory",
        header: "Memory",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "securitygrouprefid",
        referencekey : "ai_securitygrouprefid",
        header: "Security Group Id",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "subnetrefid",
        referencekey : "ai_subnetrefid",
        header: "Subnet Id",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "['volume','sizeingb']",
        referencekey : "ai_sizeingb",
        arrayname: "attachedvolumes",
        header: "Volume Size (GB)",
        datatype: "array",
        linkid: "instancerefid",
        fkid: "['volume','awsvolumeid']",
      },
      {
        field: "['volume','volumetype']",
        referencekey : "ai_volumetype",
        arrayname: "attachedvolumes",
        header: "Volume Type",
        datatype: "array",
        linkid: "instancerefid",
        fkid: "['volume','awsvolumeid']",
      },
      {
        field: "networkrefid",
        referencekey : "ai_networkrefid",
        header: "VPC Id",
        datatype: "string",
        linkid: "instancerefid",
      },
      {
        field: "cloudstatus",
        referencekey : "ai_cloudstatus",
        header: "Cloud Status",
        datatype: "string",
        linkid: "instancerefid",
      },
    ],
    ASSET_VPC: [
      {
        field: "vpcname",
        referencekey : "avpc_vpcname",
        header: "VPC Name",
        datatype: "string",
        linkid: "awsvpcid",
      },
      {
        field: "awsvpcid",
        referencekey : "avpc_awsvpcid",
        header: "VPC Id",
        datatype: "string",
        linkid: "awsvpcid",
      },
      {
        field: "ipv4cidr",
        referencekey : "avpc_ipv4cidr",
        header: "IPV4 CIDR",
        datatype: "string",
        linkid: "awsvpcid",
      },
    ],
    ASSET_SUBNET: [
      {
        field: "subnetname",
        referencekey : "asn_subnetname",
        header: "Subnet Name",
        datatype: "string",
        linkid: "awssubnetd",
      },
      {
        field: "awssubnetd",
        referencekey : "asn_awssubnetd",
        header: "Subnet Id",
        datatype: "string",
        linkid: "awssubnetd",
      },
      {
        field: "ipv4cidr",
        referencekey : "asn_ipv4cidr",
        header: "IPV4 CIDR",
        datatype: "string",
        linkid: "awssubnetd",
      },
      {
        field: "awsvpcid",
        referencekey : "asn_awsvpcid",
        header: "VPC Id",
        datatype: "string",
        linkid: "awssubnetd",
      },
    ],
    ASSET_SECURITYGROUP: [
      {
        field: "securitygroupname",
        referencekey : "asg_securitygroupname",
        header: "Security Group",
        datatype: "string",
        linkid: "awssecuritygroupid",
      },
      {
        field: "awssecuritygroupid",
        referencekey : "asg_awssecuritygroupid",
        header: "Security Group Id",
        datatype: "string",
        linkid: "awssecuritygroupid",
      },
      {
        field: "awsvpcid",
        referencekey : "asg_awsvpcid",
        header: "VPC ID",
        datatype: "string",
        linkid: "awssecuritygroupid",
      },
      {
        field: "notes",
        referencekey : "asg_notes",
        header: "Notes",
        datatype: "string",
        linkid: "awssecuritygroupid",
      },
    ],
    ASSET_LB: [
      {
        field: "lbname",
        referencekey : "alb_lbname",
        header: "LB Name",
        datatype: "string",
        linkid: "lbid",
      },
      {
        field: "securitypolicy",
        referencekey : "alb_securitypolicy",
        header: "Security Policy",
        datatype: "string",
        linkid: "lbid",
      },
      {
        field: "hcinterval",
        referencekey : "alb_hcinterval",
        header: "Interval",
        datatype: "string",
        linkid: "lbid",
      },
      {
        field: "hctimeout",
        referencekey : "alb_hctimeout",
        header: "Timeout",
        datatype: "string",
        linkid: "lbid",
      },
      {
        field: "hcport",
        referencekey : "alb_hcport",
        header: "Port",
        datatype: "string",
        linkid: "lbid",
      },
      {
        field: "hchealthythreshold",
        referencekey : "alb_hchealthythreshold",
        header: "Healthy Threshold",
        datatype: "string",
        linkid: "lbid",
      },
      {
        field: "hcunhealthythreshold",
        referencekey : "alb_hcunhealthythreshold",
        header: "Unhealthy Threshold",
        datatype: "string",
        linkid: "lbid",
      },
      {
        field: "certificatearn",
        referencekey : "alb_certificatearn",
        header: "Certificate ACM",
        datatype: "string",
        width: "40%",
        linkid: "lbid",
      },
      {
        field: "awssubnetd",
        referencekey : "alb_awssubnetd",
        header: "Subnet Id",
        datatype: "string",
        linkid: "lbid",
      },
      {
        field: "awssecuritygroupid",
        referencekey : "alb_awssecuritygroupid",
        header: "Security Group Id",
        datatype: "string",
        linkid: "lbid",
      },
    ],
    ASSET_IG: [
      {
        field: "gatewayname",
        referencekey : "aig_gatewayname",
        header: "Gateway Name",
        datatype: "string",
        linkid: "awsinternetgatewayid",
      },
      {
        field: "awsinternetgatewayid",
        referencekey : "aig_awsinternetgatewayid",
        header: "AWS Gateway Id",
        datatype: "string",
        linkid: "awsinternetgatewayid",
      },
    ],
    ASSET_S3: [
      {
        field: "assetname",
        referencekey : "as3_assetname",
        header: "Asset Name",
        datatype: "string",
        linkid: "assetid",
      },
      {
        field: "region",
        referencekey : "as3_region",
        header: "Region",
        datatype: "string",
        linkid: "assetid",
      },
    ],
    ASSET_RDS: [
      {
        field: "assetname",
        referencekey : "ards_assetname",
        header: "Asset Name",
        datatype: "string",
        linkid: "assetid",
      },
      {
        field: "region",
        referencekey : "ards_region",
        header: "Region",
        datatype: "string",
        linkid: "assetid",
      },
    ],
    ASSET_ECS: [
      {
        field: "assetname",
        referencekey : "aecs_assetname",
        header: "Asset Name",
        datatype: "string",
        linkid: "assetid",
      },
      {
        field: "region",
        referencekey : "aecs_region",
        header: "Region",
        datatype: "string",
        linkid: "assetid",
      },
    ],
    ASSET_VOLUME: [
      {
        field: "awsvolumeid",
        referencekey : "avl_awsvolumeid",
        header: "Volume Id",
        datatype: "string",
        linkid: "awsvolumeid",
      },
      {
        field: "sizeingb",
        referencekey : "avl_sizeingb",
        header: "Size (GB)",
        datatype: "string",
        linkid: "awsvolumeid",
      },
      {
        field: "encryptedyn",
        referencekey : "avl_encryptedyn",
        header: "Encrypted",
        datatype: "string",
        linkid: "awsvolumeid",
      },
      // {
      //   field: "instancename",
      //   header: "Instance Name",
      //   datatype: "string",
      //   linkid: "awsvolumeid",
      // },
      // {
      //   field: "instancetyperefid",
      //   header: "Instance Type",
      //   datatype: "string",
      //   linkid: "awsvolumeid",
      // },
    ],
    ASSET_EKS: [
      {
        field: "assetname",
        referencekey : "aeks_assetname",
        header: "Asset Name",
        datatype: "string",
        linkid: "assetid",
      },
      {
        field: "region",
        referencekey : "aeks_region",
        header: "Region",
        datatype: "string",
        linkid: "assetid",
      },
    ],
  },
});
