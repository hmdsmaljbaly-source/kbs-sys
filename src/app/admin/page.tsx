'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@heroui/react';
import { 
  Shield, ListTodo, Layers, BarChart3, CornerDownLeft, Users, LogOut, 
  ShoppingBag, Plus, Printer, Truck, Archive, Trash2, Search, Lock 
} from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';

import { MasterUpload } from '@/components/admin/MasterUpload';
import { WorkerAssignment } from '@/components/admin/WorkerAssignment';
import { ReturnsManager } from '@/components/admin/ReturnsManager';
import { LeoBlock } from '@/components/admin/LeoBlock';
import { OrderSearch } from '@/components/admin/OrderSearch';

export default function AdminPage() {
  const { users, orders, batches, returns, archiveOrders, archiveReturns, loading } = useAdminData();
  const [activeNav, setActiveNav] = useState<'orders' | 'batches' | 'reports' | 'returns' | 'users'>('orders');

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLeo, setFilterLeo] = useState('all');
  const [filterWorker, setFilterWorker] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-blue-600 bg-gray-50">
        جاري تحميل لوحة التحكم...
      </div>
    );
  }

  const ordersList = Object.values(orders || {});
  
  // Filtering logic
  let filteredOrders = ordersList.filter((o: any) => {
    if (filterStatus === 'Shipped' && o.status !== 'Shipped') return false;
    if (filterStatus === 'Pending' && o.status === 'Shipped') return false;
    if (filterLeo === 'leo_active' && !o.isLeo) return false;
    if (filterLeo === 'leo_normal' && o.isLeo) return false;
    if (filterWorker === 'unassigned' && o.assignedWorker) return false;
    if (filterWorker !== 'all' && filterWorker !== 'unassigned' && o.assignedWorker !== filterWorker) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchId = String(o.orderId || '').toLowerCase().includes(q);
      const matchTrack = String(o.trackingNumber || '').toLowerCase().includes(q);
      const matchWorker = String(o.assignedWorker || '').toLowerCase().includes(q);
      const matchProd = String(o.products || '').toLowerCase().includes(q);
      if (!matchId && !matchTrack && !matchWorker && !matchProd) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans text-gray-800" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl h-screen sticky top-0 flex flex-col z-20 border-l border-gray-100">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800">Admin Panel</h1>
            <p className="text-xs text-gray-500 font-medium">Mr. Gebaly</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveNav('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-sm ${
              activeNav === 'orders'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ListTodo className="w-5 h-5" />
            <span>إدارة الأوردرات</span>
          </button>

          <button
            onClick={() => setActiveNav('batches')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-sm ${
              activeNav === 'batches'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>توزيع الدفعات للبلك</span>
          </button>

          <button
            onClick={() => setActiveNav('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-sm ${
              activeNav === 'reports'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>التقارير وسجل البيانات</span>
          </button>

          <button
            onClick={() => setActiveNav('returns')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-sm ${
              activeNav === 'returns'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CornerDownLeft className="w-5 h-5" />
            <span>المرتجعات (Returns)</span>
          </button>

          <button
            onClick={() => setActiveNav('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition text-sm ${
              activeNav === 'users'
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>إدارة الحسابات</span>
          </button>
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="danger"
            onPress={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold py-2.5 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {/* Section 1: Orders Management */}
        {activeNav === 'orders' && (
          <section className="space-y-6">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingBag className="text-blue-600 w-6 h-6" /> إدارة الأوردرات
                </h2>
                <p className="text-gray-500 text-sm mt-1">التحكم الكامل ببيانات الطرود وتفعيل علامة الحظر (LEO)</p>
              </div>

              {/* Action Toolbar */}
              <div className="flex gap-2 flex-wrap items-center">
                <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-4 py-2 text-sm shadow-sm">
                  <Plus className="w-4 h-4" /> إضافة أوردر يدوي
                </Button>

                <div className="flex rounded-lg shadow-sm border overflow-hidden">
                  <button className="bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700 font-bold flex items-center gap-1 border-r border-red-700" title="تحميل مانيفست (PDF)">
                    <Truck className="w-4 h-4" />
                  </button>
                  <button className="bg-slate-800 text-white px-3 py-2 text-sm hover:bg-slate-900 font-bold flex items-center gap-1">
                    <Printer className="w-4 h-4" /> مانيفست المندوب
                  </button>
                </div>

                <Button className="bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold px-4 py-2 text-sm rounded-lg shadow-sm border border-amber-200">
                  <Archive className="w-4 h-4" /> تقفيل اليوم
                </Button>

                <Button className="bg-red-100 text-red-700 hover:bg-red-200 font-bold px-4 py-2 text-sm rounded-lg shadow-sm border border-red-200">
                  <Trash2 className="w-4 h-4" /> تصفير بالكامل
                </Button>
              </div>
            </div>

            {/* Filter Toolbar */}
            <Card className="shadow-sm border">
              <Card.Content className="p-3 flex flex-wrap items-center gap-3 w-full">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-2 px-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">الكل (All Statuses)</option>
                  <option value="Shipped">تم الشحن (Shipped)</option>
                  <option value="Pending">قيد الانتظار (Pending)</option>
                </select>

                <select 
                  value={filterLeo}
                  onChange={(e) => setFilterLeo(e.target.value)}
                  className="py-2 px-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">الكل (All LEO)</option>
                  <option value="leo_active">حظر LEO (Active)</option>
                  <option value="leo_normal">عادي (Normal)</option>
                </select>

                <select 
                  value={filterWorker}
                  onChange={(e) => setFilterWorker(e.target.value)}
                  className="py-2 px-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">كافة العمال (All Workers)</option>
                  <option value="unassigned">غير معين (-)</option>
                  {Object.values(users || {}).map((u: any) => (
                    <option key={u.username} value={u.username}>{u.name || u.username}</option>
                  ))}
                </select>

                <div className="relative flex-1 min-w-[250px]">
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3 z-10" />
                  <Input 
                    type="text" 
                    placeholder="ابحث برقم الأوردر، التتبع، المنتجات، العامل..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9"
                  />
                </div>
              </Card.Content>
            </Card>

            {/* Orders Table */}
            <Card className="shadow-sm border overflow-hidden">
              <Card.Content className="p-0">
                <div className="overflow-x-auto min-h-[50vh]">
                  <table className="w-full text-right text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="p-4 font-bold">رقم الأوردر</th>
                        <th className="p-4 font-bold">رقم التتبع</th>
                        <th className="p-4 font-bold">التحصيل (COD)</th>
                        <th className="p-4 font-bold">العامل المعين</th>
                        <th className="p-4 font-bold">المنتجات (Products)</th>
                        <th className="p-4 font-bold">الملاحظات</th>
                        <th className="p-4 font-bold text-center">الحالة</th>
                        <th className="p-4 font-bold text-center">حالة LEO</th>
                        <th className="p-4 font-bold text-center">تفاصيل الإسكان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-12 text-gray-400 font-bold">
                            لا توجد أوردرات تطابق خيارات البحث الحالية
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order: any, idx: number) => {
                          const isShipped = order.status === 'Shipped';
                          const isCancelled = order.status === 'Cancelled';
                          const isLeo = order.isLeo;

                          return (
                            <tr key={order.orderId || order.trackingNumber || idx} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4 font-bold text-gray-900">#{order.orderId || '-'}</td>
                              <td className="p-4 font-mono text-gray-700" dir="ltr">{order.trackingNumber || '-'}</td>
                              <td className="p-4 font-black text-red-600">{order.cod || '0'}</td>
                              <td className="p-4 font-medium">{order.assignedWorker || order.assignedTo || '-'}</td>
                              <td className="p-4 max-w-xs truncate">{order.products || '-'}</td>
                              <td className="p-4 text-gray-500">{order.notes || '-'}</td>
                              <td className="p-4 text-center">
                                {isShipped ? (
                                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">تم الشحن</span>
                                ) : isCancelled ? (
                                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">ملغي</span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">قيد الانتظار</span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {isLeo ? (
                                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">LEO</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">-</span>
                                )}
                              </td>
                              <td className="p-4 text-center text-xs text-gray-500">
                                {order.scanTime ? new Date(order.scanTime).toLocaleTimeString('ar-EG') : '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card.Content>
            </Card>
          </section>
        )}

        {/* Section 2: Batches */}
        {activeNav === 'batches' && (
          <div className="space-y-6">
            <MasterUpload />
            <WorkerAssignment users={users} batches={batches} orders={orders} />
          </div>
        )}

        {/* Section 3: Reports */}
        {activeNav === 'reports' && (
          <OrderSearch orders={orders} archiveOrders={archiveOrders} returns={returns} archiveReturns={archiveReturns} />
        )}

        {/* Section 4: Returns */}
        {activeNav === 'returns' && (
          <ReturnsManager returns={returns} />
        )}

        {/* Section 5: Account / Users Management */}
        {activeNav === 'users' && (
          <LeoBlock orders={orders} />
        )}
      </main>
    </div>
  );
}
