import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  template: `<app-dashboard></app-dashboard>`,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private pingInterval: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Enviar keepalive al servidor cada 10s para que sepa que el browser está abierto.
    // Si el browser se cierra, el watchdog de Flask apaga el servidor a los 25s.
    this.pingInterval = setInterval(() => {
      this.http.get('http://localhost:8765/api/keepalive').subscribe({
        error: () => {} // silencioso si el server ya no responde
      });
    }, 10000);

    // Ping inmediato al arrancar
    this.http.get('http://localhost:8765/api/keepalive').subscribe({ error: () => {} });
  }

  ngOnDestroy() {
    clearInterval(this.pingInterval);
  }
}
