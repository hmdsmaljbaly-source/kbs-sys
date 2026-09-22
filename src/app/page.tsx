'use client';

import { useState, useEffect } from 'react';
import { Card, Input, Button } from '@heroui/react';
import { PackageSearch, User, Lock, Loader } from 'lucide-react';
import { ref, get, child } from 'firebase/database';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

const USER_KEY = 'kbs_user';

const MASTER_ADMIN = {
  username: "gebaly27",
  password: "gebo777",
  name: "Mr. Gebaly",
  role: "ADMIN"
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    try {
      const stored = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
      if (stored) {
        const user = JSON.parse(stored);
        redirectRole(user.role);
      }
    } catch (e) {}
  }, []);

  const redirectRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        window.location.replace('/admin');
        break;
      case 'PACKAGING':
        window.location.replace('/packer');
        break;
      case 'WAREHOUSE':
        window.location.replace('/warehouse');
        break;
      default:
        break;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);

    try {
      // 1. Check Master Admin
      if (username.trim().toLowerCase() === MASTER_ADMIN.username.toLowerCase() && password === MASTER_ADMIN.password) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(MASTER_ADMIN));
        toast.success('تم تسجيل الدخول بنجاح');
        redirectRole(MASTER_ADMIN.role);
        return;
      }

      // 2. Check Firebase
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `artifacts/korean-beautys-dispatch/users`));

      if (snapshot.exists()) {
        const users = snapshot.val();
        let foundUser: any = null;
        let userKey: string | null = null;

        for (const [key, user] of Object.entries<any>(users)) {
          if (user.username && user.username.toLowerCase() === username.trim().toLowerCase() && user.password === password) {
            foundUser = user;
            userKey = key;
            break;
          }
        }

        if (foundUser) {
          if (foundUser.isActive === false) {
            toast.error('الحساب غير مفعل');
            setLoading(false);
            return;
          }

          const sessionData = {
            uid: userKey,
            username: foundUser.username,
            name: foundUser.name,
            role: foundUser.role
          };

          sessionStorage.setItem(USER_KEY, JSON.stringify(sessionData));
          toast.success('تم تسجيل الدخول بنجاح');
          redirectRole(foundUser.role);
          return;
        }
      }

      toast.error('اسم المستخدم أو كلمة المرور غير صحيحة');
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <Card className="w-full max-w-md shadow-2xl border border-white/50 bg-white/90 backdrop-blur">
        <Card.Content className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-inner">
              <PackageSearch className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Korean Beautys</h1>
            <p className="text-gray-500 mt-2 font-medium">نظام إدارة المخازن والتوزيع</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">اسم المستخدم</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute right-3 top-3 z-10" />
                <Input
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-3 z-10" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-base font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white"
              isDisabled={loading}
            >
              {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'تسجيل الدخول'}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
