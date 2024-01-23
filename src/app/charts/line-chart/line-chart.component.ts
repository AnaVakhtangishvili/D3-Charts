import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { DepartmentEntry } from '../models/chart.models';
import { ChartDimensionsService } from '../../services/chart-dimensions.service';
import * as d3 from 'd3';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Department } from '../models/chart.enums';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements OnInit {
  @Input() chartData: DepartmentEntry[] = [];

  departmentSelectionControl = new FormControl(Department.DEFENSE);
  filteredChartData: DepartmentEntry[] = [];
  departments: string[] = [];
  department = Department;

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

  margin = { top: 40, right: 20, bottom: 50, left: 96 };

  constructor(
    private element: ElementRef,
    private dimensions: ChartDimensionsService
  ) {}

  ngOnInit() {
    this.host = d3.select(this.element.nativeElement);
    this.svg = this.host.select('svg.line-chart');

    this.filterChartData(this.departmentSelectionControl.value);
    this.setData();
    this.setDimensions();
    this.setElements();
    this.updateChart();
  }

  setData() {
    this.departments = [...new Set(this.chartData.map((d) => d.department))];

    this.departmentSelectionControl.valueChanges.subscribe((value) => {
      this.filterChartData(value);
      this.updateChart();
    });
  }

  filterChartData(department: string | null) {
    this.filteredChartData = this.chartData.filter(
      (d) => d.department === department
    );
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
      .attr('class', 'chart-container')
      .attr(
        'transform',
        `translate(${this.dimensions.marginLeft}, ${this.dimensions.marginTop})`
      );

    this.title = this.svg
      .append('g')
      .style('font-size', '1.5rem')
      .append('text')
      .attr(
        'transform',
        `translate(${this.dimensions.middleInnerWidth}, ${this.dimensions.middleMarginTop})`
      )
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold');
  }

  setLabels() {
    this.title.text('U.S. Department spending from 2000-2022');
  }

  setParameters() {
    this.setXScale();
    this.setYScale();
    this.setColorScale();
  }

  setXScale() {
    const domain = [...new Set(this.chartData.map((d) => d.year))];
    this.scales.x = d3
      .scaleBand()
      .domain(domain)
      .range([0, this.dimensions.innerWidth]);
  }

  setYScale() {
    const maxValue =
      Number(d3.max(this.filteredChartData, (d) => d.expense)) / 10e6;

    this.scales.y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .range([this.dimensions.innerHeight, 0]);
  }

  setColorScale() {
    this.scales.color = d3
      .scaleOrdinal()
      .domain(this.departments)
      .range(d3.schemeTableau10);
  }

  setAxes() {
    this.xAxis = d3.axisBottom(this.scales.x).tickSizeOuter(0);
    this.yAxis = d3
      .axisLeft(this.scales.y)
      .tickSizeOuter(0)
      .tickSizeInner(-this.dimensions.innerWidth)
      .ticks(8);

    this.xAxisContainer.call(this.xAxis);
    this.xAxisContainer
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end');

    this.yAxisContainer.call(this.yAxis);
    this.yAxisContainer.selectAll('.tick line').attr('stroke', '#ddd');
  }

  drawChart() {
    const line = d3
      .line()
      .x((d: any) => this.scales.x(d.year))
      .y((d: any) => this.scales.y(d.expense / 10e6));

    const path = this.chartContainer
      .append('g')
      .attr('class', 'line-chart')
      .append('path')
      .datum(this.filteredChartData)
      .attr('fill', 'none')
      .attr('stroke-width', 5)
      .attr('stroke-linecap', 'round')
      .attr('d', line)
      .style('stroke', (d: DepartmentEntry[]) =>
        this.scales.color(d[0].department)
      );

    const totalLength = path.node().getTotalLength();

    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(800)
      .attr('stroke-dashoffset', 0);
  }

  updateChart() {
    this.chartContainer.selectAll('g.line-chart').remove();
    this.setDimensions();
    this.setLabels();
    this.setParameters();
    this.setAxes();
    this.drawChart();
  }
}
