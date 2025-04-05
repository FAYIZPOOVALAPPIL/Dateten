import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddedMoviesComponent } from './added-movies.component';

describe('AddedMoviesComponent', () => {
  let component: AddedMoviesComponent;
  let fixture: ComponentFixture<AddedMoviesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddedMoviesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddedMoviesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
