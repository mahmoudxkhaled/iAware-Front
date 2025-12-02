import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
const GaugeChart = require('gauge-chart');

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaugeChartComponent implements OnChanges {

  @Input() needleValue: number = 0;
  @Input() chartWidth: number = 300;
  @Input() needleChartTitle: string='';
  @Input() isTextCentered: boolean= true;
  @Input() showInCard: boolean = false;
  @Input() showTitle: boolean = true;

  constructor(private cdr : ChangeDetectorRef ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.needleValue = changes['needleValue'].currentValue;
    let element = document.querySelector('#gaugeArea');
    if (element) {
      element.innerHTML = '';
      this.initiatechart();
    }
  }

  initiatechart() {
    let element = document.querySelector('#gaugeArea');
    let gaugeDelimiters = [20, 40, 60, 80];
    let gaugeColors = [
      'rgb(0, 204, 0)',
      'rgb(255, 255, 0)',
      'rgb(255, 153, 51)',
      'rgb(255, 102, 0)',
      'rgb(255, 51, 51)'
    ];
    let gaugeLabels = ['20', '40', '60', '80'];
    let gaugeOptions = {
      hasNeedle: true,
      needleColor: 'rgb(0, 83, 166)',
      needleUpdateSpeed: 1500,
      arcColors: gaugeColors,
      arcDelimiters: gaugeDelimiters,
      arcLabels: gaugeLabels,
      rangeLabel: ['Low', 'High'],
      //centralLabel: `${this.needleValue}%`,
      padding: 5,
      title: 'Risk Score',
    };
    
    GaugeChart.gaugeChart(element, this.chartWidth, gaugeOptions).updateNeedle(this.needleValue);
    this.cdr.detectChanges();
  }
}