import { Component, ElementRef, Input, OnInit } from '@angular/core';
import {
  DepartmentEntry,
  DonutData,
  PieConfig,
  PieData,
} from '../models/chart.models';
import * as d3 from 'd3';
import { ChartDimensionsService } from '../../services/chart-dimensions.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { on } from 'events';

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.scss',
})
export class DonutChartComponent implements OnInit {
  @Input() chartData: DepartmentEntry[] = [];

  yearSelectionControl = new FormControl('2000');
  filteredChartData: DepartmentEntry[] = [];
  years: string[] = [];

  mappedData: any;

  host: any;
  svg: any;

  pie: any;
  arc: any;

  pieContainer: any;
  legendContainer: any;
  title: any;

  colors: any;

  margin = { top: 70, right: 40, bottom: 10, left: 10 };

  constructor(
    private element: ElementRef,
    private dimensions: ChartDimensionsService
  ) {}

  ngOnInit() {
    this.host = d3.select(this.element.nativeElement);
    this.svg = this.host.select('svg.donut-chart');

    this.filterChartData(this.yearSelectionControl.value);
    this.setData();
    this.setDimensions();
    this.setElements();
    this.updateChart();
    this.setLegend();
  }

  setData() {
    this.yearSelectionControl.valueChanges.subscribe((value) => {
      this.filterChartData(value);
      this.updateChart();
    });
  }

  filterChartData(year: string | null) {
    this.years = [...new Set(this.chartData.map((d) => d.year))];

    this.mappedData = this.years
      .map((year) => {
        const filteredData = this.chartData.filter(
          (d: DepartmentEntry) => d.year === year
        );
        return {
          year,
          data: filteredData,
        };
      })
      .filter((element) => element.year === year);
  }

  setDimensions() {
    this.dimensions.defineDimensions(
      this.svg.node().getBoundingClientRect(),
      this.margin
    );
  }

  setElements() {
    this.pieContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${
          this.dimensions.marginLeft + this.dimensions.middleInnerWidth
        }, ${this.dimensions.marginTop + this.dimensions.middleInnerHeight})`
      );

    this.legendContainer = this.svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dimensions.middleInnerWidth * 0.5}, ${
          this.dimensions.marginTop + 30
        })`
      );

    this.title = this.svg
      .append('text')
      .attr(
        'transform',
        `translate(${this.dimensions.middleInnerWidth * 0.5}, ${
          this.dimensions.marginTop
        })`
      )
      .attr('class', 'title')
      .attr('text-anchor', 'center')
      .style('font-size', '1.5rem')
      .style('font-weight', 'bold')
      .text('U.S. Departments spending by year');
  }

  setParams() {
    this.setColors();
    this.setDonut();
  }

  setColors() {
    const domain = [
      ...new Set(this.chartData.map((d: DepartmentEntry) => d.department)),
    ];

    this.colors = d3.scaleOrdinal().domain(domain).range(d3.schemeTableau10);
  }

  setDonut() {
    this.pie = d3
      .pie()
      .value((d: any) => d.expense)
      .sort(null);

    this.arc = d3
      .arc()
      .innerRadius(this.dimensions.radius * 0.5)
      .outerRadius(this.dimensions.radius * 0.9)
      .cornerRadius(6)
      .padAngle(0.02);
  }

  setLegend() {
    const legend = this.legendContainer
      .selectAll('g')
      .data(this.mappedData[0].data)
      .join('g')
      .attr(
        'transform',
        (d: DepartmentEntry, i: number) => `translate(0, ${40 * i})`
      )
      .attr('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: DepartmentEntry) => {
        this.highlightDepartment(d.department);
      })
      .on('mouseleave', () => this.restoreOpacity());

    legend
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', (d: DepartmentEntry) => this.colors(d.department))
      .attr('rx', 5);

    legend
      .append('text')
      .attr('x', 30)
      .attr('y', 5)
      .attr('font-size', '1rem')
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'hanging')
      .text((d: any) => d.department);
  }

  drawChart() {
    const pieData = this.pie(this.mappedData[0].data);

    this.pieContainer
      .selectAll('path.donut')
      .data(pieData)
      .join('path')
      .attr('d', this.arc)
      .attr('fill', (d: DonutData) => this.colors(d.data.department))
      .attr('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: DonutData) => {
        this.setTooltips(event, d);
        this.highlightDepartment(d.data.department);
      })
      .on('mouseleave', () => this.restoreOpacity())
      .transition()
      .duration(800)
      .attrTween('d', (d: any) => {
        const i = d3.interpolate(d.startAngle, d.endAngle);
        return (t: any) => {
          d.endAngle = i(t);
          return this.arc(d);
        };
      });

    this.pieContainer
      .selectAll('text.percentage')
      .data(pieData)
      .join('text')
      .attr('class', 'percentage')
      .text((d: DonutData) => this.calculatePercentage(d))
      .attr('transform', (d: PieData) => `translate(${this.arc.centroid(d)})`)
      .attr('dy', '0.35rem')
      .attr('text-anchor', 'middle')
      .attr('font-size', '1rem')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .attr('cursor', 'pointer')
      .on('mouseover', (event: MouseEvent, d: DonutData) => {
        this.setTooltips(event, d);
        this.highlightDepartment(d.data.department);
      });
  }

  calculatePercentage(data: DonutData) {
    const total = d3.sum(
      this.mappedData[0].data,
      (d: DepartmentEntry) => +d.expense
    );
    return ((+data.data.expense / total) * 100).toFixed(2) + '%';
  }

  setTooltips(event: MouseEvent, sectionData: DonutData) {
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('padding', '5px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px');

    const x = event.pageX + 10;
    const y = event.pageY - 10;
    const expense = d3.format('$,.0f')(+sectionData.data.expense);

    tooltip.style('left', `${x}px`).style('top', `${y}px`).html(`
    <p>Year: ${sectionData.data.year}</p>
    <p>Department: ${sectionData.data.department}</p>
    <p>Spending: ${expense}</p>
    <p>Percentage: ${this.calculatePercentage(sectionData)}</p>`);

    d3.select(event.target as any).on('mouseout', () => tooltip.remove());
  }

  highlightDepartment(department: string) {
    this.pieContainer
      .selectAll('path')
      .attr('opacity', (d: DonutData) =>
        d.data.department === department ? 1 : 0.5
      );

    this.legendContainer
      .selectAll('rect')
      .attr('opacity', (d: any) => (d.department === department ? 1 : 0.5));

    this.legendContainer
      .selectAll('text')
      .attr('opacity', (d: any) => (d.department === department ? 1 : 0.5));
  }

  restoreOpacity() {
    this.pieContainer.selectAll('path').attr('opacity', 1);
    this.legendContainer.selectAll('rect').attr('opacity', 1);
    this.legendContainer.selectAll('text').attr('opacity', 1);
  }

  updateChart() {
    this.pieContainer.selectAll('path').remove();
    this.pieContainer.selectAll('text.percentage').remove();
    this.setParams();
    this.drawChart();
  }
}
