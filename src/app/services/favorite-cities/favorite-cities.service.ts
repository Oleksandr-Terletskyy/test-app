import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private static readonly STORAGE_KEY = 'favoriteCities';

  private readonly favoritesSubject: BehaviorSubject<string[]> =
    new BehaviorSubject<string[]>(this.loadFavorites());

  public readonly favorites$: Observable<string[]> =
    this.favoritesSubject.asObservable();

  public addCity(city: string): void {
    const current = this.favoritesSubject.value;
    if (!current.includes(city)) {
      const updated = [city, ...current];
      this.saveFavorites(updated);
      this.favoritesSubject.next(updated);
    }
  }

  public removeCity(city: string): void {
    const updated = this.favoritesSubject.value.filter((c) => c !== city);
    this.saveFavorites(updated);
    this.favoritesSubject.next(updated);
  }

  private loadFavorites(): string[] {
    const stored = localStorage.getItem(FavoritesService.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveFavorites(favorites: string[]): void {
    try {
      localStorage.setItem(
        FavoritesService.STORAGE_KEY,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error('Failed to save favorite cities to localStorage:', error);
    }
  }
}
