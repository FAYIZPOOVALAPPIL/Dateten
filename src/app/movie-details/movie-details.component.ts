import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit {
  movie: any = null;
  movieIndex: number = -1;
  today: Date = new Date();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.movieIndex = +this.route.snapshot.paramMap.get('index')!;
      const storedMovies = localStorage.getItem('movies');
      if (storedMovies) {
        const movies = JSON.parse(storedMovies).flat();
        this.movie = movies[this.movieIndex];
      }
    }
  }

  proceedToBooking() {
    this.router.navigate(['/booking', this.movieIndex]);
  }

  canBook(): boolean {
    const releaseDate = new Date(this.movie.releaseDate);
    const threeDaysFromNow = new Date(this.today);
    threeDaysFromNow.setDate(this.today.getDate() + 3);
    return this.today >= releaseDate || (releaseDate > this.today && releaseDate <= threeDaysFromNow);
  }

  goBack() {
    this.router.navigate(['/main']);
  }
}