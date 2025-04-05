import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnDestroy {
  searchControl = new FormControl(''); // Reactive form control for search
  private destroy$ = new Subject<void>(); // For cleanup

  constructor(private router: Router) {
    // Debounce search input and navigate on change
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after typing stops
        distinctUntilChanged(), // Only emit if value changes
        takeUntil(this.destroy$) // Cleanup subscription on destroy
      )
      .subscribe(query => this.searchMovies(query));
  }

  searchMovies(query: string | null) {
    if (query?.trim()) {
      this.router.navigate(['/main'], { queryParams: { search: query.trim() } });
    } else {
      this.router.navigate(['/main']); // Clear search if empty
    }
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.router.navigate(['/main']);
  }

  goToLogin() {
    this.router.navigate(['/login']).then(success => {
      console.log('Navigation to login:', success);
    }).catch(err => {
      console.error('Navigation error:', err);
    });
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}