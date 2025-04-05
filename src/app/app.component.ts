// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showHeader = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Subscribe to router events to check the current route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Check if the current URL is '/admin'
        this.showHeader = this.router.url !== '/admin';
      }
    });
  }
}