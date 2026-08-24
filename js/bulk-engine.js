/**
 * Bulk Engine for KBS System
 * Handles SKU decomposition and export logic
 */

export const BulkEngine = {
    /**
     * Parses a raw description string into itemized SKU objects
     * Handles: "Product Name x 3" and "[Bundle] Item A + Item B x 2"
     * @param {string} descString 
     * @returns {Array} Array of { name, qty } (Note: quantity is returned as qty)
     */
    parseDescriptionItems(descString) {
        if (!descString) return [];
        const lines = String(descString).split(/\r?\n/);
        const result = [];

        const processProductName = (rawName, qty) => {
            const isBundle = /^\s*\[.*?\]/.test(rawName);
            let cleanName = rawName.replace(/^\s*\[.*?\]\s*/, '');
            
            if (isBundle) {
                let parts = cleanName.split(/\s+\+\s+/);
                parts.forEach(part => {
                    let finalName = part.replace(/^[-_\s]+/, '').trim();
                    if (finalName) result.push({ name: finalName, quantity: qty });
                });
            } else {
                let finalName = cleanName.replace(/^[-_\s]+/, '').trim();
                if (finalName) result.push({ name: finalName, quantity: qty });
            }
        };

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            const regex = /(.*?)\s*x\s*(\d+)/gi;
            let match;
            let lastIndex = 0;
            let foundAny = false;

            while ((match = regex.exec(line)) !== null) {
                foundAny = true;
                processProductName(match[1], parseInt(match[2], 10));
                lastIndex = regex.lastIndex;
            }

            if (foundAny) {
                if (lastIndex < line.length) {
                    let remaining = line.substring(lastIndex).trim();
                    if (remaining) processProductName(remaining, 1);
                }
            } else {
                processProductName(line, 1);
            }
        });
        return result;
    },

    /**
     * Extract only digits from filename, stripping Arabic chars
     * e.g., "123728 ب.pdf" -> "123728"
     * @param {string} fileName 
     * @returns {string} 
     */
    extractOrderIdFromFileName(fileName) {
        if(!fileName) return '';
        let nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        return nameWithoutExt.replace(/\D/g, '').trim();
    },

    /**
     * Aggregates items from multiple orders into a consolidated list
     * @param {Array} orders Array of order objects with parsedProducts
     * @returns {Array} Aggregated array of { name, quantity, condition }
     */
    aggregateSKUs(orders) {
        const skuMap = new Map();
        
        for (const order of orders) {
            if (!order.parsedProducts) continue;
            for (const item of order.parsedProducts) {
                const key = `${item.name.toLowerCase()}_${item.condition}`;
                if (skuMap.has(key)) {
                    const existing = skuMap.get(key);
                    existing.quantity += item.quantity;
                } else {
                    skuMap.set(key, { ...item });
                }
            }
        }
        
        // Convert map to array and sort by name
        return Array.from(skuMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    },

    /**
     * Exports the aggregated list to Excel
     * @param {Array} aggregatedList 
     * @param {string} filename 
     */
    exportToExcel(aggregatedList, filename = 'Bulk_Pick_List.xlsx') {
        if (!window.XLSX) {
            console.error("XLSX library not loaded");
            return;
        }
        
        const worksheetData = aggregatedList.map(item => ({
            "اسم المنتج": item.name,
            "الكمية": item.quantity,
            "ملاحظات": item.condition
        }));
        
        const worksheet = window.XLSX.utils.json_to_sheet(worksheetData);
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, "Pick List");
        window.XLSX.writeFile(workbook, filename);
    },

    /**
     * Exports the aggregated list to PDF
     * @param {Array} aggregatedList 
     * @param {string} filename 
     */
    exportToPDF(aggregatedList, filename = 'Bulk_Pick_List.pdf') {
        if (!window.jspdf) {
            console.error("jsPDF library not loaded");
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Optional: add custom font here for Arabic support
        doc.setFont("helvetica", "bold");
        doc.text("KBS Bulk Pick List", 105, 15, { align: 'center' });
        
        const tableBody = aggregatedList.map(item => [
            item.name,
            item.quantity.toString(),
            item.condition
        ]);
        
        doc.autoTable({
            head: [['Product Name', 'Quantity', 'Notes']],
            body: tableBody,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [30, 58, 138] }, // Tailwind blue-900
            styles: { font: 'helvetica' }
        });
        
        doc.save(filename);
    }
};
