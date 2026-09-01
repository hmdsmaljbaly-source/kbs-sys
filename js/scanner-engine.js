/**
 * Scanner Engine for KBS System
 * Handles barcode input from physical scanners and cameras.
 */
import { AudioService } from './audio-service.js';
import { db } from './config.js';
import { ref, get, update, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { AuthService } from './auth.js';

export const ScannerEngine = {
    buffer: '',
    lastScanTime: 0,
    scannerTimer: null,
    onScanCallback: null,
    html5QrcodeScanner: null,

    /**
     * Initializes the global keyboard listener for physical scanners
     * @param {function} callback Function to call when a full barcode is read
     */
    
    initKeyboardScanner(callback) {
        this.onScanCallback = callback;
        
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in an input field (unless it's specifically meant for manual entry)
            if (e.target.tagName === 'INPUT' && e.target.type !== 'hidden') return;

            const currentTime = new Date().getTime();
            
            // Clear buffer if it's been too long since the last keystroke (human typing)
            if (currentTime - this.lastScanTime > 100) {
                this.buffer = '';
            }
            
            // Prevent default for scanning to avoid browser shortcuts opening
            // But we don't want to break normal page interaction. We can prevent default if we suspect a scan is ongoing.
            if (this.buffer.length > 0) {
                // Not strictly preventing default here to avoid breaking everything, but hardware scanners send rapid keystrokes
            }

            if (e.key === 'Enter') {
                e.preventDefault(); // Stop form submissions
                if (this.buffer.length > 3) {
                    this.processScan(this.buffer);
                    this.buffer = '';
                }
            } else if (e.key.length === 1) {
                // Only capture single characters, filter out noise
                let char = e.key;
                
                // Normalize Arabic to English characters
                const arabicMap = { '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9', '٠': '0' };
                if (arabicMap[char]) char = arabicMap[char];
                
                // Keep only alphanumeric
                if (/[a-zA-Z0-9]/.test(char)) {
                    this.buffer += char;
                }
            }
            
            this.lastScanTime = currentTime;
        });
    },

    initCameraScanner(elementId, callback) {
        if (!window.Html5QrcodeScanner) {
            console.error("html5-qrcode library not loaded");
            return;
        }

        this.onScanCallback = callback;
        this.html5QrcodeScanner = new window.Html5QrcodeScanner(
            elementId, 
            { fps: 10, qrbox: {width: 250, height: 100} },
            /* verbose= */ false
        );
        
        this.html5QrcodeScanner.render((decodedText, decodedResult) => {
            this.html5QrcodeScanner.pause();
            this.processScan(decodedText);
            
            setTimeout(() => {
                if(this.html5QrcodeScanner.getState() === 2) { 
                    this.html5QrcodeScanner.resume();
                }
            }, 2000);
        }, (error) => { });
    },

    showOverlay(overlayClass) {
        document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
        
        const overlay = document.querySelector(`.${overlayClass}`);
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 3000);
        }
    },

    async processScan(barcode) {
        // Sanitize and extract numbers
        let trackingNumber = String(barcode).replace(/\D/g, '').trim();
        if (!trackingNumber) return;

        try {
            if (this.onScanCallback) {
                await this.onScanCallback(trackingNumber);
            }
        } catch (error) {
            console.error("Scan processing error:", error);
            this.triggerError();
        }
    },


    triggerError() {
        AudioService.playError();
        this.showOverlay('overlay-error');
    },

    triggerLeoBlocked() {
        AudioService.playLeoBlocked();
        this.showOverlay('overlay-leo');
    },

    triggerDuplicate() {
        AudioService.playDuplicate();
        this.showOverlay('overlay-duplicate');
    },

    triggerNotInBatch() {
        AudioService.playError();
        this.showOverlay('overlay-not-in-batch');
    },

    triggerSuccess() {
        AudioService.playSuccess();
        this.showOverlay('overlay-success');
    }
};
