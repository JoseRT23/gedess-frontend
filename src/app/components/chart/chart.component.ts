import { Component, effect, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'chart',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent {

  weatherData = input.required<any>();  
  public chartData: any = [
    {
      name: "Temperatura",
      series: [],
    },
  ];

  animations = true;
  showGridLines = true;
  legend = true;
  roundDomains = true;
  xAxis = true;
  yAxis = true;
  yMax = 50;
  yMin = 1;

  constructor(private _weatherService: WeatherService) {
    effect(() => {
      this.setNewWeather();
    })
  } 

  ngOnInit() {
    this.yMax = this._weatherService.currentParams()?.maxchart!;
    this.yMin = this._weatherService.currentParams()?.minchart!;
  }

  setNewWeather(): void {
    const [ currentData ] = this.chartData;
    this.chartData[0].series = currentData.series.concat(this.weatherData());
    this.chartData = [...this.chartData];
  }

  dateFormatter(date: string): string {
    const datePipe = new DatePipe("en-US");
    let formatted = datePipe.transform(date);
    return formatted ? formatted : date;
  }

  formatYAxis(input: string): string {
    return `${input}°C`
  }

}
