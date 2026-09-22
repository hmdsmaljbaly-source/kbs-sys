'use client';
import { useState, useRef } from 'react';
import { Card, Button } from '@heroui/react';
import { Printer, XCircle, Loader, CheckCircle, Files, FileCheck2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface PrinterViewProps {
    batch: any;
    workerUsername: string;
}

export function PrinterView({ batch, workerUsername }: PrinterViewProps) {
    const [isPrintingBatch, setIsPrintingBatch] = useState(false);
    const [printProgress, setPrintProgress] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handlePrintBatch = async () => {
        if (!batch || batch.printed || !batch.waybillPdfs) return;
        
        setIsPrintingBatch(true);
        setPrintProgress(0);

        try {
            const mergedPdf = await PDFDocument.create();
            const pdfs = batch.waybillPdfs;
            let processed = 0;

            for (const pdfData of pdfs) {
                const pdfBytes = Uint8Array.from(atob(pdfData.base64), c => c.charCodeAt(0));
                const pdfDoc = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
                processed++;
                setPrintProgress(Math.round((processed / pdfs.length) * 100));
            }

            const base64Za3amaPDF = "ضع_كود_الملف_هنا"; 
            try {
                if (base64Za3amaPDF && base64Za3amaPDF !== "ضع_كود_الملف_هنا") {
                    const za3amaBytes = Uint8Array.from(atob(base64Za3amaPDF), c => c.charCodeAt(0));
                    const za3amaDoc = await PDFDocument.load(za3amaBytes);
                    const copiedZa3amaPages = await mergedPdf.copyPages(za3amaDoc, za3amaDoc.getPageIndices());
                    copiedZa3amaPages.forEach((page) => mergedPdf.addPage(page));
                }
            } catch (e) {
                console.error("خطأ في قراءة ورقة الزعامة المخفية", e);
            }

            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);

            const finishProcess = async () => {
                setTimeout(() => {
                    setIsPrintingBatch(false);
                    setPrintProgress(0);
                }, 2500);

                try {
                    await update(ref(db, `artifacts/korean-beautys-dispatch/batches/${workerUsername}`), {
                        printed: true,
                        printedAt: new Date().toISOString()
                    });
                } catch (e) {
                    console.error('Failed to update printed flag:', e);
                }
            };

            const triggerPrint = () => {
                try {
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        iframeRef.current.contentWindow.focus(); 
                        iframeRef.current.contentWindow.print();
                    }
                    finishProcess();
                } catch (err) {
                    const win = window.open(blobUrl, '_blank');
                    if (win) { win.onload = () => { setTimeout(() => win.print(), 500); }; }
                    finishProcess();
                }
            };

            if (iframeRef.current) {
                iframeRef.current.onload = () => setTimeout(triggerPrint, 1000); 
                iframeRef.current.src = blobUrl;
                setTimeout(triggerPrint, 3000);
            } else {
                triggerPrint();
            }

        } catch (err) {
            console.error("PDF Merging Error: ", err);
            toast.error("حدث خطأ أثناء دمج وطباعة الملفات.");
            setIsPrintingBatch(false);
        }
    };

    return (
        <div className="space-y-6">
            <iframe ref={iframeRef} className="hidden" />

            {/* Assigned Batch Auto-Print */}
            <Card className="shadow-sm border overflow-hidden mb-6">
                <Card.Content className="p-0">
                    <div className="p-4 border-b bg-blue-50 flex items-center gap-3">
                        <Printer className="w-6 h-6 text-blue-600" />
                        <h2 className="font-bold text-gray-800 text-lg">طباعة بوالص الدفعة (Single-Print)</h2>
                    </div>
                    <div className="p-6">
                        {isPrintingBatch && (
                            <div className="mb-4 bg-gray-200 rounded-full h-4 overflow-hidden relative">
                                <div className="bg-blue-600 h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${printProgress}%` }}>
                                    {printProgress}%
                                </div>
                            </div>
                        )}
                        
                        {!batch?.orders || batch.orders.length === 0 ? (
                            <Button isDisabled className="w-full py-4 text-gray-400 font-bold bg-gray-200">
                                <XCircle className="w-5 h-5 ml-2" /> لا يوجد دفعة مخصصة
                            </Button>
                        ) : batch.printed ? (
                            <Button isDisabled className="w-full py-4 text-green-600 font-bold bg-green-50 border border-green-200">
                                <CheckCircle className="w-5 h-5 ml-2" /> تم طباعة الدفعة مسبقاً
                            </Button>
                        ) : (
                            <Button 
                                variant="primary"
                                onPress={handlePrintBatch}
                                isDisabled={isPrintingBatch}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                            >
                                {isPrintingBatch ? (
                                    <><Loader className="w-5 h-5 ml-2 animate-spin" /> جاري دمج وتحضير الملفات...</>
                                ) : (
                                    <><Printer className="w-5 h-5 ml-2" /> طباعة البوالص ({batch.waybillPdfs?.length || 0} ملف)</>
                                )}
                            </Button>
                        )}
                    </div>
                </Card.Content>
            </Card>

            {/* Custom Merger Mock */}
            <div className="mt-8 space-y-6 opacity-50 pointer-events-none">
                <div className="flex items-center gap-2 mb-4">
                    <Files className="w-6 h-6 text-purple-600" />
                    <h2 className="font-bold text-gray-800 text-xl">نظام طباعة الفواتير المجمعة (قيد التطوير)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="shadow-sm border">
                        <Card.Content className="p-4 flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 ml-4">
                                <FileCheck2 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold">إجمالي الملفات</p>
                                <p className="text-2xl font-bold text-gray-800">0</p>
                            </div>
                        </Card.Content>
                    </Card>
                </div>
            </div>
        </div>
    );
}
