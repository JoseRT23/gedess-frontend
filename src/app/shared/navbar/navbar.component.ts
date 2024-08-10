import { Component, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Socket, io } from 'socket.io-client';
import { AuthService } from '../../auth/services/auth.service';

interface ServerToClientEvents {
  alert: (data: any) => void;
}

interface ClientToServerEvents { }

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [ DatePipe, RouterModule, DialogModule, ButtonModule, InputNumberModule, FormsModule, ReactiveFormsModule, TooltipModule, ToastModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  providers: [MessageService]
})
export class NavbarComponent {

  private _socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

  constructor(private _fb: FormBuilder, 
              private _weatherService: WeatherService,
              private _authService: AuthService, 
              private messageService: MessageService) { 
                effect(() => {
                  if (this._authService.currentUser()) this.shownavbar = true;
                });
              }

  formConfig: FormGroup = this._fb.nonNullable.group({
    min_value: [1, Validators.required],
    max_value: [1, Validators.required],
    minchart: [1, Validators.required],
    maxchart: [1, Validators.required],
  });

  showconfig: boolean = false;
  showalerts: boolean = false;
  shownavbar: boolean = false;
  alerts: any[] = [];
  messageup: string = 'Se registro una subida en el nivel de la temperatura.';
  messagedown: string = 'Se registro una bajada en el nivel de la temperatura.';

  ngOnInit() {
    this._weatherService.getParameters().subscribe();
    this._socket = io('ws://localhost:3000');

    this._socket.on('connect', () => {
      console.log('connected to server navbar');
    });

    this._socket.on('alert', (data: any) => {
      console.log(data);
      this.showWarn(data);
    });

    this._socket.on('disconnect', () => {
      console.log('disconnected from server');
    });
  }

  ngOnDestroy(): void {
    this._socket.close();
  }

  showParamsDialog() {
    this.formConfig.reset({
      min_value: this._weatherService.currentParams()?.min_alert_value,
      max_value: this._weatherService.currentParams()?.max_alert_value,
      minchart: this._weatherService.currentParams()?.min_chart_value,
      maxchart: this._weatherService.currentParams()?.max_chart_value,
    });

    this.showconfig = true;
  }

  showAlertsDialog() {
    this._weatherService.getAlerts()
      .subscribe(res => this.alerts = res);

    this.showalerts = true;
  }

  saveConfiguration() {
    if (this.formConfig.invalid) {
      console.log('Formulario invalido')
      return;
    }

    this._weatherService.updateConfiguration(this.formConfig.value)
      .subscribe(() => this.showconfig = false);
  }

  showWarn(data: any) {
    const message: string = `Ha ocurrido una ${data.type === 'exceed' ? 'subida' : 'bajada'} en el dato recibido: ${data.value}`;
    this.messageService.add({ severity: 'warn', summary: message, detail: this.dateFormatter(data.date), key: 'br', sticky: true });
  }

  dateFormatter(date: string): string {
    const datePipe = new DatePipe("en-US");
    let formatted = datePipe.transform(date, 'medium');
    return formatted ? formatted : date;
  }

  closeSesion() {
    this._authService.closeSesion();
    this.shownavbar = false;
  }
}
