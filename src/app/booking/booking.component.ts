import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FilterByTypePipe } from '../filter-by-type.pipe';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FilterByTypePipe],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  movie: any = null;
  movieIndex: number = -1;
  bookingForm: FormGroup;
  availableShowtimes: { date: Date, time: string }[] = [];
  selectedShowtime: { date: Date, time: string } | null = null;

  seats: { id: string, type: string, price: number }[] = [
    ...Array(40).fill('').map((_, i) => ({ id: `S${i + 1}`, type: 'Silver', price: 150 })), // 4 rows x 10 seats
    ...Array(30).fill('').map((_, i) => ({ id: `G${i + 1}`, type: 'Gold', price: 250 })),   // 3 rows x 10 seats
    ...Array(20).fill('').map((_, i) => ({ id: `P${i + 1}`, type: 'Platinum', price: 350 })) // 2 rows x 10 seats
  ];
  selectedSeats: { id: string, type: string, price: number }[] = [];
  totalAmount = 0;
  bookedSeats: Set<string> = new Set();

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.bookingForm = this.fb.group({
      showtime: ['', Validators.required], // Combined date-time selection
      numSeats: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.movieIndex = +this.route.snapshot.paramMap.get('index')!;
      const storedMovies = localStorage.getItem('movies');
      if (storedMovies) {
        let movies = JSON.parse(storedMovies).flat();
        this.movie = movies[this.movieIndex];
        if (this.movie) {
          this.setAvailableShowtimes();
        }
      }
    }

    this.bookingForm.get('showtime')?.valueChanges.subscribe(value => {
      if (value) {
        const [dateStr, time] = value.split('|');
        this.selectedShowtime = { date: new Date(dateStr), time };
        this.loadBookedSeats();
      }
    });
  }

  setAvailableShowtimes() {
    const today = new Date();
    const releaseDate = new Date(this.movie.releaseDate);
    const startDate = releaseDate > today ? releaseDate : today;
    this.availableShowtimes = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.movie.showTimes.forEach((time: string) => {
        this.availableShowtimes.push({ date, time });
      });
    }
  }

  loadBookedSeats() {
    if (this.selectedShowtime) {
      const key = `${this.movie.movieName}-${this.selectedShowtime.date.toISOString().split('T')[0]}-${this.selectedShowtime.time}`;
      const booked = localStorage.getItem(key);
      this.bookedSeats = new Set(booked ? JSON.parse(booked) : []);
      this.selectedSeats = [];
      this.totalAmount = 0;
    }
  }

  toggleSeat(seat: { id: string, type: string, price: number }) {
    const numSeats = this.bookingForm.get('numSeats')?.value || 0;
    if (this.isSeatSelected(seat)) {
      this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    } else if (this.selectedSeats.length < numSeats && !this.bookedSeats.has(seat.id)) {
      this.selectedSeats.push(seat);
    }
    this.totalAmount = this.selectedSeats.reduce((sum, s) => sum + s.price, 0);
  }

  isSeatSelected(seat: { id: string, type: string, price: number }): boolean {
    return this.selectedSeats.some(s => s.id === seat.id);
  }

  isSeatDisabled(seat: { id: string, type: string, price: number }): boolean {
    const numSeats = this.bookingForm.get('numSeats')?.value || 0;
    return (
      this.bookedSeats.has(seat.id) || 
      (this.selectedSeats.length >= numSeats && !this.isSeatSelected(seat))
    );
  }

  get selectedSeatsDisplay(): string {
    return this.selectedSeats.length > 0 
      ? this.selectedSeats.map(s => `${s.id} (${s.type})`).join(', ') 
      : 'None';
  }

  proceedToPayment() {
    const numSeats = this.bookingForm.get('numSeats')?.value || 0;
    if (this.selectedSeats.length !== numSeats || this.totalAmount === 0) {
      alert('Please select the correct number of seats before proceeding.');
      return;
    }
    const key = `${this.movie.movieName}-${this.selectedShowtime?.date.toISOString().split('T')[0]}-${this.selectedShowtime?.time}`;
    const currentBooked = localStorage.getItem(key);
    const bookedSeats = currentBooked ? JSON.parse(currentBooked) : [];
    const newBookedSeats = [...bookedSeats, ...this.selectedSeats.map(s => s.id)];
    localStorage.setItem(key, JSON.stringify(newBookedSeats));
  
    this.router.navigate(['/payment', this.movieIndex], {
      queryParams: {
        date: this.selectedShowtime?.date.toISOString().split('T')[0],
        time: this.selectedShowtime?.time,
        seats: JSON.stringify(this.selectedSeats),
        total: this.totalAmount
      }
    });
  }
}