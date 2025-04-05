import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  movieForm: FormGroup;
  actors = [{ name: '', photo: null }, { name: '', photo: null }, { name: '', photo: null }];
  movieTypes = ['Humor', 'Action', 'Violence', 'Drama', 'Romance'];
  showTimes = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];
  editIndex: number | null = null;
  today: string = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.movieForm = this.fb.group({
      movieName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      duration: ['', [Validators.required, Validators.pattern(/^\d{1,3}(\s*(min|minutes))?$/)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      releaseDate: [this.today, [Validators.required]],
      showTimes: [[] as string[], [Validators.required, Validators.minLength(1)]],
      poster: [null, [Validators.required]],
      posterUrl: [''],
      trailer: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/)]],
      language: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      movieType: [[] as string[], [Validators.required, Validators.minLength(1)]],
      actors: this.fb.array(this.actors.map(actor => this.fb.group({
        name: [actor.name, [Validators.minLength(2), Validators.maxLength(50)]],
        photo: [actor.photo],
        photoUrl: ['']
      })))
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe(params => {
        this.editIndex = params['editIndex'] !== undefined ? +params['editIndex'] : null;
        if (this.editIndex !== null) {
          const storedMovies = localStorage.getItem('movies');
          if (storedMovies) {
            const movies = JSON.parse(storedMovies);
            const movie = movies[this.editIndex];
            this.movieForm.patchValue({
              movieName: movie.movieName,
              duration: movie.duration,
              description: movie.description,
              releaseDate: movie.releaseDate,
              showTimes: movie.showTimes,
              poster: movie.poster,
              posterUrl: movie.posterUrl || '',
              trailer: movie.trailer,
              language: movie.language,
              movieType: movie.movieType
            });
            while (this.actorsFormArray.length) {
              this.actorsFormArray.removeAt(0);
            }
            movie.actors.forEach((actor: any) => {
              this.actorsFormArray.push(this.fb.group({
                name: [actor.name, [Validators.minLength(2), Validators.maxLength(50)]],
                photo: [actor.photo],
                photoUrl: [actor.photoUrl || '']
              }));
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      });
    }
  }

  get actorsFormArray() {
    return this.movieForm.get('actors') as FormArray;
  }

  onFileChange(event: any, field: string, index?: number) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        if (field === 'poster') {
          this.movieForm.get('poster')?.setErrors({ invalidType: true });
        } else if (field === 'actorPhoto' && index !== undefined) {
          this.actorsFormArray.at(index).get('photo')?.setErrors({ invalidType: true });
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (field === 'poster') {
          this.movieForm.patchValue({ poster: e.target.result, posterUrl: '' });
        } else if (field === 'actorPhoto' && index !== undefined) {
          this.actorsFormArray.at(index).patchValue({ photo: e.target.result, photoUrl: '' });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onUrlChange(field: string, index?: number) {
    if (field === 'poster') {
      const url = this.movieForm.get('posterUrl')?.value;
      if (url) {
        this.movieForm.patchValue({ poster: url, posterUrl: url });
      }
    } else if (field === 'actorPhoto' && index !== undefined) {
      const url = this.actorsFormArray.at(index).get('photoUrl')?.value;
      if (url) {
        this.actorsFormArray.at(index).patchValue({ photo: url, photoUrl: url });
      }
    }
  }

  private canScheduleMovie(movieData: any): boolean {
    const { releaseDate, showTimes } = movieData;
    if (isPlatformBrowser(this.platformId)) {
      const storedMovies = localStorage.getItem('movies');
      if (storedMovies) {
        const movies = JSON.parse(storedMovies);
        // Filter out the movie being edited (if any)
        const otherMovies = movies.filter((_: any, index: number) => index !== this.editIndex);

        // Check for conflicts
        for (const showTime of showTimes) {
          const conflict = otherMovies.some((movie: any) => {
            return (
              movie.releaseDate === releaseDate &&
              movie.showTimes.includes(showTime)
            );
          });

          if (conflict) {
            alert(`Cannot schedule "${movieData.movieName}" at ${showTime} on ${this.formatDate(releaseDate)}. This time slot is already taken by another movie. Please choose a different time.`);
            return false;
          }
        }
      }
    }
    return true;
  }

  onSubmit() {
    if (this.movieForm.valid) {
      const movieData = this.movieForm.value;
      if (!this.canScheduleMovie(movieData)) {
        return;
      }
      if (isPlatformBrowser(this.platformId)) {
        let movies = JSON.parse(localStorage.getItem('movies') || '[]');
        if (this.editIndex !== null) {
          movies[this.editIndex] = movieData;
          this.editIndex = null;
        } else {
          movies.push(movieData);
        }
        localStorage.setItem('movies', JSON.stringify(movies));
      }
      this.movieForm.reset({ releaseDate: this.today });
      alert(this.editIndex === null ? 'Movie added successfully!' : 'Movie updated successfully!');
    } else {
      this.movieForm.markAllAsTouched();
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  goToMain() {
    this.router.navigate(['/']);
  }

  goToTodayReport() {
    this.router.navigate(['/today-report']);
  }

  goToAddedMovies() {
    this.router.navigate(['/added-movies']);
  }
}