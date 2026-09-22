'use client';
import { CheckCircle, AlertTriangle, ShieldAlert, XCircle, XOctagon, Ban } from 'lucide-react';

export type OverlayType = 'success' | 'duplicate' | 'leo' | 'error' | 'not-in-batch' | 'cancelled' | null;

interface PackerOverlaysProps {
    activeOverlay: OverlayType;
    dynamicText?: string | null;
}

export function PackerOverlays({ activeOverlay, dynamicText }: PackerOverlaysProps) {
    if (!activeOverlay) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-center items-center opacity-100 pointer-events-auto transition-opacity duration-300">
            {activeOverlay === 'success' && (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-green-600/95 text-white">
                    <CheckCircle className="w-32 h-32 mb-4" />
                    <h2 className="text-5xl font-bold mb-4 drop-shadow-md text-center">تم المسح بنجاح!</h2>
                    {dynamicText && (
                        <p className="font-mono text-4xl mt-4 bg-white/20 px-6 py-2 rounded-xl">{dynamicText}</p>
                    )}
                </div>
            )}
            
            {activeOverlay === 'duplicate' && (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-yellow-500/95 text-white">
                    <AlertTriangle className="w-32 h-32 mb-4" />
                    <h2 className="text-5xl font-bold mb-4 drop-shadow-md text-center">تم مسحه مسبقاً!</h2>
                </div>
            )}
            
            {activeOverlay === 'leo' && (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-orange-600/95 text-white">
                    <ShieldAlert className="w-32 h-32 mb-4" />
                    <h2 className="text-5xl font-bold mb-4 drop-shadow-md text-center">تحذير: LEO Lock!</h2>
                    <p className="text-2xl font-medium">هذا الأوردر محظور من الشحن مؤقتاً.</p>
                </div>
            )}
            
            {activeOverlay === 'error' && (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-red-600/95 text-white">
                    <XCircle className="w-32 h-32 mb-4" />
                    <h2 className="text-5xl font-bold mb-4 drop-shadow-md text-center">باركود غير صالح!</h2>
                </div>
            )}
            
            {activeOverlay === 'not-in-batch' && (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-red-600/95 text-white">
                    <XOctagon className="w-32 h-32 mb-4" />
                    <h2 className="text-5xl font-bold mb-4 drop-shadow-md text-center">⚠️ هذا الأوردر غير مخصص لك في هذه الدفعة!</h2>
                </div>
            )}
            
            {activeOverlay === 'cancelled' && (
                <div className="absolute inset-0 flex flex-col justify-center items-center bg-red-700/95 text-white">
                    <Ban className="w-32 h-32 mb-4" />
                    <h2 className="text-5xl font-bold mb-4 drop-shadow-md text-center">🚫 هذا الأوردر ملغي!</h2>
                    <p className="text-2xl font-medium">الرجاء إعادة الأوردر إلى الإدارة فوراً وعدم إسكانه.</p>
                </div>
            )}
        </div>
    );
}
