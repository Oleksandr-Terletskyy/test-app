import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  CurrentWeather,
  DailyForecast,
  OneCallWeatherResponse,
} from '../../models';
import { WeatherApiService } from './weather.api.service';

interface CachedItem<T> {
  timestamp: number;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly weatherApiService = inject(WeatherApiService);
  private readonly ONE_HOUR_MS = 60 * 60 * 1000;

  public getCityGeo(
    city: string
  ): Observable<
    { lat: number; lon: number; name: string; country: string } | []
  > {
    const cacheKey = `geo_${city.toLowerCase()}`;
    const cached = this.getCache<
      { lat: number; lon: number; name: string; country: string } | []
    >(cacheKey);
    if (cached) return of(cached);

    return this.weatherApiService.getCityGeo(city).pipe(
      map((res) => {
        if (!res || res.length === 0) return [];
        const { lat, lon, name, country } = res[0];
        const result = { lat, lon, name, country };
        this.setCache(cacheKey, result);
        return result;
      })
    );
  }
  public getWeather(
    lat: number,
    lon: number,
    cityName: string
  ): Observable<{ current: CurrentWeather; daily: DailyForecast[] }> {
    const cacheKey = `weather_${cityName.toLowerCase()}`;
    const cached = this.getCache<{
      current: CurrentWeather;
      daily: DailyForecast[];
    }>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.weatherApiService.getWeather(lat, lon).pipe(
      map((data) => this.mapOneCallToCurrentAndDaily(data)),
      map((result) => {
        this.setCache(cacheKey, result);
        return result;
      }),
      catchError(() => throwError(() => new Error('Weather API error')))
    );
  }

  private mapOneCallToCurrentAndDaily(data: OneCallWeatherResponse): {
    current: CurrentWeather;
    daily: DailyForecast[];
  } {
    return {
      current: {
        name: '',
        country: '',
        temp: data.current.temp,
        humidity: data.current.humidity,
        description: data.current.weather[0].description,
        icon: data.current.weather[0].icon,
      },
      daily: data.daily.slice(0, 5).map((d) => ({
        date: new Date(d.dt * 1000),
        temp_min: d.temp.min,
        temp_max: d.temp.max,
        description: d.weather[0].description,
        icon: d.weather[0].icon,
      })),
    };
  }

  private getCache<T>(key: string): T | null {
    const cachedStr = localStorage.getItem(key);
    if (!cachedStr) return null;
    try {
      const cached: CachedItem<T> = JSON.parse(cachedStr);
      if (Date.now() - cached.timestamp < this.ONE_HOUR_MS) return cached.data;
    } catch {
      localStorage.removeItem(key);
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    try {
      const item: CachedItem<T> = { timestamp: Date.now(), data };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Failed to set cache for key "${key}":`, error);
    }
  }
}
