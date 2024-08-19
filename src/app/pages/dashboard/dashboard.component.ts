import { AfterViewInit, Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ChartComponent } from '../../components/chart/chart.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { KnobModule } from 'primeng/knob';
import { Socket, io } from 'socket.io-client';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../auth/services/auth.service';

interface ServerToClientEvents {
  newData: (data: any) => void;
}

interface ClientToServerEvents { }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ChartComponent, KnobModule, FormsModule, ReactiveFormsModule, CommonModule, ToastModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [MessageService]
})
export class DashboardComponent implements AfterViewInit {
  private _socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
  public weatherData: any;
  public lastvalue: FormControl = new FormControl('0');
  public lastvaluesaved: number = 0;
  public minAlertRange: any = 0;
  public maxAlertRange: any = 100;

  constructor(private _weatherService: WeatherService,
              private messageService: MessageService,
              private _authService: AuthService) { }

  ngOnInit() {
    this.minAlertRange = this._weatherService.currentParams()?.min_alert_value;
    this.maxAlertRange = this._weatherService.currentParams()?.max_alert_value;
    
    this._socket = io('ws://localhost:3000');

    this._socket.on('connect', () => {
      console.log('connected to server');
    });

    this._socket.on('newData', (data: any) => {
      if (data.temperature*1<this.minAlertRange) {
          data.type = 'down';
          this.showWarn(data);
          this._weatherService.saveAlert(this.mapAlert(data))
            .subscribe();
      }
      if (data.temperature*1>this.maxAlertRange) {
          data.type = 'exceed';
          this.showWarn(data);
          this._weatherService.saveAlert(this.mapAlert(data))
            .subscribe();
      }
      this.setLastValue(data.temperature);
      this.weatherData = { value: data.temperature, name: data.date };
    });

    this._socket.on('disconnect', () => {
      console.log('disconnected from server');
    });
  }

  private mapAlert(alert: any) {
    return {
      value: alert.temperature,
      type: alert.type,
      alert_user_id: this._authService.currentUser().id
    }
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

  showWarn(data: any) {
    const message: string = `La temperatura ha ${data.type === 'exceed' ? 'superado el' : 'descendido del'} límite permitido: ${data.temperature}°C`;
    this.messageService.add({ severity: 'warn', summary: message, detail: this.dateFormatter(data.date), key: 'br', sticky: true });
  }

  dateFormatter(date: string): string {
    const datePipe = new DatePipe("en-US");
    let formatted = datePipe.transform(date, 'medium');
    return formatted ? formatted : date;
  }
}
