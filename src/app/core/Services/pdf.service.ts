import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import { LayoutService } from 'src/app/layout/app-services/app.layout.service';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private _greenCheckMarkIcon: string = 'data:image/png;base64,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'
  private _redCheckMarkIcon: string = 'data:image/png;base64,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'
  private _purpulCheckMarkIcon: string = 'data:image/png;base64,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'
  private _tenantLogo: string = '../../assets/images/companyDefaultLogo.png';
  private _companyName: string = '';
  private _iawareLogog: string = '../../assets/media/iAwareeeVII.png';

  constructor(private layoutService: LayoutService) {
    this.fetchCompanyLogo();
  }

  exportDataToPdf(data: any[], fileName: string = 'data-export.pdf') {
    const pdf = new jsPDF();

    // Dynamically extract column headers from the data keys
    const columns = Object.keys(data[0]).map(key => ({
      header: this.capitalizeFirstLetter(key),
      dataKey: key,
    }));

    // Calculate maximum widths for each column based on header and data
    const columnWidths: Record<string, number> = {};
    columns.forEach(col => {
      // Start by considering the header length
      columnWidths[col.dataKey] = pdf.getStringUnitWidth(col.header) * 3.; // Estimate the header width
    });

    data.forEach(item => {
      Object.keys(item).forEach(key => {
        const itemLength = pdf.getStringUnitWidth(String(item[key])) * 2.5; // Estimate data width
        // Update width if data length is longer than the header
        if (itemLength > columnWidths[key]) {
          columnWidths[key] = itemLength;
        }
      });
    });

    // Prepare the rows for the table from the data array
    const rows = data.map(item => {
      const rowData: Record<string, any> = {};
      Object.keys(item).forEach(key => {
        // Ensure values are converted to string (for boolean or other non-string values)
        rowData[key] = typeof item[key] === 'boolean' ? (item[key] ? 'yes' : 'no') : item[key];
      });
      return rowData;
    });

    // Define column styles based on calculated widths (auto-adjust for content)
    const columnStyles: Record<string, any> = {};
    Object.keys(columnWidths).forEach(key => {
      columnStyles[key] = { cellWidth: columnWidths[key] + 4 }; // Adjust with some padding
    });

    // Add the table to the PDF document using jsPDF autoTable
    (pdf as any).autoTable({
      columns: columns,
      body: rows,
      startY: 20, // The starting point of the table in the PDF
      theme: 'grid', // 'striped', 'grid', or 'plain'
      styles: {
        overflow: 'linebreak', // Enable wrapping within the cell
      },
      headStyles: {
        fillColor: '#883cae', // Use your CSS variable for header color
        fontSize: 10, // Adjust font size if needed
      },
      //columnStyles: columnStyles, // Use dynamically calculated column styles
      margin: { top: 5, left: 2 },
    });

    pdf.save(fileName);
  }

  exportDataToPdfVI(data: any[], fileName: string, headers: { header: string, dataKey: string }[]) {
    const pdf = new jsPDF('landscape');
    const reportGenerationDate = new Date().toLocaleDateString();
    const currentYear = new Date().getFullYear();

    pdf.addImage(this._tenantLogo, 'PNG', 20, 10, 50, 20);
    pdf.addImage(this._iawareLogog, 'PNG', 190, 10, 50, 20);

    pdf.setFontSize(12);
    pdf.text(`Company Name: ${this._companyName}`, 20, 40);
    pdf.text(`Report Name: ${fileName}`, 190, 50);
    pdf.text(`Report Generated on: ${reportGenerationDate}`, 20, 50);

    const bodyData = data.map((item, index) => {
      return [
        (index + 1).toString(), 
        ...headers.map(header => {
          if (typeof item[header.dataKey] === 'boolean') {
            return item[header.dataKey] ? '1' : '0';
          }
          return item[header.dataKey] || '';
        })
      ];
    });
    
    const headersKeys = ["#", ...headers.map(header => header.header)];    
    (pdf as any).autoTable({
      head: [headersKeys],
      body: bodyData,
      startY: 70,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: '#883cae',
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      bodyStyles: {
        minCellHeight: 8,
      },
      margin: { top: 50 },
      theme: 'grid',
      didDrawCell: (data: any) => {
        const { cell, column } = data;
        const columnName = headersKeys[column.dataKey];
        if (cell.section === 'head') {
          pdf.setFontSize(10);
          pdf.setTextColor(255, 221, 255);
        }
        if (cell.section === 'body' && cell.raw === '1') {
          if (columnName === 'Delivered' || columnName === 'Opened') {
            pdf.addImage(this._purpulCheckMarkIcon, 'PNG', cell.x + (cell.width / 2 - 5), cell.y + (cell.height / 2 - 5), 10, 10);
          }
          if (columnName === 'Reported') {
            pdf.addImage(this._greenCheckMarkIcon, 'PNG', cell.x + (cell.width / 2 - 5), cell.y + (cell.height / 2 - 5), 10, 10);
          }
          if (columnName === 'Clicked' || columnName === 'Link Clicked' || columnName === 'QR Scanned' || columnName === 'Data Entered'|| columnName === 'QR Code Scanned') {
            pdf.addImage(this._redCheckMarkIcon, 'PNG', cell.x + (cell.width / 2 - 5), cell.y + (cell.height / 2 - 5), 10, 10);
          }
        }
      },
      didParseCell: (data: any) => {
        const { cell } = data;
        if (cell.section === 'body') {
          if (cell.raw === '1') {
            cell.styles.textColor = [255, 255, 255];
            data.cell.content = '';
          } else if (cell.raw === '0') {
            cell.styles.textColor = [255, 255, 255];
            data.cell.content = '';
          }
        }
        if (data.cell.section === 'body' && data.column.index === 0) {
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.content = (data.row.index + 1).toString();
        }
      },
      didDrawPage: (data: any) => {
        pdf.setDrawColor(150);
        pdf.line(20, pdf.internal.pageSize.height - 10, pdf.internal.pageSize.width - 10, pdf.internal.pageSize.height - 10);
        // Page number
        const pageNumber = pdf.getCurrentPageInfo().pageNumber;
        pdf.setFontSize(10);
        pdf.text(`Page ${pageNumber}`, pdf.internal.pageSize.width - 30, pdf.internal.pageSize.height - 5, { align: 'right' });

        pdf.setFontSize(10);
        pdf.text(`© iAware. All Rights Reserved @${currentYear}`, pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 5, { align: 'center' });
      }
    });
    pdf.save(`${fileName}.pdf`);
  }

  exportDataToPdfById(elementId: string, fileName: string) {
    const elementToPrint = document.getElementById(elementId);
    if (elementToPrint) {
      html2canvas(elementToPrint, { scale: 2, useCORS: true }).then((canvas) => {
        const imageData = canvas.toDataURL('image/png');

        // Calculate width and height of the element to print
        const elementWidth = canvas.width;
        const elementHeight = canvas.height;

        // Create a PDF with dimensions to match the element's aspect ratio
        const pdf = new jsPDF({
          orientation: elementWidth > elementHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [elementWidth, elementHeight]
        });

        // Add the image to the PDF with zero margin and scaled to fit
        pdf.addImage(imageData, 'PNG', 0, 0, elementWidth, elementHeight);

        // Save the PDF with the specified file name
        pdf.save(`${fileName}.pdf`);
      });
    }
  }

  private capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private fetchCompanyLogo() {
    this.layoutService.getCompanyLogoVI().subscribe({
      next: (logo) => {
        if (logo.data) {
          this._companyName = logo.message;
          this._tenantLogo = logo.data;
        }
      },
      error: (e) => {
        console.log(e.message);
      },
    });
  }
}