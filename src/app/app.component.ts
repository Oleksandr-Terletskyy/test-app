import {
  Component,
  inject,
  ChangeDetectionStrategy,
  signal,
  WritableSignal,
  DestroyRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WeatherService } from './services/weather/weather.service';
import { WeatherTabsComponent } from './components/weather-tabs/weather-tabs.component';
import { FavoriteCitiesComponent } from './components/favorite-cities/favorite-cities.component';
import { EMPTY } from 'rxjs';
import { switchMap, catchError, finalize, map } from 'rxjs/operators';
import { FavoritesService } from './services/favorite-cities/favorite-cities.service';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { CurrentWeather, DailyForecast, GeoResponseItem } from './models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    WeatherTabsComponent,
    FavoriteCitiesComponent,
    SearchInputComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly weatherService: WeatherService = inject(WeatherService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);

  protected loading: WritableSignal<boolean> = signal(false);

  public cityControl: FormControl<string | null> = new FormControl(
    '',
    Validators.required
  );
  public currentWeather: CurrentWeather | null = null;
  public dailyForecast: DailyForecast[] = [];

  public searchCity(): void {
    const city = this.cityControl.value?.trim() ?? null;
    this.resetWeather();

    if (!city) {
      this.cityControl.setErrors({ required: true });
      return;
    }

    this.loading.set(true);

    this.weatherService
      .getCityGeo(city)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((res) => {
          if (Array.isArray(res) && res.length === 0) {
            this.cityControl.setErrors({ notFound: true });
            this.loading.set(false);
            return EMPTY;
          }

          const geo = res as GeoResponseItem;

          return this.weatherService
            .getWeather(geo.lat, geo.lon, geo.name)
            .pipe(
              map((data) => ({ geo, data })),
              catchError(() => {
                this.cityControl.setErrors({ apiError: true });
                this.loading.set(false);
                return EMPTY;
              })
            );
        }),
        catchError(() => {
          this.cityControl.setErrors({ apiError: true });
          this.loading.set(false);
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe(({ geo, data }) => {
        this.currentWeather = {
          ...data.current,
          name: geo.name,
          country: geo.country,
        };
        this.dailyForecast = data.daily;
      });
  }

  public addFavorite(): void {
    if (this.currentWeather) {
      this.favoritesService.addCity(this.currentWeather.name);
    }
  }

  public removeFavorite(city: string): void {
    this.favoritesService.removeCity(city);
  }

  private resetWeather(): void {
    this.currentWeather = null;
    this.dailyForecast = [];
    this.cityControl.setErrors(null);
  }
}
