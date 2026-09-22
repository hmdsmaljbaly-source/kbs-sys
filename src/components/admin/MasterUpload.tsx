'use client';
import { Card, Button, Input } from '@heroui/react';
import { UploadCloud } from 'lucide-react';

export function MasterUpload() {
    return (
        <Card className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-xl">
            <Card.Content className="p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-blue-500/10 text-blue-400 p-5 rounded-2xl border border-blue-500/20 mb-4">
                    <UploadCloud className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">رفع شيت الأوردرات (Master Upload)</h2>
                <p className="text-zinc-400 mb-6 text-sm">قم برفع شيت الإكسيل الخاص بالأوردرات ليتم تسجيلها في النظام.</p>
                <div className="flex gap-4 items-center max-w-md w-full justify-center">
                    <Input type="file" className="bg-zinc-950 border-zinc-800 text-white rounded-xl" />
                    <Button variant="primary" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-6 py-2.5">
                        <UploadCloud className="w-4 h-4" /> رفع ومعالجة
                    </Button>
                </div>
            </Card.Content>
        </Card>
    );
}
