import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DepartmentEntry } from '../models/chart.models';
import { ChartDimensionsService } from '../../services/chart-dimensions.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements OnInit, OnChanges {
  @Input() chartData: DepartmentEntry[] = [];

  host: any;
  svg: any;

  xAxis: any;
  yAxis: any;

  xAxisContainer: any;
  yAxisContainer: any;
  chartContainer: any;
  legendContainer: any;
  title: any;
  yLabel: any;

  scales: any = {};

  margin = { top: 40, right: 20, bottom: 200, left: 100 };

  line: any;

  constructor(
    private element: ElementRef,
    private dimensions: ChartDimensionsService
  ) {
    this.host = d3.select(this.element.nativeElement);
  }

  ngOnInit() {
    this.svg = this.host.select('svg');

    this.setDimensions();
    this.setElements();
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.svg) {
      return;
    }
    this.updateChart();
  }

  setDimensions() {
    this.dimensions.defineDimensions(
      this.svg.node().getBoundingClientRect(),
      this.margin
    );
  }

  setElements() {
    this.xAxisContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginBottom})`
      )
      .style('font-size', '1rem');

    this.yAxisContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      )
      .style('font-size', '1rem');

    this.chartContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      );

    // this.legendContainer = this.svg
    //   .append('g')
    //   .attr(
    //     'transform',
    //     `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
    //   );

    this.title = this.svg
      .append('g')
      .style('font-size', '1.5rem')
      .append('text')
      .attr(
        'transform',
        `translate(${this.dimensions.middleInnerWidth}, ${this.dimensions.middleMarginTop})`
      )
      .attr('text-anchor', 'middle');

    // this.yLabel = this.svg
    //   .append('g')
    //   .style('font-size', '1.5rem')
    //   .append('text')
    //   .attr(
    //     'transform',
    //     `translate(${this.dimensions.marginLeft - 70}, ${
    //       this.dimensions.middleInnerHeight
    //     })`
    //   );
  }

  setLabels() {
    this.title.text('U.S. Department spending from 2000-2022');
  }

  setParameters() {
    this.setXScale();
    this.setYScale();
    // this.setColorScale();

    this.line = d3
      .line()
      .x((d: any) => this.scales.x(d.year))
      .y((d: any) => this.scales.y(d.expense));
  }

  setXScale() {
    const domain = [...new Set(this.chartData.map((d) => d.year))];
    this.scales.x = d3
      .scaleBand()
      .domain(domain)
      .range([0, this.dimensions.innerWidth]);
  }

  setYScale() {
    const maxValue = Number(d3.max(this.chartData, (d) => d.expense)) / 10e6;

    this.scales.y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([this.dimensions.innerHeight, 0]);
  }

  // setColorScale() {
  //   this.scales.color = d3
  //     .scaleOrdinal()
  //     .domain(this.chartData.map((d) => d.department))
  //     .range(d3.schemeTableau10);
  // }

  setAxEs() {
    this.xAxis = d3.axisBottom(this.scales.x).tickSizeOuter(0);
    this.yAxis = d3.axisLeft(this.scales.y).tickSizeOuter(0);
    // .tickSizeInner(-this.dimensions.innerWidth).attr('stroke', '#ddd');

    this.xAxisContainer.call(this.xAxis);
    this.xAxisContainer
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end');
    this.yAxisContainer.call(this.yAxis);
  }

  setLegend() {}

  drawChart() {
    const lineData = this.chartData
      .filter(
        (d) => d.department === 'Department of Defense - Military Programs'
      )
      .map((d) => ({ year: d.year, expense: +d.expense }));

    this.chartContainer
      .select('path.chartLine')
      .data(lineData)
      .append('path')
      .attr('class', 'chartLine')
      .attr('d', (d: any) => {
        return this.line(d);
      })
      .style('stroke', 'red');
  }

  updateChart() {
    this.setLabels();
    this.setParameters();
    this.setAxEs();
    this.setLegend();
    this.drawChart();
  }
}
