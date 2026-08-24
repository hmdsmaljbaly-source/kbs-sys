/**
 * Bulk Engine for KBS System
 * Handles SKU decomposition and export logic
 */

export const BulkEngine = {
    /**
     * Parses a raw description string into itemized SKU objects
     * Handles: "Product Name x 3" and "[Bundle] Item A + Item B x 2"
     * @param {string} description 
     * @returns {Array} Array of { name, quantity, condition }
     */
    parseDescriptionItems(description) {
        if (!description) return [];
        let items = [];
        const conditionRegex = /\[(.*?)\]/g;
        let conditions = [];
        let match;
        
        // Extract conditions like [Damage Box]
        let cleanDesc = description;
        while ((match = conditionRegex.exec(description)) !== null) {
            const conditionStr = match[1].trim().toLowerCase();
            if (conditionStr !== 'bundle') {
                conditions.push(`[${match[1]}]`);
            }
            cleanDesc = cleanDesc.replace(match[0], '');
        }
        const condition = conditions.join(' ');
        
        // Split by + for bundles or / for multi-items if needed
        // Assuming Shopify format sometimes uses ' + ' for bundles
        const rawItems = cleanDesc.split('+').map(i => i.trim()).filter(i => i.length > 0);
        
        for (let rawItem of rawItems) {
            let name = rawItem;
            let quantity = 1;
            
            // Match trailing x 2, x3, * 2, etc.
            const qtyRegex = /(?:x|\*)\s*(\d+)$/i;
            const qtyMatch = name.match(qtyRegex);
            
            if (qtyMatch) {
                quantity = parseInt(qtyMatch[1], 10);
                name = name.replace(qtyRegex, '').trim();
            }
            
            items.push({
                name: name,
                quantity: quantity,
                condition: condition
            });
        }
        
        return items;
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
