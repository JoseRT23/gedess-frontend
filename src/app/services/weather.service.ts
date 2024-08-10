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
    return this._http.post(url, data);
  }

  public updateConfiguration(data: any): Observable<IParameter> {
    const url = `${this._baseUrl}parameters`;
    //return this._http.put(url, data);
    return this._http.put<IParameter>(url, data).pipe(
      tap((res) => this._currentParams.set(res))
    );
  }

  public getParameters(): Observable<IParameter> {
    const url = `${this._baseUrl}parameters/1`;
    return this._http.get<IParameter>(url).pipe(
      tap((data) => this._currentParams.set(data))
    );
  }

  public getAlerts(): Observable<any> {
    const url = `${this._baseUrl}alerts`;
    return this._http.get<any>(url);
  }

  public validateDates(date1: Date, date2: Date) {
    // Asegúrate de que fecha1 sea siempre la más antigua
    if (date1 > date2) {
        var temp = date1;
        date1 = date2;
        date2 = temp;
    }

    var year1 = date1.getFullYear();
    var month1 = date1.getMonth();
    var year2 = date2.getFullYear();
    var month2 = date2.getMonth();

    // Calcula la diferencia en años y meses
    var diffYears = year2 - year1;
    var diffMonths = month2 - month1 + diffYears * 12;

    // Verifica si la diferencia es mayor a 1 mes
    return diffMonths > 1 || (diffMonths === 1 && date2.getDate() > date1.getDate());
}

}
