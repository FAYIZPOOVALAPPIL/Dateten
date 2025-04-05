import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-added-movies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './added-movies.component.html',
  styleUrls: ['./added-movies.component.css']
})
export class AddedMoviesComponent implements OnInit {
  movies: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const storedMovies = localStorage.getItem('movies');
      if (storedMovies) {
        this.movies = JSON.parse(storedMovies);
      }
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  editMovie(index: number) {
    this.router.navigate(['/admin'], { queryParams: { editIndex: index } });
  }

  deleteMovie(index: number) {
    if (confirm('Are you sure you want to delete this movie?')) {
      this.movies.splice(index, 1);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('movies', JSON.stringify(this.movies));
      }
    }
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}