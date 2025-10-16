import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { WeatherApiService } from './weather.api.service';
import { GeoResponseItem, OneCallWeatherResponse } from '../../models';
import { openWeathermApiKey } from '../../../environments/environment';

describe('WeatherApiService', () => {
  let service: WeatherApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WeatherApiService],
    });
    service = TestBed.inject(WeatherApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch city geo', () => {
    const city = 'Lviv';
    const mockResponse: GeoResponseItem[] = [
      { lat: 49, lon: 24, name: 'Lviv', country: 'UA' },
    ];

    service.getCityGeo(city).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${openWeathermApiKey}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch weather', () => {
    const lat = 49,
      lon = 24;
    const mockResponse: OneCallWeatherResponse = {
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

    service.getWeather(lat, lon).subscribe((res) => {
      expect(res.current.temp).toBe(10);
      expect(res.daily.length).toBe(1);
    });

    const req = httpMock.expectOne(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${openWeathermApiKey}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
