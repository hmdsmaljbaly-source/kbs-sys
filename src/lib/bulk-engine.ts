export const BulkEngine = {
    parseDescriptionItems(descString: string) {
        if (!descString) return [];
        const lines = String(descString).split(/\r?\n/);
        const result: { name: string; quantity: number }[] = [];

        const processProductName = (rawName: string, qty: number) => {
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

    aggregateSKUs(orders: any[]) {
        const skuMap = new Map();
        
        for (const order of orders) {
            let items: any[] = [];
            if (Array.isArray(order.items) && order.items.length > 0) {
                items = order.items.map((i: any) => ({ name: i.name || i.product, quantity: i.qty || i.quantity || 1 }));
            } else if (order.products || order.description) {
                items = this.parseDescriptionItems(order.products || order.description);
            }

            for (const item of items) {
                if (!item.name) continue;
                const key = item.name.toLowerCase().trim();
                if (skuMap.has(key)) {
                    const existing = skuMap.get(key);
                    existing.quantity += (item.quantity || 1);
                } else {
                    skuMap.set(key, { name: item.name, quantity: item.quantity || 1, condition: '-' });
                }
            }
        }
        
        return Array.from(skuMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
};
