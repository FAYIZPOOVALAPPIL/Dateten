import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'https://your-rapidapi-endpoint.com';
  private apiKey = 'YOUR_RAPIDAPI_KEY';

  constructor(private http: HttpClient) { }

  getMovieImages(movieId: string): Observable<any> {
    const headers = new HttpHeaders({
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': 'your-rapidapi-host'
    });

    return this.http.get(`${this.apiUrl}/movie/${movieId}/images`, { headers });
  }
}
