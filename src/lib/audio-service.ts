// Web Audio API Service for KBS System (Next.js Compatible)

let audioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];

const getAudioContext = () => {
    if (typeof window === 'undefined') return null; // Prevent SSR error
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
};

export const AudioService = {
    stopAllAudio() {
        activeOscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
            try { osc.disconnect(); } catch(e) {}
        });
        activeOscillators = [];
    },

    playTone(frequency: number, type: OscillatorType, duration: number, vol = 0.5, endFreq: number | null = null, endVol = 0.01) {
        const ctx = getAudioContext();
        if (!ctx) return null;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        if (endFreq) {
            oscillator.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
        }

        gainNode.gain.setValueAtTime(vol, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(endVol, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
        
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
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
    },

    playDuplicate() {
        this.stopAllAudio();
        // Play dual triangle tone (500Hz -> 420Hz)
        this.playTone(500, 'triangle', 0.3, 0.5, 420);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(300);
    },

    playLeoBlocked() {
        this.stopAllAudio();
        const ctx = getAudioContext();
        if (!ctx) return;
        
        // Play rapid sawtooth siren (600Hz <-> 1200Hz)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        
        // Loop the siren 3 times
        for(let i=0; i<3; i++) {
             oscillator.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15 + (i * 0.3)); 
             oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3 + (i * 0.3)); 
        }

        gainNode.gain.setValueAtTime(0.7, ctx.currentTime);
        gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.9);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 1.0);
        
        activeOscillators.push(oscillator);

        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    },

    playError() {
        this.stopAllAudio();
        // Play square wave buzz (150Hz)
        this.playTone(150, 'square', 0.6, 0.6);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(600);
    }
};
