import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WeatherTabsComponent } from './components/weather-tabs/weather-tabs.component';
import { FavoriteCitiesComponent } from './components/favorite-cities/favorite-cities.component';
import { of, throwError } from 'rxjs';
import { WeatherService } from './services/weather/weather.service';
import { FavoritesService } from './services/favorite-cities/favorite-cities.service';
import { CurrentWeather, DailyForecast, GeoResponseItem } from './models';

describe('AppComponent', () => {
  let weatherServiceMock: jasmine.SpyObj<WeatherService>;
  let favoritesServiceMock: jasmine.SpyObj<FavoritesService>;

  beforeEach(async () => {
    weatherServiceMock = jasmine.createSpyObj('WeatherService', [
      'getCityGeo',
      'getWeather',
    ]);
    favoritesServiceMock = jasmine.createSpyObj('FavoritesService', [
      'addCity',
      'removeCity',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        WeatherTabsComponent,
        FavoriteCitiesComponent,
      ],
      providers: [
        { provide: WeatherService, useValue: weatherServiceMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('searchCity() sets currentWeather on success', () => {
    const geo: GeoResponseItem = { lat: 51.5074, lon: -0.1278, name: 'London', country: 'UK' };
    const weather = {
      current: { temp: 20, humidity: 50, description: 'Sunny', icon: '01d', name: 'London', country: 'UK' },
      daily: [] as DailyForecast[],
    };

    weatherServiceMock.getCityGeo.and.returnValue(of(geo));
    weatherServiceMock.getWeather.and.returnValue(of(weather));

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.cityControl.setValue('London');
    app.searchCity();

    expect(weatherServiceMock.getCityGeo).toHaveBeenCalledWith('London');
    expect(weatherServiceMock.getWeather).toHaveBeenCalledWith(geo.lat, geo.lon, geo.name);
    expect(app.currentWeather?.name).toBe('London');
    expect(app.dailyForecast).toEqual([]);
  });

  it('searchCity() sets notFound when getCityGeo returns empty array', () => {
    weatherServiceMock.getCityGeo.and.returnValue(of([]));

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.cityControl.setValue('InvalidCity');
    app.searchCity();

    expect(app.cityControl.hasError('notFound')).toBeTrue();
    expect(app.currentWeather).toBeNull();
    expect(app.dailyForecast).toEqual([]);
  });

  it('searchCity() sets apiError when getCityGeo throws', () => {
    weatherServiceMock.getCityGeo.and.returnValue(throwError(() => new Error('API error')));

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.cityControl.setValue('InvalidCity');
    app.searchCity();

    expect(app.cityControl.hasError('apiError')).toBeTrue();
    expect(app.currentWeather).toBeNull();
    expect(app.dailyForecast).toEqual([]);
  });

  it('searchCity() sets apiError when getWeather throws', () => {
    const geo: GeoResponseItem = { lat: 51.5074, lon: -0.1278, name: 'London', country: 'UK' };
    weatherServiceMock.getCityGeo.and.returnValue(of(geo));
    weatherServiceMock.getWeather.and.returnValue(throwError(() => new Error('Weather API error')));

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.cityControl.setValue('London');
    app.searchCity();

    expect(app.cityControl.hasError('apiError')).toBeTrue();
    expect(app.currentWeather).toBeNull();
    expect(app.dailyForecast).toEqual([]);
  });

  it('addFavorite() calls favoritesService.addCity', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.currentWeather = { name: 'London' } as CurrentWeather;
    app.addFavorite();

    expect(favoritesServiceMock.addCity).toHaveBeenCalledWith('London');
  });

  it('removeFavorite() calls favoritesService.removeCity', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.removeFavorite('London');
    expect(favoritesServiceMock.removeCity).toHaveBeenCalledWith('London');
  });
});
