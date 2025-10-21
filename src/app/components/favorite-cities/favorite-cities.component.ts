import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherTabsComponent } from '../weather-tabs/weather-tabs.component';
import { WeatherService } from '../../services/weather/weather.service';
import { EMPTY } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { FavoritesService } from '../../services/favorite-cities/favorite-cities.service';
import { CurrentWeather, DailyForecast, GeoResponseItem } from '../../models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'favorite-cities',
  standalone: true,
  imports: [CommonModule, WeatherTabsComponent, MatIconModule],
  templateUrl: './favorite-cities.component.html',
  styleUrls: ['./favorite-cities.component.scss'],
})
export class FavoriteCitiesComponent implements OnInit {
  private readonly weatherService = inject(WeatherService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);

  public favoriteCities: string[] = [];
  public weatherMap: Record<
    string,
    { current: CurrentWeather | null; daily: DailyForecast[] }
  > = {};
  public isLoadingMap: Record<string, boolean> = {};

  public ngOnInit(): void {
    this.favoritesService.favorites$
      .pipe(takeUntilDestroyed(this.destroyRef))
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
        takeUntilDestroyed(this.destroyRef),
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
              takeUntilDestroyed(this.destroyRef),
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
}
