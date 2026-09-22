'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@heroui/react';
import { 
  Shield, ListTodo, Layers, BarChart3, CornerDownLeft, Users, LogOut, 
  ShoppingBag, Plus, Printer, Truck, Archive, Trash2, Search,
  Clock, DollarSign, CheckCircle2, Package, Sparkles
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
      <div className="min-h-screen flex flex-col items-center justify-center font-bold text-xl text-blue-600 bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>جاري تحميل لوحة التحكم (HeroUI)...</span>
      </div>
    );
  }

  const ordersList = Object.values(orders || {});
  const totalOrdersCount = ordersList.length;
  const shippedCount = ordersList.filter((o: any) => o.status === 'Shipped').length;
  const pendingCount = ordersList.filter((o: any) => o.status !== 'Shipped' && o.status !== 'Cancelled').length;
  const totalCod = ordersList.reduce((acc: number, o: any) => acc + (parseFloat(o.cod) || 0), 0);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased selection:bg-blue-500 selection:text-white" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200/80 shadow-sm h-screen sticky top-0 flex flex-col z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-2xl text-blue-600 border border-blue-100 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-wide flex items-center gap-1.5">
              Admin Panel <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Mr. Gebaly</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveNav('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'orders'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListTodo className="w-5 h-5" />
            <span>إدارة الأوردرات</span>
          </button>

          <button
            onClick={() => setActiveNav('batches')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'batches'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>توزيع الدفعات للبلك</span>
          </button>

          <button
            onClick={() => setActiveNav('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'reports'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>التقارير وسجل البيانات</span>
          </button>

          <button
            onClick={() => setActiveNav('returns')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'returns'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CornerDownLeft className="w-5 h-5" />
            <span>المرتجعات (Returns)</span>
          </button>

          <button
            onClick={() => setActiveNav('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'users'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>إدارة الحسابات</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Button
            variant="danger"
            onPress={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-bold py-2.5 rounded-2xl transition-all"
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
            {/* Header Title & Actions */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                  <ShoppingBag className="text-blue-600 w-7 h-7" /> إدارة الأوردرات
                </h2>
                <p className="text-slate-500 text-sm mt-1">التحكم الكامل ببيانات الطرود وتفعيل علامة الحظر (LEO)</p>
              </div>

              {/* Action Toolbar */}
              <div className="flex gap-2 flex-wrap items-center">
                <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl px-5 py-2.5 text-sm shadow-md shadow-blue-500/20 transition-all">
                  <Plus className="w-4 h-4" /> إضافة أوردر يدوي
                </Button>

                <div className="flex rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <button className="bg-rose-600 text-white px-3.5 py-2.5 text-sm hover:bg-rose-700 font-bold flex items-center gap-1 border-r border-slate-200 transition" title="تحميل مانيفست (PDF)">
                    <Truck className="w-4 h-4" />
                  </button>
                  <button className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 text-sm font-bold flex items-center gap-2 transition">
                    <Printer className="w-4 h-4" /> مانيفست المندوب
                  </button>
                </div>

                <Button className="bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold px-4 py-2.5 text-sm rounded-2xl border border-amber-200 transition">
                  <Archive className="w-4 h-4" /> تقفيل اليوم
                </Button>

                <Button className="bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold px-4 py-2.5 text-sm rounded-2xl border border-rose-200 transition">
                  <Trash2 className="w-4 h-4" /> تصفير بالكامل
                </Button>
              </div>
            </div>

            {/* KPI Stat Cards (HeroUI Light SaaS Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition">
                <Card.Content className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">إجمالي أوردرات اليوم</p>
                    <h3 className="text-3xl font-black text-slate-900">{totalOrdersCount}</h3>
                  </div>
                  <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl border border-blue-100">
                    <Package className="w-7 h-7" />
                  </div>
                </Card.Content>
              </Card>

              <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition">
                <Card.Content className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">تم شحنها بنجاح</p>
                    <h3 className="text-3xl font-black text-emerald-600">{shippedCount}</h3>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl border border-emerald-100">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                </Card.Content>
              </Card>

              <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition">
                <Card.Content className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">متبقي قيد الانتظار</p>
                    <h3 className="text-3xl font-black text-amber-500">{pendingCount}</h3>
                  </div>
                  <div className="bg-amber-50 text-amber-500 p-3.5 rounded-2xl border border-amber-100">
                    <Clock className="w-7 h-7" />
                  </div>
                </Card.Content>
              </Card>

              <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition">
                <Card.Content className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">إجمالي التحصيل (شحن)</p>
                    <h3 className="text-3xl font-black text-rose-600">{totalCod.toFixed(2)} <span className="text-xs text-slate-400">ج.م</span></h3>
                  </div>
                  <div className="bg-rose-50 text-rose-600 p-3.5 rounded-2xl border border-rose-100">
                    <DollarSign className="w-7 h-7" />
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Filter Toolbar (HeroUI Light Surface) */}
            <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm">
              <Card.Content className="p-3.5 flex flex-wrap items-center gap-3 w-full">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:border-blue-600 transition-all"
                >
                  <option value="all">الكل (All Statuses)</option>
                  <option value="Shipped">تم الشحن (Shipped)</option>
                  <option value="Pending">قيد الانتظار (Pending)</option>
                </select>

                <select 
                  value={filterLeo}
                  onChange={(e) => setFilterLeo(e.target.value)}
                  className="py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:border-blue-600 transition-all"
                >
                  <option value="all">الكل (All LEO)</option>
                  <option value="leo_active">حظر LEO (Active)</option>
                  <option value="leo_normal">عادي (Normal)</option>
                </select>

                <select 
                  value={filterWorker}
                  onChange={(e) => setFilterWorker(e.target.value)}
                  className="py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:border-blue-600 transition-all"
                >
                  <option value="all">كافة العمال (All Workers)</option>
                  <option value="unassigned">غير معين (-)</option>
                  {Object.values(users || {}).map((u: any) => (
                    <option key={u.username} value={u.username}>{u.name || u.username}</option>
                  ))}
                </select>

                <div className="relative flex-1 min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 z-10" />
                  <Input 
                    type="text" 
                    placeholder="ابحث برقم الأوردر، التتبع، المنتجات، العامل..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl focus:bg-white"
                  />
                </div>
              </Card.Content>
            </Card>

            {/* Orders Table (HeroUI Modern Light Table) */}
            <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <Card.Content className="p-0">
                <div className="overflow-x-auto min-h-[50vh]">
                  <table className="w-full text-right text-sm border-collapse">
                    <thead className="bg-slate-50/90 text-slate-500 border-b border-slate-200 sticky top-0 backdrop-blur z-10">
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
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-16 text-slate-400 font-bold">
                            لا توجد أوردرات تطابق خيارات البحث الحالية
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order: any, idx: number) => {
                          const isShipped = order.status === 'Shipped';
                          const isCancelled = order.status === 'Cancelled';
                          const isLeo = order.isLeo;

                          return (
                            <tr key={order.orderId || order.trackingNumber || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4 font-bold text-slate-900">#{order.orderId || '-'}</td>
                              <td className="p-4 font-mono text-slate-700" dir="ltr">{order.trackingNumber || '-'}</td>
                              <td className="p-4 font-black text-rose-600">{order.cod ? `${order.cod} ج.م` : '0'}</td>
                              <td className="p-4 font-medium text-slate-700">{order.assignedWorker || order.assignedTo || '-'}</td>
                              <td className="p-4 max-w-xs text-xs text-slate-700">
                                {Array.isArray(order.items) && order.items.length > 0 ? (
                                  <div className="space-y-1">
                                    {order.items.map((it: any, i: number) => (
                                      <div key={i} className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                                        <span className="truncate">{it.name || '-'}</span>
                                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">العدد: {it.qty || 1}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="truncate block">{order.products || '-'}</span>
                                )}
                              </td>
                              <td className="p-4 text-slate-500 text-xs">{order.notes || '-'}</td>
                              <td className="p-4 text-center">
                                {isShipped ? (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> تم الشحن
                                  </span>
                                ) : isCancelled ? (
                                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full">
                                    ملغي
                                  </span>
                                ) : (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" /> قيد الانتظار
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {isLeo ? (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">LEO</span>
                                ) : (
                                  <span className="text-slate-400 text-xs">عادي</span>
                                )}
                              </td>
                              <td className="p-4 text-center text-xs text-slate-500">
                                {order.scanTime ? new Date(order.scanTime).toLocaleTimeString('ar-EG') : 'لم يتم الإسكان'}
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
