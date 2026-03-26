import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prediction-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="prediction-panel">
      <div class="summary-card">
        <label>PRECIO ACTUAL</label>
        <div class="current-price" [class.up]="priceChange >= 0">{{currentPrice | currency}}</div>
        <div class="trend-tag" [class.up]="trend === 'Alcista Fuerte'">{{trend}}</div>
      </div>

      <!-- ── PRICE TARGET WIDGET ──────────────────────────────── -->
      <div class="target-section">
        <div class="section-title">PRECIO OBJETIVO</div>
        <div class="target-input-row">
          <span class="currency-symbol">$</span>
          <input
            id="target-price-input"
            type="number"
            class="target-input"
            [(ngModel)]="targetPrice"
            (ngModelChange)="onTargetChange()"
            placeholder="Ej: 95000"
            min="0"
            step="any"
          />
        </div>

        <div class="target-result" *ngIf="targetPrice && targetPrice > 0 && currentPrice > 0">
          <!-- Distancia -->
          <div class="target-meta">
            <span class="meta-label">Distancia</span>
            <span class="meta-value" [class.up]="targetPrice > currentPrice" [class.down]="targetPrice < currentPrice">
              {{ targetPrice > currentPrice ? '▲' : '▼' }} {{ distancePct | number:'1.2-2' }}%
            </span>
          </div>

          <!-- Gauge de probabilidad -->
          <div class="gauge-wrap">
            <div class="gauge-track">
              <div
                class="gauge-fill"
                [style.width.%]="probability"
                [style.background]="gaugeColor"
              ></div>
            </div>
            <div class="gauge-labels">
              <span>0%</span>
              <span class="prob-value" [style.color]="gaugeColor">{{ probability | number:'1.0-0' }}%</span>
              <span>100%</span>
            </div>
          </div>

          <!-- Veredicto -->
          <div class="verdict" [style.color]="gaugeColor">
            {{ verdict }}
          </div>

          <!-- Factores -->
          <div class="factors">
            <div class="factor" *ngFor="let f of factors">
              <span class="factor-name">{{ f.name }}</span>
              <span class="factor-badge" [class.positive]="f.positive" [class.negative]="!f.positive">
                {{ f.positive ? '+' : '−' }} {{ f.label }}
              </span>
            </div>
          </div>

          <div class="target-disclaimer">Estimación estadística basada en tendencia, RSI, proyección y distancia al objetivo.</div>
        </div>
      </div>
      <!-- ──────────────────────────────────────────────────────── -->

      <div class="levels-section">
        <div class="section-title">SOPORTES CLAVE</div>
        <div class="level-list">
          <div *ngFor="let s of supports" class="level support">{{s | currency}}</div>
        </div>

        <div class="section-title mt-3">RESISTENCIAS</div>
        <div class="level-list">
          <div *ngFor="let r of resistances" class="level resistance">{{r | currency}}</div>
        </div>
      </div>

      <div class="model-section">
        <div class="section-title">PROYECCIÓN 24H (MODELO)</div>
        <div class="projection-box">
          <div class="range">Rango Estimado</div>
          <div class="values">{{minProjection | currency}} — {{maxProjection | currency}}</div>
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
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      overflow-y: auto;
    }

    .summary-card {
      background: #161b22;
      padding: 1.2rem;
      border-radius: 12px;
      border: 1px solid #30363d;
    }
    .summary-card label { font-size: 0.65rem; color: #8b949e; letter-spacing: 0.5px; }
    .current-price { font-size: 1.8rem; font-weight: 800; margin: 0.5rem 0; font-family: 'JetBrains Mono', monospace; color: #8b949e; }
    .current-price.up { color: #3fb950; }
    .trend-tag {
      display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px;
      font-size: 0.75rem; font-weight: 700; background: #090c10; color: #58a6ff;
    }
    .trend-tag.up { color: #3fb950; }

    /* ── Target Widget ─────────────────────────────────────── */
    .target-section {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1rem;
    }

    .section-title {
      font-size: 0.65rem;
      color: #8b949e;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }

    .target-input-row {
      display: flex;
      align-items: center;
      background: #090c10;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 0 0.75rem;
      transition: border-color 0.2s;
    }
    .target-input-row:focus-within { border-color: #388bff; }

    .currency-symbol {
      color: #8b949e;
      font-size: 1rem;
      font-weight: 700;
      margin-right: 6px;
    }

    .target-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #e6edf3;
      font-size: 1.05rem;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      padding: 0.65rem 0;
    }
    .target-input::placeholder { color: #484f58; }
    .target-input::-webkit-outer-spin-button,
    .target-input::-webkit-inner-spin-button { -webkit-appearance: none; }

    .target-result {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .target-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .meta-label { font-size: 0.7rem; color: #8b949e; }
    .meta-value { font-size: 0.9rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
    .meta-value.up { color: #3fb950; }
    .meta-value.down { color: #f85149; }

    /* Gauge */
    .gauge-wrap { display: flex; flex-direction: column; gap: 4px; }
    .gauge-track {
      height: 8px;
      background: #21262d;
      border-radius: 99px;
      overflow: hidden;
    }
    .gauge-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s;
    }
    .gauge-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.6rem;
      color: #484f58;
    }
    .prob-value { font-size: 0.75rem; font-weight: 800; }

    /* Veredicto */
    .verdict {
      font-size: 0.8rem;
      font-weight: 700;
      text-align: center;
      padding: 0.4rem 0.8rem;
      background: #090c10;
      border-radius: 6px;
      border: 1px solid #21262d;
    }

    /* Factores */
    .factors { display: flex; flex-direction: column; gap: 5px; }
    .factor {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.72rem;
    }
    .factor-name { color: #8b949e; }
    .factor-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
    }
    .factor-badge.positive { background: rgba(63, 185, 80, 0.12); color: #3fb950; }
    .factor-badge.negative { background: rgba(248, 81, 73, 0.12); color: #f85149; }

    .target-disclaimer { font-size: 0.6rem; color: #484f58; line-height: 1.4; font-style: italic; }
    /* ─────────────────────────────────────────────────────── */

    /* Levels */
    .levels-section .section-title { margin-top: 0; }
    .level-list { display: flex; flex-direction: column; gap: 6px; }
    .level { padding: 0.5rem 1rem; border-radius: 6px; font-weight: 700; font-size: 0.88rem; border: 1px solid #30363d; }
    .level.support { background: rgba(63, 185, 80, 0.08); color: #3fb950; border-color: rgba(63, 185, 80, 0.2); }
    .level.resistance { background: rgba(248, 81, 73, 0.08); color: #f85149; border-color: rgba(248, 81, 73, 0.2); }
    .mt-3 { margin-top: 0.75rem; }

    /* Proyección */
    .model-section .section-title { }
    .projection-box { background: #161b22; border: 1px dashed #bc8eff; padding: 1rem; border-radius: 12px; }
    .projection-box .range { font-size: 0.75rem; color: #bc8eff; }
    .projection-box .values { font-size: 1.1rem; font-weight: 800; color: #f0f6fc; margin-top: 5px; }
    .projection-box .confidence { font-size: 0.65rem; color: #8b949e; margin-top: 8px; }

    .disclaimer { font-size: 0.65rem; color: #484f58; line-height: 1.4; text-align: center; font-style: italic; }
    .mt-auto { margin-top: auto; }
  `]
})
export class PredictionPanelComponent implements OnChanges {
  @Input() currentPrice = 0;
  @Input() priceChange = 0;
  @Input() trend = 'Neutral';
  @Input() supports: number[] = [];
  @Input() resistances: number[] = [];
  @Input() minProjection = 0;
  @Input() maxProjection = 0;
  @Input() lastRsi = 50;

  targetPrice: number | null = null;

  // Calculados
  distancePct = 0;
  probability = 0;
  gaugeColor = '#8b949e';
  verdict = '';
  factors: { name: string; label: string; positive: boolean }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // Recalcular si cambia moneda/precio
    this.onTargetChange();
  }

  onTargetChange(): void {
    if (!this.targetPrice || this.targetPrice <= 0 || !this.currentPrice) return;
    this.calculate();
  }

  private calculate(): void {
    const target = this.targetPrice!;
    const current = this.currentPrice;
    const isUp = target > current;

    this.distancePct = Math.abs((target - current) / current) * 100;
    this.factors = [];
    let score = 50; // base neutral

    // ── Factor 1: Tendencia ──────────────────────────────────
    const trendBullish = this.trend === 'Alcista Fuerte';
    const trendBearish = this.trend === 'Bajista Fuerte';
    if (isUp && trendBullish) {
      score += 18;
      this.factors.push({ name: 'Tendencia', label: 'Alcista alineada', positive: true });
    } else if (!isUp && trendBearish) {
      score += 18;
      this.factors.push({ name: 'Tendencia', label: 'Bajista alineada', positive: true });
    } else if (isUp && trendBearish) {
      score -= 18;
      this.factors.push({ name: 'Tendencia', label: 'En contra (bajista)', positive: false });
    } else if (!isUp && trendBullish) {
      score -= 18;
      this.factors.push({ name: 'Tendencia', label: 'En contra (alcista)', positive: false });
    } else {
      this.factors.push({ name: 'Tendencia', label: 'Neutral', positive: true });
    }

    // ── Factor 2: RSI ────────────────────────────────────────
    const rsi = this.lastRsi;
    if (isUp && rsi < 70 && rsi > 30) {
      score += 12;
      this.factors.push({ name: 'RSI', label: `${rsi.toFixed(0)} — zona libre`, positive: true });
    } else if (!isUp && (rsi > 70)) {
      score += 12;
      this.factors.push({ name: 'RSI', label: `${rsi.toFixed(0)} — sobrecompra`, positive: true });
    } else if (isUp && rsi >= 70) {
      score -= 15;
      this.factors.push({ name: 'RSI', label: `${rsi.toFixed(0)} — sobrecompra`, positive: false });
    } else if (!isUp && rsi <= 30) {
      score -= 15;
      this.factors.push({ name: 'RSI', label: `${rsi.toFixed(0)} — sobreventa`, positive: false });
    } else {
      this.factors.push({ name: 'RSI', label: `${rsi.toFixed(0)} — neutro`, positive: true });
    }

    // ── Factor 3: Proyección de precio ───────────────────────
    const projMid = (this.minProjection + this.maxProjection) / 2;
    if (projMid > 0) {
      const projIsUp = projMid > current;
      if (isUp && projIsUp && target <= this.maxProjection * 1.05) {
        score += 14;
        this.factors.push({ name: 'Proyección', label: 'Dentro del rango', positive: true });
      } else if (!isUp && !projIsUp && target >= this.minProjection * 0.95) {
        score += 14;
        this.factors.push({ name: 'Proyección', label: 'Dentro del rango', positive: true });
      } else if (isUp && !projIsUp) {
        score -= 12;
        this.factors.push({ name: 'Proyección', label: 'Modelo proyecta baja', positive: false });
      } else if (!isUp && projIsUp) {
        score -= 12;
        this.factors.push({ name: 'Proyección', label: 'Modelo proyecta alza', positive: false });
      } else {
        score -= 5;
        this.factors.push({ name: 'Proyección', label: 'Fuera del rango', positive: false });
      }
    }

    // ── Factor 4: Distancia ──────────────────────────────────
    let distPenalty = 0;
    if (this.distancePct <= 2) {
      distPenalty = 10;
      this.factors.push({ name: 'Distancia', label: `${this.distancePct.toFixed(1)}% — muy cercano`, positive: true });
    } else if (this.distancePct <= 5) {
      distPenalty = 5;
      this.factors.push({ name: 'Distancia', label: `${this.distancePct.toFixed(1)}% — alcanzable`, positive: true });
    } else if (this.distancePct <= 15) {
      distPenalty = -8;
      this.factors.push({ name: 'Distancia', label: `${this.distancePct.toFixed(1)}% — moderada`, positive: false });
    } else {
      distPenalty = -20;
      this.factors.push({ name: 'Distancia', label: `${this.distancePct.toFixed(1)}% — muy lejano`, positive: false });
    }
    score += distPenalty;

    // ── Factor 5: Niveles (soporte/resistencia en el camino) ──
    const allLevels = [...this.supports, ...this.resistances];
    const blocked = allLevels.filter(l =>
      isUp ? (l > current && l < target) : (l < current && l > target)
    );
    if (blocked.length >= 2) {
      score -= 10;
      this.factors.push({ name: 'Niveles', label: `${blocked.length} barreras en el camino`, positive: false });
    } else if (blocked.length === 1) {
      score -= 4;
      this.factors.push({ name: 'Niveles', label: '1 barrera en el camino', positive: false });
    } else {
      score += 5;
      this.factors.push({ name: 'Niveles', label: 'Camino despejado', positive: true });
    }

    // ── Clamp final ──────────────────────────────────────────
    this.probability = Math.min(95, Math.max(5, Math.round(score)));

    // Color y veredicto
    if (this.probability >= 70) {
      this.gaugeColor = '#3fb950';
      this.verdict = '✅ Alta probabilidad de alcanzarlo';
    } else if (this.probability >= 50) {
      this.gaugeColor = '#f0b429';
      this.verdict = '⚠️ Probabilidad moderada';
    } else if (this.probability >= 30) {
      this.gaugeColor = '#f85149';
      this.verdict = '❌ Probabilidad baja';
    } else {
      this.gaugeColor = '#8b949e';
      this.verdict = '🚫 Muy improbable en el corto plazo';
    }
  }
}
