
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterModule], // Removed HeaderComponent
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  searchQuery: string | null = '';
  movies: any[] = [];
  filteredMovies: any[] = [];
  currentMovies: { movie: any, originalIndex: number }[] = [];
  upcomingMovies: { movie: any, originalIndex: number }[] = [];
  today: Date = new Date();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const storedMovies = localStorage.getItem('movies');
      if (storedMovies) {
        this.movies = JSON.parse(storedMovies);
        this.filteredMovies = [...this.movies];
      }
    }

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || null;
      this.filterMovies();
    });
  }

  filterMovies() {
    if (this.searchQuery) {
      this.filteredMovies = this.movies.filter(movie =>
        movie.movieName.toLowerCase().includes(this.searchQuery!.toLowerCase())
      );
    } else {
      this.filteredMovies = [...this.movies];
    }
    this.categorizeMovies();
  }

  categorizeMovies() {
    this.currentMovies = [];
    this.upcomingMovies = [];

    this.filteredMovies.forEach((movie, index) => {
      const releaseDate = new Date(movie.releaseDate);
      const movieItem = { movie, originalIndex: index };

      if (this.today >= releaseDate) {
        this.currentMovies.push(movieItem);
      } else {
        this.upcomingMovies.push(movieItem);
      }
    });
  }

  bookNow(originalIndex: number) {
    this.router.navigate(['/movie-details', originalIndex]);
  }
}