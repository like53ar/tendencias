import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CryptoApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  getData(symbol: string, timeframe: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/data?symbol=${symbol}&timeframe=${timeframe}`);
  }

  getIndicators(symbol: string, timeframe: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/indicators?symbol=${symbol}&timeframe=${timeframe}`);
  }

  getPrediction(symbol: string, timeframe: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/predict?symbol=${symbol}&timeframe=${timeframe}`);
  }
}
