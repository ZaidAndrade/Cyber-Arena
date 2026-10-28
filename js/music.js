const GAME_MUSIC = {
    menu: [
        {
            title: 'MENTE MÁ - NAKAMA',
            src: 'music/MENTE MÁ - NAKAMA (Official Lyric Video) - Nakama.mp3'
        }
    ],
    battle: [
        {
            title: 'PASSO BEM SOLTO',
            src: 'music/ATLXS - PASSO BEM SOLTO - phonk.mp3'
        },
        {
            title: 'MONTAGEM BAILÃO',
            src: 'music/MONTAGEM BAILÃO - TheGoodVibe.mp3'
        },
        {
            title: 'MONTAGEM XONADA',
            src: 'music/MONTAGEM XONADA - TheGoodVibe.mp3'
        },
        {
            title: 'NO BATIDÃO',
            src: 'music/ZXKAI, slxughter -  NO BATIDÃO (Official Audio) - slxughter.mp3'
        }
    ],
    customize: [
        {
            title: 'MONTAGEM ALQUIMIA',
            src: 'music/MONTAGEM ALQUIMIA - (Official Music Video) - h6itam.mp3'
        }
    ],
    boss: []
};

class MusicManager {
    constructor(audioElement = document.getElementById('bg-music')) {
        if (!audioElement) {
            throw new Error('No se encontró el elemento de audio #bg-music.');
        }

        this.audio = audioElement;
        this.scene = null;
        this.bossNumber = null;
        this.battleZone = null;
        this.currentTrack = null;
        this.trackIndex = 0;
        this.unlocked = false;
        this.paused = false;
        this.muted = false;
        this.volume = typeof sound !== 'undefined' ? sound.getEffectiveMusicVolume() : 0.55;
        this.playToken = 0;
        this.unlockHandler = () => this.unlock();

        this.audio.addEventListener('ended', () => this.handleTrackEnded());
        document.addEventListener('pointerdown', this.unlockHandler);
        document.addEventListener('keydown', this.unlockHandler);
        document.addEventListener('touchstart', this.unlockHandler, { passive: true });
    }

    syncWithAudioSettings() {
        this.volume = typeof sound !== 'undefined' ? sound.getEffectiveMusicVolume() : this.volume;
        this.muted = typeof sound !== 'undefined' ? !sound.musicEnabled || !sound.enabled : this.muted;
        if (this.audio) {
            this.audio.volume = this.getCurrentVolume();
            this.audio.muted = this.muted;
        }
    }

    getCurrentVolume() {
        const effective = typeof sound !== 'undefined' ? sound.getEffectiveMusicVolume() : this.volume;
        return Number.isFinite(effective) ? Math.min(1, Math.max(0, effective)) : 0;
    }

    playMenuMusic() {
        this.playScene('menu');
    }

    playCustomizeMusic() {
        this.playScene('customize');
    }

    playNormalBattleMusic(zoneNumber) {
        if (!Number.isInteger(zoneNumber) || zoneNumber < 1) {
            throw new RangeError('El número de zona debe ser un entero positivo.');
        }
        if (this.scene === 'battle' && this.battleZone === zoneNumber) return;

        const playlist = GAME_MUSIC.battle;
        const zoneTrackIndex = zoneNumber % playlist.length;
        this.battleZone = zoneNumber;
        this.playScene('battle', playlist[zoneTrackIndex]);
    }

    playBossBattleMusic(bossNumber) {
        if (!Number.isInteger(bossNumber) || bossNumber < 1) {
            throw new RangeError('El número de jefe debe ser un entero positivo.');
        }
        const isEvenBoss = bossNumber % 2 === 0;
        const bossTrack = isEvenBoss
            ? { title: 'MONTAGEM RUGADA', src: 'music/MONTAGEM RUGADA - MAFIA.mp3' }
            : { title: 'MONTAGEM SUPERSONIC', src: 'music/Montagem Supersonic - KHAOS, Jmilton - KHAOS.mp3' };
        this.playScene('boss', bossTrack, bossNumber);
    }

    playScene(scene, track = null, bossNumber = null) {
        if (!Object.prototype.hasOwnProperty.call(GAME_MUSIC, scene)) {
            throw new Error(`Escena musical desconocida: ${scene}`);
        }
        const nextTrack = track || GAME_MUSIC[scene][0];
        if (this.scene === scene && this.currentTrack?.src === nextTrack.src) {
            this.bossNumber = bossNumber;
            return;
        }

        this.scene = scene;
        this.bossNumber = bossNumber;
        if (scene !== 'battle') this.battleZone = null;
        this.currentBossTrack = scene === 'boss' ? nextTrack : null;
        this.currentTrack = nextTrack;
        this.trackIndex = scene === 'battle' ? GAME_MUSIC.battle.indexOf(nextTrack) : 0;
        this.paused = false;
        const musicBadge = document.getElementById('hud-music');
        if (musicBadge) musicBadge.textContent = `🎵 ${nextTrack.title}`;
        this.stopCurrentTrack();
        if (this.unlocked) this.startCurrentTrack(nextTrack);
    }

    unlock() {
        if (this.unlocked) return;
        this.unlocked = true;
        document.removeEventListener('pointerdown', this.unlockHandler);
        document.removeEventListener('keydown', this.unlockHandler);
        document.removeEventListener('touchstart', this.unlockHandler);
        if (this.scene && !this.paused) this.startCurrentTrack();
    }

    startCurrentTrack(trackOverride = null) {
        const playlist = GAME_MUSIC[this.scene];
        const track = trackOverride || this.currentTrack || playlist[this.trackIndex];
        const token = ++this.playToken;

        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = track.src;
        this.audio.loop = this.scene === 'menu' || this.scene === 'customize' || this.scene === 'boss';
        this.audio.muted = typeof sound !== 'undefined' ? (!sound.enabled || !sound.musicEnabled) : this.muted;
        this.audio.volume = this.getCurrentVolume();
        this.audio.load();

        const musicBadge = document.getElementById('hud-music');
        if (musicBadge) musicBadge.textContent = `🎵 ${track.title}`;

        const playPromise = this.audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(error => {
                if (token === this.playToken) {
                    console.error(`No se pudo reproducir "${track.title}".`, error);
                }
            });
        }
    }

    stopCurrentTrack() {
        this.playToken++;
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    handleTrackEnded() {
        if (this.scene !== 'battle') return;
        const playlist = GAME_MUSIC[this.scene];
        this.trackIndex = (this.trackIndex + 1) % playlist.length;
        this.currentTrack = playlist[this.trackIndex];
        this.stopCurrentTrack();
        if (this.unlocked && !this.paused) this.startCurrentTrack(this.currentTrack);
    }

    pause() {
        this.paused = true;
        this.audio.pause();
    }

    resume() {
        this.paused = false;
        if (!this.unlocked || !this.scene) return;
        if (this.audio.src) {
            const playPromise = this.audio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(error => {
                    console.error('No se pudo reanudar la música.', error);
                });
            }
        } else {
            this.startCurrentTrack();
        }
    }

    stop() {
        this.paused = true;
        this.scene = null;
        this.bossNumber = null;
        this.battleZone = null;
        this.currentBossTrack = null;
        this.currentTrack = null;
        this.trackIndex = 0;
        this.stopCurrentTrack();
    }

    setVolume(volume) {
        const normalized = Number(volume);
        if (!Number.isFinite(normalized) || normalized < 0 || normalized > 1) {
            throw new RangeError('El volumen debe ser un número entre 0 y 1.');
        }
        if (typeof sound !== 'undefined') {
            sound.setMusicVolume(normalized * 100);
            this.volume = normalized;
        } else {
            this.volume = normalized;
        }
        this.audio.volume = this.getCurrentVolume();
        this.audio.muted = typeof sound !== 'undefined' ? (!sound.enabled || !sound.musicEnabled) : this.muted;
    }

    setMuted(muted) {
        if (typeof sound !== 'undefined') {
            sound.setMusicEnabled(!Boolean(muted));
            this.muted = !sound.musicEnabled;
        } else {
            this.muted = Boolean(muted);
        }
        this.audio.volume = this.getCurrentVolume();
        this.audio.muted = this.muted;
        return this.muted;
    }

    mute() {
        return this.setMuted(true);
    }

    unmute() {
        return this.setMuted(false);
    }

    toggleMute() {
        return this.setMuted(!this.muted);
    }
}

const musicManager = new MusicManager();

window.musicManager = musicManager;
window.playMenuMusic = () => musicManager.playMenuMusic();
window.playCustomizeMusic = () => musicManager.playCustomizeMusic();
window.playNormalBattleMusic = zoneNumber => musicManager.playNormalBattleMusic(zoneNumber);
window.playBossBattleMusic = bossNumber => musicManager.playBossBattleMusic(bossNumber);
window.pauseMusic = () => musicManager.pause();
window.resumeMusic = () => musicManager.resume();
window.setMusicVolume = volume => musicManager.setVolume(volume);
window.muteMusic = () => musicManager.mute();
window.unmuteMusic = () => musicManager.unmute();
