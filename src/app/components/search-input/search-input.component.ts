import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  input,
  output,
  OutputEmitterRef,
  InputSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'search-input',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  public control: InputSignal<FormControl<string | null>> =
    input.required<FormControl<string | null>>();
  public placeholder: InputSignal<string> = input('Enter city name');

  public search: OutputEmitterRef<void> = output<void>();

  public onClearInput(): void {
    this.control().setValue('');
    this.control().setErrors(null);
  }

  public onSubmit(): void {
    this.search.emit();
  }
}
