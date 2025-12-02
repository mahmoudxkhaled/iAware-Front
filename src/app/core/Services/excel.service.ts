import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';
import { LayoutService } from 'src/app/layout/app-services/app.layout.service';

@Injectable({
    providedIn: 'root',
})
export class ExcelService {
    private _tenantLogo: string = '../../assets/images/companyDefaultLogo.png';
    private _iawareLogog: string = '../../assets/media/iAwareeeVII.png';
    private _companyName: string = '';
    private _reportGenerationDate = new Date().toLocaleDateString();

    constructor(private layoutService: LayoutService) {
        this.fetchCompanyLogo();
    }

    async importExcel(file: File): Promise<any[]> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);

            const worksheet = workbook.getWorksheet(1);
            const rows: any[] = [];
            let headers: string[] = [];

            worksheet?.eachRow((row, rowNumber) => {
                const rowData = row.values as Array<any>;

                if (rowNumber === 1) {
                    // Extract headers from the first row and convert to lowercase
                    headers = rowData.slice(1).map(header => header?.toString().toLowerCase() ?? '');
                } else {
                    // Initialize row object
                    const dataObject: any = {};

                    // Initialize all headers with default values
                    headers.forEach(header => {
                        if (header === 'roles') {
                            dataObject[header] = []; // Initialize 'roles' with an empty array
                        } else {
                            dataObject[header] = ''; // Initialize other headers with an empty string
                        }
                    });

                    // Update row object with actual data
                    rowData.slice(1).forEach((cellValue, index) => {
                        const header = headers[index];
                        if (header) {
                            if (header === 'role') {
                                // Split roles value by comma and trim any extra spaces
                                dataObject[header] = (cellValue as string)?.split(',').map(role => role.trim()) ?? [];
                            } else if (header === 'email') {
                                // Check if cellValue is an object and extract the 'text' key if available
                                if (typeof cellValue === 'object' && cellValue !== null && 'text' in cellValue) {
                                    dataObject[header] = (cellValue as any).text ?? ''; // Use the 'text' key if it exists
                                } else {
                                    dataObject[header] = cellValue ?? ''; // Use the cell value directly
                                }
                            }
                            else {
                                dataObject[header] = cellValue ?? ''; // Assign empty string if cellValue is null or undefined
                            }
                        }
                    });

                    rows.push(dataObject);
                }
            });

            return rows;
        } catch (error) {
            console.error('Error reading Excel file:', error);
            throw new Error('Failed to read the Excel file. Please make sure it is a valid Excel file.');
        }
    }

    async exportExcel(data: any[], fileName: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Define the header row and apply styles
        const headerRow = Object.keys(data[0]);
        worksheet.addRow(headerRow);

        headerRow.forEach((header, index) => {
            const cell = worksheet.getCell(1, index + 1);
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 20 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '883cae' } };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } },
            };
        });

        // Add data rows with alternating background colors
        data.forEach((row: any, rowIndex: number) => {
            const rowData = Object.values(row);
            const excelRow = worksheet.addRow(rowData);

            // Apply borders to each cell in the row
            rowData.forEach((_, index) => {
                const cell = excelRow.getCell(index + 1);
                cell.border = {
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } },
                };
            });

            // Apply alternating row colors
            if (rowIndex % 2 === 0) {
                excelRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }; // Light gray for even rows
                });
            } else {
                excelRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // White for odd rows
                });
            }
        });

        // Apply autofit to columns and increase width by 10
        worksheet.columns.forEach((column: any) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const columnLength = cell.value ? cell.value.toString().length + 2 : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength + 10; // Increase width by 10
        });

        // Apply autofilter to the header row to enable dropdowns
        worksheet.autoFilter = {
            from: 'A1',
            to: `${String.fromCharCode(65 + headerRow.length - 1)}1`,
        };

        // Write to buffer
        const buffer = await workbook.xlsx.writeBuffer();
        this.saveAsExcelFile(buffer, fileName);
    }

    async exportExcelVI(data: any[], fileName: string, headers: { header: string, dataKey: string }[]) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Convert images to Base64 with correct prefix
        const imageLeftBase64 = `data:image/png;base64,${this._tenantLogo}`;
        const imageRightBase64 = await this.imageToBase64(this._iawareLogog); // Convert right image to Base64
        // Insert metadata rows

        // Add an empty row as a spacer before the table headers
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);
        
        worksheet.addRow([`Company Name: ${this._companyName}`]);
        worksheet.getCell('A6').value = `Report Generated Date: ${this._reportGenerationDate}`;
        worksheet.getCell('D5').value = `Report Generated Date: ${this._reportGenerationDate}`;

        // worksheet.addRow([]);
        worksheet.addRow([]);

        // Add images: one on the left and one on the right
        const imageIdLeft = workbook.addImage({
            base64: imageLeftBase64,
            extension: 'png',
        });
        const imageIdRight = workbook.addImage({
            base64: imageRightBase64,
            extension: 'png',
        });

        // Position the images
        worksheet.addImage(imageIdLeft, {
            tl: { col: 0, row: 0 }, // Position at top-left (row 1, column 1)
            ext: { width: 200, height: 70 }, // Adjust the size (width and height)
        });

        worksheet.addImage(imageIdRight, {
            tl: { col: headers.length - 5, row: 0 }, // Position at top-right
            ext: { width: 200, height: 70 }, // Adjust the size
        });


        // Define and style the header row based on the headers parameter
        const headerRow = headers.map(h => h.header);
        worksheet.addRow(headerRow);

        // Now apply the header styles to the table header row (which is row 5, after metadata)
        headerRow.forEach((header, index) => {
            const cell = worksheet.getCell(8, index + 1); // Row 5 corresponds to the header row after spacers
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }; // Adjusted size for better readability
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '883cae' } };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } },
            };
        })
        // Add data rows with alternating background colors based on headers
        data.forEach((row: any, rowIndex: number) => {
            const rowData = headers.map(header => row[header.dataKey] || '');
            const excelRow = worksheet.addRow(rowData);

            // Apply borders to each cell in the row
            rowData.forEach((_, index) => {
                const cell = excelRow.getCell(index + 1);
                cell.border = {
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } },
                };
            });

            // Apply alternating row colors
            if (rowIndex % 2 === 0) {
                excelRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }; // Light gray for even rows
                });
            } else {
                excelRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // White for odd rows
                });
            }
        });

        // Apply autofit to columns and increase width by 10
        worksheet.columns.forEach((column: any) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell: any) => {
                const columnLength = cell.value ? cell.value.toString().length + 2 : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength + 10; // Increase width by 10
        });

        // Apply autofilter to the header row
        worksheet.autoFilter = {
            from: 'A8',
            to: `${String.fromCharCode(65 + headerRow.length - 1)}8`,
        };

        // Write to buffer
        const buffer = await workbook.xlsx.writeBuffer();
        this.saveAsExcelFile(buffer, fileName);
    }

    async loadExcelAddSheetsAndExport(filePath: string, newSheetsData: { sheetName: string, data: any[] }[], fileName: string) {
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        // Add new sheets with provided data
        newSheetsData.forEach(sheet => {
            const worksheet = workbook.addWorksheet(sheet.sheetName);
            const headerRow = Object.keys(sheet.data[0]);
            worksheet.addRow(headerRow);

            headerRow.forEach((header, index) => {
                const cell = worksheet.getCell(1, index + 1);
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 20 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '883cae' } };
                cell.border = {
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } },
                };
            });

            sheet.data.forEach((row, rowIndex) => {
                const rowData = Object.values(row);
                const excelRow = worksheet.addRow(rowData);

                // Apply borders to each cell in the row
                rowData.forEach((_, index) => {
                    const cell = excelRow.getCell(index + 1);
                    cell.border = {
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } },
                    };
                });

                // Apply alternating row colors
                if (rowIndex % 2 === 0) {
                    excelRow.eachCell({ includeEmpty: true }, (cell) => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }; // Light gray for even rows
                    });
                } else {
                    excelRow.eachCell({ includeEmpty: true }, (cell) => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // White for odd rows
                    });
                }
            });

            // Apply autofit to columns and increase width by 10
            worksheet.columns.forEach((column: any) => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell: any) => {
                    const columnLength = cell.value ? cell.value.toString().length + 2 : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength + 10; // Increase width by 10
            });

        });

        // Write to buffer
        const buffer = await workbook.xlsx.writeBuffer();
        this.saveAsExcelFile(buffer, fileName);
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE,
        });
        FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
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

    private async imageToBase64(imageUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imageUrl;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                const base64Image = canvas.toDataURL('image/png'); // This includes the correct prefix
                resolve(base64Image); // Base64 string with the prefix
            };
            img.onerror = (err) => reject(err);
        });
    }
}