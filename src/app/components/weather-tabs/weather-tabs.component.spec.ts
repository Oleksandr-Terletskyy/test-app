import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherTabsComponent } from './weather-tabs.component';
import { By } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CurrentWeather, DailyForecast } from '../../models';

describe('WeatherTabsComponent', () => {
  let component: WeatherTabsComponent;
  let fixture: ComponentFixture<WeatherTabsComponent>;

  const mockCurrentWeather: CurrentWeather = {
    name: 'London',
    country: 'UK',
    temp: 20,
    humidity: 50,
    description: 'Sunny',
    icon: '01d',
  };

  const mockDailyForecast: DailyForecast[] = [
    {
      date: new Date(),
      temp_min: 15,
      temp_max: 22,
      description: 'Cloudy',
      icon: '02d',
    },
    {
      date: new Date(),
      temp_min: 16,
      temp_max: 23,
      description: 'Rain',
      icon: '09d',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WeatherTabsComponent,
        CommonModule,
        MatTabsModule,
        MatIconModule,
        MatButtonModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherTabsComponent);
    component = fixture.componentInstance;
    component.currentWeather = mockCurrentWeather;
    component.dailyForecast = mockDailyForecast;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render current weather name and country', () => {
    const header = fixture.debugElement.query(
      By.css('.current-weather-header h2')
    ).nativeElement;
    expect(header.textContent).toContain('London');
    expect(header.textContent).toContain('UK');
  });

  it('should emit removeCity when onRemoveCity() called', () => {
    spyOn(component.removeCity, 'emit');
    component.currentWeather = mockCurrentWeather;
    component.onRemoveCity();
    expect(component.removeCity.emit).toHaveBeenCalledWith('London');
  });

  it('should show title button if showTitle is true', () => {
    component.showTitle = true;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
  });

  it('should not show title button if showTitle is false', () => {
    component.showTitle = false;
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeNull();
  });
});
