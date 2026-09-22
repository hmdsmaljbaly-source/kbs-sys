'use client';
import { Card, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { RefreshCcw } from 'lucide-react';

export function ReturnsManager({ returns }: any) {
    const returnsList = Object.entries(returns || {}).map(([id, data]) => ({ id, ...(data as any) }));

    return (
        <Card className="mt-6">
            <Card.Content className="p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <RefreshCcw className="w-6 h-6 text-purple-600" />
                        إدارة المرتجعات واستلامها
                    </h2>
                </div>

                <div className="flex gap-4 mb-6">
                    <Input placeholder="امسح باركود المرتجع هنا..." className="flex-1"  />
                    <Button variant="primary" >تسجيل مرتجع</Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50 text-gray-700 text-xs font-bold uppercase">
                                <th className="p-3">رقم التتبع</th>
                                <th className="p-3">رقم الأوردر</th>
                                <th className="p-3">تاريخ الاستلام</th>
                                <th className="p-3">الحالة</th>
                                <th className="p-3">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {returnsList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400 font-bold">
                                        لا توجد مرتجعات مسجلة
                                    </td>
                                </tr>
                            ) : (
                                returnsList.map((ret: any) => (
                                    <tr key={ret.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-mono" dir="ltr">{ret.trackingNumber}</td>
                                        <td className="p-3">#{ret.orderId}</td>
                                        <td className="p-3">{new Date(ret.receivedAt).toLocaleString()}</td>
                                        <td className="p-3">
                                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">
                                                {ret.status}
                                            </span>
                                        </td>
                                        <td className="p-3">{ret.notes || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card.Content>
        </Card>
    );
}
