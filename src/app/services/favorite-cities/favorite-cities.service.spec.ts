import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorite-cities.service';

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a city', (done) => {
    service.addCity('Lviv');
    service.favorites$.subscribe((favs) => {
      expect(favs).toContain('Lviv');
      done();
    });
  });

  it('should not add duplicates', (done) => {
    service.addCity('Lviv');
    service.addCity('Lviv');
    service.favorites$.subscribe((favs) => {
      expect(favs.filter((c) => c === 'Lviv').length).toBe(1);
      done();
    });
  });

  it('should remove a city', (done) => {
    service.addCity('Kyiv');
    service.removeCity('Kyiv');
    service.favorites$.subscribe((favs) => {
      expect(favs).not.toContain('Kyiv');
      done();
    });
  });

  it('should persist in localStorage', () => {
    service.addCity('Odesa');
    const stored = JSON.parse(localStorage.getItem('favoriteCities')!);
    expect(stored).toContain('Odesa');
  });
});
