import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartComponent } from '../../components/chart/chart.component';
import { WeatherService } from '../../services/weather.service';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, ChartComponent, CalendarModule, ButtonModule, TooltipModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {

  public startdate: FormControl = new FormControl('');
  public enddate: FormControl = new FormControl('');
  public status: 'ERROR' | 'WAITING' | 'IDLE' = 'IDLE';
  public errormessage: string = '';
  public weatherData: any[] = [];
  @ViewChild('historyChart', {read: ElementRef}) chart: ElementRef | undefined;

  constructor(private _weatherService: WeatherService) { }

  onSearch(): void {
    this.status = 'WAITING';
    if (this.startdate.value=='' || this.enddate.value=='') {
      this.status = 'ERROR';
      this.errormessage = 'Las fechas no deben ir vacias';
      return;
    }

    const result = this._weatherService.validateDates(new Date(this.startdate.value), new Date(this.enddate.value));

    if (result.error) {
      this.status = 'ERROR';
      this.errormessage = result.error;
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

  downloadCsv(): void {
    this._weatherService.downloadCsv(this.startdate.value, this.enddate.value).subscribe((data) => {
      console.log(data);
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datos${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  downloadPdf(): void {
    const svgElement = this.chart?.nativeElement.querySelector('svg');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const imageData = canvas.toDataURL('image/png');
      
      // Enviar la imagen al backend para generar el PDF
      this._weatherService.downloadPdf(imageData)
        .subscribe(data => {
          const blob = new Blob([data], { type: 'application/pdf' });
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = 'reporte.pdf';
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
        })
    }
    img.src = url;
  }

}
