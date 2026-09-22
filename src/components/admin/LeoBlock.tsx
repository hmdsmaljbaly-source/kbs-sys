'use client';
import { Card, Input, Button, Switch } from '@heroui/react';
import { Lock } from 'lucide-react';

export function LeoBlock({ orders }: any) {
    return (
        <Card className="mt-6">
            <Card.Content className="p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Lock className="w-6 h-6 text-orange-600" />
                        نظام LEO Lock (حظر الشحن)
                    </h2>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-orange-800">
                    يمكنك هنا حظر أي أوردر من الشحن مؤقتاً. إذا قام الموظف بمسح باركود أوردر محظور، سيصدر النظام تنبيهاً ولن يتم تسجيله.
                </div>

                <div className="flex gap-4 max-w-md">
                    <Input placeholder="رقم الأوردر أو التتبع..." className="flex-1" />
                    <Button variant="secondary" className="text-white">تطبيق الحظر</Button>
                </div>
            </Card.Content>
        </Card>
    );
}
