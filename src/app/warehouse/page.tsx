'use client';

import { useState, useEffect } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from '@heroui/react';
import { Warehouse, LogOut, Filter, FileSpreadsheet, FileText } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { BulkEngine } from '@/lib/bulk-engine';
import toast from 'react-hot-toast';

export default function WarehousePage() {
    const [user, setUser] = useState<any>({});
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<string>('ALL');

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem('kbs_user') || localStorage.getItem('kbs_user');
            if (stored) {
                const u = JSON.parse(stored);
                if (u.role !== 'WAREHOUSE' && u.role !== 'ADMIN') {
                    window.location.replace('/');
                    return;
                }
                setUser(u);
            } else {
                window.location.replace('/');
            }
        } catch (e) {}

        const ordersRef = ref(db, 'artifacts/korean-beautys-dispatch/orders');
        const unsub = onValue(ordersRef, (snapshot) => {
            const data = snapshot.val() || {};
            setAllOrders(Object.values(data));
        });

        return () => unsub();
    }, []);

    const handleLogout = () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.replace('/');
    };

    // Workers list
    const workersMap = new Map();
    allOrders.forEach(o => {
        if (o.assignedWorker) {
            workersMap.set(o.assignedWorker, o.scannedBy || o.assignedWorker);
        }
    });

    // Filter pending orders
    let filteredOrders = allOrders.filter(o => o.status !== 'Shipped');
    if (selectedWorker !== 'ALL') {
        filteredOrders = filteredOrders.filter(o => o.assignedWorker === selectedWorker);
    }

    const aggregatedList = BulkEngine.aggregateSKUs(filteredOrders);
    const totalQty = aggregatedList.reduce((acc: number, item: any) => acc + item.quantity, 0);

    const exportToCSV = () => {
        if (aggregatedList.length === 0) {
            toast.error('لا يوجد بيانات للتصدير');
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "اسم المنتج,الكمية المطلوبة,ملاحظات\n";
        aggregatedList.forEach((item: any) => {
            csvContent += `"${item.name}",${item.quantity},"${item.condition || '-'}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Bulk_Pick_List_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('تم تصدير ملف CSV بنجاح');
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-sans" dir="rtl">
            <header className="bg-purple-900 text-white shadow-md border-b border-purple-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Warehouse className="w-8 h-8 text-purple-300" />
                    <h1 className="text-xl font-bold">شاشة السحب والتجميع (Bulk)</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-purple-200">{user.name || user.username || 'مستخدم'}</span>
                    <Button variant="danger" onPress={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                        <LogOut className="w-4 h-4" /> تسجيل الخروج
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                <Card className="shadow-sm border">
                    <Card.Content className="p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-purple-600" /> فلترة قوائم السحب
                        </h2>
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[240px]">
                                <label className="block text-sm font-bold text-gray-700 mb-1">تصفية حسب العامل (Per-Bulk):</label>
                                <select 
                                    value={selectedWorker} 
                                    onChange={(e) => setSelectedWorker(e.target.value)}
                                    className="w-full border-gray-300 rounded-lg p-2.5 border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                                >
                                    <option value="ALL">Big Bulk (الكل)</option>
                                    {Array.from(workersMap.entries()).map(([username, name]) => (
                                        <option key={username} value={username}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="primary" onPress={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                                    <FileSpreadsheet className="w-4 h-4" /> تصدير Excel / CSV
                                </Button>
                            </div>
                        </div>
                    </Card.Content>
                </Card>

                <Card className="shadow-sm border overflow-hidden">
                    <Card.Content className="p-6">
                        <div className="flex justify-between items-center mb-4 border-b pb-4">
                            <h3 className="text-lg font-bold text-gray-800">قائمة البضائع (Pick List)</h3>
                            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
                                إجمالي القطع: {totalQty}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-gray-700 text-xs font-bold uppercase">
                                        <th className="p-3">اسم المنتج (SKU)</th>
                                        <th className="p-3">الكمية المطلوبة</th>
                                        <th className="p-3">حالة / ملاحظات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {aggregatedList.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-8 text-gray-400 font-bold">
                                                لا توجد منتجات للسحب في الوقت الحالي
                                            </td>
                                        </tr>
                                    ) : (
                                        aggregatedList.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="p-3 font-bold text-gray-900">{item.name}</td>
                                                <td className="p-3 font-black text-purple-700 text-base">{item.quantity}</td>
                                                <td className="p-3 text-gray-500">{item.condition || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card.Content>
                </Card>
            </main>
        </div>
    );
}
