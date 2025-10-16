import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FavoriteCitiesComponent } from './favorite-cities.component';
import { WeatherService } from '../../services/weather/weather.service';
import { FavoritesService } from '../../services/favorite-cities/favorite-cities.service';
import { of } from 'rxjs';
import { WeatherTabsComponent } from '../weather-tabs/weather-tabs.component';
import { MatIconModule } from '@angular/material/icon';
import { CurrentWeather, DailyForecast } from '../../models';

describe('FavoriteCitiesComponent', () => {
  let component: FavoriteCitiesComponent;
  let fixture: ComponentFixture<FavoriteCitiesComponent>;
  let weatherServiceMock: jasmine.SpyObj<WeatherService>;
  let favoritesService: FavoritesService;

  const mockWeatherData = {
    current: {
      name: '',
      country: '',
      temp: 20,
      humidity: 50,
      description: 'Sunny',
      icon: '01d',
    } as CurrentWeather,
    daily: [
      {
        date: new Date(),
        temp_min: 10,
        temp_max: 25,
        description: 'Sunny',
        icon: '01d',
      } as DailyForecast,
    ],
  };

  beforeEach(async () => {
    weatherServiceMock = jasmine.createSpyObj('WeatherService', [
      'getCityGeo',
      'getWeather',
    ]);

    await TestBed.configureTestingModule({
      imports: [FavoriteCitiesComponent, WeatherTabsComponent, MatIconModule],
      providers: [
        { provide: WeatherService, useValue: weatherServiceMock },
        FavoritesService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteCitiesComponent);
    component = fixture.componentInstance;
    favoritesService = TestBed.inject(FavoritesService);

    weatherServiceMock.getCityGeo.and.callFake((city: string) =>
      of({ lat: 1, lon: 1, name: city, country: 'US' })
    );
    weatherServiceMock.getWeather.and.returnValue(of(mockWeatherData));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to favorites and load city weather', fakeAsync(() => {
    favoritesService.addCity('London');
    fixture.detectChanges();
    tick();

    expect(component.favoriteCities).toContain('London');
    expect(component.weatherMap['London']).toBeDefined();
    expect(component.weatherMap['London'].current?.description).toBe('Sunny');
  }));

  it('should remove city from favorites', fakeAsync(() => {
    favoritesService.addCity('Paris');
    tick();
    fixture.detectChanges();

    component.removeCity('Paris');
    tick();
    fixture.detectChanges();

    expect(component.favoriteCities).not.toContain('Paris');
    expect(component.weatherMap['Paris']).toBeUndefined();
  }));

  it('should remove weatherMap data if city no longer in favorites', fakeAsync(() => {
    favoritesService.addCity('Berlin');
    tick();
    fixture.detectChanges();

    favoritesService.removeCity('Berlin');
    tick();
    fixture.detectChanges();

    expect(component.weatherMap['Berlin']).toBeUndefined();
  }));

  it('should set isLoadingMap during load', fakeAsync(() => {
    favoritesService.addCity('Tokyo');
    tick();
    fixture.detectChanges();

    expect(component.isLoadingMap['Tokyo']).toBeFalse();
  }));
});
