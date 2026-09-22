import { useEffect, useRef } from 'react';

type ScanCallback = (barcode: string) => void;

export function useScanner(onScan: ScanCallback) {
    const bufferRef = useRef('');
    const lastScanTimeRef = useRef(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block DevTools shortcuts to prevent scanner weirdness
            if (e.key === 'F12' || 
               (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) || 
               (e.ctrlKey && (e.key === 'U' || e.key === 'u'))) {
                e.preventDefault();
                return;
            }

            // Ignore if typing in a text field that is NOT readonly
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'hidden' && !(target as HTMLInputElement).readOnly) return;
            if (target.tagName === 'TEXTAREA') return;

            // Trap non-character keys
            if (e.key.length > 1 && e.key !== 'Enter') {
                if(e.key.startsWith('F')) e.preventDefault(); // Block F1-F11 from scanners
                return;
            }

            const currentTime = new Date().getTime();
            
            // Capture rapid sequential keystrokes (currentTime - lastKeyTime < 50ms)
            if (currentTime - lastScanTimeRef.current > 50) {
                // If it's slow (human typing), flush the buffer
                bufferRef.current = '';
            }
            
            if (e.key === 'Enter') {
                e.preventDefault();
                if (bufferRef.current.length >= 3) {
                    const cleanBarcode = bufferRef.current.trim().replace(/[^a-zA-Z0-9]/g, '');
                    bufferRef.current = ''; // Flush immediately
                    if (cleanBarcode) {
                        onScan(cleanBarcode);
                    }
                } else {
                    bufferRef.current = '';
                }
            } else if (e.key.length === 1) {
                let char = e.key;
                // Normalize Arabic numerics
                const arabicMap: Record<string, string> = { '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9', '٠': '0' };
                if (arabicMap[char]) char = arabicMap[char];
                
                // Allow only alphanumeric
                if (/[a-zA-Z0-9\-]/.test(char)) {
                    bufferRef.current += char;
                }
            }
            
            lastScanTimeRef.current = currentTime;
        };

        window.addEventListener('keydown', handleKeyDown, true);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [onScan]);
}
