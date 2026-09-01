// pdf-generator.js
// High-Capacity PDF Engine using pdfmake

window.downloadFilteredAuditPDF = function() {
    let rows = [];
    
    if (typeof window.currentFilteredReportsList !== 'undefined' && window.currentFilteredReportsList.length > 0) {
        rows = window.currentFilteredReportsList;
    } else {
        // Fallback: extract from DOM
        const trElements = document.querySelectorAll('#reportsTableBody tr:not(.empty-row), #ordersTableBody tr:not(.empty-row)');
        trElements.forEach(tr => {
            const cells = tr.querySelectorAll('td');
            if (cells.length >= 6) {
                rows.push({
                    orderId: cells[0]?.innerText?.replace('#', '').trim() || '',
                    trackingNumber: cells[1]?.innerText?.trim() || '',
                    cod: cells[2]?.innerText?.trim() || 'N/A',
                    products: cells[3]?.innerText?.trim() || '',
                    notes: cells[4]?.querySelector('input')?.value || cells[4]?.innerText?.trim() || '—',
                    status: cells[5]?.innerText?.trim() || 'Pending',
                    assignedWorker: cells[6]?.innerText?.trim() || '-',
                    scanTime: cells[7]?.innerText?.trim() || '-'
                });
            }
        });
    }

    if (!rows || rows.length === 0) {
        alert("لا توجد بيانات مطابقة للفلتر لتحميلها في التقرير!");
        return;
    }

    try {
        if (typeof window.pdfMake === 'undefined') {
            throw new Error("pdfmake is not loaded");
        }

        const body = [];
        // Table Header
        body.push([
            { text: 'الحالة', style: 'tableHeader', alignment: 'center' },
            { text: 'الوقت', style: 'tableHeader', alignment: 'center' },
            { text: 'المسؤول', style: 'tableHeader', alignment: 'center' },
            { text: 'الملاحظات', style: 'tableHeader', alignment: 'center' },
            { text: 'المنتجات (Products)', style: 'tableHeader', alignment: 'left' },
            { text: 'التحصيل COD', style: 'tableHeader', alignment: 'center' },
            { text: 'رقم التتبع', style: 'tableHeader', alignment: 'left' },
            { text: 'رقم الأوردر', style: 'tableHeader', alignment: 'center' },
            { text: '#', style: 'tableHeader', alignment: 'center' }
        ]);

        rows.forEach((r, i) => {
            const isShipped = String(r.status).includes('شحن') || r.status === 'Shipped';
            const statusLabel = isShipped ? 'تم الشحن' : 'قيد الانتظار';
            
            let productsStr = '-';
            if (Array.isArray(r.items) && r.items.length > 0) {
                productsStr = r.items.map(it => it.name + ' x' + (it.qty || 1)).join('\n');
            } else if (r.products) {
                productsStr = r.products;
            }

            body.push([
                { text: statusLabel, alignment: 'center' },
                { text: r.scanTime ? new Date(r.scanTime).toLocaleString('en-GB') : '-', alignment: 'center' },
                { text: r.assignedWorker || r.worker || r.scannedBy || '-', alignment: 'center' },
                { text: r.notes || '—', alignment: 'center' },
                { text: productsStr, alignment: 'left' },
                { text: r.cod ? String(r.cod) : 'N/A', alignment: 'center' },
                { text: r.trackingNumber || r.tracking || '-', alignment: 'left' },
                { text: r.orderId || r.id || '-', alignment: 'center' },
                { text: String(i + 1), alignment: 'center' }
            ]);
        });

        const docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            content: [
                { text: 'تقرير الجرد الداخلي', style: 'header', alignment: 'center' },
                {
                    table: {
                        headerRows: 1,
                        widths: [ 'auto', 'auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto' ],
                        body: body
                    }
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                tableHeader: { bold: true, fontSize: 11, color: 'black' }
            },
            defaultStyle: {
                fontSize: 9
            }
        };

        window.pdfMake.createPdf(docDefinition).download('Report.pdf');

    } catch (error) {
        console.warn("pdfmake failed, falling back to native iframe print", error);
        fallbackNativePrint(rows);
    }
};

function fallbackNativePrint(rows) {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير الجرد الداخلي</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
                @page { size: A4 landscape; margin: 10mm; }
                body { font-family: 'Tajawal', sans-serif; font-size: 11px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 4px; text-align: right; }
                th { background-color: #f3f4f6; }
                .ltr { direction: ltr; text-align: left; }
            </style>
        </head>
        <body>
            <h2 style="text-align: center;">تقرير الجرد الداخلي - ${new Date().toLocaleDateString('en-GB')}</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>رقم الأوردر</th>
                        <th class="ltr">رقم التتبع</th>
                        <th class="ltr">المنتجات (Products)</th>
                        <th>التحصيل COD</th>
                        <th>الملاحظات</th>
                        <th>المسؤول</th>
                        <th>الوقت</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((r, i) => {
                        const isShipped = String(r.status).includes('شحن') || r.status === 'Shipped';
                        let productsStr = '-';
                        if (Array.isArray(r.items) && r.items.length > 0) {
                            productsStr = r.items.map(it => it.name + ' x' + (it.qty || 1)).join('<br>');
                        } else if (r.products) {
                            productsStr = String(r.products).replace(/\n/g, '<br>');
                        }
                        return '<tr>' +
                            '<td>' + (i + 1) + '</td>' +
                            '<td>' + (r.orderId || r.id || '-') + '</td>' +
                            '<td class="ltr">' + (r.trackingNumber || r.tracking || '-') + '</td>' +
                            '<td class="ltr">' + productsStr + '</td>' +
                            '<td>' + (r.cod ? String(r.cod) : 'N/A') + '</td>' +
                            '<td>' + (r.notes || '—') + '</td>' +
                            '<td>' + (r.assignedWorker || r.worker || r.scannedBy || '-') + '</td>' +
                            '<td dir="ltr">' + (r.scanTime ? new Date(r.scanTime).toLocaleString('en-GB') : '-') + '</td>' +
                            '<td>' + (isShipped ? 'تم الشحن' : 'قيد الانتظار') + '</td>' +
                        '</tr>';
                    }).join('')}
                </tbody>
            </table>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.parent.document.body.removeChild(window.frameElement), 500);
                };
            </script>
        </body>
        </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();
}
