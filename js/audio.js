/**
 * ==========================================================================
 * NEON STICK: CYBER ARENA - MOTOR DE AUDIO Y SINTETIZADOR BGM
 * Síntesis de sonido en tiempo real con Web Audio API (Sin dependencias externas)
 * ==========================================================================
 */

const MUSIC_TRACKS = {
    menu: {
        title: 'MONTAGEM ALQUIMIA',
        src: 'music/MONTAGEM ALQUIMIA - (Official Music Video) - h6itam.mp3'
    },
    combat: {
        title: 'MONTAGEM XONADA',
        src: 'music/MONTAGEM XONADA - TheGoodVibe.mp3'
    },
    intense: {
        title: 'MONTAGEM RUGADA',
        src: 'music/MONTAGEM RUGADA - MAFIA.mp3'
    },
    finalBoss: {
        title: 'NO BATIDÃO',
        src: 'music/ZXKAI, slxughter -  NO BATIDÃO (Official Audio) - slxughter.mp3'
    },
    special: {
        title: 'MONTAGEM SUPERSONIC',
        src: 'music/Montagem Supersonic - KHAOS, Jmilton - KHAOS.mp3'
    },
    victory: {
        title: 'PASSO BEM SOLTO',
        src: 'music/ATLXS - PASSO BEM SOLTO - phonk.mp3'
    },
    // Selectable alternatives; no current combat mechanic chooses these automatically.
    altCombat: {
        title: 'MONTAGEM BAILÃO',
        src: 'music/MONTAGEM BAILÃO - TheGoodVibe.mp3'
    },
    darkCombat: {
        title: 'MENTE MÁ',
        src: 'music/MENTE MÁ - NAKAMA (Official Lyric Video) - Nakama.mp3'
    }
};

const AUDIO_STORAGE_KEY = 'neonStickAudioPrefs';

const DEFAULT_AUDIO_SETTINGS = Object.freeze({
    generalVolume: 100,
    musicVolume: 55,
    sfxVolume: 70,
    musicEnabled: true,
    sfxEnabled: true
});

class SoundFX {
    constructor() {
        this.enabled = true;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        this.generalVolume = DEFAULT_AUDIO_SETTINGS.generalVolume;
        this.lastGeneralVolume = DEFAULT_AUDIO_SETTINGS.generalVolume;
        this.musicVolume = DEFAULT_AUDIO_SETTINGS.musicVolume;
        this.sfxVolume = DEFAULT_AUDIO_SETTINGS.sfxVolume;
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;

        // Propiedades de la pista musical sintética
        this.bgmTimer = null;
        this.bgmPlaying = false;
        this.bgmStep = 0;
        this.tempo = 124; // BPM Cyberpunk
        this.baseTrackKey = 'menu';
        this.currentTrackKey = null;
        this.musicCueKey = null;
        this.musicCueRemaining = 0;
        this.musicCueDeadline = 0;
        this.musicCueTimer = null;
        this.musicCueReturnTime = 0;
        this.musicCueReturnTrackKey = null;
        this.musicFadeTimer = null;
        this.musicTransitionToken = 0;
        this.musicCueDuration = 9000;

        this.loadPreferences();

        // Patrón de bajo Cyberpunk (Frecuencias en Hz)
        // Secuencia en C Menor / Eb / Bb / G:
        this.bassNotes = [
            65.41, 65.41, 130.81, 65.41,  // C2, C2, C3, C2
            77.78, 77.78, 155.56, 77.78,  // Eb2
            58.27, 58.27, 116.54, 58.27,  // Bb1
            49.00, 49.00, 98.00, 49.00    // G1
        ];

        // Secuencia melódica de arpegios neón
        this.arpNotes = [
            261.63, 311.13, 392.00, 523.25, // C4, Eb4, G4, C5
            311.13, 392.00, 523.25, 622.25, // Eb4, G4, C5, Eb5
            233.08, 293.66, 349.23, 466.16, // Bb3, D4, F4, Bb4
            196.00, 246.94, 293.66, 392.00  // G3, B3, D4, G4
        ];
    }

    normalizePercent(value, fallback = 100) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return fallback;
        return Math.min(100, Math.max(0, Math.round(numeric)));
    }

    getEffectiveMusicVolume() {
        if (!this.enabled || !this.musicEnabled) return 0;
        return (this.generalVolume / 100) * (this.musicVolume / 100);
    }

    getEffectiveSfxVolume() {
        if (!this.sfxEnabled) return 0;
        return this.sfxVolume / 100;
    }

    getMusicCategoryVolume() {
        return this.musicEnabled ? this.musicVolume / 100 : 0;
    }

    persistPreferences() {
        if (typeof localStorage === 'undefined') return;
        const settings = {
            generalVolume: this.generalVolume,
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            musicEnabled: this.musicEnabled,
            sfxEnabled: this.sfxEnabled
        };
        localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
    }

    loadPreferences() {
        if (typeof localStorage === 'undefined') return;
        try {
            const saved = JSON.parse(localStorage.getItem(AUDIO_STORAGE_KEY) || '{}');
            this.generalVolume = this.normalizePercent(saved.generalVolume, DEFAULT_AUDIO_SETTINGS.generalVolume);
            this.musicVolume = this.normalizePercent(saved.musicVolume, DEFAULT_AUDIO_SETTINGS.musicVolume);
            this.sfxVolume = this.normalizePercent(saved.sfxVolume, DEFAULT_AUDIO_SETTINGS.sfxVolume);
            this.musicEnabled = saved.musicEnabled !== false;
            this.sfxEnabled = saved.sfxEnabled !== false;
        } catch (error) {
            console.warn('No se pudieron cargar las preferencias de audio.', error);
            this.generalVolume = DEFAULT_AUDIO_SETTINGS.generalVolume;
            this.musicVolume = DEFAULT_AUDIO_SETTINGS.musicVolume;
            this.sfxVolume = DEFAULT_AUDIO_SETTINGS.sfxVolume;
            this.musicEnabled = DEFAULT_AUDIO_SETTINGS.musicEnabled;
            this.sfxEnabled = DEFAULT_AUDIO_SETTINGS.sfxEnabled;
        }
        this.lastGeneralVolume = this.generalVolume > 0 ? this.generalVolume : DEFAULT_AUDIO_SETTINGS.generalVolume;
        this.enabled = this.generalVolume > 0;
    }

    applyVolumeTargets() {
        if (this.ctx && this.masterGain && this.sfxGain && this.musicGain) {
            const currentTime = this.ctx.currentTime;
            this.masterGain.gain.setValueAtTime(this.enabled ? this.generalVolume / 100 : 0, currentTime);
            this.musicGain.gain.setValueAtTime(this.getMusicCategoryVolume(), currentTime);
            this.sfxGain.gain.setValueAtTime(this.getEffectiveSfxVolume(), currentTime);
        }

        const audioElement = document.getElementById('bg-music');
        if (typeof musicManager !== 'undefined') {
            musicManager.syncWithAudioSettings();
        } else if (audioElement) {
            audioElement.muted = !this.enabled || !this.musicEnabled;
            audioElement.volume = this.getEffectiveMusicVolume();
        }
    }

    setGeneralVolume(value) {
        this.generalVolume = this.normalizePercent(value, this.generalVolume);
        this.enabled = this.generalVolume > 0;
        if (this.generalVolume > 0) this.lastGeneralVolume = this.generalVolume;
        this.applyVolumeTargets();
        this.persistPreferences();
        return this.generalVolume;
    }

    setMusicVolume(value) {
        this.musicVolume = this.normalizePercent(value, this.musicVolume);
        this.applyVolumeTargets();
        this.persistPreferences();
        return this.musicVolume;
    }

    setSfxVolume(value) {
        this.sfxVolume = this.normalizePercent(value, this.sfxVolume);
        this.applyVolumeTargets();
        this.persistPreferences();
        return this.sfxVolume;
    }

    setMusicEnabled(enabled) {
        this.musicEnabled = Boolean(enabled);
        this.applyVolumeTargets();
        this.persistPreferences();
        return this.musicEnabled;
    }

    setSfxEnabled(enabled) {
        this.sfxEnabled = Boolean(enabled);
        this.applyVolumeTargets();
        this.persistPreferences();
        return this.sfxEnabled;
    }

    syncAudioControls() {
        const generalSlider = document.getElementById('audio-general-volume');
        const musicSlider = document.getElementById('audio-music-volume');
        const sfxSlider = document.getElementById('audio-sfx-volume');
        const musicToggle = document.getElementById('audio-music-enabled');
        const sfxToggle = document.getElementById('audio-sfx-enabled');
        const generalValue = document.getElementById('audio-general-value');
        const musicValue = document.getElementById('audio-music-value');
        const sfxValue = document.getElementById('audio-sfx-value');

        if (generalSlider) generalSlider.value = this.generalVolume;
        if (musicSlider) musicSlider.value = this.musicVolume;
        if (sfxSlider) sfxSlider.value = this.sfxVolume;
        if (musicToggle) musicToggle.checked = this.musicEnabled;
        if (sfxToggle) sfxToggle.checked = this.sfxEnabled;
        if (generalValue) generalValue.textContent = `${this.generalVolume}%`;
        if (musicValue) musicValue.textContent = `${this.musicVolume}%`;
        if (sfxValue) sfxValue.textContent = `${this.sfxVolume}%`;
    }

    bindAudioSettingsPanel() {
        const generalSlider = document.getElementById('audio-general-volume');
        const musicSlider = document.getElementById('audio-music-volume');
        const sfxSlider = document.getElementById('audio-sfx-volume');
        const musicToggle = document.getElementById('audio-music-enabled');
        const sfxToggle = document.getElementById('audio-sfx-enabled');
        const saveButton = document.getElementById('btn-save-audio');
        const resetButton = document.getElementById('btn-reset-audio');
        if (!generalSlider || !musicSlider || !sfxSlider || !musicToggle || !sfxToggle) {
            return false;
        }

        const updateFromInputs = () => {
            this.setGeneralVolume(generalSlider.value);
            this.setMusicVolume(musicSlider.value);
            this.setSfxVolume(sfxSlider.value);
            this.setMusicEnabled(musicToggle.checked);
            this.setSfxEnabled(sfxToggle.checked);
            this.syncAudioControls();
        };

        generalSlider.oninput = updateFromInputs;
        musicSlider.oninput = updateFromInputs;
        sfxSlider.oninput = updateFromInputs;
        musicToggle.onchange = updateFromInputs;
        sfxToggle.onchange = updateFromInputs;

        if (saveButton) {
            saveButton.onclick = () => {
                this.persistPreferences();
                this.syncAudioControls();
            };
        }

        if (resetButton) {
            resetButton.onclick = () => {
                this.generalVolume = DEFAULT_AUDIO_SETTINGS.generalVolume;
                this.musicVolume = DEFAULT_AUDIO_SETTINGS.musicVolume;
                this.sfxVolume = DEFAULT_AUDIO_SETTINGS.sfxVolume;
                this.musicEnabled = DEFAULT_AUDIO_SETTINGS.musicEnabled;
                this.sfxEnabled = DEFAULT_AUDIO_SETTINGS.sfxEnabled;
                this.enabled = this.generalVolume > 0;
                this.lastGeneralVolume = this.generalVolume;
                this.persistPreferences();
                this.syncAudioControls();
                this.applyVolumeTargets();
            };
        }

        this.syncAudioControls();
        return true;
    }

    /**
     * Inicializa el AudioContext tras la primera interacción del usuario.
     */
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();

                // Nodos de ganancia organizados
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.enabled ? this.generalVolume / 100 : 0, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);

                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.setValueAtTime(this.getEffectiveSfxVolume(), this.ctx.currentTime);
                this.sfxGain.connect(this.masterGain);

                this.musicGain = this.ctx.createGain();
                this.musicGain.gain.setValueAtTime(this.getMusicCategoryVolume(), this.ctx.currentTime);
                this.musicGain.connect(this.masterGain);
            }
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.applyVolumeTargets();
    }

    /**
     * Alterna el estado del sonido general y de la música
     */
    toggleSound() {
        if (this.enabled) {
            this.lastGeneralVolume = this.generalVolume > 0 ? this.generalVolume : this.lastGeneralVolume;
            this.generalVolume = 0;
            this.enabled = false;
        } else {
            this.generalVolume = this.lastGeneralVolume > 0 ? this.lastGeneralVolume : DEFAULT_AUDIO_SETTINGS.generalVolume;
            this.enabled = true;
        }
        this.applyVolumeTargets();
        this.persistPreferences();
        return this.enabled;
    }

    // ==========================================================================
    // EFECTOS DE SONIDO (SFX)
    // ==========================================================================

    playHit() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playSlash() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.13);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.13);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.13);
    }

    playHeavySlash() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
    }

    playJump() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(170, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.14);
    }

    playDamage() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, this.ctx.currentTime);
        osc.frequency.setValueAtTime(60, this.ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
    }

    playCoin() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
        osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.28);
    }

    playHeal() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.26);
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.26);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.26);
    }

    playSpecial() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        // Efecto láser expansivo
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + 0.25);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    playBossAlert() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, this.ctx.currentTime);
        osc.frequency.setValueAtTime(260, this.ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(130, this.ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(320, this.ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.65);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.65);
    }

    playBossCharge() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(420, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
    }

    playBossSlam() {
        if (!this.enabled || !this.sfxEnabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(190, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }

    // ==========================================================================
    // MÚSICA DE FONDO CYBERPUNK SINTETIZADA EN TIEMPO REAL
    // ==========================================================================

    setMusicState(trackKey) {
        if (!Object.prototype.hasOwnProperty.call(MUSIC_TRACKS, trackKey)) {
            throw new Error(`Pista musical desconocida: ${trackKey}`);
        }
        this.baseTrackKey = trackKey;
        if (this.musicCueKey) return;
        this.startBGM();
    }

    playMusicCue(trackKey, duration = this.musicCueDuration) {
        if (!Object.prototype.hasOwnProperty.call(MUSIC_TRACKS, trackKey)) {
            throw new Error(`Pista musical desconocida: ${trackKey}`);
        }
        if (!this.enabled || !this.musicEnabled || this.musicCueKey) return false;

        const audioElement = document.getElementById('bg-music');
        this.musicCueReturnTrackKey = this.baseTrackKey;
        this.musicCueReturnTime = audioElement && this.currentTrackKey === this.baseTrackKey
            ? audioElement.currentTime
            : 0;
        this.musicCueKey = trackKey;
        this.musicCueRemaining = Math.max(0, duration);
        this.switchMusic(trackKey, false);
        return true;
    }

    startBGM() {
        if (!this.enabled || !this.musicEnabled) return;
        this.init();
        const trackKey = this.musicCueKey || this.baseTrackKey;
        this.switchMusic(trackKey, !this.musicCueKey, true);
        if (this.musicCueKey && !this.musicCueTimer) this.scheduleMusicCueEnd();
    }

    switchMusic(trackKey, loop = true, resumeCurrent = false, startAt = 0) {
        const track = MUSIC_TRACKS[trackKey];
        if (!track) throw new Error(`Pista musical desconocida: ${trackKey}`);

        const audioElement = document.getElementById('bg-music');
        if (!audioElement) {
            console.error('No se encontró el elemento de audio #bg-music.');
            return;
        }

        const trackUrl = new URL(track.src, document.baseURI).href;
        this.cancelMusicFade();
        const token = ++this.musicTransitionToken;
        const sameTrack = this.currentTrackKey === trackKey && audioElement.src === trackUrl;
        audioElement.loop = loop;
        audioElement.muted = !this.enabled || !this.musicEnabled;
        audioElement.onended = () => {
            if (this.musicCueKey) this.endMusicCue();
        };

        if (sameTrack && !audioElement.paused) {
            this.bgmPlaying = true;
            return;
        }

        const startTrack = () => {
            if (token !== this.musicTransitionToken) return;
            audioElement.pause();
            this.stopSynthBGM();

            if (!sameTrack) {
                audioElement.src = track.src;
                if (startAt > 0) {
                    audioElement.addEventListener('loadedmetadata', () => {
                        if (token === this.musicTransitionToken && this.currentTrackKey === trackKey) {
                            audioElement.currentTime = Math.min(startAt, audioElement.duration || startAt);
                        }
                    }, { once: true });
                }
                audioElement.load();
                if (startAt <= 0) audioElement.currentTime = 0;
            } else if (!resumeCurrent) {
                audioElement.currentTime = 0;
            } else if (startAt > 0) {
                audioElement.currentTime = startAt;
            }

            this.currentTrackKey = trackKey;
            const musicBadge = document.getElementById('hud-music');
            if (musicBadge) musicBadge.textContent = `🎵 ${track.title}`;
            audioElement.volume = 0;

            const playPromise = audioElement.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(() => {
                    if (token !== this.musicTransitionToken) return;
                    this.bgmPlaying = true;
                    this.fadeMusicTo(this.getEffectiveMusicVolume(), 450, token);
                    if (this.musicCueKey === trackKey) this.scheduleMusicCueEnd();
                }).catch(error => {
                    if (token !== this.musicTransitionToken) return;
                    this.bgmPlaying = false;
                    console.warn(`No se pudo reproducir "${track.title}"; se usará el sintetizador de respaldo.`, error);
                    this._startSynthBGM();
                    if (this.musicCueKey === trackKey) this.scheduleMusicCueEnd();
                });
            } else {
                this.bgmPlaying = true;
                this.fadeMusicTo(this.getEffectiveMusicVolume(), 450, token);
                if (this.musicCueKey === trackKey) this.scheduleMusicCueEnd();
            }
        };

        if (sameTrack) {
            startTrack();
            return;
        }

        if (audioElement.paused || audioElement.volume <= 0.01) {
            startTrack();
            return;
        }
        this.fadeMusicTo(0, 350, token, startTrack);
    }

    fadeMusicTo(targetVolume, duration, token, onComplete = null) {
        this.cancelMusicFade();
        const audioElement = document.getElementById('bg-music');
        if (!audioElement) return;
        const startVolume = audioElement.volume;
        const startTime = performance.now();

        const step = () => {
            if (token !== this.musicTransitionToken) return;
            const progress = Math.min(1, (performance.now() - startTime) / duration);
            audioElement.volume = startVolume + (targetVolume - startVolume) * progress;
            if (progress >= 1) {
                this.musicFadeTimer = null;
                if (onComplete) onComplete();
                return;
            }
            this.musicFadeTimer = setTimeout(step, 32);
        };

        if (duration <= 0) {
            audioElement.volume = targetVolume;
            if (onComplete) onComplete();
        } else {
            this.musicFadeTimer = setTimeout(step, 0);
        }
    }

    cancelMusicFade() {
        if (this.musicFadeTimer) {
            clearTimeout(this.musicFadeTimer);
            this.musicFadeTimer = null;
        }
    }

    scheduleMusicCueEnd() {
        if (!this.musicCueKey || this.musicCueTimer || !this.bgmPlaying) return;
        this.musicCueDeadline = Date.now() + this.musicCueRemaining;
        this.musicCueTimer = setTimeout(() => this.endMusicCue(), this.musicCueRemaining);
    }

    endMusicCue() {
        if (!this.musicCueKey) return;
        const returnTrackKey = this.baseTrackKey;
        const returnTime = returnTrackKey === this.musicCueReturnTrackKey
            ? this.musicCueReturnTime
            : 0;
        this.clearMusicCue();
        this.switchMusic(returnTrackKey, true, returnTime > 0, returnTime);
    }

    clearMusicCue() {
        this.musicCueKey = null;
        this.musicCueRemaining = 0;
        this.musicCueDeadline = 0;
        this.musicCueReturnTime = 0;
        this.musicCueReturnTrackKey = null;
        if (this.musicCueTimer) {
            clearTimeout(this.musicCueTimer);
            this.musicCueTimer = null;
        }
    }

    pauseBGM() {
        this.bgmPlaying = false;
        this.musicTransitionToken++;
        this.cancelMusicFade();
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
        if (this.musicCueTimer) {
            this.musicCueRemaining = Math.max(0, this.musicCueDeadline - Date.now());
            clearTimeout(this.musicCueTimer);
            this.musicCueTimer = null;
        }
        const audioElement = document.getElementById('bg-music');
        if (audioElement && !audioElement.paused) {
            audioElement.pause();
        }
    }

    stopSynthBGM() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
        this.bgmPlaying = false;
    }

    _startSynthBGM() {
        this.bgmPlaying = true;
        const stepTime = (60 / this.tempo) / 4; // Dieciseisavos

        const playStep = () => {
            if (!this.bgmPlaying || !this.ctx) return;

            const t = this.ctx.currentTime;
            const noteIdx = this.bgmStep % 16;

            // 1. Sintetizador de Bajo (Bassline)
            if (noteIdx % 2 === 0) {
                const bassOsc = this.ctx.createOscillator();
                const bassGain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                bassOsc.type = 'sawtooth';
                bassOsc.frequency.setValueAtTime(this.bassNotes[noteIdx], t);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(380, t);
                filter.frequency.exponentialRampToValueAtTime(140, t + stepTime * 1.8);

                bassGain.gain.setValueAtTime(0.22, t);
                bassGain.gain.exponentialRampToValueAtTime(0.01, t + stepTime * 1.8);

                bassOsc.connect(filter);
                filter.connect(bassGain);
                bassGain.connect(this.musicGain);

                bassOsc.start(t);
                bassOsc.stop(t + stepTime * 1.8);
            }

            // 2. Arpegios Neón (Lead Synth)
            const arpOsc = this.ctx.createOscillator();
            const arpGain = this.ctx.createGain();
            arpOsc.type = 'square';
            arpOsc.frequency.setValueAtTime(this.arpNotes[noteIdx], t);

            arpGain.gain.setValueAtTime(0.06, t);
            arpGain.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 0.9);

            arpOsc.connect(arpGain);
            arpGain.connect(this.musicGain);

            arpOsc.start(t);
            arpOsc.stop(t + stepTime * 0.9);

            // 3. Bombo y Caja Cyberpunk (Kick & Snare beats)
            if (noteIdx === 0 || noteIdx === 8) {
                // Kick Drum
                const kickOsc = this.ctx.createOscillator();
                const kickGain = this.ctx.createGain();
                kickOsc.type = 'sine';
                kickOsc.frequency.setValueAtTime(120, t);
                kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
                kickGain.gain.setValueAtTime(0.3, t);
                kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
                kickOsc.connect(kickGain);
                kickGain.connect(this.musicGain);
                kickOsc.start(t);
                kickOsc.stop(t + 0.12);
            } else if (noteIdx === 4 || noteIdx === 12) {
                // Snare Hit (Noise burst simulation)
                const snareOsc = this.ctx.createOscillator();
                const snareGain = this.ctx.createGain();
                snareOsc.type = 'triangle';
                snareOsc.frequency.setValueAtTime(180, t);
                snareOsc.frequency.linearRampToValueAtTime(80, t + 0.08);
                snareGain.gain.setValueAtTime(0.18, t);
                snareGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
                snareOsc.connect(snareGain);
                snareGain.connect(this.musicGain);
                snareOsc.start(t);
                snareOsc.stop(t + 0.08);
            }

            this.bgmStep++;
            this.bgmTimer = setTimeout(playStep, stepTime * 1000);
        };

        playStep();
    }

    stopBGM() {
        this.pauseBGM();
        this.clearMusicCue();
        this.currentTrackKey = null;
        const audioElement = document.getElementById('bg-music');
        if (audioElement) {
            audioElement.currentTime = 0;
            audioElement.volume = this.getEffectiveMusicVolume();
        }
    }
}

// Instancia global del sistema de sonido
const sound = new SoundFX();
