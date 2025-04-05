import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { MainComponent } from './main/main.component';
import { BookingComponent } from './booking/booking.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { PaymentComponent } from './payment/payment.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { TodayReportComponent } from './today-report/today-report.component';
import { AddedMoviesComponent } from './added-movies/added-movies.component';

export const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'movie-details/:index', component: MovieDetailsComponent },
  { path: 'booking/:index', component: BookingComponent },
  { path: 'payment/:index', component: PaymentComponent },
  { path: 'login', component: LoginComponent },
  { path: 'today-report', component: TodayReportComponent },
  { path: 'added-movies', component: AddedMoviesComponent },
  { path: '**', redirectTo: '/main' }
];