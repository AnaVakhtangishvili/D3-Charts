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
