'use client';
import { useState } from 'react';
import { Card, Input } from '@heroui/react';
import { Scan, ClipboardCheck, PackageSearch, ListTodo, Search, PartyPopper } from 'lucide-react';

interface Order {
    orderId: string;
    trackingNumber: string;
    status: string;
    isLeo?: boolean;
    items?: any[];
    products?: string;
    cod?: string;
}

interface Batch {
    orders: Order[];
    printed?: boolean;
    waybillPdfs?: any[];
}

interface ScannerViewProps {
    batch: Batch | null;
    lastScanData: Order | null;
}

export function ScannerView({ batch, lastScanData }: ScannerViewProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const total = batch?.orders?.length || 0;
    const shipped = batch?.orders?.filter(o => o.status === 'Shipped').length || 0;
    const pendingCount = total - shipped;

    let pendingOrders = batch?.orders?.filter(o => o.status !== 'Shipped') || [];
    
    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        pendingOrders = pendingOrders.filter(o => 
            (o.orderId && o.orderId.toLowerCase().includes(q)) || 
            (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q))
        );
    }

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
                <Card className="shadow-sm border">
                    <Card.Content className="p-4 text-center">
                        <div className="text-xs md:text-sm text-gray-500 font-bold mb-1">إجمالي الدفعة</div>
                        <div className="text-2xl md:text-4xl font-black text-gray-800">{total}</div>
                    </Card.Content>
                </Card>
                <Card className="shadow-sm border border-b-4 border-b-green-500">
                    <Card.Content className="p-4 text-center">
                        <div className="text-xs md:text-sm text-gray-500 font-bold mb-1">المكتملة</div>
                        <div className="text-2xl md:text-4xl font-black text-green-600">{shipped}</div>
                    </Card.Content>
                </Card>
                <Card className="shadow-sm border border-b-4 border-b-orange-500">
                    <Card.Content className="p-4 text-center">
                        <div className="text-xs md:text-sm text-gray-500 font-bold mb-1">المتبقية</div>
                        <div className="text-2xl md:text-4xl font-black text-orange-500">{pendingCount}</div>
                    </Card.Content>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scanner Idle Card */}
                <Card className="shadow-sm border min-h-[400px]">
                    <Card.Content className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">جاهز للإسكان</h2>
                            <p className="text-gray-500 mt-2 text-sm">استخدم جهاز الباركود الخارجي مباشرة</p>
                        </div>
                        <div className="w-full max-w-sm overflow-hidden rounded-xl border-4 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-12 relative">
                            <div className="relative mb-6">
                                <Scan className="w-24 h-24 text-gray-300" />
                                <span className="absolute top-2 right-2 flex h-5 w-5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 shadow-lg shadow-green-500/50"></span>
                                </span>
                            </div>
                            <p className="font-bold text-lg text-green-600 mb-1 flex items-center gap-2">قارئ الباركود متصل وجاهز</p>
                            <p className="text-sm font-bold text-gray-400 text-center">في انتظار استقبال البيانات...</p>
                        </div>
                    </Card.Content>
                </Card>
                
                {/* Last Scanned */}
                <Card className="shadow-sm border">
                    <Card.Content className="p-0 flex flex-col h-full overflow-hidden">
                        <div className="bg-gray-50 border-b p-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                                آخر أوردر تم فحصه
                            </h3>
                        </div>
                        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                            {!lastScanData ? (
                                <>
                                    <PackageSearch className="w-16 h-16 mb-4 opacity-30" />
                                    <p className="font-bold">في انتظار الإسكان...</p>
                                </>
                            ) : (
                                <div className="w-full text-right h-full flex flex-col">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-700 font-bold flex items-center gap-2 shadow-sm">
                                        <ClipboardCheck className="w-5 h-5" /> تم تحديث الحالة بنجاح
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-50 p-3 rounded-lg border">
                                            <span className="text-xs text-gray-500 block mb-1">رقم التتبع</span>
                                            <span className="font-bold text-lg font-mono text-gray-800 tracking-wide">{lastScanData.trackingNumber}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border">
                                            <span className="text-xs text-gray-500 block mb-1">رقم الأوردر</span>
                                            <span className="font-bold text-lg text-gray-800">#{lastScanData.orderId}</span>
                                        </div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                                        <span className="text-xs text-red-400 block mb-1">التحصيل (COD)</span>
                                        <span className="font-black text-xl text-red-600">{lastScanData.cod || '0'}</span>
                                    </div>
                                    <div className="flex-1 bg-white border rounded-lg p-4 overflow-y-auto max-h-[150px] custom-scrollbar">
                                        <div className="text-sm font-bold text-gray-500 mb-3 border-b pb-2">المنتجات (Physical Verification):</div>
                                        {lastScanData.items && lastScanData.items.length > 0 ? (
                                            lastScanData.items.map((it, idx) => (
                                                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                                    <span className="font-bold text-gray-700">{it.name || '-'}</span>
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">x {it.qty || 1}</span>
                                                </div>
                                            ))
                                        ) : lastScanData.products ? (
                                            <div dangerouslySetInnerHTML={{ __html: String(lastScanData.products).replace(/\n/g, '<br>') }} />
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card.Content>
                </Card>
            </div>

            {/* Pending Orders Live List */}
            <Card className="mt-6 shadow-sm border overflow-hidden">
                <Card.Content className="p-0">
                    <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <ListTodo className="w-5 h-5 text-orange-500" />
                            الأوردرات المتبقية للإسكان
                        </h3>
                        <div className="relative w-full md:w-64">
                            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 z-10" />
                            <Input 
                                type="text" 
                                placeholder="بحث برقم الأوردر أو التتبع..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pr-9" 
                            />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                            {!batch?.orders || batch.orders.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-gray-400 font-bold">لا يوجد أوردرات في هذه الدفعة</div>
                            ) : pendingCount === 0 ? (
                                <div className="col-span-full bg-green-50 border border-green-200 text-green-700 rounded-xl p-8 text-center font-black text-xl shadow-sm flex flex-col items-center justify-center gap-3">
                                    <PartyPopper className="w-12 h-12 text-green-500" />
                                    🎉 أحسنت! تم إسكان جميع أوردرات الدفعة بالكامل
                                </div>
                            ) : pendingOrders.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-gray-400 font-bold">لا يوجد نتائج تطابق البحث</div>
                            ) : (
                                pendingOrders.map((o, i) => {
                                    const isCancelled = o.status === 'Cancelled';
                                    const containerClass = isCancelled ? "bg-red-50 border-red-200 opacity-75" : "bg-white border-gray-200 hover:border-orange-300";

                                    return (
                                        <div key={o.orderId || i} className={`flex items-center justify-between p-3 border shadow-sm rounded-lg transition-colors ${containerClass}`}>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 mb-0.5">
                                                    رقم الأوردر
                                                    {isCancelled && <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200 shadow-sm ml-2">ملغي</span>}
                                                </span>
                                                <span className={`font-bold ${isCancelled ? 'text-red-700 line-through' : 'text-gray-800'}`}>
                                                    #{o.orderId || '-'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-xs text-gray-500 mb-0.5">التتبع</span>
                                                <div className="flex items-center gap-2 justify-end">
                                                    {o.isLeo && <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 shadow-sm ml-2">LEO</span>}
                                                    <span className={`font-mono text-sm font-bold ${isCancelled ? 'text-red-700 line-through' : 'text-gray-700'} tracking-wide`} dir="ltr">
                                                        {o.trackingNumber || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </Card.Content>
            </Card>
        </div>
    );
}
