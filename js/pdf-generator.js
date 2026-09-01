// pdf-generator.js
// Native HTML-to-PDF Print Stream Engine

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

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("يرجى السماح بالنوافذ المنبثقة (Popups) من المتصفح لتحميل التقرير.");
        return;
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>تقرير الجرد الداخلي</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800&display=swap" rel="stylesheet">
            <style>
                @page { 
                    size: A4 portrait; 
                    margin: 8mm; 
                }
                body { 
                    font-family: 'Tajawal', sans-serif; 
                    font-size: 11px; 
                    color: #000;
                    margin: 0;
                    padding: 0;
                }
                h2 { 
                    text-align: center; 
                    font-size: 18px; 
                    margin-bottom: 15px; 
                    border-bottom: 2px solid #000; 
                    padding-bottom: 5px; 
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    font-size: 10px;
                }
                th, td { 
                    border: 1px solid #444; 
                    padding: 5px; 
                    text-align: right; 
                }
                th { 
                    background-color: #f3f4f6; 
                    font-weight: 700;
                    -webkit-print-color-adjust: exact;
                }
                tr { 
                    page-break-inside: avoid; 
                }
                .ltr { 
                    direction: ltr; 
                    text-align: left; 
                }
                .badge {
                    display: inline-block;
                    background: #eee;
                    padding: 1px 4px;
                    border-radius: 4px;
                    font-size: 9px;
                    font-weight: bold;
                    margin-left: 4px;
                }
                .footer {
                    text-align: center;
                    font-size: 9px;
                    margin-top: 15px;
                    color: #555;
                }
            </style>
        </head>
        <body>
            <h2>تقرير الجرد الداخلي - ${new Date().toLocaleDateString('en-GB')}</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>رقم الأوردر</th>
                        <th class="ltr">رقم التتبع</th>
                        <th class="ltr">المنتجات (Products)</th>
                        <th>التحصيل (COD)</th>
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
                            productsStr = r.items.map(it => '<div>' + (it.name || '-') + ' <span class="badge">x ' + (it.qty || 1) + '</span></div>').join('');
                        } else if (r.products) {
                            productsStr = String(r.products).replace(/\n/g, '<br>');
                        }

                        // Safe date parsing
                        let timeStr = '-';
                        if (r.scanTime && r.scanTime !== '-') {
                            const d = new Date(r.scanTime);
                            if (!isNaN(d.getTime())) {
                                timeStr = d.toLocaleString('en-GB', { 
                                    day: '2-digit', month: '2-digit', year: 'numeric', 
                                    hour: '2-digit', minute: '2-digit' 
                                });
                            } else {
                                timeStr = r.scanTime; // Fallback to raw string
                            }
                        }

                        // COD formatting
                        let codStr = 'N/A';
                        if (r.cod && r.cod !== 'N/A') {
                            const num = parseFloat(String(r.cod).replace(/[^0-9.-]+/g,""));
                            if (!isNaN(num)) {
                                codStr = new Intl.NumberFormat('en-US').format(num) + ' ج.م';
                            } else {
                                codStr = String(r.cod).includes('ج') ? r.cod : r.cod + ' ج.م';
                            }
                        }

                        return '<tr>' +
                            '<td style="text-align: center;">' + (i + 1) + '</td>' +
                            '<td style="font-weight: 700;">#' + (r.orderId || r.id || '-') + '</td>' +
                            '<td class="ltr" style="font-family: monospace;">' + (r.trackingNumber || r.tracking || '-') + '</td>' +
                            '<td class="ltr">' + productsStr + '</td>' +
                            '<td style="font-weight: bold; color: #b91c1c;">' + codStr + '</td>' +
                            '<td>' + (r.notes || '—') + '</td>' +
                            '<td>' + (r.assignedWorker || r.worker || r.scannedBy || '-') + '</td>' +
                            '<td dir="ltr" style="font-size: 9px;">' + timeStr + '</td>' +
                            '<td style="font-weight: bold;">' + (isShipped ? 'تم الشحن' : 'قيد الانتظار') + '</td>' +
                        '</tr>';
                    }).join('')}
                </tbody>
            </table>
            <div class="footer">تم إنشاء التقرير بواسطة نظام KBS</div>
            <script>
                window.onload = function() {
                    window.print();
                    // Close the window after printing (or if cancelled)
                    setTimeout(() => window.close(), 500);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
