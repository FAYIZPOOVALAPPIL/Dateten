import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  movie: any = null;
  movieIndex: number = -1;
  selectedDate: string | null = null;
  selectedTime: string | null = null;
  selectedSeats: { id: string; type: string; price: number }[] = [];
  totalAmount: number = 0;
  mobileNumber: string = '';
  emailId: string = '';
  paymentMethod: string = '';
  paymentSuccessful: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.movieIndex = +this.route.snapshot.paramMap.get('index')!;
      this.route.queryParams.subscribe(params => {
        this.selectedDate = params['date'] || null;
        this.selectedTime = params['time'] || null;
        this.selectedSeats = params['seats'] ? JSON.parse(params['seats']) : [];
        this.totalAmount = +params['total'] || 0;
      });
      const storedMovies = localStorage.getItem('movies');
      if (storedMovies) {
        const movies = JSON.parse(storedMovies).flat();
        this.movie = movies[this.movieIndex];
      }
    } else {
      this.movie = { movieName: 'Loading...' };
    }
  }

  get selectedSeatsDisplay(): string {
    return this.selectedSeats.length > 0 
      ? this.selectedSeats.map(s => `${s.id} (${s.type})`).join(', ')
      : 'None';
  }

  payNow() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.mobileNumber || !this.emailId || !this.paymentMethod) {
      alert('Please enter mobile number, email ID, and select a payment method.');
      return;
    }
    if (!/^\d{10}$/.test(this.mobileNumber)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(this.emailId)) {
      alert('Please enter a valid email ID.');
      return;
    }

    const paymentData = {
      movieName: this.movie.movieName,
      movieIndex: this.movieIndex,
      selectedDate: this.selectedDate,
      selectedTime: this.selectedTime,
      selectedSeats: this.selectedSeats,
      totalAmount: this.totalAmount,
      mobileNumber: this.mobileNumber,
      emailId: this.emailId,
      paymentMethod: this.paymentMethod,
      paymentDate: new Date().toISOString()
    };

    const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    existingPayments.push(paymentData);
    localStorage.setItem('payments', JSON.stringify(existingPayments));

    this.paymentSuccessful = true;
  }

  async exportToPDF() {
    if (!isPlatformBrowser(this.platformId)) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - 70; // Leave space for QR code and margins (20 left + 50 QR width)

    // Payment details
    const paymentDetails = {
      movieName: this.movie.movieName,
      date: this.selectedDate ? new Date(this.selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
      time: this.selectedTime || '',
      seats: this.selectedSeatsDisplay,
      total: this.totalAmount,
      mobile: this.mobileNumber,
      email: this.emailId,
      method: this.paymentMethod,
      paymentDate: new Date().toISOString().split('T')[0]
    };

    // Title
    doc.setFontSize(18);
    doc.setTextColor(211, 47, 47); // Red color
    doc.text('Payment Receipt', pageWidth / 2, 20, { align: 'center' });

    // Details with bold red headings
    doc.setFontSize(12);
    let y = 30;

    // Movie
    doc.setTextColor(211, 47, 47);
    doc.setFont('helvetica', 'bold');
    doc.text('Movie:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${paymentDetails.movieName}`, 50, y);
    y += 10;

    // Date
    doc.setTextColor(211, 47, 47);
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${paymentDetails.date}`, 50, y);
    y += 10;

    // Time
    doc.setTextColor(211, 47, 47);
    doc.setFont('helvetica', 'bold');
    doc.text('Time:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${paymentDetails.time}`, 50, y);
    y += 10;

    // Seats (with wrapping)
    doc.setTextColor(211, 47, 47);
    doc.setFont('helvetica', 'bold');
    doc.text('Seats:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const seatsText = `${paymentDetails.seats}`;
    const splitSeats = doc.splitTextToSize(seatsText, maxLineWidth - 30); // 30 accounts for the offset from x=50
    splitSeats.forEach((line: string, index: number) => {
      doc.text(line, 50, y + (index * 10));
    });
    y += splitSeats.length * 10; // Adjust y based on number of lines

    // Total Paid
    doc.setTextColor(211, 47, 47);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Paid:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${paymentDetails.total}`, 50, y);
    y += 10;

    // Mobile
    doc.setTextColor(211, 47, 47);
    doc.setFont('helvetica', 'bold');
    doc.text('Mobile:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${paymentDetails.mobile}`, 50, y);
    y += 10;

    // Email
    doc.setTextColor(211, 47, 47);
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${paymentDetails.email}`, 50, y);
    y += 10;

    // Payment Date
    doc.setTextColor(211, 47, 47);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Date:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`${paymentDetails.paymentDate}`, 50, y);

    // Generate QR Code (50x50)
    const qrData = JSON.stringify(paymentDetails);
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, qrData, { width: 50, margin: 1 });
    const qrImage = qrCanvas.toDataURL('image/png');
    
    // Add QR Code to PDF
    y += 20;
    doc.addImage(qrImage, 'PNG', pageWidth - 70, y - 10, 50, 50);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Scan QR for details', pageWidth - 45, y + 45, { align: 'center' });

    // Save PDF
    doc.save(`Payment_Receipt_${paymentDetails.movieName}_${paymentDetails.paymentDate}.pdf`);
  }

  backToHome() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/']);
    }
  }
}