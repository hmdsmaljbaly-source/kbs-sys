// Web Audio API Service for KBS System
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let activeOscillators = [];

export const AudioService = {
    stopAllAudio() {
        activeOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
            try { osc.disconnect(); } catch(e) {}
        });
        activeOscillators = [];
    },

    playTone(frequency, type, duration, vol = 0.5, endFreq = null, endVol = 0.01) {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        if (endFreq) {
            oscillator.frequency.linearRampToValueAtTime(endFreq, audioCtx.currentTime + duration);
        }

        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(endVol, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
        
        activeOscillators.push(oscillator);
        setTimeout(() => {
            activeOscillators = activeOscillators.filter(o => o !== oscillator);
        }, duration * 1000);
        return oscillator;
    },

    playSuccess() {
        this.stopAllAudio();
        // Play SUCCESS sine wave (800Hz)
        this.playTone(800, 'sine', 0.2, 0.5);
        if(navigator.vibrate) navigator.vibrate(200);
    },

    playDuplicate() {
        this.stopAllAudio();
        // Play dual triangle tone (500Hz -> 420Hz)
        this.playTone(500, 'triangle', 0.3, 0.5, 420);
        if(navigator.vibrate) navigator.vibrate(300);
    },

    playLeoBlocked() {
        this.stopAllAudio();
        // Play rapid sawtooth siren (600Hz <-> 1200Hz)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        
        // Loop the siren 3 times
        for(let i=0; i<3; i++) {
             oscillator.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.15 + (i * 0.3)); 
             oscillator.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.3 + (i * 0.3)); 
        }

        gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.9);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1.0);
        
        activeOscillators.push(oscillator);

        if(navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    },

    playError() {
        this.stopAllAudio();
        // Play square wave buzz (150Hz)
        this.playTone(150, 'square', 0.6, 0.6);
        if(navigator.vibrate) navigator.vibrate(600);
    }
};
