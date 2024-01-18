export interface GroupStackDataElement {
  key: string;
  domain: string;
  group: string;
  stack: string;
  value: number;
}

export interface GroupStackedData {
  title: string;
  yLabel: string;
  unit: string;
  data: GroupStackDataElement[];
  stackOrder: string[];
}

export interface GroupStackConfig {
  hiddenOpacity: number;
  transition: number;
  margin: ChartMargins;
}

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// my models----------------------------------------------------
export interface DataType {
  [year: string]: string;
  Department: string;
}

export interface DepartmentEntry {
  department: string;
  year: string;
  expense: string;
}

export interface GroupedBarData {
  year: string;
  data: DepartmentEntry[];
}
