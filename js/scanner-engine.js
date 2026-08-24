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
            
            if (e.key === 'Enter') {
                if (this.buffer.length > 3) {
                    this.processScan(this.buffer);
                    this.buffer = '';
                }
            } else if (e.key.length === 1) { // Only capture single characters
                this.buffer += e.key;
            }
            
            this.lastScanTime = currentTime;
        });
    },

    /**
     * Initializes the camera scanner using html5-qrcode
     * @param {string} elementId ID of the div to render the scanner
     * @param {function} callback 
     */
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
            // Pause scanner to prevent multiple rapid reads of the same code
            this.html5QrcodeScanner.pause();
            this.processScan(decodedText);
            
            // Resume after 2 seconds
            setTimeout(() => {
                if(this.html5QrcodeScanner.getState() === 2) { // 2 = PAUSED
                    this.html5QrcodeScanner.resume();
                }
            }, 2000);
        }, (error) => {
            // ignore constant read errors
        });
    },

    /**
     * Shows an overlay temporarily
     * @param {string} overlayClass e.g. 'overlay-leo'
     */
    showOverlay(overlayClass) {
        // Remove active class from all overlays first
        document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
        
        const overlay = document.querySelector(`.${overlayClass}`);
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 3000); // Hide after 3 seconds
        }
    },

    /**
     * Internal method to handle a scanned code
     */
    async processScan(barcode) {
        const trackingNumber = barcode.trim();
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

    triggerSuccess() {
        AudioService.playSuccess();
        this.showOverlay('overlay-success');
    }
};
