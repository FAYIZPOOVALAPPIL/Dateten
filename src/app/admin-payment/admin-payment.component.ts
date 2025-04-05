import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet,Routes } from '@angular/router';

interface Payment {
  movieName: string;
  selectedDate: string;
  selectedTime: string;
  selectedSeats: { id: string; type: string; price: number }[];
  totalAmount: number;
  mobileNumber: string;
  emailId: string;
  paymentMethod: string;
  paymentDate: Date | string;
}

@Component({
  selector: 'app-admin-payment',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './admin-payment.component.html',
  styleUrls: ['./admin-payment.component.css']
})
export class AdminPaymentComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  editIndex: number | null = null;
  editedPayment: Payment | null = null;
  filterMovie: string = '';
  filterDate: string = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPayments();
    }
  }

  loadPayments() {
    const storedPayments = localStorage.getItem('payments');
    if (storedPayments) {
      try {
        this.payments = JSON.parse(storedPayments);
        this.applyFilters();
      } catch (e) {
        console.error('Error parsing payments:', e);
        this.payments = [];
        this.filteredPayments = [];
      }
    } else {
      this.payments = [];
      this.filteredPayments = [];
    }
  }

  getFormattedSeats(seats: { id: string; type: string; price: number }[]): string {
    return seats.map(s => `${s.id} (${s.type})`).join(', ');
  }

  startEdit(index: number) {
    this.editIndex = index;
    this.editedPayment = { ...this.filteredPayments[index] };
  }

  saveEdit() {
    if (this.editIndex !== null && this.editedPayment) {
      const filteredPayment = this.filteredPayments[this.editIndex];
      const originalIndex = this.payments.findIndex(p => p === filteredPayment);
      this.payments[originalIndex] = { ...this.editedPayment };
      localStorage.setItem('payments', JSON.stringify(this.payments));
      this.cancelEdit();
      this.applyFilters();
    }
  }

  cancelEdit() {
    this.editIndex = null;
    this.editedPayment = null;
  }

  deletePayment(index: number) {
    if (confirm('Are you sure you want to delete this payment?')) {
      const originalIndex = this.payments.findIndex(p => p === this.filteredPayments[index]);
      this.payments.splice(originalIndex, 1);
      localStorage.setItem('payments', JSON.stringify(this.payments));
      this.applyFilters();
    }
  }

  applyFilters() {
    this.filteredPayments = this.payments.filter(payment => {
      const matchesMovie = this.filterMovie ? payment.movieName.toLowerCase().includes(this.filterMovie.toLowerCase()) : true;
      const matchesDate = this.filterDate ? payment.selectedDate === this.filterDate : true;
      return matchesMovie && matchesDate;
    });
  }

  clearFilters() {
    this.filterMovie = '';
    this.filterDate = '';
    this.applyFilters();
  }
}