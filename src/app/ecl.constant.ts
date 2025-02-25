const SUB_TENANT = "Customer";
export const ECLAppConstant = Object.freeze({
  // URL's
  ECL2: {
    INSTANCETYPE: {
      FINDALL: "/ecl2/instancetype/list",
    },
    AMI: {
      CREATE: "/ecl2/image/create",
      FINDALL: "/ecl2/image/list",
      UPDATE: "/ecl2/image/update",
      FINDBYID: "/ecl2/image/",
    },
    ZONES: {
      FINDALL: "/ecl2/zone/list",
    },
    NETWORK: {
      CREATE: "/ecl2/network/create",
      FINDALL: "/ecl2/network/list",
      UPDATE: "/ecl2/network/update",
      FINDBYID: "/ecl2/network/",
      DELETE: "/ecl2/network/delete",
    },
    SUBNET: {
      CREATE: "/ecl2/subnet/create",
      FINDALL: "/ecl2/subnet/list",
      UPDATE: "/ecl2/subnet/update",
      FINDBYID: "/ecl2/subnet/",
      DELETE: "/ecl2/subnet/delete",
    },
    PORT: {
      CREATE: "/ecl2/port/create",
      FINDALL: "/ecl2/port/list",
      UPDATE: "/ecl2/port/update",
      FINDBYID: "/ecl2/port/",
      DELETE: "/ecl2/port/delete",
    },
    VOLUMES: {
      CREATE: "/ecl2/volume/create",
      FINDALL: "/ecl2/volume/list",
      UPDATE: "/ecl2/volume/update",
      FINDBYID: "/ecl2/volume/",
    },
    SOLUTION: {
      CREATE: "/ecl2/solution/create",
      FINDALL: "/ecl2/solution/list",
      UPDATE: "/ecl2/solution/update",
      FINDBYID: "/ecl2/solution/",
      CONNREQ: "/ecl2/solution/createconnreq",
    },
    LOADBALANCER: {
      CREATE: "/ecl2/loadbalancer/create",
      FINDALL: "/ecl2/loadbalancer/list",
      UPDATE: "/ecl2/loadbalancer/update",
      FINDBYID: "/ecl2/loadbalancer/",
      DELETE: "/ecl2/loadbalancer/delete",
      RETRY: "/deployments/ecl2/netscaler",
    },
    KEYPAIR: {
      CREATE: "/ecl2/key/create",
      FINDALL: "/ecl2/key/list",
      UPDATE: "/ecl2/key/update",
      FINDBYID: "/ecl2/key/",
    },
    GATEWAY: {
      CREATE: "/ecl2/gateway/create",
      FINDALL: "/ecl2/gateway/list",
      UPDATE: "/ecl2/gateway/update",
      FINDBYID: "/ecl2/gateway/",
      DELETE: "/ecl2/gateway/delete",
    },
    FIREWALL: {
      CREATE: "/ecl2/firewall/create",
      FINDALL: "/ecl2/firewall/list",
      UPDATE: "/ecl2/firewall/update",
      FINDBYID: "/ecl2/firewall/",
      DELETE: "/ecl2/firewall/delete",
    },
    INTERFACE: {
      CREATE: "/ecl2/gateway/interface/create",
      FINDALL: "/ecl2/gateway/interface/list",
      UPDATE: "/ecl2/gateway/interface/update",
      FINDBYID: "/ecl2/gateway/interface/",
      DELETE: "/ecl2/gateway/interface/delete",
    },
    GLOBALIP: {
      CREATE: "/ecl2/gateway/globalip/create",
      FINDALL: "/ecl2/gateway/globalip/list",
      UPDATE: "/ecl2/gateway/globalip/update",
      FINDBYID: "/ecl2/gateway/globalip/",
      DELETE: "/ecl2/gateway/globalip/delete",
    },
    STATICIP: {
      CREATE: "/ecl2/gateway/staticip/create",
      FINDALL: "/ecl2/gateway/staticip/list",
      UPDATE: "/ecl2/gateway/staticip/update",
      FINDBYID: "/ecl2/gateway/staticip/",
      DELETE: "/ecl2/gateway/staticip/delete",
    },
    COMMONFUNCGATEWAY: {
      CREATE: "/ecl2/commonfunctiongateway/create",
      FINDALL: "/ecl2/commonfunctiongateway/list",
      UPDATE: "/ecl2/commonfunctiongateway/update",
      FINDBYID: "/ecl2/commonfunctiongateway/globalip/",
      DELETE: "/ecl2/commonfunctiongateway/delete",
    },
    COMMONFNPOOL: {
      FINDALL: "/ecl2/commonfunctionpool/list",
    },
    FIREWALLPLAN: {
      FINDALL: "/ecl2/firewallplans/list",
    },
    INTERNETSERVICES: {
      FINDALL: "/ecl2/internetservices/list",
    },
    QOSOPTIONS: {
      FINDALL: "/ecl2/qosoptions/list",
    },
    LBPLAN: {
      FINDALL: "/ecl2/lbplan/list",
    },
    FIREWALLINTERFACE: {
      UPDATE: "/ecl2/firewallinterface/update",
      FINDALL: "/ecl2/firewallinterface/list",
    },
    LBINTERFACE: {
      UPDATE: "/ecl2/lbinterface/update",
      FINDALL: "/ecl2/lbinterface/list",
    },
    LBSYSLOGSERVERS: {
      CREATE: "/ecl2/lbsyslogserver/create",
      UPDATE: "/ecl2/lbsyslogserver/update",
      FINDALL: "/ecl2/lbsyslogserver/list",
    },
    VSRXPLAN: {
      FINDALL: "/ecl2/vsrxplan/list",
    },
    VSRX: {
      CREATE: "/ecl2/vsrx/create",
      UPDATE: "/ecl2/vsrx/update",
      FINDALL: "/ecl2/vsrx/list",
      DELETE: "/ecl2/vsrx/delete",
      FINDBYID: "/ecl2/vsrx/",
      RPC: "/ecl2/vsrx/rpc",
      RETRY: "/deployments/ecl2/vsrx",
    },
    TENANTCONN_REQ: {
      CREATE: "/ecl2/tenantconnrequest/create",
      UPDATE: "/ecl2/tenantconnrequest/update",
      FINDALL: "/ecl2/tenantconnrequest/list",
      DELETE: "/ecl2/tenantconnrequest/delete",
      FINDBYID: "/ecl2/tenantconnrequest/",
    },
    TENANT_CONNECTION: {
      CREATE: "/ecl2/tenantconnection/create",
      UPDATE: "/ecl2/tenantconnection/update",
      FINDALL: "/ecl2/tenantconnection/list",
      DELETE: "/ecl2/tenantconnection/delete",
      FINDBYID: "/ecl2/tenantconnection/",
    },
    DATASYNC: "/ecl2/common/synchronization",
    DEPLOY: "/deployments/ecl2/deploy",
    VNCCONSOLE: "/deployments/ecl2/vncconsole",
    ZONE: "/ecl2/zone/",
  },

  // Validations

  VALIDATIONS: {
    RESIZE: {
      maintwindowid: {
        required: "Please select the maintenance window",
      },
      weekdays: {
        required: "Please select the week day",
      },
      newplan: {
        required: "Please select upgrade plan type",
      },
    },
    AMI: {
      ADD: "Add Image",
      UPDATE: "Update Image",
      IMAGENAME: {
        required: "Please Enter Image Name",
        minlength: "Image Name atleast 1 character",
        maxlength: "Image Name not more than 200 character",
      },
      ECL2IMAGEID: {
        required: "Please enter ECL2 image ID",
        minlength: "ECL2 image ID atleast 1 character",
        maxlength: "ECL2 image ID not more than 100 character",
      },
      PLATFORM: {
        required: "Please Select Platform",
      },
      NOTES: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 100 character",
      },
    },
    KEY: {
      KEYNAME: {
        required: "Please Enter Key Name",
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 50character",
      },
      PUBLICKEY: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 500haracter",
      },
    },
    PORT: {
      PORTNAME: {
        required: "Please Enter Port Name",
        minlength: "Image Name atleast 1 character",
        maxlength: "Image Name not more than 100 character",
      },
      ADMINSTATE: {
        required: "Please Select Admin State",
      },
      SEGMENTATIONTYPE: {
        required: "Please Select Segmentation Type",
      },
    },
    SUBNET: {
      SUBNETNAME: {
        minlength: "Subnet Name atleast 1 character",
        maxlength: "Subnet Name not more than 100 character",
      },
      CIDR: {
        required: "Please Enter Network Address",
        pattern: "Invalid Address",
      },
      DESCRIPTION: {
        maxlength: "Subnet Name not more than 500 character",
      },
      STARTADDRESS: {
        required: "Please Enter Start address of allocation pool",
      },
      ENDADDRESS: {
        required: "Please Enter End address of allocation pool",
      },
    },
    NETWORK: {
      NETWORKNAME: {
        minlength: "Network Name atleast 1 character",
        maxlength: "Network Name not more than 100 character",
      },
      PLANE: {
        required: "Please Select Network Plane",
      },
      ADMINSTATE: {
        required: "Please Select Admin State",
      },
      ZONE: {
        required: "Please Select Zone",
      },
      DESCRIPTION: {
        maxlength: "Description not more than 500 character",
      },
    },
    LB: {
      SETTINGS: {
        SERVICEGROUP: {
          servicegroupname: { required: "Please enter name" },
          name: { required: "Please enter name" },
          port: { required: "Please enter port" },
          weight: { required: "Please enter weight" },
          customserverid: { required: "Please enter custom server id" },
          servicetype: { required: "Please select protocol" },
          lbmethod: { required: "Please enter method" },
          newservicerequest: {
            required: "Please enter new service request rate",
          },
          backuplbmethod: { required: "Please enter Backup LB Method" },
          newservicerequestunit: {
            required: "Please enter New Service Request unit",
          },
          newservicerequestincrementinterval: {
            required: "Please enter Increment Interval ",
          },
          td: { required: "Please enter Traffic domain" },
          // cachetype: { required: 'Please select cache type' },
          monconnectionclose: {
            required: "Please select monitor connection close bit",
          },
          // autoscale: { required: 'Please select auto scale mode' },
          monitor_name: { required: "Please select monitor" },
        },
      },
      LBNAME: {
        required: "Please Enter Load Balancer Name",
        minlength: "Load Balancer Name atleast 1 character",
        maxlength: "Load Balancer Name not more than 100 character",
      },
      LBPLAN: {
        required: "Please Select Load Balancer Plan",
      },
      DESCRIPTION: {
        maxlength: "Subnet Name not more than 500 character",
      },
    },
    INSTANCE: {
      INSTANCENAME: {
        required: "Please Enter Instance Name",
        minlength: "Instance Name atleast 1 character",
        maxlength: "Instance Name not more than 100 character",
      },
      INSTANCETYPE: {
        required: "Please Select Instance Type",
      },
      IMAGE: {
        required: "Please Select Image",
      },
      NETWORKS: {
        required: "Please Select Network",
      },
      // ,INTERNETGATEWAY: {
      //   required: 'Please Select Internet Gateway',
      // },
      // VSRX: {
      //   required: 'Please Select VSRX',
      // }
    },
    GATEWAY: {
      GATEWAYNAME: {
        required: "Please Enter Gateway Name",
        minlength: "Gateway Name atleast 1 character",
        maxlength: "Gateway Name not more than 100 character",
      },
      INTERNETSERVICE: {
        required: "Please Select Internet Service",
      },
      QOSOPTION: {
        required: "Please Select QoS Option",
      },
      ZONE: {
        required: "Please Select Zone",
      },
      DESCRIPTION: {
        minlength: "Description atleast 1 character",
        maxlength: "Description not more than 500 character",
      },
    },
    FIREWALL: {
      ADDFW: "Add Firewall",
      ADDVSRX: "Add VSRX",
      UPDATEFW: "Update Firewall",
      UPDATEVSRX: "Update VSRX",
      FIREWALLNAME: {
        required: "Please Enter Firewall Name",
        minlength: "Firewall Name atleast 1 character",
        maxlength: "Firewall Name not more than 100 character",
      },
      FIREWALLPLAN: {
        required: "Please Select Firewall Plan",
      },
      ZONE: {
        required: "Please Select Zone",
      },
      DESCRIPTION: {
        minlength: "Description atleast 1 character",
        maxlength: "Description not more than 500 character",
      },
      NETWORK: {
        required: "Please Select Network",
      },
      IPADDRESS: {
        required: "Please Enter IP Address",
        minlength: "IP Address atleast 1 character",
        maxlength: "IP Address not more than 30 character",
      },
      DEFAULTGATEWAY: {
        minlength: "IP Address atleast 1 character",
        maxlength: "IP Address not more than 30 character",
      },
      SOURCENAT: {
        RULENAME: {
          required: "Please Enter Rule Name",
        },
        FROMZONE: {
          required: "Please Select From Zone",
        },
        TOZONE: {
          required: "Please Select To Zone",
        },
        SOURCEADDRESS: {
          required: "Please Enter Source Address",
        },
        DESTINATIONADDRESS: {
          required: "Please Enter Destination Address",
        },
        NATTO: {
          required: "Please Select NAT To",
        },
        IPADDRESS: {
          required: "Please Enter IP Address",
        },
      },
      DESTINATIONNAT: {
        RULENAME: {
          required: "Please Enter Rule Name",
        },
        FROMZONE: {
          required: "Please Select From Zone",
        },
        POOLADDRESS: {
          required: "Please Enter Incoming Pool Address",
        },
        DESTINATIONADDRESS: {
          required: "Please Enter Matching Destination Address",
        },
      },
      PROXYARPNAT: {
        INTERFACE: {
          required: "Please Select Interface",
        },
        FROMADDRESS: {
          required: "Please Enter From Address",
        },
        TOADDRESS: {
          required: "Please Enter To Address",
        },
      },
      SECURITYPOLICY: {
        RULENAME: {
          required: "Please Enter Rule Name",
        },
        FROMZONE: {
          required: "Please Select From Zone",
        },
        TOZONE: {
          required: "Please Select To Zone",
        },
        SOURCEADDRESS: {
          required: "Please Enter Source Address",
        },
        DESTINATIONADDRESS: {
          required: "Please Enter Destination Address",
        },
        ADVANCEDRULE: {
          required: "Please Select Advanced Rule",
        },
        SERVICE: {
          required: "Please Select Service",
        },
      },
    },
    CLOUD_ASSET: {
      tnregionid: {
        required: "Please Select Region",
      },
      assetname: {
        required: "Please Enter Asset Name",
        minlength: "Interface Name atleast 1 character",
        maxlength: "Interface Name not more than 100 character",
      },
      cloudprovider: {
        required: "Please Select Cloud Provider",
      },
      remarks: {
        required: "Please Enter Remarks",
      },
    },
    GATEWAYINTERFACE: {
      INTERFACENAME: {
        minlength: "Interface Name atleast 1 character",
        maxlength: "Interface Name not more than 100 character",
      },
      NETWORK: {
        required: "Please Select Network",
      },
      GATEWAYIPV4: {
        required: "Please Enter Gateway IPV4 Address",
        minlength: "Gateway IPV4 Address atleast 1 character",
        maxlength: "Gateway IPV4 Address not more than 100 character",
      },
      PRIMARYIPV4: {
        required: "Please Enter Primary Device IPv4 Address",
        minlength: "Primary Device IPv4 Address atleast 1 character",
        maxlength: "Primary Device IPv4 Address not more than 100 character",
      },
      SECONDARYIPV4: {
        required: "Please Enter Secondary Device IPv4 Address",
        minlength: "Secondary Device IPv4 Address atleast 1 character",
        maxlength: "Secondary Device IPv4 Address not more than 100 character",
      },
      VRRPGROUPID: {
        required: "Please Enter VRRP Group ID",
      },
      DESCRIPTION: {
        minlength: "Description atleast 1 character",
        maxlength: "Description not more than 500 character",
      },
    },
    GLOBALIP: {
      GLOBALIPNAME: {
        minlength: "Global IP Name atleast 1 character",
        maxlength: "Global IP Name not more than 100 character",
      },
      DESCRIPTION: {
        minlength: "Description atleast 1 character",
        maxlength: "Description not more than 500 character",
      },
    },
    COMMONFNGATEWAY: {
      GATEWAYNAME: {
        required: "Please Enter Common Function Gateway Name",
        minlength: "Common Function Gateway Name atleast 1 character",
        maxlength: "Common Function Gateway Name not more than 100 character",
      },
      COMMONPOOL: {
        required: "Please Select Common Function Pool",
      },
      ZONE: {
        required: "Please Select Zone",
      },
      DESCRIPTION: {
        minlength: "Description atleast 1 character",
        maxlength: "Description not more than 500 character",
      },
    },
    SYSLOGSERVER: {
      SYSLOGSERVERNAME: {
        required: "Please Enter Syslog Server Name",
        minlength: "Syslog Server Name atleast 1 character",
        maxlength: "Syslog Server Name not more than 100 character",
      },
      IPADDRESS: {
        required: "Please Enter IP Address",
        minlength: "IP Address atleast 1 character",
        maxlength: "IP Address not more than 30 character",
      },
    },
    LBINTERFACE: {
      NETWORK: {
        required: "Please Select Network",
      },
      IPADDRESS: {
        minlength: "IP Address atleast 1 character",
        maxlength: "IP Address not more than 30 character",
      },
    },
    LBVRRPCONFIG: {
      VIRTUALIP: {
        required: "Please Enter Virtual IP address",
        minlength: "Virtual IP Address atleast 1 character",
        maxlength: "Virtual IP Address not more than 30 character",
      },
      VRID: {
        required: "Please Enter VRID",
        minlength: "VRID atleast 1 character",
        maxlength: "VRID not more than 11 character",
      },
    },
    INTERTENANTCONN: {
      NAME: {
        minlength: "Name atleast 1 character",
        maxlength: "Name not more than 100 character",
      },
      DESCRIPTION: {
        minlength: "Description atleast 1 character",
        maxlength: "Description not more than 500 character",
      },
      DESTINATIONTENANT: {
        required: "Please Enter Destination " + SUB_TENANT,
      },
      DESTINATIONNETWORK: {
        required: "Please Enter Destination Network",
      },
    },
    INTERCONNAPPROVAL: {
      ACCESSKEY: {
        required: "Please Enter Access key",
      },
      SECRETKEY: {
        required: "Please Enter Secret key",
      },
      ADMINTENANTID: {
        required: "Please Enter Admin Tenant ID",
      },
    },
    COMMON: {
      CUSTOMER: {
        required: "Please Select " + SUB_TENANT,
      },
    },
  },
});
