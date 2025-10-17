import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CurrentWeather, DailyForecast } from '../../models';

@Component({
  selector: 'weather-tabs',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, MatButtonModule],
  templateUrl: './weather-tabs.component.html',
  styleUrls: ['./weather-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherTabsComponent {
  @Input({ required: true })
  public currentWeather: CurrentWeather | null = null;

  @Input({ required: true })
  public dailyForecast: DailyForecast[] = [];

  @Input()
  public showTitle = false;

  @Output()
  public removeCity = new EventEmitter<string>();

  public onRemoveCity(): void {
    this.removeCity.emit(this.currentWeather?.name);
  }
}
