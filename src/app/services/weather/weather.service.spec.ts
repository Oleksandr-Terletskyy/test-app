import { TestBed } from '@angular/core/testing';
import { WeatherService } from './weather.service';
import { WeatherApiService } from './weather.api.service';
import { of, throwError } from 'rxjs';
import { OneCallWeatherResponse, GeoResponseItem } from '../../models';

describe('WeatherService', () => {
  let service: WeatherService;
  let apiSpy: jasmine.SpyObj<WeatherApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('WeatherApiService', [
      'getCityGeo',
      'getWeather',
    ]);
    TestBed.configureTestingModule({
      providers: [
        WeatherService,
        { provide: WeatherApiService, useValue: spy },
      ],
    });
    service = TestBed.inject(WeatherService);
    apiSpy = TestBed.inject(
      WeatherApiService
    ) as jasmine.SpyObj<WeatherApiService>;
    localStorage.clear();
  });

  it('should get city geo from API if not cached', (done) => {
    const mockGeo: GeoResponseItem[] = [
      { lat: 49, lon: 24, name: 'Lviv', country: 'UA' },
    ];
    apiSpy.getCityGeo.and.returnValue(of(mockGeo));

    service.getCityGeo('Lviv').subscribe((res) => {
      expect(res).toEqual(mockGeo[0]);
      expect(apiSpy.getCityGeo).toHaveBeenCalled();
      done();
    });
  });

  it('should return empty array when city not found', (done) => {
    const emptyGeo: GeoResponseItem[] = [];
    apiSpy.getCityGeo.and.returnValue(of(emptyGeo));

    service.getCityGeo('asdfasfasdf').subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });
  });

  it('should return cached geo', (done) => {
    localStorage.setItem(
      'geo_lviv',
      JSON.stringify({
        timestamp: Date.now(),
        data: { lat: 49, lon: 24, name: 'Lviv', country: 'UA' },
      })
    );
    service.getCityGeo('Lviv').subscribe((res) => {
      expect(res).toEqual({ lat: 49, lon: 24, name: 'Lviv', country: 'UA' });
      expect(apiSpy.getCityGeo).not.toHaveBeenCalled();
      done();
    });
  });

  it('should map OneCall to CurrentWeather and DailyForecast', (done) => {
    const mockOneCall: OneCallWeatherResponse = {
      lat: 49,
      lon: 24,
      timezone: 'Europe/Kyiv',
      timezone_offset: 10800,
      current: {
        dt: 0,
        sunrise: 0,
        sunset: 0,
        temp: 10,
        feels_like: 10,
        pressure: 1010,
        humidity: 50,
        dew_point: 5,
        uvi: 1,
        clouds: 20,
        visibility: 10000,
        wind_speed: 1,
        wind_deg: 90,
        weather: [
          { id: 800, main: 'Clear', description: 'clear', icon: '01d' },
        ],
      },
      daily: [
        {
          dt: 0,
          sunrise: 0,
          sunset: 0,
          moonrise: 0,
          moonset: 0,
          moon_phase: 0,
          temp: { day: 10, min: 5, max: 12, night: 6, eve: 8, morn: 5 },
          feels_like: { day: 9, night: 5, eve: 7, morn: 5 },
          pressure: 1010,
          humidity: 50,
          dew_point: 5,
          wind_speed: 1,
          wind_deg: 90,
          weather: [
            { id: 800, main: 'Clear', description: 'clear', icon: '01d' },
          ],
          clouds: 20,
          pop: 0,
          uvi: 1,
        },
      ],
    };

    apiSpy.getWeather.and.returnValue(of(mockOneCall));

    service.getWeather(49, 24, 'Lviv').subscribe((res) => {
      expect(res.current.temp).toBe(10);
      expect(res.daily.length).toBe(1);
      const cached = localStorage.getItem('weather_lviv');
      expect(cached).toBeTruthy();
      done();
    });
  });

  it('should return cached weather', (done) => {
    const cachedValue = {
      current: {
        name: 'Lviv',
        country: 'UA',
        temp: 10,
        humidity: 50,
        description: 'clear',
        icon: '01d',
      },
      daily: [],
    };
    localStorage.setItem(
      'weather_lviv',
      JSON.stringify({ timestamp: Date.now(), data: cachedValue })
    );

    service.getWeather(49, 24, 'Lviv').subscribe((res) => {
      expect(res.current.name).toBe('Lviv');
      expect(apiSpy.getWeather).not.toHaveBeenCalled();
      done();
    });
  });

  it('should throw error on weather API failure', (done) => {
    apiSpy.getWeather.and.returnValue(throwError(() => new Error('fail')));

    service.getWeather(49, 24, 'Lviv').subscribe({
      next: () => {},
      error: (err) => {
        expect(err).toBeTruthy();
        expect(err.message).toBe('Weather API error');
        done();
      },
    });
  });
});
