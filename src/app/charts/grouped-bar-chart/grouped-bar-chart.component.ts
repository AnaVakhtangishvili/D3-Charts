import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DepartmentEntry, GroupedBarData } from '../models/chart.models';
import { ChartDimensionsService } from '../../services/chart-dimensions.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-grouped-bar-chart',
  standalone: true,
  imports: [],
  templateUrl: './grouped-bar-chart.component.html',
  styleUrl: './grouped-bar-chart.component.scss',
})
export class GroupedBarChartComponent implements OnInit, OnChanges {
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

  margin = { top: 40, right: 20, bottom: 60, left: 80 };

  groupedBarData: GroupedBarData[] = [];

  constructor(
    private element: ElementRef,
    private dimensions: ChartDimensionsService
  ) {
    this.host = d3.select(this.element.nativeElement);
  }

  ngOnInit() {
    this.svg = this.host.select('svg');
    this.groupedBarData = d3
      .groups(this.chartData, (d: DepartmentEntry) => d.year)
      .slice(-5)
      .map((element) => ({
        year: element[0],
        data: element[1],
      }));

    this.setDimensions();
    this.setElements();
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.svg) return;
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
      );

    this.yAxisContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      );

    this.chartContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      );

    this.legendContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${
          this.dimensions.marginBottom + 30
        })`
      );

    this.title = this.svg
      .append('g')
      .style('font-size', '1.5rem')
      .append('text')
      .attr(
        'transform',
        `translate(${this.dimensions.middleInnerWidth}, ${this.dimensions.middleMarginTop})`
      )
      .attr('text-anchor', 'middle');

    this.yLabel = this.svg
      .append('g')
      .style('font-size', '1.5rem')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft - 60}, ${
          this.dimensions.middleHeight
        })`
      )
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)');
  }

  setLabels() {
    this.title.text('US Departments Expenses 2018-2022');
    this.yLabel.text('Expenses in million USD');
  }

  setParameters() {
    this.setXScales();
    this.setYScales();
    this.setGroupScale();
    this.setColorScale();
  }

  setXScales() {
    const years = this.chartData.map((d) => d.year).slice(-5);
    this.scales.x = d3
      .scaleBand()
      .domain(years)
      .rangeRound([0, this.dimensions.innerWidth])
      .padding(0.1);
  }

  setYScales() {
    const expenses = this.groupedBarData.map((d) => d.data).flat();
    const maxValue = Number(d3.max(expenses, (d) => d.expense)) / 10e6;

    this.scales.y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([this.dimensions.innerHeight, 0]);
  }

  setGroupScale() {
    const groups = [...new Set(this.chartData.map((d) => d.department))];
    this.scales.group = d3
      .scaleBand()
      .domain(groups)
      // this.groupedBarData.map((d) => d.year)
      .range([0, this.scales.x.bandwidth()])
  }

  setColorScale() {
    const groups = [...new Set(this.chartData.map((d) => d.department))];
    this.scales.color = d3
      .scaleOrdinal()
      .domain(groups)
      .range(d3.schemeTableau10);
  }

  setAxes() {
    this.setXAxis();
    this.setYAxis();
  }

  setXAxis() {
    this.xAxis = d3.axisBottom(this.scales.x).tickSizeOuter(0);
    this.xAxisContainer.call(this.xAxis);
  }

  setYAxis() {
    this.yAxis = d3
      .axisLeft(this.scales.y)
      .ticks(10)
      .tickSizeOuter(0)
      .tickSizeInner(-this.dimensions.innerWidth);

    this.yAxisContainer.call(this.yAxis);
    this.yAxisContainer.selectAll('.tick line').attr('stroke', '#ddd');
  }

  setLegend() {}

  drawBars() {
    console.log(
      this.groupedBarData,
      this.groupedBarData.map((d) => d.data)
    );
    this.chartContainer
      .selectAll('g.group')
      .data(this.groupedBarData.map((d) => d.year))
      .join('g')
      .attr('class', 'group')
      .style('fill', (d: string) => {
        console.log(d);
        return this.scales.color(d)})
      .selectAll('rect.data')
      .data((d: string) => {
        console.log(d);
        return this.groupedBarData.find((e) => e.year === d)?.data;
      })
      .join('rect')
      .attr('x', (d: DepartmentEntry) => this.scales.x(d.year) + this.scales.group(d.department))
      .attr('y', (d: DepartmentEntry) =>
        this.scales.y(Number(d.expense) / 10e6)
      )
      .attr('width', this.scales.group.bandwidth())
      .attr(
        'height',
        (d: DepartmentEntry) =>
          this.dimensions.innerHeight - this.scales.y(Number(d.expense) / 10e6)
      )
      .attr('fill', (d: DepartmentEntry) => this.scales.color(d.department));

    // create legend
    const legend = this.legendContainer
      .selectAll('g')
      .data(this.groupedBarData[0].data)
      .join('g')
      .attr('transform', (d: any, i: any) => `translate(${i * 100}, 0)`);
    legend
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', (d: any, i: any) => this.scales.color(d.department));
    legend
      .append('text')
      .attr('x', 30)
      .attr('y', 15)
      .text((d: any) => d.domain);
  }

  updateChart() {
    this.setLabels();
    this.setParameters();
    this.setAxes();
    this.setLegend();
    this.drawBars();
  }
}
