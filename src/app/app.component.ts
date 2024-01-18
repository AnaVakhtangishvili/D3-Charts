import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { DataService } from './services/data.service';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { setStacks } from './helpers/grouped-bar.helper';
import { GroupStackedData } from './charts/models/chart.models';

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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  population$: Observable<any> = this.dataService.getParsedData(
    'assets/population.csv'
  );
  // population!: any;
  stackedData!: GroupStackedData;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.population$.subscribe((data) => {
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

    // this.dataService.getParsedJson('assets/us-spending-since-2000-v3.json').subscribe((data) => {
    //   this.chartData = data;
    //   console.log(data);
    // });
  }
}
