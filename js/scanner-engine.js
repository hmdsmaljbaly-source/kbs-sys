/**
 * Scanner Engine for KBS System (Hardware Strict Mode)
 * Exclusively traps rapid sequence hardware keyboard scanner inputs.
 */
import { AudioService } from './audio-service.js';

export const ScannerEngine = {
    buffer: '',
    lastScanTime: 0,
    onScanCallback: null,

    initKeyboardScanner(callback) {
        this.onScanCallback = callback;
        
        window.addEventListener('keydown', (e) => {
            // Ignore if typing in a text field that is NOT readonly
            if (e.target.tagName === 'INPUT' && e.target.type !== 'hidden' && !e.target.readOnly) return;
            if (e.target.tagName === 'TEXTAREA') return;

            // Trap non-character keys
            if (e.key.length > 1 && e.key !== 'Enter') return;

            const currentTime = new Date().getTime();
            
            // Capture rapid sequential keystrokes (currentTime - lastKeyTime < 50ms)
            if (currentTime - this.lastScanTime > 50) {
                // If it's slow (human typing), flush the buffer
                this.buffer = '';
            }
            
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.buffer.length >= 3) {
                    const cleanBarcode = this.buffer.trim();
                    this.buffer = ''; // Flush immediately
                    this.processScan(cleanBarcode);
                } else {
                    this.buffer = '';
                }
            } else if (e.key.length === 1) {
                let char = e.key;
                // Normalize Arabic numerics
                const arabicMap = { '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9', '٠': '0' };
                if (arabicMap[char]) char = arabicMap[char];
                
                // Allow only alphanumeric
                if (/[a-zA-Z0-9\-]/.test(char)) {
                    this.buffer += char;
                }
            }
            
            this.lastScanTime = currentTime;
        }, true); // Use capture phase to intercept before other listeners
    },

    showOverlay(overlayClass, dynamicText = null) {
        document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
        
        const overlay = document.querySelector(`.${overlayClass}`);
        if (overlay) {
            if (dynamicText) {
                const textEl = overlay.querySelector('.dynamic-text');
                if (textEl) textEl.textContent = dynamicText;
            }
            overlay.classList.add('active');
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 3000);
        }
    },

    async processScan(barcode) {
        // Sanitize string via regex to extract strictly clean Tracking Number / Order ID
        let clean = String(barcode).replace(/[^a-zA-Z0-9]/g, '').trim();
        if (!clean) return;

        try {
            if (this.onScanCallback) {
                await this.onScanCallback(clean);
            }
        } catch (error) {
            console.error("Scan processing error:", error);
            this.triggerNotInBatch();
        }
    },

    triggerSuccess(orderId) {
        AudioService.playSuccess();
        this.showOverlay('overlay-success', `#${orderId}`);
    },

    triggerDuplicate() {
        AudioService.playDuplicate();
        this.showOverlay('overlay-duplicate');
    },

    triggerLeoBlocked() {
        AudioService.playLeoBlocked();
        this.showOverlay('overlay-leo');
    },

    triggerNotInBatch() {
        AudioService.playError();
        this.showOverlay('overlay-not-in-batch');
    }
};
