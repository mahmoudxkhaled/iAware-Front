import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    HostListener,
    ViewEncapsulation,
} from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import * as $ from 'jquery';
import 'turn.js';
interface Match {
    x: number;
    y: number;
    width: number;
    height: number;
}

@Component({
    selector: 'app-iaware-pdf',
    templateUrl: './iAware-pdf.component.html',
    styleUrl: './iAware-pdf.component.scss',
})
export class IAwarePdfComponent implements OnChanges {
    @Input() pdfUrl: string = '';
    @Output() lastPageReached: EventEmitter<void> = new EventEmitter<void>();

    private totalNumPages: number = 0;
    private currentPage: number = 1;
    currentZoom: number = 1;
    searchTerm: string = '';
    highlights: { page: number; matches: any[] }[] = [];

    ngOnChanges(changes: SimpleChanges) {
        if (changes['pdfUrl'] && this.pdfUrl) {
            this.loadPdf(this.pdfUrl);
        }
    }

    async loadPdf(url: string) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const flipbookContainer = $('#flipbook');
        flipbookContainer.empty();
        const images = [];
        this.totalNumPages = pdf.numPages;
        this.currentPage = 1;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) {
                console.error('Failed to get 2D context');
                return;
            }
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const img = document.createElement('img');
            img.src = canvas.toDataURL();

            // Logic to style page based on page number
            if (pageNum % 2 === 0) {
                img.style.borderRight = '3px solid rgba(0, 0, 0, 0.3)';
                img.style.boxShadow = '2px 0px 8px rgba(0, 0, 0, 0.2)';
            } else {
                img.style.borderLeft = '3px solid rgba(0, 0, 0, 0.3)';
                img.style.boxShadow = '-2px 0px 8px rgba(0, 0, 0, 0.2)';
            }

            // Add smooth transition to border and shadow for more user-friendly interaction
            img.style.transition = 'border 0.3s ease, box-shadow 0.3s ease';
            images.push(img);
        }
        flipbookContainer.append(images);
        this.initializeFlipbook();
    }

    initializeFlipbook() {
        const flipbookContainer = $('#flipbook');
        const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
        (flipbookContainer as any).turn({
            width: '100%',
            height: 600,
            gradients: true,
            autoCenter: true,
            display: isSmallScreen ? 'single' : 'double',
            when: {
                turned: (event: any, page: any, view: any) => {
                    this.currentPage = page;
                    if (this.totalNumPages % 2 !== 0) {
                        if (this.currentPage === this.totalNumPages - 1) {
                            this.onLastPageReached();
                        }
                    } else {
                        if (this.currentPage === this.totalNumPages) {
                            this.onLastPageReached();
                        }
                    }
                },
            },
        });
    }

    // Listen for screen size changes to dynamically adjust the page display mode
    @HostListener('window:resize')
    onResize() {
        const flipbookContainer = $('#flipbook');
        const isSmallScreen = window.matchMedia('(max-width:  414px)').matches;
        (flipbookContainer as any).turn('display', isSmallScreen ? 'single' : 'double');
    }

    nextPage() {
        const flipbookContainer = $('#flipbook');
        if (this.currentPage < this.totalNumPages) {
            this.currentPage++;
            (flipbookContainer as any).turn('next');
        }
    }

    prevPage() {
        const flipbookContainer = $('#flipbook');
        if (this.currentPage > 1) {
            this.currentPage--;
            (flipbookContainer as any).turn('previous'); // Turn to the previous page using tu
        }
    }

    // Function to zoom into a specific point based on click event
    zoomInToPoint(event: MouseEvent) {
        const flipbookContainer = document.getElementById('flipbook-container');
        const flipbook = $('#flipbook');
        if (flipbookContainer) {
            const containerRect = flipbookContainer.getBoundingClientRect();
            // Calculate the click position relative to the container
            const clickX = event.clientX - containerRect.left;
            const clickY = event.clientY - containerRect.top;
            // Calculate percentage position
            const originX = (clickX / containerRect.width) * 100;
            const originY = (clickY / containerRect.height) * 100;
            // Set the new transform origin for zooming into the click point
            flipbook.css('transform-origin', `${originX}% ${originY}%`);
            // Increase the zoom level
            this.currentZoom += 0.1;
            this.applyZoom();
        }
    }

    // Function to apply the zoom to the flipbook
    applyZoom() {
        const flipbook = $('#flipbook');
        flipbook.css('transform', `scale(${this.currentZoom})`);
    }

    // Zoom In function (optional control)
    zoomIn() {
        this.currentZoom += 0.1;
        this.applyZoom();
    }

    // Zoom Out function (optional control)
    zoomOut() {
        if (this.currentZoom > 0.1) {
            this.currentZoom -= 0.1;
            this.applyZoom();
        }
    }

    resetZoom() {
        this.currentZoom = 1;
        this.applyZoom();
    }

    async searchInPdf() {
        const loadingTask = pdfjsLib.getDocument(this.pdfUrl);
        const pdf = await loadingTask.promise;
        this.highlights = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const viewport = page.getViewport({ scale: 1.5 });
            const matches = this.findMatches(textContent, this.searchTerm, viewport);
            if (matches.length > 0) {
                this.highlights.push({ page: pageNum, matches });
            }
        }
        this.renderHighlights();
    }

    findMatches(textContent: any, searchTerm: string, viewport: any): Match[] {
        const matches: Match[] = []; // Use Match[] for the matches array
        const regex = new RegExp(searchTerm, 'gi');
        textContent.items.forEach((item: any) => {
            const match = item.str.match(regex);
            if (match) {
                const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
                const x = tx[4];
                const y = tx[5] - item.height; // Adjust y to position correctly
                const width = item.width;
                const height = item.height;
                matches.push({ x, y, width, height });
            }
        });
        return matches;
    }

    renderHighlights() {
        const flipbookContainer = $('#flipbook');
        this.highlights.forEach((highlightData) => {
            const pageElement = flipbookContainer.find(`img:nth-child(${highlightData.page})`);
            highlightData.matches.forEach((match) => {
                const highlight = document.createElement('div');
                highlight.style.position = 'absolute';
                highlight.style.left = `${match.x}px`;
                highlight.style.top = `${match.y}px`;
                highlight.style.width = `${match.width}px`;
                highlight.style.height = `${match.height}px`;
                highlight.style.backgroundColor = 'rgba(255, 255, 0, 0.4)';
                pageElement.parent().append(highlight);
            });
        });
    }

    private onLastPageReached() {
        this.lastPageReached.emit();
    }
}


// import {
//     Component,
//     Input,
//     OnChanges,
//     HostListener,
//     Renderer2,
// } from '@angular/core';
// import * as pdfjsLib from 'pdfjs-dist';
// import * as $ from 'jquery';
// import 'turn.js';

// @Component({
//     selector: 'app-iAware-pdf',
//     templateUrl: './iAware-pdf.component.html',
//     styleUrls: ['./iAware-pdf.component.scss'],
// })
// export class IAwarePdfComponent implements OnChanges {
//     @Input() pdfUrl: string = '';
//     @Input() direction: 'ltr' | 'rtl' = 'ltr'; // Accept direction as input
//     private currentZoom: number = 1;

//     constructor(private renderer: Renderer2) {}

//     ngOnChanges() {
//         if (this.pdfUrl) {
//             this.loadPdf(this.pdfUrl);
//         }
//         this.updateDirection(); // Adjust direction based on input
//     }

//     async loadPdf(url: string) {
//         pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';
//         const loadingTask = pdfjsLib.getDocument(url);
//         const pdf = await loadingTask.promise;
//         const flipbookContainer = $('#flipbook');
//         flipbookContainer.empty();
//         for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//             const page = await pdf.getPage(pageNum);
//             const viewport = page.getViewport({ scale: 1.5 });
//             const canvas = document.createElement('canvas');
//             const context = canvas.getContext('2d');
//             canvas.height = viewport.height;
//             canvas.width = viewport.width;
//             await page.render({ canvasContext: context!, viewport: viewport }).promise;
//             const img = document.createElement('img');
//             img.src = canvas.toDataURL();
//             flipbookContainer.append(img);
//         }
//         this.initializeFlipbook();
//     }

//     initializeFlipbook() {
//         const flipbookContainer = $('#flipbook');
//         const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
//         (flipbookContainer as any).turn({
//             width: '100%',
//             height: 600,
//             gradients: true,
//             autoCenter: true,
//             display: isSmallScreen ? 'single' : 'double',
//             direction: this.direction, // Dynamic direction
//         });
//     }

//     @HostListener('window:resize')
//     onResize() {
//         const flipbookContainer = $('#flipbook');
//         const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
//         (flipbookContainer as any).turn('display', isSmallScreen ? 'single' : 'double');
//     }

//     updateDirection() {
//         const flipbookContainer = $('#flipbook');
//         const containerElement = document.getElementById('flipbook-container');
//         this.renderer.setStyle(containerElement, 'direction', this.direction);
//         (flipbookContainer as any).turn('option', 'direction', this.direction); // Update turn.js direction
//     }

//     zoomIn() {
//         this.currentZoom += 0.1;
//         this.applyZoom();
//     }

//     zoomOut() {
//         if (this.currentZoom > 0.1) {
//             this.currentZoom -= 0.1;
//             this.applyZoom();
//         }
//     }

//     resetZoom() {
//         this.currentZoom = 1;
//         this.applyZoom();
//     }

//     private applyZoom() {
//         const flipbook = $('#flipbook');
//         flipbook.css('transform', `scale(${this.currentZoom})`);
//     }
// }
