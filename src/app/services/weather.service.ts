import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface IParameter {
  min_value: number,
  max_value: number,
  minchart: number,
  maxchart: number,
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private _http: HttpClient) { }

  private _baseUrl: string = 'http://localhost:3000/api/';
  private _currentParams = signal<any | null>(null);
  public currentParams = computed(() => this._currentParams());

  public searchWeather(startdate: string, enddate: string): Observable<any> {
    const url = `${this._baseUrl}data/search?startdate=${startdate}&enddate=${enddate}`;
    return this._http.get(url);
  }

  public getWeather(): Observable<any[]> {
    const url = `${this._baseUrl}data`;
    return this._http.get<any[]>(url);
  }

  public mapData(weatherData: any): any[] {
    return weatherData.map((item: { temperature: any; date: any; }) => ({
      value: item.temperature,
      name: item.date
    }));
  }

  public saveConfiguration(data: any): Observable<any> {
    const url = `${this._baseUrl}parameters`;
    return this._http.post(url, data).pipe(
      tap(res => this._currentParams.set(data))
    );
  }

  public updateConfiguration(idparameter: any, data: any): Observable<IParameter> {
    const url = `${this._baseUrl}parameters/${idparameter}`;
    return this._http.put<IParameter>(url, data).pipe(
      tap((res) => this._currentParams.set(res))
    );
  }

  public getParameters(iduser: any): Observable<IParameter> {
    const url = `${this._baseUrl}parameters/${iduser}`;
    return this._http.get<IParameter>(url).pipe(
      tap((data) => this._currentParams.set(data))
    );
  }

  public getAlerts(iduser: any): Observable<any> {
    const url = `${this._baseUrl}alerts/${iduser}`;
    return this._http.get<any>(url);
  }

  public saveAlert(alert: any): Observable<any> {
    const url = `${this._baseUrl}alerts`;
    return this._http.post<any>(url, alert);
  }

  public validateDates(date1: Date, date2: Date) {
    // Asegúrate de que fecha1 sea siempre la más antigua
    if (date1 > date2) {
      return  {
        error: "La fecha inicial no puede ser mayor a la final",
        isSucces: false
      }
    }

    var year1 = date1.getFullYear();
    var month1 = date1.getMonth();
    var year2 = date2.getFullYear();
    var month2 = date2.getMonth();

    // Calcula la diferencia en años y meses
    var diffYears = year2 - year1;
    var diffMonths = month2 - month1 + diffYears * 12;

    // Verifica si la diferencia es mayor a 1 mes
    if (diffMonths > 1 || (diffMonths === 1 && date2.getDate() > date1.getDate())) {
      return  {
        error: "Las fechas no pueden ser mayores a un mes",
        isSucces: false
      }
    }
    return {
      error: null,
      isSuccess: true
    };
  }

  downloadCsv(startdate: string, enddate: string): Observable<Blob> {
    const url = `${this._baseUrl}data/download-excel?startdate=${startdate}&enddate=${enddate}`;
    return this._http.get(url, { responseType: 'blob' });
  }

  downloadPdf(imageData: any): Observable<Blob> {
    //?startdate=${startdate}&enddate=${enddate}
    const url = `${this._baseUrl}data/download-pdf`;
    return this._http.post(url, { image: imageData }, { responseType: 'blob' });

  }

}
