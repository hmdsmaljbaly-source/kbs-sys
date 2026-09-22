// pdf-generator.js
// jsPDF + AutoTable Engine for massive data

window.downloadFilteredAuditPDF = async function() {
    let rows = [];
    
    if (typeof window.currentFilteredReportsList !== 'undefined' && window.currentFilteredReportsList.length > 0) {
        rows = window.currentFilteredReportsList;
    } else {
        alert("لا توجد بيانات مطابقة للفلتر لتحميلها في التقرير!");
        return;
    }

    const btn = document.getElementById('btnExportAuditPdf');
    let originalHtml = '';
    if(btn) {
        originalHtml = btn.innerHTML;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> جاري التحميل...`;
        btn.disabled = true;
        if(window.lucide) window.lucide.createIcons();
    }

    // Allow UI to update
    await new Promise(r => setTimeout(r, 100));

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        
        // Add Cairo font for Arabic
        // NOTE: In production you should bundle the font, but this works fine if it's cached.
        doc.addFont('https://raw.githubusercontent.com/wsmariano/Cairo/master/Cairo-Regular.ttf', 'Cairo', 'normal');
        doc.setFont('Cairo');
        
        doc.setFontSize(16);
        doc.text("تقرير السجلات - KBS System", 40, 40);
        
        doc.setFontSize(10);
        doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('en-GB')}`, 40, 60);
        doc.text(`إجمالي الأوردرات: ${rows.length}`, 40, 75);

        const tableData = rows.map((r, i) => {
            const isShipped = String(r.status).includes('شحن') || r.status === 'Shipped';
            
            let productsStr = '-';
            if (Array.isArray(r.items) && r.items.length > 0) {
                productsStr = r.items.map(it => `${it.name || '-'} (x${it.qty || 1})`).join('\n');
            } else if (r.parsedProducts && r.parsedProducts.length > 0) {
                productsStr = r.parsedProducts.map(p => `${p.name} (العدد: ${p.quantity})`).join('\n');
            } else if (r.products) {
                productsStr = String(r.products);
            } else if (r.recordType === 'return') {
                productsStr = 'طلب مرتجع';
            }

            let timeStr = '-';
            if (r.scanTime && r.scanTime !== '-') {
                const d = new Date(r.scanTime);
                if (!isNaN(d.getTime())) {
                    timeStr = d.toLocaleString('en-GB', { 
                        day: '2-digit', month: '2-digit', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                    });
                } else {
                    timeStr = r.scanTime;
                }
            }

            let codStr = 'N/A';
            if (r.cod && r.cod !== 'N/A' && r.recordType !== 'return') {
                const num = parseFloat(String(r.cod).replace(/[^0-9.-]+/g,""));
                if (!isNaN(num)) {
                    codStr = new Intl.NumberFormat('en-US').format(num) + ' ج.م';
                } else {
                    codStr = String(r.cod).includes('ج') ? r.cod : r.cod + ' ج.م';
                }
            }

            let statusLabel = r.status;
            if(r.recordType === 'return') {
                statusLabel = r.status === 'Received' ? 'مرتجع مستلم' : 'مرتجع معلق';
            } else if (isShipped) {
                statusLabel = 'تم الشحن';
            } else {
                statusLabel = 'قيد الانتظار';
            }

            return [
                i + 1,
                r.orderId || r.id || '-',
                r.trackingNumber || r.tracking || '-',
                codStr,
                productsStr,
                r.notes || '—',
                r.assignedName || r.assignedWorker || r.worker || r.scannedByUsername || r.scannedBy || '-',
                timeStr,
                statusLabel
            ];
        });

        doc.autoTable({
            startY: 90,
            head: [['#', 'رقم الأوردر', 'رقم التتبع', 'التحصيل', 'المنتجات', 'الملاحظات', 'المسؤول', 'الوقت', 'الحالة']],
            body: tableData,
            theme: 'grid',
            styles: { 
                font: 'Cairo', 
                fontSize: 8,
                halign: 'right', // Right align for Arabic
                valign: 'middle',
                cellPadding: 4
            },
            headStyles: { 
                fillColor: [79, 70, 229], // Indigo 600
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 20 },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { cellWidth: 150 }, // Give products more space
            },
            didDrawPage: function (data) {
                // Footer
                let str = "Page " + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                let pageSize = doc.internal.pageSize;
                let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(str, data.settings.margin.left, pageHeight - 10);
            }
        });

        doc.save(`Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
        console.error("PDF Generation Error:", err);
        alert("حدث خطأ أثناء استخراج ملف الـ PDF. يرجى المحاولة مرة أخرى.");
    } finally {
        if(btn) {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            if(window.lucide) window.lucide.createIcons();
        }
    }
};
