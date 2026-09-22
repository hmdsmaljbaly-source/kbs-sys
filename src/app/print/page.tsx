'use client';

import { useState, useRef } from 'react';
import { Card, Button, Input } from '@heroui/react';
import { Printer, UploadCloud, Files, HardDrive, Activity, Trash2, Search, CheckCircle } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import toast from 'react-hot-toast';

export default function StandalonePrintPage() {
    const [filesArray, setFilesArray] = useState<{ id: string; file: File; blobUrl: string; status: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [autoClear, setAutoClear] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        let newCount = 0;
        const newFiles: { id: string; file: File; blobUrl: string; status: string }[] = [];

        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            if (f.type === 'application/pdf') {
                newFiles.push({
                    id: Math.random().toString(36).substring(2, 9),
                    file: f,
                    blobUrl: URL.createObjectURL(f),
                    status: 'wait'
                });
                newCount++;
            }
        }

        if (newCount > 0) {
            setFilesArray(prev => [...prev, ...newFiles]);
            toast.success(`تم إضافة ${newCount} فاتورة بنجاح`);
        } else if (files.length > 0) {
            toast.error('يرجى اختيار ملفات PDF فقط!');
        }
    };

    const removeFile = (id: string) => {
        setFilesArray(prev => {
            const target = prev.find(f => f.id === id);
            if (target) URL.revokeObjectURL(target.blobUrl);
            return prev.filter(f => f.id !== id);
        });
    };

    const clearAllFiles = () => {
        filesArray.forEach(f => URL.revokeObjectURL(f.blobUrl));
        setFilesArray([]);
        toast.success('تم تفريغ القائمة');
    };

    const totalBytes = filesArray.reduce((acc, curr) => acc + curr.file.size, 0);
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024, dm = 2, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const filteredFiles = filesArray.filter(f => f.file.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    const handleBatchPrint = async () => {
        if (filesArray.length === 0) return;

        setIsProcessing(true);
        setProgress(0);

        try {
            const mergedPdf = await PDFDocument.create();

            for (let i = 0; i < filesArray.length; i++) {
                const fileArrayBuffer = await filesArray[i].file.arrayBuffer();
                const pdf = await PDFDocument.load(fileArrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
                setProgress(Math.round(((i + 1) / filesArray.length) * 90));
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

            const mergedPdfFile = await mergedPdf.save();
            const blobUrl = URL.createObjectURL(new Blob([mergedPdfFile as any], { type: 'application/pdf' }));

            setProgress(100);

            const triggerPrint = () => {
                try {
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                        iframeRef.current.contentWindow.focus();
                        iframeRef.current.contentWindow.print();
                    }
                    toast.success('يرجى اختيار الطابعة من النافذة المنبثقة');
                    setTimeout(() => {
                        setIsProcessing(false);
                        setProgress(0);
                        if (autoClear) clearAllFiles();
                    }, 2500);
                } catch (err) {
                    const win = window.open(blobUrl, '_blank');
                    if (win) { win.onload = () => { setTimeout(() => win.print(), 500); }; }
                    setIsProcessing(false);
                    setProgress(0);
                    if (autoClear) clearAllFiles();
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
            console.error(err);
            toast.error('حدث خطأ أثناء معالجة الملفات');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 p-4 md:p-8 flex flex-col items-center" dir="rtl">
            <iframe ref={iframeRef} className="hidden" title="print-frame" />

            <div className="w-full max-w-6xl space-y-6">
                <header className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-900 rounded-2xl mb-2 text-white shadow-lg">
                        <Printer className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900">نظام طباعة Batch El-Za3ama</h1>
                    <p className="text-gray-500 font-semibold">بواسطة Mr. Gebaly</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="shadow-sm border">
                        <Card.Content className="p-4 flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 ml-4">
                                <Files className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold">إجمالي الملفات</p>
                                <p className="text-2xl font-bold text-gray-800">{filesArray.length}</p>
                            </div>
                        </Card.Content>
                    </Card>

                    <Card className="shadow-sm border">
                        <Card.Content className="p-4 flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600 ml-4">
                                <HardDrive className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold">الحجم الإجمالي</p>
                                <p className="text-2xl font-bold text-gray-800">{formatBytes(totalBytes)}</p>
                            </div>
                        </Card.Content>
                    </Card>

                    <Card className="shadow-sm border">
                        <Card.Content className="p-4 flex items-center">
                            <div className="p-3 rounded-full bg-purple-100 text-purple-600 ml-4">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold">الحالة</p>
                                <p className={`text-lg font-bold ${filesArray.length > 0 ? 'text-green-600' : 'text-purple-600'}`}>
                                    {filesArray.length > 0 ? 'جاهز للطباعة' : 'في انتظار الفواتير'}
                                </p>
                            </div>
                        </Card.Content>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 transition cursor-pointer">
                            <Card.Content 
                                className="p-8 text-center flex flex-col items-center justify-center min-h-[220px]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full mb-4">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">اسحب وأفلت الفواتير هنا</h3>
                                <p className="text-sm text-gray-500 mb-4">أو اضغط لتصفح جهازك (يدعم PDF فقط)</p>
                                <Button variant="primary" className="bg-white border text-gray-700 hover:bg-gray-50">اختيار الملفات</Button>
                                <input 
                                    ref={fileInputRef} 
                                    type="file" 
                                    multiple 
                                    accept="application/pdf" 
                                    className="hidden" 
                                    onChange={(e) => handleFiles(e.target.files)} 
                                />
                            </Card.Content>
                        </Card>

                        <Card className="shadow-sm border">
                            <Card.Content className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">إعدادات الطباعة</h3>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={autoClear} 
                                        onChange={(e) => setAutoClear(e.target.checked)} 
                                        className="w-4 h-4 rounded text-blue-600"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">تنظيف تلقائي</p>
                                        <p className="text-xs text-gray-500">حذف الفواتير من القائمة بعد الطباعة.</p>
                                    </div>
                                </label>
                            </Card.Content>
                        </Card>

                        <Card className="shadow-sm border bg-indigo-50/30">
                            <Card.Content className="p-6">
                                {isProcessing && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-semibold mb-1 text-gray-600">
                                            <span>جاري التجهيز...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    variant="primary"
                                    isDisabled={filesArray.length === 0 || isProcessing}
                                    onPress={handleBatchPrint}
                                    className="w-full py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                >
                                    <Printer className="w-5 h-5 ml-2" />
                                    {isProcessing ? 'جاري المعالجة...' : 'طباعة Batch El-Za3ama'}
                                </Button>
                            </Card.Content>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="shadow-sm border min-h-[500px]">
                            <Card.Content className="p-0 flex flex-col h-full">
                                <div className="p-4 border-b bg-white">
                                    <div className="relative">
                                        <Search className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                                        <Input
                                            type="text"
                                            placeholder="ابحث برقم الأوردر أو اسم الملف..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pr-10"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">قائمة الفواتير الجاهزة</h3>
                                    {filesArray.length > 0 && (
                                        <Button variant="danger" onPress={clearAllFiles} className="text-xs bg-red-50 text-red-600 hover:bg-red-100">
                                            <Trash2 className="w-4 h-4 ml-1" /> مسح القائمة
                                        </Button>
                                    )}
                                </div>

                                <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                                    {filesArray.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12 text-center">
                                            <Files className="w-16 h-16 mb-4 opacity-40" />
                                            <p className="text-lg font-medium text-gray-500">القائمة فارغة</p>
                                            <p className="text-sm mt-1">قم بإضافة الفواتير من المربع الجانبي للبدء</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredFiles.map((item, idx) => (
                                                <div key={item.id} className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="bg-indigo-50 text-indigo-600 font-bold w-7 h-7 rounded-lg flex items-center justify-center text-xs">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <div className="font-semibold text-gray-800 text-sm truncate max-w-[250px]">{item.file.name}</div>
                                                            <div className="text-xs text-gray-500">{formatBytes(item.file.size)}</div>
                                                        </div>
                                                    </div>
                                                    <Button variant="danger" onPress={() => removeFile(item.id)} className="p-1 text-red-500 bg-red-50 hover:bg-red-100">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card.Content>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
