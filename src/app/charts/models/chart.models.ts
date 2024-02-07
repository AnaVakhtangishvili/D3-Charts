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

export interface PieDataElement {
  id: string | number;
  label: string;
  value: number;
}

export interface PieData {
  title: string;
  data: PieDataElement[];
}

export interface PieConfig {
  innerRadiusCoefficient: number;
  hiddenOpacity: number;
  transition: number;
  margin: ChartMargins;
  legendItem: {
    symbolSize: number;
    height: number;
    fontsize: number;
    textSeparator: number;
  };
  arcs: {
    stroke: string;
    strokeWidth: number;
    radius: number;
    padAngle: number;
  };
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

export interface DonutData {
  data: DepartmentEntry;
  endAngle: number;
  index: number;
  padAngle: number;
  startAngle: number;
  value: number;
}

export interface LegendConfig {
  rectSize: number;
  rectBorderRadius: number;
  fontSize: string;
  attrX: number
  attrY: number;
  spacing: number;
}
