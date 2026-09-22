'use client';
import { Card, Input, Button } from '@heroui/react';
import { Search } from 'lucide-react';

export function OrderSearch({ orders, archiveOrders, returns, archiveReturns }: any) {
    return (
        <Card className="mt-6">
            <Card.Content className="p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Search className="w-6 h-6 text-blue-600" />
                        البحث الشامل والتتبع
                    </h2>
                </div>

                <div className="flex gap-4 max-w-2xl mb-6">
                    <Input placeholder="أدخل رقم الأوردر، التتبع، أو رقم الهاتف..." className="flex-1"  />
                    <Button variant="primary"><Search className="w-4 h-4" /> بحث</Button>
                </div>

                <div className="text-center text-gray-500 py-12">
                    قم بإدخال بيانات البحث للبحث في الأوردرات الحية، المؤرشفة، والمرتجعات.
                </div>
            </Card.Content>
        </Card>
    );
}
