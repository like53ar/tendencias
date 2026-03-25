import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prediction-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="prediction-panel">
      <div class="summary-card">
        <label>PRECIO ACTUAL</label>
        <div class="current-price" [class.up]="priceChange >= 0">{{currentPrice | currency}}</div>
        <div class="trend-tag" [class.up]="trend === 'Alcista'">{{trend}}</div>
      </div>

      <div class="levels-section mt-4">
        <div class="title">Soportes Clave</div>
        <div class="level-list">
          <div *ngFor="let s of supports" class="level support">{{s | currency}}</div>
        </div>

        <div class="title mt-3">Resistencias</div>
        <div class="level-list">
          <div *ngFor="let r of resistances" class="level resistance">{{r | currency}}</div>
        </div>
      </div>

      <div class="model-section mt-4">
        <div class="title">PROYECCIÓN 24H (MODELO)</div>
        <div class="projection-box">
          <div class="range">Rango Estimado</div>
          <div class="values">{{minProjection | currency}} - {{maxProjection | currency}}</div>
          <div class="confidence">Modelo Estadístico (85% Conf)</div>
        </div>
      </div>
      
      <div class="disclaimer mt-auto">
        Los datos presentados son estimaciones estadísticas basadas en comportamiento histórico.
      </div>
    </aside>
  `,
  styles: [`
    .prediction-panel {
      width: 320px;
      height: 100%;
      background: #0d1117;
      border-left: 1px solid #30363d;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .summary-card {
      background: #161b22;
      padding: 1.2rem;
      border-radius: 12px;
      border: 1px solid #30363d;
    }
    .summary-card label { font-size: 0.65rem; color: #8b949e; letter-spacing: 0.5px; }
    .current-price { font-size: 1.8rem; font-weight: 800; margin: 0.5rem 0; font-family: 'JetBrains Mono', monospace; }
    .current-price.up { color: #3fb950; }
    .trend-tag { 
      display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
      background: #090c10; color: #58a6ff;
    }
    .trend-tag.up { color: #3fb950; }

    .levels-section .title { font-size: 0.7rem; color: #8b949e; margin-bottom: 0.8rem; text-transform: uppercase; }
    .level-list { display: flex; flex-direction: column; gap: 8px; }
    .level { padding: 0.6rem 1rem; border-radius: 6px; font-weight: 700; font-size: 0.9rem; border: 1px solid #30363d; }
    .level.support { background: rgba(63, 185, 80, 0.1); color: #3fb950; border-color: rgba(63, 185, 80, 0.2); }
    .level.resistance { background: rgba(248, 81, 73, 0.1); color: #f85149; border-color: rgba(248, 81, 73, 0.2); }

    .model-section .title { font-size: 0.7rem; color: #8b949e; margin-bottom: 0.8rem; }
    .projection-box { background: #161b22; border: 1px dashed #30363d; padding: 1.2rem; border-radius: 12px; border-color: #bc8eff; }
    .projection-box .range { font-size: 0.75rem; color: #bc8eff; }
    .projection-box .values { font-size: 1.2rem; font-weight: 800; color: #f0f6fc; margin-top: 5px; }
    .projection-box .confidence { font-size: 0.65rem; color: #8b949e; margin-top: 8px; }

    .disclaimer { font-size: 0.65rem; color: #484f58; line-height: 1.4; text-align: center; font-style: italic; }
  `]
})
export class PredictionPanelComponent {
  @Input() currentPrice = 0;
  @Input() priceChange = 0;
  @Input() trend = 'Neutral';
  @Input() supports: number[] = [];
  @Input() resistances: number[] = [];
  @Input() minProjection = 0;
  @Input() maxProjection = 0;
}
