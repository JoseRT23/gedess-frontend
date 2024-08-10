import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartComponent } from '../../components/chart/chart.component';
import { WeatherService } from '../../services/weather.service';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ChartComponent, CalendarModule, ButtonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {

  public startdate: FormControl = new FormControl('');
  public enddate: FormControl = new FormControl('');
  public status: 'ERROR' | 'WAITING' | 'IDLE' = 'IDLE';
  public errormessage: string = '';
  public weatherData: any[] = [];

  constructor(private _weatherService: WeatherService) { }

  onSearch(): void {
    this.status = 'WAITING';
    if (this.startdate.value=='' || this.enddate.value=='') {
      this.status = 'ERROR';
      this.errormessage = 'Las fechas no deben ir vacias';
      return;
    }

    if (this._weatherService.validateDates(new Date(this.startdate.value), new Date(this.enddate.value))) {
      this.status = 'ERROR';
      this.errormessage = 'Las fechas no pueden ser mayores a un mes';
      return;
    }

    this._weatherService.searchWeather(this.startdate.value, this.enddate.value)
    .subscribe(res => {
      this.weatherData = res;
      this.weatherData = this._weatherService.mapData(this.weatherData);
      this.status = 'IDLE';
    });
  }

  clear(): void {
    this.startdate.setValue('');
    this.enddate.setValue('');
    this.status = 'IDLE';
    this.weatherData = [];
    this.errormessage = '';
  }

}
