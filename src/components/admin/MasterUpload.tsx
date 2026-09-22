'use client';
import { Card, Button, Input } from '@heroui/react';
import { UploadCloud } from 'lucide-react';

export function MasterUpload() {
    return (
        <Card className="mt-6">
            <Card.Content className="p-8 flex flex-col items-center justify-center text-center">
                <UploadCloud className="w-16 h-16 text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">رفع شيت الأوردرات (Master Upload)</h2>
                <p className="text-gray-500 mb-6">قم برفع شيت الإكسيل الخاص بالأوردرات ليتم تسجيلها في النظام.</p>
                <div className="flex gap-4 items-center">
                    <Input type="file" className="max-w-xs" />
                    <Button variant="primary">
                        <UploadCloud className="w-4 h-4" /> رفع ومعالجة
                    </Button>
                </div>
            </Card.Content>
        </Card>
    );
}
