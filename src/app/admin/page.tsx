'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@heroui/react';
import { 
  Shield, ListTodo, Layers, BarChart3, CornerDownLeft, Users, LogOut, 
  ShoppingBag, Plus, Printer, Truck, Archive, Trash2, Search, Lock,
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
      <div className="min-h-screen flex flex-col items-center justify-center font-bold text-xl text-blue-400 bg-zinc-950 gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex font-sans antialiased selection:bg-blue-500 selection:text-white" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900/70 backdrop-blur-xl h-screen sticky top-0 flex flex-col z-20 border-l border-zinc-800/80">
        <div className="p-6 border-b border-zinc-800/80 flex items-center gap-3">
          <div className="bg-blue-500/10 p-2.5 rounded-2xl text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              Admin Panel <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Mr. Gebaly</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveNav('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'orders'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <ListTodo className="w-5 h-5" />
            <span>إدارة الأوردرات</span>
          </button>

          <button
            onClick={() => setActiveNav('batches')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'batches'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>توزيع الدفعات للبلك</span>
          </button>

          <button
            onClick={() => setActiveNav('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'reports'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>التقارير وسجل البيانات</span>
          </button>

          <button
            onClick={() => setActiveNav('returns')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'returns'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <CornerDownLeft className="w-5 h-5" />
            <span>المرتجعات (Returns)</span>
          </button>

          <button
            onClick={() => setActiveNav('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
              activeNav === 'users'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>إدارة الحسابات</span>
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800/80">
          <Button
            variant="danger"
            onPress={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-bold py-3 rounded-2xl transition-all"
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
                <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                  <ShoppingBag className="text-blue-500 w-7 h-7" /> إدارة الأوردرات
                </h2>
                <p className="text-zinc-400 text-sm mt-1">التحكم الكامل ببيانات الطرود وتفعيل علامة الحظر (LEO)</p>
              </div>

              {/* Action Toolbar */}
              <div className="flex gap-3 flex-wrap items-center">
                <Button variant="primary" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl px-5 py-2.5 text-sm shadow-lg shadow-blue-600/30 transition-all">
                  <Plus className="w-4 h-4" /> إضافة أوردر يدوي
                </Button>

                <div className="flex rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-sm">
                  <button className="bg-rose-600/80 hover:bg-rose-600 text-white px-3.5 py-2.5 text-sm font-bold flex items-center gap-1 border-r border-zinc-800 transition" title="تحميل مانيفست (PDF)">
                    <Truck className="w-4 h-4" />
                  </button>
                  <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2.5 text-sm font-bold flex items-center gap-2 transition">
                    <Printer className="w-4 h-4" /> مانيفست المندوب
                  </button>
                </div>

                <Button className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold px-4 py-2.5 text-sm rounded-2xl border border-amber-500/20 transition">
                  <Archive className="w-4 h-4" /> تقفيل اليوم
                </Button>

                <Button className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-bold px-4 py-2.5 text-sm rounded-2xl border border-rose-500/20 transition">
                  <Trash2 className="w-4 h-4" /> تصفير بالكامل
                </Button>
              </div>
            </div>

            {/* KPI Stat Cards (HeroUI Dark Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl shadow-lg backdrop-blur">
                <Card.Content className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 mb-1">إجمالي أوردرات اليوم</p>
                    <h3 className="text-3xl font-black text-white">{totalOrdersCount}</h3>
                  </div>
                  <div className="bg-blue-500/10 text-blue-400 p-3.5 rounded-2xl border border-blue-500/20">
                    <Package className="w-7 h-7" />
                  </div>
                </Card.Content>
              </Card>

              <Card className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl shadow-lg backdrop-blur">
                <Card.Content className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 mb-1">تم شحنها بنجاح</p>
                    <h3 className="text-3xl font-black text-emerald-400">{shippedCount}</h3>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-2xl border border-emerald-500/20">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                </Card.Content>
              </Card>

              <Card className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl shadow-lg backdrop-blur">
                <Card.Content className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 mb-1">متبقي قيد الانتظار</p>
                    <h3 className="text-3xl font-black text-amber-400">{pendingCount}</h3>
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 p-3.5 rounded-2xl border border-amber-500/20">
                    <Clock className="w-7 h-7" />
                  </div>
                </Card.Content>
              </Card>

              <Card className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl shadow-lg backdrop-blur">
                <Card.Content className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 mb-1">إجمالي التحصيل (شحن)</p>
                    <h3 className="text-3xl font-black text-rose-400">{totalCod.toFixed(2)} <span className="text-xs text-zinc-500">ج.م</span></h3>
                  </div>
                  <div className="bg-rose-500/10 text-rose-400 p-3.5 rounded-2xl border border-rose-500/20">
                    <DollarSign className="w-7 h-7" />
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Filter Toolbar (HeroUI Dark Surface) */}
            <Card className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-lg">
              <Card.Content className="p-3.5 flex flex-wrap items-center gap-3 w-full">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="py-2.5 px-4 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200 bg-zinc-950 hover:bg-zinc-900 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="all">الكل (All Statuses)</option>
                  <option value="Shipped">تم الشحن (Shipped)</option>
                  <option value="Pending">قيد الانتظار (Pending)</option>
                </select>

                <select 
                  value={filterLeo}
                  onChange={(e) => setFilterLeo(e.target.value)}
                  className="py-2.5 px-4 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200 bg-zinc-950 hover:bg-zinc-900 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="all">الكل (All LEO)</option>
                  <option value="leo_active">حظر LEO (Active)</option>
                  <option value="leo_normal">عادي (Normal)</option>
                </select>

                <select 
                  value={filterWorker}
                  onChange={(e) => setFilterWorker(e.target.value)}
                  className="py-2.5 px-4 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-200 bg-zinc-950 hover:bg-zinc-900 focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="all">كافة العمال (All Workers)</option>
                  <option value="unassigned">غير معين (-)</option>
                  {Object.values(users || {}).map((u: any) => (
                    <option key={u.username} value={u.username}>{u.name || u.username}</option>
                  ))}
                </select>

                <div className="relative flex-1 min-w-[260px]">
                  <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3 z-10" />
                  <Input 
                    type="text" 
                    placeholder="ابحث برقم الأوردر، التتبع، المنتجات، العامل..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 rounded-xl"
                  />
                </div>
              </Card.Content>
            </Card>

            {/* Orders Table (HeroUI Modern Dark Table) */}
            <Card className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-xl overflow-hidden">
              <Card.Content className="p-0">
                <div className="overflow-x-auto min-h-[50vh]">
                  <table className="w-full text-right text-sm border-collapse">
                    <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 sticky top-0 backdrop-blur z-10">
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
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-16 text-zinc-500 font-bold">
                            لا توجد أوردرات تطابق خيارات البحث الحالية
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order: any, idx: number) => {
                          const isShipped = order.status === 'Shipped';
                          const isCancelled = order.status === 'Cancelled';
                          const isLeo = order.isLeo;

                          return (
                            <tr key={order.orderId || order.trackingNumber || idx} className="hover:bg-zinc-800/40 transition-colors">
                              <td className="p-4 font-bold text-white">#{order.orderId || '-'}</td>
                              <td className="p-4 font-mono text-zinc-300" dir="ltr">{order.trackingNumber || '-'}</td>
                              <td className="p-4 font-black text-rose-400">{order.cod ? `${order.cod} ج.م` : '0'}</td>
                              <td className="p-4 font-medium text-zinc-300">{order.assignedWorker || order.assignedTo || '-'}</td>
                              <td className="p-4 max-w-xs text-xs text-zinc-300">
                                {Array.isArray(order.items) && order.items.length > 0 ? (
                                  <div className="space-y-1">
                                    {order.items.map((it: any, i: number) => (
                                      <div key={i} className="flex items-center justify-between gap-2 bg-zinc-950/60 border border-zinc-800 p-1.5 rounded-lg">
                                        <span className="truncate">{it.name || '-'}</span>
                                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">العدد: {it.qty || 1}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="truncate block">{order.products || '-'}</span>
                                )}
                              </td>
                              <td className="p-4 text-zinc-400 text-xs">{order.notes || '-'}</td>
                              <td className="p-4 text-center">
                                {isShipped ? (
                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> تم الشحن
                                  </span>
                                ) : isCancelled ? (
                                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold px-3 py-1 rounded-full">
                                    ملغي
                                  </span>
                                ) : (
                                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> قيد الانتظار
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                {isLeo ? (
                                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full">LEO</span>
                                ) : (
                                  <span className="text-zinc-600 text-xs">عادي</span>
                                )}
                              </td>
                              <td className="p-4 text-center text-xs text-zinc-500">
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
