export const ALIBABAAppConstant = Object.freeze({
  // URL's
  ALIBABA: {
    DEPLOYMENT: {
      CREATE: "/ali/deployment/create",
      FINDALL: "/ali/deployment/list",
      UPDATE: "/ali/deployment/update",
      FINDBYID: "/ali/deployment/",
    },
    IMAGE: {
      CREATE: "/ali/image/create",
      FINDALL: "/ali/image/list",
      UPDATE: "/ali/image/update",
      FINDBYID: "/ali/image/",
    },
    INSTANCETYPE: {
      CREATE: "/ali/instancetype/create",
      FINDALL: "/ali/instancetype/list",
      UPDATE: "/ali/instancetype/update",
      FINDBYID: "/ali/instancetype/",
    },
    KEY: {
      CREATE: "/ali/key/create",
      FINDALL: "/ali/key/list",
      UPDATE: "/ali/key/update",
      FINDBYID: "/ali/key/",
    },
    LOADBALANCER: {
      CREATE: "/ali/loadbalancer/create",
      FINDALL: "/ali/loadbalancer/list",
      UPDATE: "/ali/loadbalancer/update",
      FINDBYID: "/ali/loadbalancer/",
    },
    LBLISTENER: {
      CREATE: "/ali/lblistener/create",
      FINDALL: "/ali/lblistener/list",
      UPDATE: "/ali/lblistener/update",
      FINDBYID: "/ali/lblistener/",
    },
    SECURITYGROUP: {
      CREATE: "/ali/securitygroup/create",
      FINDALL: "/ali/securitygroup/list",
      UPDATE: "/ali/securitygroup/update",
      FINDBYID: "/ali/securitygroup/",
    },
    SGRULES: {
      CREATE: "/ali/sgrule/create",
      FINDALL: "/ali/sgrule/list",
      UPDATE: "/ali/sgrule/update",
      FINDBYID: "/ali/sgrule/",
    },
    SOLUTION: {
      CREATE: "/ali/solution/create",
      FINDALL: "/ali/solution/list",
      UPDATE: "/ali/solution/update",
      FINDBYID: "/ali/solution/",
    },
    TAG: {
      CREATE: "/ali/tag/create",
      FINDALL: "/ali/tag/list",
      UPDATE: "/ali/tag/update",
      FINDBYID: "/ali/tag/",
    },
    VOLUME: {
      CREATE: "/ali/volume/create",
      FINDALL: "/ali/volume/list",
      UPDATE: "/ali/volume/update",
      FINDBYID: "/ali/volume/",
    },
    VPC: {
      CREATE: "/ali/vpc/create",
      FINDALL: "/ali/vpc/list",
      UPDATE: "/ali/vpc/update",
      FINDBYID: "/ali/vpc/",
    },
    VSWITCH: {
      CREATE: "/ali/vswitch/create",
      FINDALL: "/ali/vswitch/list",
      UPDATE: "/ali/vswitch/update",
      FINDBYID: "/ali/vswitch/",
    },
    ZONE: {
      CREATE: "/ali/zone/create",
      FINDALL: "/ali/zone/list",
      UPDATE: "/ali/zone/update",
      FINDBYID: "/ali/zone/",
    },
  },

  // Validations
  VALIDATIONS: {
    IMAGE: {
      ADD: "Add Image",
      UPDATE: "Update Image",
      IMAGENAME: {
        required: "Please enter image name",
        minlength: "Image name atleast 1 character",
        maxlength: "Image name not more than 100 character",
      },
      ZONE: {
        required: "Please select zone",
      },
      ALIIMAGEID: {
        required: "Please enter Alibaba image ID",
        minlength: "Alibaba image ID atleast 1 character",
        maxlength: "Alibaba image ID not more than 100 character",
      },
      PLATFORM: {
        required: "Please select platform",
      },
      NOTES: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 500 character",
      },
    },
    VPC: {
      VPCNAME: {
        required: "Please enter VPC name",
        minlength: "VPC name atleast 1 character",
        maxlength: "VPC name not more than 100 character",
      },
      VPCID: {
        minlength: "Alibaba VPC ID atleast 1 character",
        maxlength: "Alibaba VPC ID not more than 50 character",
      },
      CIDR: {
        required: "Please enter IPV4 CIDR",
        pattern: "Invalid pattern",
      },
      REGION: {
        required: "Please select region",
      },
      NOTES: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 500 character",
      },
    },
    VOLUME: {
      VOLUMENAME: {
        required: "Please enter volume name",
        minlength: "Volume name atleast 1 character",
        maxlength: "Volume name not more than 100 character",
      },
      DISKCATEGORY: {
        required: "Please select disk category",
      },
      ZONE: {
        required: "Please select zone",
      },
      ENCRYPTED: {
        required: "Please select encrypted block",
      },
      DESCRIPTION: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 500 character",
      },
    },
    VSWITCH: {
      VSWITCHNAME: {
        required: "Please enter vSwitch name",
        minlength: "vSwitch name atleast 1 character",
        maxlength: "vSwitch name not more than 100 character",
      },
      VSWITCHID: {
        minlength: "Alibaba vSwitch ID atleast 1 character",
        maxlength: "Alibaba vSwitch ID not more than 50 character",
      },
      VPC: {
        required: "Please select VPC",
      },
      ZONE: {
        required: "Please select zone",
      },
      CIDR: {
        required: "Please enter IPV4 CIDR",
        pattern: "Invalid pattern",
      },
      NOTES: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 500 character",
      },
    },
    SECURITYGROUP: {
      SGNME: {
        required: "Please enter security group name",
        minlength: "Security group name atleast 1 character",
        maxlength: "Security group name not more than 100 character",
      },
      SGID: {
        minlength: "Alibaba security group ID atleast 1 character",
        maxlength: "Alibaba security group ID not more than 50 character",
      },
      VPC: {
        required: "Please select VPC",
      },
      REGION: {
        required: "Please select region",
      },
      CIDR: {
        required: "Please enter IPV4 CIDR",
        pattern: "Invalid pattern",
      },
      NOTES: {
        minlength: "Notes atleast 1 character",
        maxlength: "Notes not more than 500 character",
      },
      RULEDIRECTION: {
        required: "Please select rule direction",
      },
      IPPROTOCOL: {
        required: "Please select protocol",
      },
      PORTRNGE: {
        required: "Please enter port range",
      },
      PRIORITY: {
        required: "Please enter priority",
      },
    },
    KEYPAIR: {
      KEYNAME: {
        required: "Please enter KeyPair name",
        minlength: "KeyPair name atleast 1 character",
        maxlength: "KeyPair name not more than 50character",
      },
    },
    INSTANCE: {
      INSTANCENAME: {
        required: "Please enter instance name",
        minlength: "Instance name atleast 1 character",
        maxlength: "Instance name not more than 100 character",
      },
      INSTANCETYPE: {
        required: "Please select instance type",
      },
      INSTANCECHARGETYPE: {
        required: "Please select instance charge type",
      },
      NETCHARGETYPE: {
        required: "Please select internet charge type",
      },
      BANDWITHIN: {
        required: "Please enter internet maxbandwith IN",
      },
      BANDWITHOUT: {
        required: "Please enter internet maxbandwith OUT",
      },
      IMAGE: {
        required: "Please select image",
      },
      VPC: {
        required: "Please select VPC",
      },
      VSWITCH: {
        required: "Please select vSwitch",
      },
      SECURITYGROUP: {
        required: "Please select security group",
      },
    },
    LB: {
      NAME: {
        required: "Please enter name",
        minlength: "Name atleast 1 character",
        maxlength: "Name not more than 100 character",
        pattern: "Invalid pattern",
      },
      SERVER: {
        required: "Please select server",
      },
      INSTYPE: {
        required: "Please select instance type",
      },
      VSWITCH: {
        required: "Please select vSwitch",
      },
      PROTOCOL: {
        required: "Please select protocol",
      },
      FRONTENDPORT: {
        required: "Please enter FrontEnd port",
      },
      BACKENDPORT: {
        required: "Please enter BackEnd port",
      },
      HEALTHCHECKTYPE: {
        required: "Please select health check type",
      },
      HEALTHYTHRESHOLD: {
        required: "Please select healthy threshold",
      },
    },
  },
});
