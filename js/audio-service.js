// Web Audio API Service for KBS System
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const AudioService = {
    playTone(frequency, type, duration, vol = 0.5) {
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    },

    playSuccess() {
        // High-pitch success beep
        this.playTone(880, 'sine', 0.1, 0.5); // A5
        setTimeout(() => this.playTone(1760, 'sine', 0.2, 0.5), 100); // A6
    },

    playError() {
        // Harsh buzzer
        this.playTone(150, 'sawtooth', 0.5, 0.8);
    },

    playDuplicate() {
        // Warning tone (two quick mid-tones)
        this.playTone(440, 'square', 0.15, 0.5);
        setTimeout(() => this.playTone(440, 'square', 0.15, 0.5), 200);
    },

    playLeoBlocked() {
        // Frequency-ramping siren
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime); // Start freq
        oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.5); // Ramp up
        oscillator.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 1.0); // Ramp down
        
        // Loop the siren a few times
        for(let i=1; i<3; i++) {
             oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.5 + i); 
             oscillator.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 1.0 + i); 
        }

        gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 3.0);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 3.0);
        
        // Try to vibrate if supported
        if(navigator.vibrate) {
            navigator.vibrate([500, 250, 500, 250, 500]);
        }
    }
};
