import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherTabsComponent } from '../weather-tabs/weather-tabs.component';
import { WeatherService } from '../../services/weather/weather.service';
import { Subject, EMPTY } from 'rxjs';
import { switchMap, takeUntil, catchError, map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { FavoritesService } from '../../services/favorite-cities/favorite-cities.service';
import { CurrentWeather, DailyForecast, GeoResponseItem } from '../../models';

@Component({
  selector: 'favorite-cities',
  standalone: true,
  imports: [CommonModule, WeatherTabsComponent, MatIconModule],
  templateUrl: './favorite-cities.component.html',
  styleUrls: ['./favorite-cities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoriteCitiesComponent implements OnInit, OnDestroy {
  private readonly weatherService = inject(WeatherService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroy$ = new Subject<void>();

  public favoriteCities: string[] = [];
  public weatherMap: Record<
    string,
    { current: CurrentWeather | null; daily: DailyForecast[] }
  > = {};
  public isLoadingMap: Record<string, boolean> = {};

  public ngOnInit(): void {
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe((cities) => {
        this.favoriteCities = cities;
        cities.forEach((city) => {
          if (!this.weatherMap[city]) {
            this.loadCityWeather(city);
          }
        });

        Object.keys(this.weatherMap).forEach((city) => {
          if (!cities.includes(city)) {
            delete this.weatherMap[city];
          }
        });
      });
  }

  private loadCityWeather(city: string): void {
    this.isLoadingMap[city] = true;

    this.weatherService
      .getCityGeo(city)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (Array.isArray(res) && res.length === 0) {
            this.weatherMap[city] = { current: null, daily: [] };
            this.isLoadingMap[city] = false;
            return EMPTY;
          }

          const geo = res as GeoResponseItem;

          return this.weatherService
            .getWeather(geo.lat, geo.lon, geo.name)
            .pipe(
              takeUntil(this.destroy$),
              catchError(() => {
                this.weatherMap[city] = { current: null, daily: [] };
                this.isLoadingMap[city] = false;
                return EMPTY;
              }),
              map((data) => {
                this.weatherMap[city] = {
                  current: {
                    ...data.current,
                    name: geo.name,
                    country: geo.country,
                  },
                  daily: data.daily,
                };
                this.isLoadingMap[city] = false;
              })
            );
        })
      )
      .subscribe();
  }

  public removeCity(city: string): void {
    this.favoritesService.removeCity(city);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
