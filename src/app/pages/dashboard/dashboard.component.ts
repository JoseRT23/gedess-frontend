import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../components/chart/chart.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { KnobModule } from 'primeng/knob';
import { Socket, io } from 'socket.io-client';

interface ServerToClientEvents {
  newData: (data: any) => void;
}

interface ClientToServerEvents { }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartComponent, KnobModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit {
  private _socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
  public weatherData: any;
  public lastvalue: FormControl = new FormControl('0');
  public lastvaluesaved: number = 0;
  public minAlertRange: any = 0;
  public maxAlertRange: any = 100;

  constructor(private _weatherService: WeatherService) { }

  ngOnInit() {
    this.minAlertRange = this._weatherService.currentParams()?.min_value;
    this.maxAlertRange = this._weatherService.currentParams()?.max_value;
    
    this._socket = io('ws://localhost:3000');

    this._socket.on('connect', () => {
      console.log('connected to server');
    });

    this._socket.on('newData', (data: any) => {
      this.setLastValue(data.temperature);
      this.weatherData = { value: data.temperature, name: data.date };
    });

    this._socket.on('disconnect', () => {
      console.log('disconnected from server');
    });
  }

  ngAfterViewInit(): void {
   this.initChart();
  }

  ngOnDestroy(): void {
    this._socket.close();
  }

  initChart() {
    this._weatherService.getWeather()
      .subscribe(res => {
        this.weatherData = res;
        this.setLastValue(this.weatherData[this.weatherData.length-1].temperature);
        this.weatherData = this._weatherService.mapData(this.weatherData);
      })
  }

  setLastValue(value: string) {
    this.lastvalue.setValue(`${value} °C`);
    this.lastvaluesaved = Number(value);
  }
}
