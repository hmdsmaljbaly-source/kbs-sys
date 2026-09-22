'use client';
import { Card } from '@heroui/react';
import { Package, Truck, AlertTriangle, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';

export function DashboardStats({ orders, batches, returns, archiveOrders }: any) {
    const ordersList = Object.values(orders || {});
    const totalLive = ordersList.length;
    const shipped = ordersList.filter((o: any) => o.status === 'Shipped').length;
    const pending = ordersList.filter((o: any) => o.status !== 'Shipped' && o.status !== 'Cancelled').length;
    const cancelled = ordersList.filter((o: any) => o.status === 'Cancelled').length;

    const returnsList = Object.values(returns || {});
    const totalReturns = returnsList.length;
    const receivedReturns = returnsList.filter((r: any) => r.status === 'Received').length;

    const statCards = [
        { title: 'إجمالي الشحنات الحية', value: totalLive, icon: <Package className="w-8 h-8 text-blue-500" />, color: 'text-blue-600' },
        { title: 'تم التغليف (Shipped)', value: shipped, icon: <Truck className="w-8 h-8 text-green-500" />, color: 'text-green-600' },
        { title: 'قيد الانتظار', value: pending, icon: <AlertTriangle className="w-8 h-8 text-amber-500" />, color: 'text-amber-600' },
        { title: 'ملغي (Cancelled)', value: cancelled, icon: <XCircle className="w-8 h-8 text-red-500" />, color: 'text-red-600' },
        { title: 'إجمالي المرتجعات', value: totalReturns, icon: <RefreshCcw className="w-8 h-8 text-purple-500" />, color: 'text-purple-600' },
        { title: 'مرتجعات مستلمة', value: receivedReturns, icon: <CheckCircle className="w-8 h-8 text-emerald-500" />, color: 'text-emerald-600' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {statCards.map((stat, i) => (
                <Card key={i} className="shadow-sm border border-gray-100">
                    <Card.Content className="flex flex-row items-center justify-between p-6">
                        <div>
                            <p className="text-sm text-gray-500 font-bold mb-1">{stat.title}</p>
                            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-full">
                            {stat.icon}
                        </div>
                    </Card.Content>
                </Card>
            ))}
        </div>
    );
}

