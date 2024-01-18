import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
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

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [DataService],
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    BarChartComponent,
    PieChartComponent,
    LineChartComponent,
    GroupedBarChartComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  stackedData!: GroupStackedData;

  barData: DepartmentEntry[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getStackedBarData();
    this.getGroupedBarData();
  }

  getStackedBarData() {
    this.dataService
      .getParsedData('assets/population.csv')
      .subscribe((data) => {
        // this.population = data;
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

  getGroupedBarData() {
    this.dataService
      .getParsedJson('assets/us-spending-since-2000-v3.json')
      .subscribe((data: DataType[]) => {
        this.barData = data
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


        console.log('data', this.barData);
      });
  }
}
