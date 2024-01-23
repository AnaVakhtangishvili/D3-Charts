import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import * as d3 from 'd3';
import { ChartDimensionsService } from '../../services/chart-dimensions.service';

@Component({
  selector: 'app-multiple-line-chart',
  standalone: true,
  imports: [],
  templateUrl: './multiple-line-chart.component.html',
  styleUrl: './multiple-line-chart.component.scss',
})
export class MultipleLineChartComponent implements OnInit, OnChanges {
  @Input() data: any;

  host: any;
  svg: any;

  dataContainer: any;
  xAxisContainer: any;
  yAxisContainer: any;
  legendContainer: any;

  title: any;

  margins = { top: 40, right: 20, bottom: 80, left: 50 };

  timeParse = d3.timeParse('%Y%m%d');
  timeFormat = d3.timeFormat('%Y-%B');

  constructor(
    private element: ElementRef,
    private dimensions: ChartDimensionsService
  ) {}

  ngOnInit(): void {
    this.host = d3.select(this.element.nativeElement);
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
      this.margins
    );
  }

  setElements() {
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
  }

  setParameters() {}

  setLabels() {}

  setAxes() {}

  setLegend() {}

  drawChart() {}

  updateChart() {
    this.setParameters();
    this.setLabels();
    this.setAxes();
    this.setLegend();
    this.drawChart();
  }
}
