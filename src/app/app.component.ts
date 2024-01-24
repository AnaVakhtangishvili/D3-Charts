import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BarChartComponent } from './udemy-charts/bar-chart/bar-chart.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { DataService } from './services/data.service';
import { HttpClientModule } from '@angular/common/http';
import { setStacks } from './helpers/grouped-bar.helper';
import {
  DataType,
  DepartmentEntry,
  GroupStackedData,
} from './charts/models/chart.models';
import { GroupedBarChartComponent } from './charts/grouped-bar-chart/grouped-bar-chart.component';
import * as d3 from 'd3';
import { MultipleLineChartComponent } from './udemy-charts/multiple-line-chart/multiple-line-chart.component';
import { DonutChartComponent } from './charts/donut-chart/donut-chart.component';
import { PieChartComponent } from './udemy-charts/pie-chart/pie-chart.component';
import { Observable, map, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [DataService],
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    BarChartComponent,
    MultipleLineChartComponent,
    PieChartComponent,
    GroupedBarChartComponent,
    LineChartComponent,
    DonutChartComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  stackedData!: GroupStackedData;
  multipleLineData!: any;
  data$: Observable<DepartmentEntry[]> | undefined;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getStackedBarData();
    this.getMultipleLineData();

    this.getGroupedBarData();
  }

  getStackedBarData() {
    this.dataService
      .getParsedData('assets/population.csv')
      .subscribe((data) => {
        const stacks = setStacks(data, 'year', 'gender', 'age_group', 'value');
        this.stackedData = {
          title: 'Population by year, gender and age group (in millions)',
          yLabel: 'Population (in millions)',
          unit: 'million',
          data: stacks,
          stackOrder: [
            '<3',
            '4',
            '5-9',
            '10-14',
            '15-19',
            '20-24',
            '25-29',
            '30-34',
            '35-39',
            '>=40',
          ],
        };
      });
  }

  getMultipleLineData() {
    this.dataService.getParsedJson('assets/daily.json').subscribe((data) => {
      this.multipleLineData = data;
    });
  }

  getGroupedBarData() {
    this.data$ = this.dataService
      .getParsedJson('assets/us-spending-since-2000-v3.json')
      .pipe(
        map((data: DataType[]) => {
          return data
            .map((element) => {
              const department = element.Department;
              const objectEntries = Object.entries(element);

              return objectEntries
                .filter(([key, value]) => key !== 'Department')
                .map(([key, value]) => ({
                  department,
                  year: key,
                  expense: value,
                }));
            })
            .flat();
        })
      );

    // .subscribe((data: DataType[]) => {
    //   this.data = data
    //     .map((element) => {
    //       const department = element.Department;
    //       const objectEntries = Object.entries(element);

    //       return objectEntries
    //         .filter(([key, value]) => key !== 'Department')
    //         .map(([key, value]) => ({
    //           department,
    //           year: key,
    //           expense: value,
    //         }));
    //     })
    //     .flat();
    // });
  }
}
