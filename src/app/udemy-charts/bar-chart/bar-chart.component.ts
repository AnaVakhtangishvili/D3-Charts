import { Component, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {
  GroupStackDataElement,
  GroupStackConfig,
  GroupStackedData,
} from '../../charts/models/chart.models';
import { UpdateObjectWithPartialValues } from '../../helpers/grouped-bar.helper';
import { ChartDimensionsService } from '../../services/chart-dimensions.service';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [],
  // templateUrl: './bar-chart.component.html',
  template: `<svg class="chart7">
    <style>
      .chart7 {
        font-size: 16px;
      }
      .chart7 text {
        font-weight: bold;
      }
    </style>
  </svg>`,
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit, OnChanges {
  @Input() data!: GroupStackedData;
  @Input() set config(values: Partial<GroupStackConfig>) {
    this._config = UpdateObjectWithPartialValues(this._defaultConfig, values);
  }

  host: any;
  svg: any;

  xAxis: any;
  yAxis: any;

  xAxisContainer: any;
  yAxisContainer: any;
  dataContainer: any;
  legendContainer: any;

  title: any;
  yLabel: any;

  scales: any = {};

  private _config!: GroupStackConfig;
  private _defaultConfig: GroupStackConfig = {
    hiddenOpacity: 0.3,
    transition: 300,
    margin: { top: 40, right: 20, bottom: 60, left: 50 },
  };

  get config(): GroupStackConfig {
    if (!this._config) {
      this._config = this._defaultConfig;
    }
    return this._config;
  }

  data1 = [
    {
      year: 2002,
      apples: 3840,
      bananas: 1920,
      cherries: 960,
      dates: 400,
    },
    {
      year: 2003,
      apples: 1600,
      bananas: 1440,
      cherries: 960,
      dates: 400,
    },
    {
      year: 2004,
      apples: 640,
      bananas: 960,
      cherries: 640,
      dates: 400,
    },
    {
      year: 2005,
      apples: 320,
      bananas: 480,
      cherries: 640,
      dates: 400,
    },
  ];

  data2 = [
    {
      year: 2002,
      fruit: 'apples',
      value: 3840,
    },
    {
      year: 2003,
      fruit: 'apples',
      value: 1600,
    },
    {
      year: 2004,
      fruit: 'apples',
      value: 640,
    },
    {
      year: 2005,
      fruit: 'apples',
      value: 320,
    },
    {
      year: 2002,
      fruit: 'bananas',
      value: 1920,
    },
    {
      year: 2003,
      fruit: 'bananas',
      value: 1440,
    },
    {
      year: 2004,
      fruit: 'bananas',
      value: 960,
    },
    {
      year: 2005,
      fruit: 'bananas',
      value: 480,
    },
    {
      year: 2002,
      fruit: 'cherries',
      value: 960,
    },
    {
      year: 2003,
      fruit: 'cherries',
      value: 960,
    },
    {
      year: 2004,
      fruit: 'cherries',
      value: 640,
    },
    {
      year: 2005,
      fruit: 'cherries',
      value: 640,
    },
    {
      year: 2002,
      fruit: 'dates',
      value: 400,
    },
    {
      year: 2003,
      fruit: 'dates',
      value: 400,
    },
    {
      year: 2004,
      fruit: 'dates',
      value: 400,
    },
    {
      year: 2005,
      fruit: 'dates',
      value: 400,
    },
  ];

  stackedData: any;

  constructor(element: ElementRef, private dimensions: ChartDimensionsService) {
    this.host = d3.select(element.nativeElement);
  }

  ngOnInit(): void {
    // console.log(this.scales);
    this.svg = this.host.select('svg');
    this.setDimensions();
    this.setElements();
    this.updateChart();

    // console.log(this.data);
  }

  ngOnChanges(): void {
    if (!this.svg) {
      return;
    }
    this.updateChart();
  }

  setDimensions(): void {
    this.dimensions.defineDimensions(
      this.svg.node().getBoundingClientRect(),
      this.config.margin
    );
  }
  
  setElements(): void {
    this.xAxisContainer = this.svg
      .append('g')
      .attr('class', 'x-axis')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginBottom})`
      );

    this.yAxisContainer = this.svg
      .append('g')
      .attr('class', 'y-axis')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      );

    this.dataContainer = this.svg
      .append('g')
      .attr('class', 'data')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      );

    this.legendContainer = this.svg
      .append('g')
      .attr('class', 'legend')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${
          this.dimensions.marginBottom + 30
        })`
      );

    this.title = this.svg
      .append('g')
      .attr('class', 'title-container')
      .attr(
        'transform',
        `translate(${this.dimensions.middleInnerWidth}, ${this.dimensions.middleMarginTop})`
      )
      .append('text')
      .attr('class', 'text')
      .style('text-anchor', 'middle');

    this.yLabel = this.svg
      .append('g')
      .attr('class', 'y-label-container')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft - 30}, ${
          this.dimensions.middleHeight
        })`
      )
      .append('text')
      .attr('class', 'title')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)');
  }

  setParameters(): void {
    this.setXScale();
    this.setYScale();
    this.setGroupScale();
    this.setColorScale();
  }

  setXScale(): void {
    // console.log(this.data); 
    const domain = Array.from(
      new Set(this.data.data.map((d: GroupStackDataElement) => d.domain))
    ).sort(d3.ascending);
    const range = [0, this.dimensions.innerWidth];

    this.scales.x = d3.scaleBand().domain(domain).range(range);
  }
  setYScale(): void {
    const data = this.data.data || [];
    const minValue = Math.min(0, d3.min(data, (d) => d.value) as number);
    const maxValue = d3.max(
      d3.flatRollup(
        data,
        (v) => d3.sum(v, (d: any) => d.value),
        (d) => d.domain,
        (d) => d.group
      ),
      (d) => d[2]
    ) as number;

    const domain = [minValue, maxValue];
    const range = [this.dimensions.innerHeight, 0];
    this.scales.y = d3.scaleLinear().domain(domain).range(range);
  }
  setGroupScale(): void {
    const domain = Array.from(
      new Set(this.data.data.map((d: GroupStackDataElement) => d.group))
    ).sort(d3.ascending);
    const range = [0, this.scales.x.bandwidth()];

    this.scales.group = d3.scaleBand().domain(domain).range(range);

    // console.log(this.scales);
  }
  setColorScale(): void {
    const stacks = Array.from(
      new Set(this.data.data.map((d: GroupStackDataElement) => d.stack))
    );
    const domain = [stacks.length - 1, 0];
    this.scales.color = d3.scaleSequential(d3.interpolateSpectral).domain(domain);
  }

  setLabels(): void {
    this.title.text(this.data.title);
    this.yLabel.text(this.data.yLabel);
  }

  setAxes(): void {
    this.setXAxis();
    this.setYAxis();
  }

  setXAxis(): void {
    this.xAxis = d3.axisBottom(this.scales.x).tickSizeOuter(0);
    this.xAxisContainer.call(this.xAxis);
  }
  setYAxis(): void {
    this.yAxis = d3
      .axisLeft(this.scales.y)
      .ticks(5)
      .tickSizeOuter(0)
      .tickSizeInner(-this.dimensions.innerWidth);

    this.yAxisContainer.call(this.yAxis);

    this.yAxisContainer
      .selectAll('.tick line')
      .style('opacity', '0.3')
      .style('stroke-dasharray', '4');
  }

  setLegend(): void {}

  draw(): void {
    this.setStackedData();
    this.redrawRectangles();
  }

  setStackedData(): void {
    const data = this.data.data;
    const groupedData = d3.groups(data, (d: any) => d.domain + '-' + d.group);
    const keys = d3.groups(data, (d: any) => d.stack).map((d) => d[0]);
    const stack = d3
      .stack()
      .keys(keys)
      .value(
        (element: any, key: any) =>
          element[1].find((d: any) => d.stack === key).value
      );

    // console.log('grouped', groupedData);
    this.stackedData = stack(groupedData as any);
    // console.log('stacked', this.stackedData);
  }

  redrawRectangles(): void {
    const data = this.stackedData;
    // const colors = d3.schemeCategory10;

    this.dataContainer
      .selectAll('g.series')
      .data(data, (d: any) => d.key)
      .join('g')
      .attr('class', 'series')
      .style('fill', (d: any, i: any) => this.scales.color(i))
      .selectAll('rect.data')
      .data(
        (d: any) => d,
        (d: any) => d.data.year
      )
      .join('rect')
      .attr('class', 'data')
      // .attr('x', (d: any) => this.scales.x(d.data[0] + ''))
      .attr('x', (d: any) => {
        const [domain, group] = d.data[0].split('-');
        // console.log([domain, group])
        return this.scales.x(domain) + this.scales.group(group);
      })
      .attr('width', this.scales.group.bandwidth())
      .attr('y', (d: any) => this.scales.y(d[1]))
      .attr('height', (d: any) =>
        Math.abs(this.scales.y(d[0]) - this.scales.y(d[1]))
      )
      .attr('fill', (d: any) => d3.schemeCategory10[d.index])
      .attr('stroke', 'white');
  }

  updateChart(): void {
    this.setParameters();
    this.setLabels();
    this.setAxes();
    this.setLegend();
    this.draw();
  }
}
