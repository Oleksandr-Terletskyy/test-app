import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SearchInputComponent,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    component.control = new FormControl('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search event when onSubmit() is called', () => {
    spyOn(component.search, 'emit');
    component.onSubmit();
    expect(component.search.emit).toHaveBeenCalled();
  });

  it('should clear input and errors when onClearInput() is called', () => {
    component.control.setValue('London');
    component.control.setErrors({ required: true });
    component.onClearInput();
    expect(component.control.value).toBe('');
    expect(component.control.errors).toBeNull();
  });

  it('should show clear button only when input has value', () => {
    component.control.setValue('');
    fixture.detectChanges();
    let clearBtn = fixture.debugElement.query(By.css('button[color="warn"]'));
    expect(clearBtn).toBeNull();

    component.control.setValue('London');
    fixture.detectChanges();
    clearBtn = fixture.debugElement.query(By.css('button[color="warn"]'));
    expect(clearBtn).toBeTruthy();
  });

  it('should set placeholder correctly from input', () => {
    component.placeholder = 'Enter a city';
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.placeholder).toBe('Enter a city');
  });
});
