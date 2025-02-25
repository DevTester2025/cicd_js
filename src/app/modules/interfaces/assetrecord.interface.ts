export interface IResourceType {
  resource: string;
  crn: string;
  parentcrn?:string;
}
export interface IAssetHdr {
  id: number;
  tenantid: number;
  crn: string;
  fieldkey: string;
  identifier?: boolean;
  fieldname: string;
  fieldtype: string;
  protected: null;
  defaultval: null;
  showbydefault: number;
  status: string;
  createdby: string;
  createddt: Date;
  lastupdatedby: null;
  lastupdateddt: null;
  assetname: string;
  referenceasset: string;
  field: string;
  header: string;
  parentcrn:string;
  ordernumber:number;
}

export interface IAssetDtl {
  id: number;
  tenantid: null;
  crn: string;
  fieldkey: string;
  fieldvalue: string;
  resourceid: string;
  status: string;
  createdby: string;
  createddt: Date;
  lastupdatedby: null;
  lastupdateddt: null;
}
