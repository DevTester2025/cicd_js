export interface Orchestration {
  version: string;
  diagram: string;
  indicators: any[];
  links: Link[];
  nodes: Node[];
  workflowsettings: Workflowsettings;
}

export interface Link {
  from: string;
  to: string;
  points: Point[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Node {
  name: string;
  params: Params;
  data: Data;
}

export interface Data {
  [key: string]: any;
}

export interface Params {
  id: string;
  label: string;
  x: number;
  y: number;
  data: Data;
}

export interface Workflowsettings {
  name: string;
  description: string;
  logfile: string;
}
