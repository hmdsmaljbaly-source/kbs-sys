'use client';
import { Card, Button } from '@heroui/react';
import { Users } from 'lucide-react';

export function WorkerAssignment({ users, batches, orders }: any) {
    const activeWorkers = Object.values(users || {}).filter((u: any) => u.roles?.includes('PACKAGING') || u.roles?.includes('WORKER'));

    return (
        <Card className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-xl">
            <Card.Content className="p-6">
                <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-purple-400" />
                        توزيع الدفعات وتعيين الموظفين
                    </h2>
                    <Button variant="secondary" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold rounded-xl text-xs">
                        تحديث الدفعات
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 border border-zinc-800 rounded-2xl p-5 bg-zinc-950/60">
                        <h3 className="font-bold text-white mb-4">تعيين دفعة جديدة</h3>
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="text-xs font-bold text-zinc-400">اختر الموظف</label>
                            <select className="bg-zinc-900 border-zinc-800 rounded-xl p-2.5 w-full border text-white text-sm focus:outline-none focus:border-blue-500">
                                <option value="">حدد الموظف</option>
                                {activeWorkers.map((worker: any) => (
                                    <option key={worker.username} value={worker.username}>
                                        {worker.name || worker.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                            <label className="text-xs font-bold text-zinc-400">حجم الدفعة</label>
                            <select className="bg-zinc-900 border-zinc-800 rounded-xl p-2.5 w-full border text-white text-sm focus:outline-none focus:border-blue-500">
                                <option value="">عدد الأوردرات</option>
                                <option value="10">10 أوردرات</option>
                                <option value="20">20 أوردر</option>
                                <option value="50">50 أوردر</option>
                            </select>
                        </div>
                        <Button variant="primary" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl py-2.5">
                            تخصيص الدفعة
                        </Button>
                    </div>
                    
                    <div className="lg:col-span-2">
                        <h3 className="font-bold text-white mb-4">الدفعات النشطة حالياً</h3>
                        <div className="overflow-x-auto rounded-xl border border-zinc-800">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-xs font-bold uppercase">
                                        <th className="p-3">الموظف</th>
                                        <th className="p-3">إجمالي</th>
                                        <th className="p-3">المنجز</th>
                                        <th className="p-3">المتبقي</th>
                                        <th className="p-3">الحالة</th>
                                        <th className="p-3">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/60 text-sm text-zinc-300">
                                    {Object.keys(batches || {}).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-zinc-500 font-bold">
                                                لا توجد دفعات نشطة
                                            </td>
                                        </tr>
                                    ) : (
                                        Object.entries(batches || {}).map(([worker, batch]: any) => {
                                            const total = batch?.orders?.length || 0;
                                            const shipped = batch?.orders?.filter((o: any) => o.status === 'Shipped').length || 0;
                                            return (
                                                <tr key={worker} className="hover:bg-zinc-800/40">
                                                    <td className="p-3 font-bold text-white">{worker}</td>
                                                    <td className="p-3">{total}</td>
                                                    <td className="p-3 text-emerald-400 font-bold">{shipped}</td>
                                                    <td className="p-3 text-amber-400 font-bold">{total - shipped}</td>
                                                    <td className="p-3">{batch.printed ? 'مطبوعة' : 'لم تطبع'}</td>
                                                    <td className="p-3">
                                                        <Button variant="danger" className="text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg py-1 px-3">إلغاء الدفعة</Button>
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
