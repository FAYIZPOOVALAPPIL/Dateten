import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-today-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './today-report.component.html',
  styleUrls: ['./today-report.component.css']
})
export class TodayReportComponent implements OnInit {
  todayBookings: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchTodayBookings();
    }
  }

  fetchTodayBookings() {
    const today = new Date().toISOString().split('T')[0];
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    
    const bookingMap = new Map<string, { movieName: string; time: string; seats: number }>();
    payments.forEach((payment: any) => {
      const paymentDate = payment.selectedDate;
      if (paymentDate === today) {
        const key = `${payment.movieName}-${payment.selectedTime}`;
        const existing = bookingMap.get(key);
        if (existing) {
          existing.seats += payment.selectedSeats?.length || 1;
        } else {
          bookingMap.set(key, { 
            movieName: payment.movieName, 
            time: payment.selectedTime,
            seats: payment.selectedSeats?.length || 1 
          });
        }
      }
    });

    this.todayBookings = Array.from(bookingMap.values()).map((booking, index) => ({
      slNo: index + 1,
      movieName: booking.movieName,
      bookingTime: booking.time,
      bookedSeats: booking.seats
    }));
  }

  exportToExcel() {
    if (this.todayBookings.length === 0) {
      alert('No bookings to export');
      return;
    }

    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const today = new Date().toISOString().split('T')[0].split('-').reverse().join('/');
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8">
          <!--[if gte mso 9]>
            <xml>
              <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                  <x:ExcelWorksheet>
                    <x:Name>Today Bookings</x:Name>
                    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                  </x:ExcelWorksheet>
                </x:ExcelWorksheets>
              </x:ExcelWorkbook>
            </xml>
          <![endif]-->
        </head>
        <body>
          <table border="1" style="width: 50%; border-collapse: collapse;">
            <tr>
              <td colspan="4" style="color: red; font-size: 16pt; text-align: center; font-weight: bold; height: 50pt; vertical-align: middle;">
                Today's Booking Reports (${escapeHtml(today)})
              </td>
            </tr>
            <tr>
              <th style="background-color: #ADD8E6; color: black; font-weight: bold;">Sl No</th>
              <th style="background-color: #ADD8E6; color: black; font-weight: bold;">Movie Name</th>
              <th style="background-color: #ADD8E6; color: black; font-weight: bold;">Booking Time</th>
              <th style="background-color: #ADD8E6; color: black; font-weight: bold;">Booked Seats</th>
            </tr>
            ${this.todayBookings
              .map(
                (booking, index) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td>${escapeHtml(booking.movieName)}</td>
                  <td>${escapeHtml(booking.bookingTime)}</td>
                  <td style="text-align: center;">${booking.bookedSeats}</td>
                </tr>
              `
              )
              .join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const fileName = `Today_Bookings_${new Date().toISOString().split('T')[0]}.xls`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  exportToPDF() {
    if (this.todayBookings.length === 0) {
      alert('No bookings to export');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(255, 0, 0);
    doc.text("Today's Booking Reports", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 30,
      head: [['Sl No', 'Movie Name', 'Booking Time', 'Booked Seats']],
      body: this.todayBookings.map(booking => [
        booking.slNo,
        booking.movieName,
        booking.bookingTime,
        booking.bookedSeats
      ]),
      theme: 'striped',
      headStyles: { 
        fillColor: [173, 216, 230],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      styles: { cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 70 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 }
      }
    });

    doc.save(`Today_Bookings_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}