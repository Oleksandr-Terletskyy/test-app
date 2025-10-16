import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeoResponseItem, OneCallWeatherResponse } from '../../models';
import { openWeathermApiKey } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WeatherApiService {
  private readonly httpClient = inject(HttpClient);

  public getCityGeo(city: string): Observable<GeoResponseItem[]> {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${openWeathermApiKey}`;
    return this.httpClient.get<GeoResponseItem[]>(url);
  }

  public getWeather(
    lat: number,
    lon: number
  ): Observable<OneCallWeatherResponse> {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${openWeathermApiKey}`;
    return this.httpClient.get<OneCallWeatherResponse>(url);
  }
}
