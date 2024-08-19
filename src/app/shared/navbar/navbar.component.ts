import { Component, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { Socket, io } from 'socket.io-client';
import { AuthService } from '../../auth/services/auth.service';

interface ServerToClientEvents {
  alert: (data: any) => void;
}

interface ClientToServerEvents { }

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [ DatePipe, RouterModule, DialogModule, ButtonModule, 
    InputNumberModule, FormsModule, ReactiveFormsModule, TooltipModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {

  private _socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

  constructor(private _fb: FormBuilder, 
              private _weatherService: WeatherService,
              public _authService: AuthService, 
              ) { 
                effect(() => {
                  if (this._authService.currentUser()) this.shownavbar = true;
                });
              }

  formConfig: FormGroup = this._fb.nonNullable.group({
    min_alert_value: [1, Validators.required],
    max_alert_value: [1, Validators.required],
    min_chart_value: [1, Validators.required],
    max_chart_value: [1, Validators.required],
    parameter_user_id: ['', Validators.nullValidator],
  });

  showconfig: boolean = false;
  showalerts: boolean = false;
  shownavbar: boolean = false;
  alerts: any[] = [];
  messageup: string = 'Se registro un alto nivel de temperatura.';
  messagedown: string = 'Se registro un bajo nivel temperatura.';

  ngOnInit() {
    this._weatherService.getParameters(this._authService.currentUser().id).subscribe();
    this._socket = io('ws://localhost:3000');

    this._socket.on('connect', () => {
      console.log('connected to server navbar');
    });

    // this._socket.on('alert', (data: any) => {
    //   console.log(data);
    //   //this.showWarn(data);
    // });

    this._socket.on('disconnect', () => {
      console.log('disconnected from server');
    });
  }

  ngOnDestroy(): void {
    this._socket.close();
  }

  showParamsDialog() {
    this.formConfig.reset({
      min_alert_value: this._weatherService.currentParams()?.min_alert_value,
      max_alert_value: this._weatherService.currentParams()?.max_alert_value,
      min_chart_value: this._weatherService.currentParams()?.min_chart_value,
      max_chart_value: this._weatherService.currentParams()?.max_chart_value,
      parameter_user_id: this._weatherService.currentParams()?.parameter_user_id,
    });

    this.showconfig = true;
  }

  showAlertsDialog() {
    this._weatherService.getAlerts(this._authService.currentUser().id)
      .subscribe(res => this.alerts = res);

    this.showalerts = true;
  }

  saveConfiguration() {
    if (this.formConfig.invalid) {
      console.log('Formulario invalido');
      return;
    }

    if (!this.formConfig.get('parameter_user_id')?.value) {
      this.formConfig.get('parameter_user_id')?.setValue(this._authService.currentUser().id);
      this._weatherService.saveConfiguration(this.formConfig.value)
      .subscribe(() => this.showconfig = false);
      return;
    }
      
    this._weatherService.updateConfiguration(this._weatherService.currentParams().id, this.formConfig.value)
      .subscribe(() => this.showconfig = false);
  }

  // showWarn(data: any) {
  //   const message: string = `Ha ocurrido una ${data.type === 'exceed' ? 'subida' : 'bajada'} en el dato recibido: ${data.value}`;
  //   this.messageService.add({ severity: 'warn', summary: message, detail: this.dateFormatter(data.date), key: 'br', sticky: true });
  // }

  // dateFormatter(date: string): string {
  //   const datePipe = new DatePipe("en-US");
  //   let formatted = datePipe.transform(date, 'medium');
  //   return formatted ? formatted : date;
  // }

  closeSesion() {
    this._authService.closeSesion();
    this.shownavbar = false;
  }
}
