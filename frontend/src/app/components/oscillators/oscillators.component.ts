import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { createChart, IChartApi, ISeriesApi, LineSeries } from 'lightweight-charts';

@Component({
  selector: 'app-oscillators',
  standalone: true,
  template: `<div class="labels">RSI (14)</div><div #chartContainer class="chart-container"></div>`,
  styles: [`
    .chart-container {
      width: 100%;
      height: 140px;
    }
    .labels {
      font-size: 0.65rem;
      font-weight: 800;
      color: #8b949e;
      padding: 0.5rem 1rem;
      background: #090c10;
    }
  `]
})
export class OscillatorsComponent implements OnInit, OnChanges {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() rsiData: any[] = [];

  private chart!: IChartApi;
  private rsiSeries!: ISeriesApi<'Line'>;

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && changes['rsiData']?.currentValue?.length) {
      this.rsiSeries.setData(this.rsiData);
    }
  }

  private initChart(): void {
    this.chart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { color: '#090c10' },
        textColor: '#8b949e',
        fontSize: 10
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: '#30363d' },
      },
      timeScale: { visible: false },
    });

    this.rsiSeries = this.chart.addSeries(LineSeries, {
      color: '#bc8eff',
      lineWidth: 2,
    });

    // Add 70 and 30 lines (Overbought/Oversold)
    this.rsiSeries.createPriceLine({
        price: 70,
        color: '#f85149',
        lineWidth: 1,
        lineStyle: 1,
        axisLabelVisible: true,
        title: 'OVERBOUGHT',
    });

    this.rsiSeries.createPriceLine({
        price: 30,
        color: '#3fb950',
        lineWidth: 1,
        lineStyle: 1,
        axisLabelVisible: true,
        title: 'OVERSOLD',
    });

    this.chart.priceScale('right').applyOptions({
        autoScale: true,
        scaleMargins: {
            top: 0.1,
            bottom: 0.1,
        },
    });

    this.rsiSeries.priceScale().applyOptions({
        autoScale: true
    });
  }
}
