import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-phish-alert-button',
  templateUrl: './phish-alert-button.component.html',
  styleUrl: './phish-alert-button.component.scss'
})
export class PhishAlertButtonComponent implements OnInit {
  data: any;
  options: any;
  installed: number = 155;
  uninstalled: number = 31;
  totalReported: number = 264;
  simulatedEmails: number = 89;
  nonSimulatedEmails: number = 175;

  ngOnInit(): void {

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const daysInMonth = this.getCurrentDateFormatted();
    this.data = {
      labels: daysInMonth,
      datasets: [
        {
          label: 'Simulated',
          backgroundColor: documentStyle.getPropertyValue('--primary-200'),
          borderColor: documentStyle.getPropertyValue('--primary-200'),
          data: [155, 31, 264, 89, 175, 200, 150, 180, 210, 90, 120, 140, 160, 100, 80, 200, 220, 170, 160, 150, 130, 110, 100, 140, 180, 200, 220, 250, 270, 290]
        },
        {
          label: 'Non Simulated',
          backgroundColor: documentStyle.getPropertyValue('--primary-500'),
          borderColor: documentStyle.getPropertyValue('--primary-500'),
          data: [5, 87, 46, 4, 175, 200, 150, 797, 210, 90, 120, 90, 0, 434, 34, 200, 220, 983, 160, 150, 130, 110, 100, 43, 180, 45, 56, 44, 46, 665]
        }
      ]
    };

    this.options = {
      indexAxis: 'x',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        datalabels: { // If using Chart.js Data Labels plugin
          display: false, // Disable data labels
        },
        legend: {
          labels: {
            color: textColor
          }
        }
      },
    
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          title: {
            display: true,
            text: 'Emails Reported'
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  getCurrentDateFormatted(): string[] {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      return `${String(month + 1).padStart(2, '0')}/${day}/${year}`;
    });
  }
}