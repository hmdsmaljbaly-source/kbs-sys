'use client';
import { useState, useEffect } from 'react';
import { Box, ScanLine, Printer, LogOut } from 'lucide-react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Toaster } from 'react-hot-toast';
import { ScannerView } from '@/components/packer/ScannerView';
import { PrinterView } from '@/components/packer/PrinterView';
import { PackerOverlays, OverlayType } from '@/components/packer/PackerOverlays';
import { useScanner } from '@/hooks/useScanner';
import { AudioService } from '@/lib/audio-service';

export default function PackerPage() {
    const [activeTab, setActiveTab] = useState<'scanner' | 'printer'>('scanner');
    const [user, setUser] = useState<any>({});
    const [batch, setBatch] = useState<any>(null);
    const [allLiveOrders, setAllLiveOrders] = useState<Record<string, any>>({});
    
    const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
    const [overlayText, setOverlayText] = useState<string | null>(null);
    const [lastScanData, setLastScanData] = useState<any>(null);

    const workerUsername = (user.username || '').trim().toLowerCase();

    useEffect(() => {
        // Mocking AuthService check for simplicity in this migration
        let currentUser = {};
        try {
            currentUser = JSON.parse(sessionStorage.getItem('kbs_user') || localStorage.getItem('kbs_user') || '{}');
            setUser(currentUser);
        } catch (e) {}
    }, []);

    useEffect(() => {
        if (!workerUsername) return;

        const batchRef = ref(db, `artifacts/korean-beautys-dispatch/batches/${workerUsername}`);
        const ordersRef = ref(db, `artifacts/korean-beautys-dispatch/orders`);

        const unsubBatch = onValue(batchRef, (snapshot) => {
            let currentBatch = snapshot.val();
            if (currentBatch && currentBatch.orders) {
                // Merge with live orders if available
                setAllLiveOrders((liveOrders) => {
                    if (Object.keys(liveOrders).length > 0) {
                        currentBatch.orders = currentBatch.orders.map((o: any) => {
                            const liveOrder = liveOrders[`WAYBILL_${o.trackingNumber}`] || liveOrders[`WAYBILL_${o.orderId}`];
                            return liveOrder ? { ...o, ...liveOrder } : o;
                        });
                    }
                    setBatch(currentBatch);
                    return liveOrders;
                });
            } else {
                setBatch(currentBatch);
            }
        });

        const unsubOrders = onValue(ordersRef, (snapshot) => {
            const liveOrders = snapshot.val() || {};
            setAllLiveOrders(liveOrders);
            setBatch((prevBatch: any) => {
                if (prevBatch && prevBatch.orders) {
                    return {
                        ...prevBatch,
                        orders: prevBatch.orders.map((o: any) => {
                            const liveOrder = liveOrders[`WAYBILL_${o.trackingNumber}`] || liveOrders[`WAYBILL_${o.orderId}`];
                            return liveOrder ? { ...o, ...liveOrder } : o;
                        })
                    };
                }
                return prevBatch;
            });
        });

        return () => {
            unsubBatch();
            unsubOrders();
        };
    }, [workerUsername]);

    const showOverlay = (type: OverlayType, text?: string) => {
        setActiveOverlay(type);
        if (text) setOverlayText(text);
        setTimeout(() => setActiveOverlay(null), 3000);
    };

    const handleScan = async (cleanBarcode: string) => {
        if (!batch || !batch.orders) {
            AudioService.playError();
            showOverlay('not-in-batch');
            return;
        }

        const orderIndex = batch.orders.findIndex((o: any) => 
            String(o.trackingNumber).trim().toLowerCase() === cleanBarcode || 
            String(o.orderId).trim().toLowerCase() === cleanBarcode
        );

        if (orderIndex === -1) {
            AudioService.playError();
            showOverlay('not-in-batch');
            return;
        }

        const matchedOrder = batch.orders[orderIndex];

        if (matchedOrder.status === 'Cancelled') {
            AudioService.playLeoBlocked();
            showOverlay('cancelled');
            return;
        }

        if (matchedOrder.isLeo) {
            AudioService.playLeoBlocked();
            showOverlay('leo');
            return;
        }

        if (matchedOrder.status === 'Shipped') {
            AudioService.playDuplicate();
            showOverlay('duplicate');
            return;
        }

        try {
            const now = new Date().toISOString();
            const updates: Record<string, any> = {};
            
            // Update batch status
            updates[`/artifacts/korean-beautys-dispatch/batches/${workerUsername}/orders/${orderIndex}/status`] = 'Shipped';
            updates[`/artifacts/korean-beautys-dispatch/batches/${workerUsername}/orders/${orderIndex}/scanTime`] = now;
            
            // Update master order status
            const orderKey = `WAYBILL_${matchedOrder.trackingNumber}`;
            updates[`/artifacts/korean-beautys-dispatch/orders/${orderKey}/status`] = 'Shipped';
            updates[`/artifacts/korean-beautys-dispatch/orders/${orderKey}/assignedWorker`] = workerUsername;
            updates[`/artifacts/korean-beautys-dispatch/orders/${orderKey}/scannedBy`] = (user.name || user.username);
            updates[`/artifacts/korean-beautys-dispatch/orders/${orderKey}/scanTime`] = now;

            await update(ref(db), updates);
            
            AudioService.playSuccess();
            showOverlay('success', `#${matchedOrder.orderId || cleanBarcode}`);
            setLastScanData(matchedOrder);

        } catch (err) {
            console.error("Firebase update failed:", err);
            AudioService.playError();
            showOverlay('error');
        }
    };

    useScanner(handleScan);

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-sans" dir="rtl">
            <Toaster position="bottom-center" />
            <PackerOverlays activeOverlay={activeOverlay} dynamicText={overlayText} />

            {/* Header / Navbar */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Box className="w-6 h-6 text-white" />
                                </div>
                                <span className="font-bold text-xl text-gray-800 hidden sm:inline">محطة التغليف</span>
                            </div>
                            {/* Navigation Tabs */}
                            <div className="hidden md:flex space-x-2 space-x-reverse h-16 items-end">
                                <button 
                                    onClick={() => setActiveTab('scanner')}
                                    className={`px-4 py-3 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'scanner' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
                                >
                                    <ScanLine className="w-4 h-4" /> محطة الإسكان
                                </button>
                                <button 
                                    onClick={() => setActiveTab('printer')}
                                    className={`px-4 py-3 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'printer' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
                                >
                                    <Printer className="w-4 h-4" /> محطة الطباعة والدمج
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                {user.name || user.username || 'مستخدم'}
                            </span>
                            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="تسجيل الخروج">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {/* Mobile Tabs */}
                    <div className="flex md:hidden border-t">
                        <button 
                            onClick={() => setActiveTab('scanner')}
                            className={`flex-1 px-2 py-3 text-xs font-bold flex items-center justify-center gap-1 whitespace-nowrap ${activeTab === 'scanner' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600'}`}
                        >
                            <ScanLine className="w-4 h-4" /> الإسكان
                        </button>
                        <button 
                            onClick={() => setActiveTab('printer')}
                            className={`flex-1 px-2 py-3 text-xs font-bold flex items-center justify-center gap-1 whitespace-nowrap ${activeTab === 'printer' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600'}`}
                        >
                            <Printer className="w-4 h-4" /> الطباعة
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {activeTab === 'scanner' && (
                    <ScannerView batch={batch} lastScanData={lastScanData} />
                )}

                {activeTab === 'printer' && (
                    <PrinterView batch={batch} workerUsername={workerUsername} />
                )}
            </main>
        </div>
    );
}
