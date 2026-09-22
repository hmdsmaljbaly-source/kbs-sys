'use client';
import { Card, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { Users } from 'lucide-react';

export function WorkerAssignment({ users, batches, orders }: any) {
    const activeWorkers = Object.values(users || {}).filter((u: any) => u.roles?.includes('PACKAGING') || u.roles?.includes('WORKER'));

    return (
        <Card className="mt-6">
            <Card.Content className="p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-600" />
                        توزيع الدفعات وتعيين الموظفين
                    </h2>
                    <Button variant="secondary" >
                        تحديث الدفعات
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 border rounded-lg p-4 bg-gray-50">
                        <h3 className="font-bold mb-4">تعيين دفعة جديدة</h3>
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="text-sm font-bold text-gray-700">اختر الموظف</label>
                            <select className="border-gray-300 rounded-md p-2 w-full border">
                                <option value="">حدد الموظف</option>
                                {activeWorkers.map((worker: any) => (
                                    <option key={worker.username} value={worker.username}>
                                        {worker.name || worker.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="text-sm font-bold text-gray-700">حجم الدفعة</label>
                            <select className="border-gray-300 rounded-md p-2 w-full border">
                                <option value="">عدد الأوردرات</option>
                                <option value="10">10 أوردرات</option>
                                <option value="20">20 أوردر</option>
                                <option value="50">50 أوردر</option>
                            </select>
                        </div>
                        <Button variant="primary" className="w-full">
                            تخصيص الدفعة
                        </Button>
                    </div>
                    
                    <div className="lg:col-span-2">
                        <h3 className="font-bold mb-4">الدفعات النشطة حالياً</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-gray-700 text-xs font-bold uppercase">
                                        <th className="p-3">الموظف</th>
                                        <th className="p-3">إجمالي</th>
                                        <th className="p-3">المنجز</th>
                                        <th className="p-3">المتبقي</th>
                                        <th className="p-3">الحالة</th>
                                        <th className="p-3">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {Object.keys(batches || {}).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-gray-400 font-bold">
                                                لا توجد دفعات نشطة
                                            </td>
                                        </tr>
                                    ) : (
                                        Object.entries(batches || {}).map(([worker, batch]: any) => {
                                            const total = batch?.orders?.length || 0;
                                            const shipped = batch?.orders?.filter((o: any) => o.status === 'Shipped').length || 0;
                                            return (
                                                <tr key={worker} className="hover:bg-gray-50">
                                                    <td className="p-3 font-bold">{worker}</td>
                                                    <td className="p-3">{total}</td>
                                                    <td className="p-3 text-green-600 font-bold">{shipped}</td>
                                                    <td className="p-3 text-orange-500 font-bold">{total - shipped}</td>
                                                    <td className="p-3">{batch.printed ? 'مطبوعة' : 'لم تطبع'}</td>
                                                    <td className="p-3">
                                                        <Button variant="danger" className="text-xs bg-red-50 text-red-600 hover:bg-red-100">إلغاء الدفعة</Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
}
