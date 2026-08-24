/**
 * Print Engine for KBS System
 * Handles merging of PDF waybills using pdf-lib and hidden iframe printing.
 */
import { db } from './config.js';
import { ref, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { AuthService } from './auth.js';

export const PrintEngine = {
    /**
     * Merges an array of PDF ArrayBuffers or URLs into a single PDF Blob
     * @param {Array<string|ArrayBuffer>} pdfSources 
     * @param {function} progressCallback (current, total)
     * @returns {Blob} The merged PDF Blob
     */
    async mergePDFs(pdfSources, progressCallback) {
        if (!window.PDFLib) {
            throw new Error("pdf-lib library not loaded");
        }

        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();

        const total = pdfSources.length;
        for (let i = 0; i < total; i++) {
            let source = pdfSources[i];
            let arrayBuffer;

            if (typeof source === 'string') {
                // Fetch URL
                const response = await fetch(source);
                if (!response.ok) throw new Error(`Failed to fetch PDF: ${source}`);
                arrayBuffer = await response.arrayBuffer();
            } else {
                arrayBuffer = source;
            }

            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));

            if (progressCallback) {
                progressCallback(i + 1, total);
            }
        }

        const mergedPdfBytes = await mergedPdf.save();
        return new Blob([mergedPdfBytes], { type: 'application/pdf' });
    },

    /**
     * Prints a PDF Blob using a hidden iframe
     * @param {Blob} pdfBlob 
     */
    printBlob(pdfBlob) {
        return new Promise((resolve) => {
            const blobUrl = URL.createObjectURL(pdfBlob);
            
            let iframe = document.getElementById('print-iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'print-iframe';
                document.body.appendChild(iframe);
            }

            iframe.onload = function() {
                setTimeout(() => {
                    iframe.contentWindow.print();
                    // Optional: revoke URL after some time to save memory
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                    resolve();
                }, 500); // Give the PDF plugin time to load
            };

            iframe.src = blobUrl;
        });
    },

    /**
     * Executes the Single-Print Lock workflow for a batch
     * @param {string} batchId 
     * @param {Array<string>} pdfUrls URLs of the PDFs to merge
     * @param {HTMLElement} printButton The button to disable
     * @param {HTMLElement} progressBar The progress bar element (fill)
     */
    async printBatchWithLock(batchId, pdfUrls, printButton, progressBar) {
        try {
            printButton.disabled = true;
            printButton.textContent = "جاري تحضير الملفات...";

            const blob = await this.mergePDFs(pdfUrls, (current, total) => {
                if (progressBar) {
                    const percent = Math.round((current / total) * 100);
                    progressBar.style.width = `${percent}%`;
                    progressBar.textContent = `${percent}%`;
                }
            });

            printButton.textContent = "جاري إرسال أمر الطباعة...";
            await this.printBlob(blob);

            // Lock the batch in Firebase
            const user = AuthService.getCurrentUser();
            const updates = {};
            updates[`/batches/${batchId}/isPrinted`] = true;
            updates[`/batches/${batchId}/printedAt`] = new Date().toISOString();
            updates[`/batches/${batchId}/printedBy`] = user ? user.name : 'Unknown';

            await update(ref(db), updates);

            printButton.textContent = "تمت الطباعة بنجاح";
            printButton.classList.replace('bg-blue-600', 'bg-green-600');
            
        } catch (error) {
            console.error("Print Error:", error);
            printButton.disabled = false;
            printButton.textContent = "خطأ في الطباعة، حاول مجدداً";
            alert("حدث خطأ أثناء دمج وطباعة الملفات: " + error.message);
        }
    }
};
