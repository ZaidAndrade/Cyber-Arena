/**
 * ==========================================================================
 * NEON STICK: CYBER ARENA - MOTOR PRINCIPAL DE JUEGO (GAME ENGINE)
 * ==========================================================================
 */

const ZONE_SCENES = [
    { name: 'TOKIO NEÓN', background: 'img/tokyo_neon.png', colors: ['#03040c', '#090e24'], accent: '#00f3ff' },
    { name: 'PARÍS CIBERNÉTICO', background: 'img/paris_cyber.png', colors: ['#0a0804', '#201205'], accent: '#ffcc00' },
    { name: 'NUEVA YORK CIBERPUNK', background: 'img/new_york_cyberpunk.png', colors: ['#0a0312', '#1a0826'], accent: '#b000ff' },
    { name: 'LONDRES DE NEÓN', background: 'img/london_neon.png', colors: ['#120306', '#26040a'], accent: '#ff0055' },
    { name: 'BERLÍN FUTURISTA', background: 'img/berlin_futuristic.png', colors: ['#02120b', '#062618'], accent: '#00ff88' },
    { name: 'SEÚL DIGITAL', background: 'img/seoul_digital.png', colors: ['#140500', '#2d0c02'], accent: '#ff5500' },
    { name: 'CIUDAD DE MÉXICO NEÓN', background: 'img/mexico_city_neon.png', colors: ['#0c0217', '#1f0633'], accent: '#cc00ff' },
    { name: 'EL CAIRO FUTURO', background: 'img/cairo_future.png', colors: ['#14020a', '#290615'], accent: '#ffea00' },
    { name: 'DUBÁI CYBERPUNK', background: 'img/dubai_cyberpunk.png', colors: ['#100a00', '#0b2b38'], accent: '#ffb703' },
    { name: 'RÍO DE JANEIRO NEÓN', background: 'img/rio_neon.png', colors: ['#0a0f1a', '#112d2c'], accent: '#2dd4bf' },
    { name: 'MACHU PICCHU NEÓN', background: 'img/machu_picchu_neon.png', colors: ['#081310', '#0f2d1f'], accent: '#7ef9d8' }
];

const ZONE_BACKGROUND_IMAGES = ZONE_SCENES.map(scene => {
    const image = new Image();
    image.addEventListener('error', () => {
        console.error(`No se pudo cargar el fondo de la zona: ${scene.background}`);
    });
    image.src = scene.background;
    return image;
});

const BOSS_WEAPON_DAMAGE_MULTIPLIERS = Object.freeze({
    dagger: 1.35,
    sword: 1.2,
    plasma: 1.15,
    hammer: 1.2,
    whip: 1.2,
    blaster: 1.25,
    cyberDaggers: 1.6,
    seismicHammer: 1.5
});

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.fixedStepMs = 1000 / 60;
        this.maxFrameDeltaMs = 100;
        this.maxUpdatesPerFrame = 5;
        this.accumulator = 0;
        this.lastFrameTimestamp = null;
        this.loopRunning = false;
        this.animationFrameId = null;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER', 'VICTORY'
        this.previousState = 'MENU';

        this.currentZone = 1; // Zona actual, del 1 al 11.
        this.activeBackground = ZONE_BACKGROUND_IMAGES[this.currentZone - 1];
        this.currentWave = 1;
        this.maxWaves = 5;

        // Carga de datos persistentes desde localStorage
        this.loadProgress();
        this.customization = this.loadCustomization();
        this.player2Customization = this.loadPlayer2Customization();
        this.activePlayerIndex = 0;
        this.activeShopPlayerIndex = 0;

        this.orientationDismissed = false;

        // Entidades principales; se crean cuando el usuario elige el modo de juego.
        this.playerCount = 0;
        this.players = [];
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.explosions = [];
        this.floatingTexts = [];
        this.platforms = [];

        // Estado de controles y efectos
        this.input = new InputManager(
            () => this.pauseGame(),
            gamepads => this.updateGamepadAssignments(gamepads)
        );
        this.screenShake = 0;
        this.damageFlash = 0;
        this.teamInvulnerableTimer = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.gameTime = 0;
        this.bossActive = false;
        this.bossExplosionConfig = {
            radius: 230,
            maxDamage: 55,
            minDamage: 10,
            knockback: 17,
            particleCount: 64,
            screenShake: 28
        };

        // Inicialización de subsistemas
        this.initResize();
        this.initInput();
        this.initUI();
        this.setupZonePlatforms();
        this.updateHUD();
    }

    /**
     * Calcula la altura del suelo de manera adaptativa según la pantalla
     */
    getFloorY() {
        if (this.height < 520) {
            // Dispositivos móviles en horizontal: suelo ligeramente más alto para no solapar controles
            return Math.round(this.height - 65);
        } else if (this.width < 600) {
            // Dispositivos móviles en vertical: elevar la arena para dar espacio a los controles táctiles
            return Math.round(this.height * 0.76);
        }
        return this.height - 80;
    }

    createPlayers(playerCount) {
        if (playerCount !== 1 && playerCount !== 2) {
            throw new Error(`Cantidad de jugadores no válida: ${playerCount}`);
        }

        const floorY = this.getFloorY();
        const p1 = new Player(Math.max(25, Math.min(150, this.width * 0.25)), floorY - 70, 'P1');
        const p1Inventory = this.playerProgress[0];
        const equippedWeapon = WEAPONS[p1Inventory.equippedWeapon] || WEAPONS.sword;
        p1.weapon = equippedWeapon;
        p1.color = this.customization.color;
        p1.accentColor = this.customization.accentColor;
        p1.nickname = this.customization.nickname;
        p1.effects = { ...this.customization.effects };

        this.players = [p1];
        if (playerCount === 2) {
            const p2 = new Player(Math.min(this.width - 25, Math.max(this.width - 150, this.width * 0.75)), floorY - 70, 'P2');
            const p2Config = this.player2Customization || {
                nickname: 'P2',
                color: '#ff00aa',
                accentColor: '#ffffff',
                weaponId: this.playerProgress[1].equippedWeapon,
                effects: { ...DEFAULT_PLAYER_EFFECTS, color: '#ff00aa' }
            };
            p2.weapon = WEAPONS[this.playerProgress[1].equippedWeapon] || equippedWeapon;
            p2.color = p2Config.color;
            p2.accentColor = p2Config.accentColor;
            p2.nickname = p2Config.nickname;
            p2.effects = { ...p2Config.effects };
            p2.facingRight = false;
            this.players.push(p2);
        }
        this.playerCount = playerCount;
        this.player = p1;
    }

    get coins() {
        return this.playerProgress?.[0]?.coins || 0;
    }

    set coins(value) {
        if (this.playerProgress?.[0]) this.playerProgress[0].coins = Math.max(0, Number(value) || 0);
    }

    get purchasedWeapons() {
        return this.playerProgress?.[0]?.purchasedWeapons || [];
    }

    set purchasedWeapons(value) {
        if (this.playerProgress?.[0]) this.playerProgress[0].purchasedWeapons = value;
    }

    get equippedWeapon() {
        return this.playerProgress?.[0]?.equippedWeapon || 'sword';
    }

    set equippedWeapon(value) {
        if (this.playerProgress?.[0]) this.playerProgress[0].equippedWeapon = value;
    }

    equipPlayerWeapon(playerIndex, weaponId) {
        const player = this.players[playerIndex];
        if (!player) return false;
        const normalizedId = normalizeWeaponId(weaponId);
        const inventory = this.playerProgress[playerIndex];
        if (!inventory?.purchasedWeapons.includes(normalizedId)) return false;
        player.weapon = WEAPONS[normalizedId];
        inventory.equippedWeapon = normalizedId;
        if (playerIndex === 0) this.customization.weaponId = normalizedId;
        else this.player2Customization.weaponId = normalizedId;
        this.saveProgress();
        this.updateHUD();
        return true;
    }

    cyclePlayerWeapon(playerIndex) {
        const player = this.players[playerIndex];
        if (!player) return;
        const weaponIds = this.playerProgress[playerIndex].purchasedWeapons;
        if (!weaponIds.length) return;
        const currentIndex = weaponIds.indexOf(player.weapon?.id);
        const nextWeaponId = weaponIds[(currentIndex + 1) % weaponIds.length];
        this.equipPlayerWeapon(playerIndex, nextWeaponId);
        this.floatingTexts.push(new FloatingText(
            player.x,
            player.y - 58,
            WEAPONS[nextWeaponId].name,
            WEAPONS[nextWeaponId].color,
            15
        ));
    }

    getAlivePlayers() {
        return this.players.filter(player => player && !player.isGhost && !player.isDead);
    }

    getActivePlayer() {
        const alive = this.getAlivePlayers();
        if (alive.length > 0) return alive[0];
        const fallback = this.players.find(player => player && !player.isGhost && !player.isDead) || this.players[0];
        return fallback || this.player || null;
    }

    revivePlayersForNextZone() {
        const floorY = this.getFloorY();
        this.players.forEach((player, index) => {
            if (!player || (!player.isGhost && !player.isDead)) return;
            const spawnX = index === 0
                ? Math.max(25, Math.min(150, this.width * 0.25))
                : Math.min(this.width - 25, Math.max(this.width - 150, this.width * 0.75));
            player.x = spawnX;
            player.y = floorY - 70;
            player.vx = 0;
            player.vy = 0;
            player.knockbackVx = 0;
            player.hp = player.maxHp;
            player.energy = 0;
            player.isGhost = false;
            player.isDead = false;
            player.isAttacking = false;
            player.attackTimer = 0;
            player.attackCooldown = 0;
            player.attackElapsed = 0;
            player.attackImpactResolved = false;
            player.attackWeapon = null;
            player.hitEnemies.clear();
            player.invulnerableTimer = 60;
            player.facingRight = index === 0;
        });
    }

    /**
     * Respuesta háptica por vibración para celulares
     */
    vibrate(duration = 15) {
        if (window.navigator && window.navigator.vibrate) {
            try { window.navigator.vibrate(duration); } catch (e) {}
        }
    }

    /**
     * Activa o desactiva el modo Pantalla Completa
     */
    toggleFullscreen() {
        const elem = document.documentElement;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {});
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    /**
     * Verifica la orientación en dispositivos móviles y muestra sugerencia
     */
    checkOrientation() {
        const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 768);
        const isPortrait = window.innerHeight > window.innerWidth;
        const overlay = document.getElementById('orientation-overlay');
        if (!overlay) return;

        if (isMobile && isPortrait && !this.orientationDismissed) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Ajuste responsivo de la resolución de pantalla
     */
    initResize() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.setupZonePlatforms();
            this.checkOrientation();
            this.updateHUD();
        };

        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => {
            setTimeout(resize, 120);
        });

        document.addEventListener('fullscreenchange', () => {
            resize();
            this.updateHUD();
        });

        resize();
    }

    /**
     * Gestión de entradas (Teclado y Táctil Multi-touch)
     */
    initInput() {
        // Desbloquear AudioContext al primer toque (imprescindible en iOS Safari y Android Chrome)
        const unlockAudio = () => {
            sound.init();
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('click', unlockAudio);
        };
        window.addEventListener('touchstart', unlockAudio, { passive: true });
        window.addEventListener('click', unlockAudio, { passive: true });

        // SISTEMA MULTI-TOUCH ERGONÓMICO PARA D-PAD HORIZONTAL (Deslizar o pulsar)
        const dpad = document.querySelector('.touch-dpad-horizontal');
        const btnLeft = document.getElementById('btn-touch-left');
        const btnRight = document.getElementById('btn-touch-right');

        const updateDpadTouch = (clientX, clientY) => {
            if (!dpad) return;
            const rect = dpad.getBoundingClientRect();
            // Verificar si el toque está en el D-pad o zona cercana con tolerancia para pulgares
            if (clientX >= rect.left - 20 && clientX <= rect.right + 20 &&
                clientY >= rect.top - 25 && clientY <= rect.bottom + 30) {
                const midX = rect.left + rect.width / 2;
                if (clientX < midX) {
                    this.input.setAction('p1', 'moveLeft', true);
                    this.input.setAction('p1', 'moveRight', false);
                    btnLeft?.classList.add('active');
                    btnRight?.classList.remove('active');
                } else {
                    this.input.setAction('p1', 'moveRight', true);
                    this.input.setAction('p1', 'moveLeft', false);
                    btnRight?.classList.add('active');
                    btnLeft?.classList.remove('active');
                }
            }
        };

        const releaseDpad = () => {
            this.input.setAction('p1', 'moveLeft', false);
            this.input.setAction('p1', 'moveRight', false);
            btnLeft?.classList.remove('active');
            btnRight?.classList.remove('active');
        };

        if (dpad) {
            let activeDpadTouchId = null;

            dpad.addEventListener('touchstart', e => {
                e.preventDefault();
                sound.init();
                const touch = e.changedTouches[0];
                activeDpadTouchId = touch.identifier;
                updateDpadTouch(touch.clientX, touch.clientY);
                this.vibrate(10);
            }, { passive: false });

            window.addEventListener('touchmove', e => {
                if (activeDpadTouchId === null) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const t = e.changedTouches[i];
                    if (t.identifier === activeDpadTouchId) {
                        updateDpadTouch(t.clientX, t.clientY);
                        break;
                    }
                }
            }, { passive: false });

            const handleDpadEnd = e => {
                if (activeDpadTouchId === null) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === activeDpadTouchId) {
                        activeDpadTouchId = null;
                        releaseDpad();
                        break;
                    }
                }
            };

            window.addEventListener('touchend', handleDpadEnd, { passive: true });
            window.addEventListener('touchcancel', handleDpadEnd, { passive: true });
        }

        // Configuración de botones de acción táctiles (Salto izquierdo/derecho, Rápido, Pesado, Especial)
        const setupActionTouch = (id, action, actionType) => {
            const el = document.getElementById(id);
            if (!el) return;

            const handleStart = (e) => {
                e.preventDefault();
                sound.init();
                el.classList.add('active');
                this.input.setAction('p1', action, true);
                this.vibrate(15);

                if (actionType && this.state === 'PLAYING') {
                    this.input.queueAttack('p1', actionType);
                    this.updateHUD();
                }
            };

            const handleEnd = (e) => {
                e.preventDefault();
                el.classList.remove('active');
                this.input.setAction('p1', action, false);
            };

            el.addEventListener('touchstart', handleStart, { passive: false });
            el.addEventListener('touchend', handleEnd, { passive: false });
            el.addEventListener('touchcancel', handleEnd, { passive: false });

            // Soporte de ratón para pruebas en PC
            el.addEventListener('mousedown', handleStart);
            el.addEventListener('mouseup', handleEnd);
            el.addEventListener('mouseleave', handleEnd);
        };

        // Salto izquierdo y Salto alternativo en mano derecha
        setupActionTouch('btn-touch-jump', 'jump', null);
        setupActionTouch('btn-touch-jump-alt', 'jump', null);

        // Botones de Ataque
        setupActionTouch('btn-touch-light', 'attack', 'light');
        setupActionTouch('btn-touch-heavy', 'attack', 'heavy');
        setupActionTouch('btn-touch-special', 'attack', 'special');
    }

    /**
     * Vinculación de botones de la interfaz gráfica
     */
    initUI() {
        [0, 1].forEach(playerIndex => {
            const selector = document.getElementById(`p${playerIndex + 1}-weapon-select`);
            const nextButton = document.getElementById(`p${playerIndex + 1}-weapon-next`);
            selector.addEventListener('change', () => {
                this.equipPlayerWeapon(playerIndex, selector.value);
            });
            document.getElementById('shop-player-select').addEventListener('change', event => {
                this.activeShopPlayerIndex = Number(event.target.value);
                this.openShop(this.activeShopPlayerIndex);
            });
            nextButton.addEventListener('click', () => {
                this.cyclePlayerWeapon(playerIndex);
            });
        });

        // Menú principal
        document.getElementById('btn-play-single').onclick = () => { sound.init(); this.startGame(1); };
        document.getElementById('btn-play-two').onclick = () => { sound.init(); this.startGame(2); };
        document.getElementById('btn-shop').onclick = () => { sound.init(); this.openShop(); };
        document.getElementById('btn-customize').onclick = () => this.openCustomization();
        playMenuMusic();
        document.querySelectorAll('[data-customization-player]').forEach(button => {
            button.addEventListener('click', () => {
                this.selectCustomizationPlayer(Number(button.dataset.customizationPlayer));
            });
        });
        document.getElementById('btn-controls').onclick = () => { sound.init(); this.showOverlay('controls-overlay'); };
        document.getElementById('btn-progress').onclick = () => { sound.init(); this.openProgress(); };
        document.getElementById('btn-reset').onclick = () => { sound.init(); this.resetProgress(); };
        document.getElementById('btn-fullscreen-menu').onclick = () => { sound.init(); this.toggleFullscreen(); };

        // Botones de cierre de ventanas modales
        document.getElementById('btn-close-shop').onclick = () => this.closeShop();
        document.getElementById('btn-close-controls').onclick = () => this.showOverlay('menu-overlay');
        document.getElementById('btn-close-progress').onclick = () => this.showOverlay('menu-overlay');
        document.getElementById('btn-close-customization').onclick = () => this.cancelCustomization();
        document.getElementById('btn-reset-customization').onclick = () => this.resetCustomizationDraft();
        document.getElementById('customization-form').addEventListener('submit', event => this.saveCustomization(event));
        [
            'customization-nickname', 'customization-weapon', 'effects-enabled', 'effects-aura',
            'effects-run-trail', 'effects-dash-trail', 'effects-jump-land', 'effects-combat-flash',
            'effects-defeat-energy', 'effects-intensity', 'effects-density', 'effects-reduced'
        ]
            .forEach(id => document.getElementById(id).addEventListener('input', () => this.updateCustomizationPreview()));
        document.querySelectorAll('.color-picker-trigger').forEach(button => {
            button.addEventListener('click', () => this.openColorPicker(button.dataset.colorTarget));
        });
        this.initColorPicker();

        // Botones del overlay de sugerencia de rotación
        document.getElementById('btn-orientation-fullscreen').onclick = () => {
            sound.init();
            this.toggleFullscreen();
            this.orientationDismissed = true;
            this.checkOrientation();
        };
        document.getElementById('btn-orientation-continue').onclick = () => {
            sound.init();
            this.orientationDismissed = true;
            this.checkOrientation();
        };

        // Controles de pausa y HUD
        document.getElementById('btn-pause-hud').onclick = () => this.pauseGame();
        document.getElementById('btn-resume').onclick = () => this.resumeGame();
        document.getElementById('btn-fullscreen-hud').onclick = () => this.toggleFullscreen();
        document.getElementById('btn-pause-shop').onclick = () => {
            this.previousState = 'PAUSED';
            this.openShop();
        };
        document.getElementById('btn-quit').onclick = () => {
            this.showOverlay('menu-overlay');
            this.state = 'MENU';
            playMenuMusic();
        };

        // Reintentos y finalizaciones
        document.getElementById('btn-retry').onclick = () => this.startGame();
        document.getElementById('btn-gameover-menu').onclick = () => {
            this.showOverlay('menu-overlay');
            this.state = 'MENU';
            playMenuMusic();
        };
        document.getElementById('btn-victory-menu').onclick = () => {
            this.showOverlay('menu-overlay');
            this.state = 'MENU';
            playMenuMusic();
        };

        // Conmutador de Sonido
        const soundBtn = document.getElementById('btn-sound-toggle');
        soundBtn.onclick = () => {
            sound.init();
            const isEnabled = sound.toggleSound();
            musicManager.setMuted(!isEnabled);
            this.updateHUD();
        };

        this.updateGamepadAssignments();
    }

    updateGamepadAssignments(gamepads = this.input.getConnectedGamepads()) {
        const container = document.getElementById('gamepad-assignments');
        if (!container) return;

        container.replaceChildren();
        if (gamepads.length === 0) {
            container.textContent = 'No hay mandos conectados. Conecta un mando y asígnalo a P1 o P2.';
            return;
        }

        gamepads.forEach(gamepad => {
            const row = document.createElement('label');
            row.className = 'gamepad-assignment-row';

            const name = document.createElement('span');
            name.textContent = gamepad.id || `Mando ${gamepad.index + 1}`;

            const select = document.createElement('select');
            select.setAttribute('aria-label', `Asignar ${name.textContent} a un jugador`);
            select.add(new Option('Sin asignar', ''));
            select.add(new Option('P1', 'p1'));
            select.add(new Option('P2', 'p2'));
            select.value = gamepad.assignedTo;
            select.addEventListener('change', () => {
                this.input.assignGamepad(gamepad.index, select.value);
            });

            row.append(name, select);
            container.appendChild(row);
        });
    }

    /**
     * Muestra u oculta overlays de interfaz
     */
    showOverlay(id, hideOthers = true) {
        if (hideOthers) {
            document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden'));
        }
        if (id) {
            const target = document.getElementById(id);
            if (target) target.classList.remove('hidden');
        }
    }

    /**
     * Carga de datos persistentes del jugador
     */
    loadProgress() {
        const readWeaponList = key => {
            try {
                const saved = JSON.parse(localStorage.getItem(key) || 'null');
                return Array.isArray(saved) ? saved : null;
            } catch (error) {
                console.warn(`No se pudo leer el inventario guardado (${key}).`, error);
                return null;
            }
        };
        const normalizeInventory = (saved, allowExpansion) => {
            const owned = new Set(['sword']);
            if (Array.isArray(saved)) {
                saved.forEach(id => {
                    const normalizedId = normalizeWeaponId(id);
                    const weapon = WEAPONS[normalizedId];
                    if (weapon && (allowExpansion || !weapon.expansion)) owned.add(normalizedId);
                });
            }
            return [...owned];
        };
        const readCoins = (key, fallback = 0) => {
            const saved = localStorage.getItem(key);
            if (saved === null) return fallback;
            const value = Number(saved);
            return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
        };
        const legacyInventory = readWeaponList('purchasedWeapons');
        const player1Inventory = readWeaponList('player1PurchasedWeapons');
        const player2Inventory = readWeaponList('player2PurchasedWeapons');
        const legacyEquipped = normalizeWeaponId(localStorage.getItem('equippedWeapon'));
        const equippedFor = (key, fallback, inventory) => {
            const candidate = normalizeWeaponId(localStorage.getItem(key) || fallback);
            return inventory.includes(candidate) ? candidate : 'sword';
        };
        const p1Weapons = normalizeInventory(player1Inventory || legacyInventory || ['sword'], !!player1Inventory);
        const p2Weapons = normalizeInventory(player2Inventory || ['sword'], !!player2Inventory);
        const p1Equipped = equippedFor('player1EquippedWeapon', legacyEquipped, p1Weapons);
        const p2Equipped = equippedFor('player2EquippedWeapon', 'sword', p2Weapons);
        this.playerProgress = [
            {
                coins: readCoins('player1Coins', readCoins('playerCoins')),
                purchasedWeapons: p1Weapons,
                equippedWeapon: p1Equipped
            },
            {
                coins: readCoins('player2Coins'),
                purchasedWeapons: p2Weapons,
                equippedWeapon: p2Equipped
            }
        ];
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.totalKills = parseInt(localStorage.getItem('totalEnemiesDefeated')) || 0;
        this.totalBosses = parseInt(localStorage.getItem('totalBossesDefeated')) || 0;
    }

    loadCustomization() {
        const defaults = {
            nickname: 'STICK',
            color: '#00f3ff',
            accentColor: '#ffffff',
            weaponId: this.equippedWeapon,
            effects: { ...DEFAULT_PLAYER_EFFECTS }
        };

        try {
            const saved = JSON.parse(localStorage.getItem('playerCustomization') || '{}');
            const nickname = typeof saved.nickname === 'string' ? saved.nickname.trim() : '';
            const effects = saved.effects && typeof saved.effects === 'object' ? saved.effects : {};
            const auraStyles = ['none', 'orbit', 'ring', 'flame'];
            return {
                nickname: this.isValidNickname(nickname) ? nickname : defaults.nickname,
                color: this.isValidHexColor(saved.color) ? saved.color.toLowerCase() : defaults.color,
                accentColor: this.isValidHexColor(saved.accentColor) ? saved.accentColor.toLowerCase() : defaults.accentColor,
                weaponId: normalizeWeaponId(saved.weaponId || defaults.weaponId),
                effects: {
                    enabled: typeof effects.enabled === 'boolean' ? effects.enabled : defaults.effects.enabled,
                    auraStyle: auraStyles.includes(effects.auraStyle) ? effects.auraStyle : defaults.effects.auraStyle,
                    runTrail: typeof effects.runTrail === 'boolean' ? effects.runTrail : defaults.effects.runTrail,
                    dashTrail: typeof effects.dashTrail === 'boolean' ? effects.dashTrail : defaults.effects.dashTrail,
                    jumpLand: typeof effects.jumpLand === 'boolean' ? effects.jumpLand : defaults.effects.jumpLand,
                    combatFlash: typeof effects.combatFlash === 'boolean' ? effects.combatFlash : defaults.effects.combatFlash,
                    defeatEnergy: typeof effects.defeatEnergy === 'boolean' ? effects.defeatEnergy : defaults.effects.defeatEnergy,
                    color: this.isValidHexColor(effects.color) ? effects.color.toLowerCase() : defaults.effects.color,
                    intensity: this.clampInteger(effects.intensity, 0, 100, defaults.effects.intensity),
                    density: this.clampInteger(effects.density, 0, 100, defaults.effects.density),
                    reduced: typeof effects.reduced === 'boolean' ? effects.reduced : defaults.effects.reduced
                }
            };
        } catch (error) {
            console.warn('No se pudo leer la personalización guardada; se usarán los valores iniciales.', error);
            return defaults;
        }
    }

    loadPlayer2Customization() {
        const defaults = {
            nickname: 'P2',
            color: '#ff00aa',
            accentColor: '#ffffff',
            weaponId: this.playerProgress[1].equippedWeapon,
            effects: { ...DEFAULT_PLAYER_EFFECTS, color: '#ff00aa' }
        };

        try {
            const saved = JSON.parse(localStorage.getItem('player2Customization') || '{}');
            const nickname = typeof saved.nickname === 'string' ? saved.nickname.trim() : '';
            const effects = saved.effects && typeof saved.effects === 'object' ? saved.effects : {};
            const auraStyles = ['none', 'orbit', 'ring', 'flame'];
            return {
                nickname: this.isValidNickname(nickname) ? nickname : defaults.nickname,
                color: this.isValidHexColor(saved.color) ? saved.color.toLowerCase() : defaults.color,
                accentColor: this.isValidHexColor(saved.accentColor) ? saved.accentColor.toLowerCase() : defaults.accentColor,
                weaponId: normalizeWeaponId(saved.weaponId || defaults.weaponId),
                effects: {
                    enabled: typeof effects.enabled === 'boolean' ? effects.enabled : defaults.effects.enabled,
                    auraStyle: auraStyles.includes(effects.auraStyle) ? effects.auraStyle : defaults.effects.auraStyle,
                    runTrail: typeof effects.runTrail === 'boolean' ? effects.runTrail : defaults.effects.runTrail,
                    dashTrail: typeof effects.dashTrail === 'boolean' ? effects.dashTrail : defaults.effects.dashTrail,
                    jumpLand: typeof effects.jumpLand === 'boolean' ? effects.jumpLand : defaults.effects.jumpLand,
                    combatFlash: typeof effects.combatFlash === 'boolean' ? effects.combatFlash : defaults.effects.combatFlash,
                    defeatEnergy: typeof effects.defeatEnergy === 'boolean' ? effects.defeatEnergy : defaults.effects.defeatEnergy,
                    color: this.isValidHexColor(effects.color) ? effects.color.toLowerCase() : defaults.effects.color,
                    intensity: this.clampInteger(effects.intensity, 0, 100, defaults.effects.intensity),
                    density: this.clampInteger(effects.density, 0, 100, defaults.effects.density),
                    reduced: typeof effects.reduced === 'boolean' ? effects.reduced : defaults.effects.reduced
                }
            };
        } catch (error) {
            console.warn('No se pudo leer la personalización de P2; se usarán los valores iniciales.', error);
            return defaults;
        }
    }

    isValidNickname(nickname) {
        return /^[\p{L}\p{N}_ -]{2,16}$/u.test(nickname);
    }

    isValidHexColor(value) {
        return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
    }

    clampInteger(value, min, max, fallback) {
        const number = Number(value);
        return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
    }

    openCustomization(playerIndex = 0) {
        this.selectCustomizationPlayer(playerIndex);
        const inventory = this.playerProgress[this.activePlayerIndex];
        const weaponSelect = document.getElementById('customization-weapon');
        weaponSelect.replaceChildren();
        Object.values(WEAPONS).forEach(weapon => {
            const isUnlocked = inventory.purchasedWeapons.includes(weapon.id);
            const option = new Option(
                `${weapon.name}${isUnlocked ? '' : ' — BLOQUEADA'}`,
                weapon.id
            );
            option.disabled = !isUnlocked;
            weaponSelect.add(option);
        });

        const playerCustomization = this.getPlayerCustomization(this.activePlayerIndex);
        this.customizationDraft = {
            ...playerCustomization,
            weaponId: inventory.equippedWeapon,
            effects: { ...playerCustomization.effects }
        };
        this.writeCustomizationForm(this.customizationDraft);
        document.getElementById('customization-message').textContent =
            'Los cambios se guardan solo al pulsar Aplicar.';
        this.updateCustomizationPreview();
        playCustomizeMusic();
        this.showOverlay('customization-overlay');
    }

    getPlayerCustomization(playerIndex) {
        if (playerIndex === 0) return this.customization;
        if (playerIndex === 1) return this.player2Customization;
        throw new Error(`Jugador de personalización no válido: ${playerIndex}`);
    }

    selectCustomizationPlayer(playerIndex) {
        if (playerIndex !== 0 && playerIndex !== 1) {
            throw new Error(`Jugador de personalización no válido: ${playerIndex}`);
        }
        this.activePlayerIndex = playerIndex;
        const customization = this.getPlayerCustomization(playerIndex);
        this.customizationDraft = {
            ...customization,
            effects: { ...customization.effects }
        };
        document.querySelectorAll('[data-customization-player]').forEach(button => {
            const selected = Number(button.dataset.customizationPlayer) === playerIndex;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        this.writeCustomizationForm(this.customizationDraft);
        this.updateCustomizationPreview();
    }

    writeCustomizationForm(draft) {
        document.getElementById('customization-nickname').value = draft.nickname;
        document.getElementById('customization-weapon').value = draft.weaponId;
        document.getElementById('effects-enabled').checked = draft.effects.enabled;
        document.getElementById('effects-aura').value = draft.effects.auraStyle;
        document.getElementById('effects-run-trail').checked = draft.effects.runTrail;
        document.getElementById('effects-dash-trail').checked = draft.effects.dashTrail;
        document.getElementById('effects-jump-land').checked = draft.effects.jumpLand;
        document.getElementById('effects-combat-flash').checked = draft.effects.combatFlash;
        document.getElementById('effects-defeat-energy').checked = draft.effects.defeatEnergy;
        document.getElementById('effects-intensity').value = draft.effects.intensity;
        document.getElementById('effects-density').value = draft.effects.density;
        document.getElementById('effects-reduced').checked = draft.effects.reduced;
        this.setColorControl('customization-color', 'customization-color-swatch', draft.color);
        this.setColorControl('customization-accent', 'customization-accent-swatch', draft.accentColor);
        this.setColorControl('effects-color', 'effects-color-swatch', draft.effects.color);
        document.getElementById('effects-intensity-value').textContent = `${draft.effects.intensity}%`;
        document.getElementById('effects-density-value').textContent = `${draft.effects.density}%`;
    }

    setColorControl(outputId, swatchId, color) {
        document.getElementById(outputId).textContent = color.toUpperCase();
        document.getElementById(swatchId).style.backgroundColor = color;
        document.getElementById(swatchId).style.color = color;
    }

    readCustomizationForm() {
        const effects = {
            enabled: document.getElementById('effects-enabled').checked,
            auraStyle: document.getElementById('effects-aura').value,
            runTrail: document.getElementById('effects-run-trail').checked,
            dashTrail: document.getElementById('effects-dash-trail').checked,
            jumpLand: document.getElementById('effects-jump-land').checked,
            combatFlash: document.getElementById('effects-combat-flash').checked,
            defeatEnergy: document.getElementById('effects-defeat-energy').checked,
            color: this.customizationDraft.effects.color,
            intensity: Number(document.getElementById('effects-intensity').value),
            density: Number(document.getElementById('effects-density').value),
            reduced: document.getElementById('effects-reduced').checked
        };
        return {
            nickname: document.getElementById('customization-nickname').value.trim().replace(/\s+/g, ' '),
            color: this.customizationDraft.color,
            accentColor: this.customizationDraft.accentColor,
            weaponId: document.getElementById('customization-weapon').value,
            effects
        };
    }

    updateCustomizationPreview() {
        const canvas = document.getElementById('customization-preview');
        if (!canvas) return;
        const draft = this.readCustomizationForm();
        const previewPlayer = this.previewPlayer || new Player(canvas.width / 2, canvas.height - 38, 'P1');
        previewPlayer.nickname = draft.nickname || 'STICK';
        previewPlayer.color = this.colorPickerTarget === 'color' ? this.colorPickerColor : draft.color;
        previewPlayer.accentColor = this.colorPickerTarget === 'accentColor' ? this.colorPickerColor : draft.accentColor;
        previewPlayer.weapon = WEAPONS[normalizeWeaponId(draft.weaponId)] || WEAPONS.whip;
        previewPlayer.effects = {
            ...draft.effects,
            color: this.colorPickerTarget === 'effects.color' ? this.colorPickerColor : draft.effects.color
        };
        this.previewPlayer = previewPlayer;
        this.setColorControl('customization-color', 'customization-color-swatch', previewPlayer.color);
        this.setColorControl('customization-accent', 'customization-accent-swatch', previewPlayer.accentColor);
        this.setColorControl('effects-color', 'effects-color-swatch', previewPlayer.effects.color);
        document.getElementById('effects-intensity-value').textContent = `${draft.effects.intensity}%`;
        document.getElementById('effects-density-value').textContent = `${draft.effects.density}%`;

        this.renderCustomizationPreview();
    }

    renderCustomizationPreview() {
        const canvas = document.getElementById('customization-preview');
        const previewPlayer = this.previewPlayer;
        if (!canvas || !previewPlayer) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#050916';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.45)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 8);
        ctx.lineTo(canvas.width, canvas.height - 8);
        ctx.stroke();
        previewPlayer.effectFrame++;
        previewPlayer.updateEffectParticles();
        if (previewPlayer.effects.enabled) {
            if (previewPlayer.effects.runTrail && previewPlayer.effectFrame % 5 === 0) {
                previewPlayer.emitEffectBurst('trail', Math.round(2 * previewPlayer.effectDensity()), -1);
            }
            if (previewPlayer.effects.combatFlash && previewPlayer.effectFrame % 78 === 0) {
                previewPlayer.triggerCombatFlash();
            }
            if (previewPlayer.effects.defeatEnergy && previewPlayer.effectFrame % 126 === 0) {
                previewPlayer.emitEffectBurst('defeat', Math.round(9 * previewPlayer.effectDensity()));
            }
        }
        previewPlayer.draw(ctx);
    }

    getCustomizationDefaults(playerIndex = this.activePlayerIndex) {
        const isPlayer2 = playerIndex === 1;
        const playerColor = isPlayer2 ? '#ff00aa' : '#00f3ff';
        return {
            nickname: isPlayer2 ? 'P2' : 'STICK',
            color: playerColor,
            accentColor: '#ffffff',
            weaponId: this.playerProgress[playerIndex].equippedWeapon,
            effects: { ...DEFAULT_PLAYER_EFFECTS, color: playerColor }
        };
    }

    resetCustomizationDraft() {
        this.customizationDraft = this.getCustomizationDefaults(this.activePlayerIndex);
        this.writeCustomizationForm(this.customizationDraft);
        document.getElementById('customization-message').textContent =
            'Valores iniciales restaurados. Pulsa Aplicar para guardarlos.';
        this.updateCustomizationPreview();
    }

    cancelCustomization() {
        this.colorPickerTarget = null;
        document.getElementById('color-picker').classList.add('hidden');
        this.customizationDraft = null;
        this.showOverlay('menu-overlay');
        playMenuMusic();
    }

    colorTargetDefault(target) {
        if (target === 'color') return '#00f3ff';
        if (target === 'accentColor') return '#ffffff';
        if (target === 'effects.color') return DEFAULT_PLAYER_EFFECTS.color;
        throw new Error(`Destino de color desconocido: ${target}`);
    }

    getDraftColor(target) {
        if (target === 'color' || target === 'accentColor') return this.customizationDraft[target];
        if (target === 'effects.color') return this.customizationDraft.effects.color;
        throw new Error(`Destino de color desconocido: ${target}`);
    }

    setDraftColor(target, color) {
        if (target === 'color' || target === 'accentColor') this.customizationDraft[target] = color;
        else if (target === 'effects.color') this.customizationDraft.effects.color = color;
        else throw new Error(`Destino de color desconocido: ${target}`);
    }

    openColorPicker(target) {
        if (!['color', 'accentColor', 'effects.color'].includes(target)) {
            throw new Error(`Destino de color desconocido: ${target}`);
        }
        this.colorPickerTarget = target;
        this.colorPickerColor = this.getDraftColor(target);
        this.colorPickerDefault = this.colorTargetDefault(target);
        const hsv = this.hexToHsv(this.colorPickerColor);
        this.colorPickerHue = hsv.h;
        this.colorPickerSaturation = hsv.s;
        this.colorPickerValue = hsv.v;
        document.getElementById('color-picker-error').textContent = '';
        document.getElementById('color-picker').classList.remove('hidden');
        this.updateColorPicker();
        document.getElementById('color-picker-hex').focus();
        this.updateCustomizationPreview();
    }

    closeColorPicker() {
        this.colorPickerTarget = null;
        document.getElementById('color-picker').classList.add('hidden');
        document.getElementById('color-picker-error').textContent = '';
        this.updateCustomizationPreview();
    }

    initColorPicker() {
        const canvas = document.getElementById('color-picker-sv');
        let pointerActive = false;
        const updateFromPointer = event => {
            if (!pointerActive && event.type === 'pointermove') return;
            const bounds = canvas.getBoundingClientRect();
            this.colorPickerSaturation = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
            this.colorPickerValue = 1 - Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
            this.syncColorPickerFromHsv();
        };
        canvas.addEventListener('pointerdown', event => {
            pointerActive = true;
            canvas.setPointerCapture(event.pointerId);
            updateFromPointer(event);
        });
        canvas.addEventListener('pointermove', updateFromPointer);
        canvas.addEventListener('pointerup', () => { pointerActive = false; });
        canvas.addEventListener('pointercancel', () => { pointerActive = false; });
        canvas.addEventListener('keydown', event => {
            const step = event.shiftKey ? 0.05 : 0.01;
            if (event.key === 'ArrowLeft') this.colorPickerSaturation = Math.max(0, this.colorPickerSaturation - step);
            else if (event.key === 'ArrowRight') this.colorPickerSaturation = Math.min(1, this.colorPickerSaturation + step);
            else if (event.key === 'ArrowUp') this.colorPickerValue = Math.min(1, this.colorPickerValue + step);
            else if (event.key === 'ArrowDown') this.colorPickerValue = Math.max(0, this.colorPickerValue - step);
            else return;
            event.preventDefault();
            this.syncColorPickerFromHsv();
        });
        document.getElementById('color-picker-hue').addEventListener('input', event => {
            this.colorPickerHue = Number(event.target.value);
            this.syncColorPickerFromHsv();
        });
        document.getElementById('color-picker-hex').addEventListener('input', event => {
            const value = event.target.value.trim();
            if (!/^#?[0-9a-f]{6}$/i.test(value)) {
                document.getElementById('color-picker-error').textContent = 'Introduce un HEX válido, por ejemplo #31A8FF.';
                return;
            }
            this.colorPickerColor = value.startsWith('#') ? value.toLowerCase() : `#${value.toLowerCase()}`;
            const hsv = this.hexToHsv(this.colorPickerColor);
            this.colorPickerHue = hsv.h;
            this.colorPickerSaturation = hsv.s;
            this.colorPickerValue = hsv.v;
            document.getElementById('color-picker-error').textContent = '';
            this.updateColorPicker();
            this.updateCustomizationPreview();
        });
        document.getElementById('color-picker-hex').addEventListener('blur', event => {
            const value = event.target.value.startsWith('#') ? event.target.value : `#${event.target.value}`;
            if (this.isValidHexColor(value)) {
                event.target.value = value.toUpperCase();
            }
        });
        document.getElementById('btn-apply-color').onclick = () => {
            if (!this.isValidHexColor(this.colorPickerColor)) return;
            this.setDraftColor(this.colorPickerTarget, this.colorPickerColor);
            this.closeColorPicker();
        };
        document.getElementById('btn-cancel-color').onclick = () => this.closeColorPicker();
        document.getElementById('btn-reset-color').onclick = () => {
            const hsv = this.hexToHsv(this.colorPickerDefault);
            this.colorPickerHue = hsv.h;
            this.colorPickerSaturation = hsv.s;
            this.colorPickerValue = hsv.v;
            this.syncColorPickerFromHsv();
        };
    }

    syncColorPickerFromHsv() {
        this.colorPickerColor = this.hsvToHex(
            this.colorPickerHue,
            this.colorPickerSaturation,
            this.colorPickerValue
        );
        document.getElementById('color-picker-error').textContent = '';
        this.updateColorPicker();
        this.updateCustomizationPreview();
    }

    updateColorPicker() {
        const canvas = document.getElementById('color-picker-sv');
        const ctx = canvas.getContext('2d');
        const hueColor = `hsl(${this.colorPickerHue} 100% 50%)`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = hueColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const white = ctx.createLinearGradient(0, 0, canvas.width, 0);
        white.addColorStop(0, '#ffffff');
        white.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = white;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const black = ctx.createLinearGradient(0, 0, 0, canvas.height);
        black.addColorStop(0, 'rgba(0, 0, 0, 0)');
        black.addColorStop(1, '#000000');
        ctx.fillStyle = black;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const markerX = Math.max(10, Math.min(canvas.width - 10, this.colorPickerSaturation * canvas.width));
        const markerY = Math.max(10, Math.min(canvas.height - 10, (1 - this.colorPickerValue) * canvas.height));
        ctx.beginPath();
        ctx.arc(markerX, markerY, 7, 0, Math.PI * 2);
        ctx.strokeStyle = this.colorPickerValue > 0.55 ? '#000000' : '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(markerX, markerY, 9, 0, Math.PI * 2);
        ctx.strokeStyle = this.colorPickerValue > 0.55 ? '#ffffff' : '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        const hueInput = document.getElementById('color-picker-hue');
        hueInput.value = this.colorPickerHue;
        hueInput.style.background = 'linear-gradient(to bottom, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)';
        const hexInput = document.getElementById('color-picker-hex');
        if (document.activeElement !== hexInput || this.isValidHexColor(hexInput.value)) {
            hexInput.value = this.colorPickerColor.toUpperCase();
        }
        const rgb = this.hexToRgb(this.colorPickerColor);
        document.getElementById('color-picker-rgb').textContent = `RGB ${rgb.r}, ${rgb.g}, ${rgb.b}`;
        document.getElementById('color-picker-preview').style.backgroundColor = this.colorPickerColor;
        document.getElementById('color-picker-preview').style.color = this.colorPickerColor;
    }

    hexToRgb(hex) {
        const value = hex.replace('#', '');
        return {
            r: parseInt(value.slice(0, 2), 16),
            g: parseInt(value.slice(2, 4), 16),
            b: parseInt(value.slice(4, 6), 16)
        };
    }

    hexToHsv(hex) {
        const { r: red, g: green, b: blue } = this.hexToRgb(hex);
        const r = red / 255;
        const g = green / 255;
        const b = blue / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        let hue = 0;
        if (delta !== 0) {
            if (max === r) hue = 60 * (((g - b) / delta) % 6);
            else if (max === g) hue = 60 * ((b - r) / delta + 2);
            else hue = 60 * ((r - g) / delta + 4);
        }
        return {
            h: (hue + 360) % 360,
            s: max === 0 ? 0 : delta / max,
            v: max
        };
    }

    hsvToHex(hue, saturation, value) {
        const normalizedHue = ((hue % 360) + 360) % 360;
        const normalizedSaturation = Math.max(0, Math.min(1, saturation));
        const normalizedValue = Math.max(0, Math.min(1, value));
        const chroma = normalizedValue * normalizedSaturation;
        const section = normalizedHue / 60;
        const x = chroma * (1 - Math.abs((section % 2) - 1));
        const [r, g, b] = section < 1 ? [chroma, x, 0] :
            section < 2 ? [x, chroma, 0] :
            section < 3 ? [0, chroma, x] :
            section < 4 ? [0, x, chroma] :
            section < 5 ? [x, 0, chroma] : [chroma, 0, x];
        const offset = normalizedValue - chroma;
        return `#${[r, g, b].map(channel =>
            Math.round((channel + offset) * 255).toString(16).padStart(2, '0')
        ).join('')}`;
    }

    saveCustomization(event) {
        event.preventDefault();
        const customization = this.readCustomizationForm();
        const nicknameInput = document.getElementById('customization-nickname');
        const { nickname, weaponId } = customization;
        const message = document.getElementById('customization-message');

        if (!this.isValidNickname(nickname)) {
            message.textContent = 'Usa un apodo de 2 a 16 caracteres: letras, números, espacios, guion o _.';
            nicknameInput.focus();
            return;
        }
        if (!WEAPONS[weaponId] ||
            !this.playerProgress[this.activePlayerIndex].purchasedWeapons.includes(weaponId)) {
            message.textContent = 'Desbloquea esa arma en la armería antes de equiparla.';
            return;
        }
        if (!['none', 'orbit', 'ring', 'flame'].includes(customization.effects.auraStyle) ||
            !this.isValidHexColor(customization.color) ||
            !this.isValidHexColor(customization.accentColor) ||
            !this.isValidHexColor(customization.effects.color)) {
            message.textContent = 'Hay valores de color o efectos no válidos. Restablécelos e inténtalo de nuevo.';
            return;
        }

        const storageKey = this.activePlayerIndex === 0 ? 'playerCustomization' : 'player2Customization';
        try {
            localStorage.setItem(storageKey, JSON.stringify(customization));
        } catch (error) {
            console.error('No se pudo guardar la personalización.', error);
            message.textContent = 'No se pudo guardar. Comprueba el espacio disponible del navegador.';
            return;
        }

        if (this.activePlayerIndex === 0) this.customization = customization;
        else this.player2Customization = customization;
        this.equipPlayerWeapon(this.activePlayerIndex, weaponId);
        this.applyCustomizationToPlayers();
        this.customizationDraft = {
            ...customization,
            effects: { ...customization.effects }
        };
        message.textContent = 'Personalización y efectos aplicados y guardados.';
        this.updateCustomizationPreview();
    }

    applyCustomizationToPlayers() {
        this.players.forEach(player => {
            const config = player.playerId === 'P2' ? this.player2Customization : this.customization;
            if (!config) return;
            player.nickname = config.nickname;
            player.color = config.color;
            player.accentColor = config.accentColor;
            const inventory = this.playerProgress[player.playerId === 'P2' ? 1 : 0];
            player.weapon = WEAPONS[inventory.equippedWeapon] || WEAPONS.sword;
            player.effects = { ...config.effects };
        });
    }

    /**
     * Guarda el progreso en localStorage
     */
    saveProgress() {
        localStorage.setItem('playerCoins', this.coins);
        localStorage.setItem('purchasedWeapons', JSON.stringify(this.purchasedWeapons));
        localStorage.setItem('equippedWeapon', this.equippedWeapon);
        this.playerProgress.forEach((progress, index) => {
            const playerNumber = index + 1;
            localStorage.setItem(`player${playerNumber}Coins`, progress.coins);
            localStorage.setItem(`player${playerNumber}PurchasedWeapons`, JSON.stringify(progress.purchasedWeapons));
            localStorage.setItem(`player${playerNumber}EquippedWeapon`, progress.equippedWeapon);
        });
        localStorage.setItem('bestScore', this.bestScore);
        localStorage.setItem('totalEnemiesDefeated', this.totalKills);
        localStorage.setItem('totalBossesDefeated', this.totalBosses);
        this.updateHUD();
    }

    /**
     * Reinicio seguro del progreso
     */
    resetProgress() {
        if (confirm("¿Estás seguro de que deseas reiniciar todo tu progreso de juego?")) {
            localStorage.removeItem('playerCoins');
            localStorage.removeItem('purchasedWeapons');
            localStorage.removeItem('equippedWeapon');
            ['player1Coins', 'player1PurchasedWeapons', 'player1EquippedWeapon',
                'player2Coins', 'player2PurchasedWeapons', 'player2EquippedWeapon']
                .forEach(key => localStorage.removeItem(key));
            localStorage.removeItem('bestScore');
            localStorage.removeItem('totalEnemiesDefeated');
            localStorage.removeItem('totalBossesDefeated');

            this.playerProgress = [0, 1].map(() => ({
                coins: 0,
                purchasedWeapons: ['sword'],
                equippedWeapon: 'sword'
            }));
            this.bestScore = 0;
            this.totalKills = 0;
            this.totalBosses = 0;

            this.players.forEach((player, index) => {
                player.weapon = WEAPONS[this.playerProgress[index].equippedWeapon];
            });

            this.saveProgress();
            alert("Progreso reiniciado correctamente.");
        }
    }

    /**
     * Apertura de la Tienda de Armas Neón
     */
    openShop(playerIndex = this.activeShopPlayerIndex) {
        if (playerIndex !== 0 && playerIndex !== 1) throw new Error(`Jugador de tienda no válido: ${playerIndex}`);
        this.activeShopPlayerIndex = playerIndex;
        const progress = this.playerProgress[playerIndex];
        const container = document.getElementById('shop-container');
        container.innerHTML = '';
        document.getElementById('shop-player-select').value = String(playerIndex);
        document.getElementById('shop-coins').innerText = `P${playerIndex + 1}: 🪙 ${progress.coins}`;

        Object.values(WEAPONS).forEach(w => {
            const isBought = progress.purchasedWeapons.includes(w.id);
            const isEquipped = (this.players[playerIndex]?.weapon?.id || progress.equippedWeapon) === w.id;

            const card = document.createElement('div');
            card.className = `shop-item ${isEquipped ? 'equipped' : ''}`;
            card.innerHTML = `
                <div class="shop-item-title" style="color:${w.color};">${w.name}</div>
                <div class="shop-item-stats">
                    ${w.desc}
                    <div class="stat-bars-container">
                        <div class="stat-row">
                            <span>Daño:</span>
                            <div class="stat-mini-bar">
                                <div class="stat-mini-fill" style="width: ${(w.damageMult / 3.5) * 100}%; background: ${w.color};"></div>
                            </div>
                        </div>
                        <div class="stat-row">
                            <span>Velocidad:</span>
                            <div class="stat-mini-bar">
                                <div class="stat-mini-fill" style="width: ${(w.speed / 1.5) * 100}%; background: ${w.color};"></div>
                            </div>
                        </div>
                        <div class="stat-row">
                            <span>Alcance:</span>
                            <div class="stat-mini-bar">
                                <div class="stat-mini-fill" style="width: ${(w.reachMult / 2) * 100}%; background: ${w.color};"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="shop-item-price">${isBought ? (isEquipped ? 'EN USO' : 'DESBLOQUEADA') : `🪙 ${w.price}`}</div>
                <button class="btn ${isEquipped ? 'btn-green' : (isBought ? '' : 'btn-magenta')}" style="padding: 8px 12px; font-size: 0.85rem; margin-top: 5px;">
                    ${isEquipped ? 'EQUIPADA' : (isBought ? 'EQUIPAR' : 'COMPRAR')}
                </button>
            `;

            card.querySelector('button').onclick = () => {
                sound.init();
                if (isBought) {
                    this.equipPlayerWeapon(playerIndex, w.id);
                    this.openShop();
                } else {
                    if (progress.coins >= w.price) {
                        progress.coins -= w.price;
                        progress.purchasedWeapons.push(w.id);
                        this.equipPlayerWeapon(playerIndex, w.id);
                        sound.playCoin();
                        this.openShop();
                    } else {
                        const msg = document.getElementById('shop-msg');
                        msg.innerText = "¡MONEDAS INSUFICIENTES!";
                        setTimeout(() => { msg.innerText = ""; }, 2200);
                    }
                }
            };

            container.appendChild(card);
        });

        this.showOverlay('shop-overlay');
    }

    /**
     * Cierra la tienda y regresa al estado previo correspondiente (Pausa o Menú)
     */
    closeShop() {
        if (this.state === 'PAUSED' || this.previousState === 'PAUSED') {
            this.showOverlay('pause-overlay');
        } else {
            this.showOverlay('menu-overlay');
        }
    }

    /**
     * Muestra las estadísticas de progreso acumuladas
     */
    openProgress() {
        const stats = document.getElementById('progress-stats');
        stats.innerHTML = `
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-box-title">Monedas por jugador</div>
                    <div class="stat-box-val" style="color: #ffcc00;">P1 ${this.playerProgress[0].coins} / P2 ${this.playerProgress[1].coins} 🪙</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-title">Enemigos Eliminados</div>
                    <div class="stat-box-val">${this.totalKills} ⚔️</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-title">Jefes Derrotados</div>
                    <div class="stat-box-val" style="color: #ff0055;">${this.totalBosses} 👑</div>
                </div>
                <div class="stat-box">
                    <div class="stat-box-title">Arsenal P1 / P2</div>
                    <div class="stat-box-val" style="color: #00ff88;">${this.playerProgress[0].purchasedWeapons.length} / ${this.playerProgress[1].purchasedWeapons.length} de ${Object.keys(WEAPONS).length} 🗡️</div>
                </div>
            </div>
        `;
        this.showOverlay('progress-overlay');
    }

    /**
     * Configuración de plataformas flotantes por zona
     */
    setupZonePlatforms() {
        this.platforms = [];
        const floorY = this.getFloorY();
        const platW = Math.min(200, Math.max(120, this.width * 0.24));

        if (this.currentZone === 2) {
            // Zona 2: Neon Factory (1 plataforma flotante central)
            this.platforms.push({ x: this.width * 0.38, y: floorY - 120, w: platW, h: 14 });
        } else if (this.currentZone === 3) {
            // Zona 3: Void District (2 plataformas flotantes)
            this.platforms.push({ x: this.width * 0.16, y: floorY - 120, w: platW, h: 14 });
            this.platforms.push({ x: this.width * 0.60, y: floorY - 120, w: platW, h: 14 });
        } else if (this.currentZone === 4) {
            // Zona 4: Core of Darkness (3 plataformas multinivel)
            this.platforms.push({ x: this.width * 0.12, y: floorY - 120, w: platW, h: 14 });
            this.platforms.push({ x: this.width * 0.40, y: floorY - 190, w: platW, h: 14 });
            this.platforms.push({ x: this.width * 0.68, y: floorY - 120, w: platW, h: 14 });
        } else if (this.currentZone === 5) {
            // Zona 5: Quantum Matrix (3 plataformas matrix en cascada)
            this.platforms.push({ x: this.width * 0.14, y: floorY - 170, w: platW * 0.9, h: 14 });
            this.platforms.push({ x: this.width * 0.42, y: floorY - 120, w: platW * 0.9, h: 14 });
            this.platforms.push({ x: this.width * 0.70, y: floorY - 170, w: platW * 0.9, h: 14 });
        } else if (this.currentZone === 6) {
            // Zona 6: Volcanic Nucleus (2 plataformas altas sobre el magma)
            this.platforms.push({ x: this.width * 0.20, y: floorY - 150, w: platW, h: 14 });
            this.platforms.push({ x: this.width * 0.58, y: floorY - 150, w: platW, h: 14 });
        } else if (this.currentZone === 7) {
            // Zona 7: Spectral Abyss (3 plataformas flotantes espectrales)
            this.platforms.push({ x: this.width * 0.12, y: floorY - 130, w: platW * 0.85, h: 14 });
            this.platforms.push({ x: this.width * 0.39, y: floorY - 200, w: platW * 0.95, h: 14 });
            this.platforms.push({ x: this.width * 0.68, y: floorY - 130, w: platW * 0.85, h: 14 });
        } else if (this.currentZone === 8) {
            // Zona 8: Singularity Apex (4 plataformas cúpula final)
            this.platforms.push({ x: this.width * 0.08, y: floorY - 130, w: platW * 0.8, h: 14 });
            this.platforms.push({ x: this.width * 0.30, y: floorY - 210, w: platW * 0.85, h: 14 });
            this.platforms.push({ x: this.width * 0.52, y: floorY - 210, w: platW * 0.85, h: 14 });
            this.platforms.push({ x: this.width * 0.74, y: floorY - 130, w: platW * 0.8, h: 14 });
        }
    }

    setZone(zoneNumber) {
        if (!Number.isInteger(zoneNumber) || zoneNumber < 1 || zoneNumber > ZONE_SCENES.length) {
            throw new RangeError(`Zona no válida: ${zoneNumber}. Debe ser un entero entre 1 y ${ZONE_SCENES.length}.`);
        }

        if (this.currentZone === zoneNumber) return;
        this.currentZone = zoneNumber;
        this.activeBackground = ZONE_BACKGROUND_IMAGES[zoneNumber - 1];
        this.setupZonePlatforms();
        if (this.state === 'PLAYING') this.syncMusicWithGameState();
        this.updateHUD();
        this.draw();
    }

    /**
     * Inicia una nueva partida
     */
    startGame(playerCount = this.playerCount) {
        this.createPlayers(playerCount);
        this.input.setPlayerCount(playerCount);
        this.input.clearAttacks();
        this.teamInvulnerableTimer = 0;
        this.currentZone = 1;
        this.activeBackground = ZONE_BACKGROUND_IMAGES[this.currentZone - 1];
        this.currentWave = 1;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.explosions = [];
        this.floatingTexts = [];
        this.combo = 0;
        this.gameTime = 0;
        this.bossActive = false;

        this.setupZonePlatforms();
        this.startWave();

        this.showOverlay(null);
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        document.getElementById('hud').classList.remove('hidden');
        this.state = 'PLAYING';
        this.previousState = 'PLAYING';

        playNormalBattleMusic(this.currentZone);
    }

    /**
     * Pausar el juego
     */
    pauseGame() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.previousState = 'PAUSED';
            musicManager.pause();
            this.showOverlay('pause-overlay', false);
        }
    }

    /**
     * Reanudar el juego
     */
    resumeGame() {
        if (this.state === 'PAUSED') {
            this.input.clearAttacks();
            this.showOverlay(null);
            this.state = 'PLAYING';
            this.previousState = 'PLAYING';
            musicManager.resume();
        }
    }

    syncMusicWithGameState() {
        if (this.state === 'PLAYING') {
            if (this.bossActive) playBossBattleMusic(this.currentZone);
            else playNormalBattleMusic(this.currentZone);
        }
    }

    /**
     * Comienza una nueva oleada dentro de la zona actual
     */
    startWave() {
        this.enemies = [];
        this.projectiles = [];
        this.bossActive = false;

        // Jefes únicos y temáticos para las 11 Zonas.
        const bossConfigs = [
            { name: 'NEON OVERLORD PRECURSOR', hp: 450, color: '#ff00aa', element: 'fire' }, // Tokio
            { name: 'CYBER SENTINEL MK-II', hp: 550, color: '#00ffcc', element: 'air' }, // París
            { name: 'VOID HARVESTER PRIME', hp: 650, color: '#b000ff', element: 'earth' }, // Nueva York
            { name: 'NEON OVERLORD SUPREME', hp: 750, color: '#ff0055', element: 'water' }, // Londres
            { name: 'CHRONOS QUANTUM ARCHON', hp: 850, color: '#00ff88', element: 'fire' }, // Berlín
            { name: 'INFERNAL CYBORG TITAN', hp: 980, color: '#ff5500', element: 'air' }, // Seúl
            { name: 'PHANTOM ECLIPSE ARCHON', hp: 1150, color: '#cc00ff', element: 'earth' }, // Ciudad de México
            { name: 'GOD-CYBORG DESTRUCTOR', hp: 1400, color: '#ffea00', element: 'water' }, // El Cairo
            { name: 'TITAN SOLAR', hp: 1700, color: '#ff8f1f', element: 'fire', accent: '#ffd166' }, // Dubái
            { name: 'TEMPEST', hp: 1850, color: '#36d1dc', element: 'air', accent: '#c0f5ff' }, // Río
            { name: 'GUARDIÁN INCA', hp: 2200, color: '#2ec27e', element: 'earth', secondaryElement: 'water', accent: '#f4d35e' } // Machu
        ];

        // Distribución equilibrada de oleadas (1 a 4 normales, 5ta es Jefe de Zona)
        if (this.currentWave < this.maxWaves) {
            if (this.currentZone === 1) {
                if (this.currentWave === 1) this.spawnEnemies({ basic: 3 });
                else if (this.currentWave === 2) this.spawnEnemies({ basic: 4, fast: 1 });
                else if (this.currentWave === 3) this.spawnEnemies({ basic: 4, heavy: 1 });
                else if (this.currentWave === 4) this.spawnEnemies({ basic: 5, fast: 2, special: 1 });
            } else {
                const z = this.currentZone;
                const w = this.currentWave;
                this.spawnEnemies({
                    basic: Math.min(8, 2 + Math.floor(z * 0.5) + Math.floor(w * 0.4)),
                    fast: Math.min(6, 1 + Math.floor(w * 0.7) + Math.floor(z * 0.4)),
                    heavy: Math.min(4, Math.floor(w / 2) + Math.floor(z / 3)),
                    special: Math.min(5, Math.floor(z / 2) + (w >= 3 ? 1 : 0))
                });
            }
        } else {
            // Oleada 5: Jefe de Zona
            const cfg = bossConfigs[this.currentZone - 1] || bossConfigs[0];
            this.startBoss(cfg);
        }

        this.syncMusicWithGameState();
        this.updateHUD();
    }

    /**
     * Genera enemigos perfectamente alineados al suelo base
     */
    spawnEnemies(counts) {
        const floorY = this.getFloorY();
        Object.keys(counts).forEach(type => {
            const scale = (type === 'boss' ? 1.6 : (type === 'heavy' ? 1.25 : (type === 'fast' ? 0.9 : 1.0)));
            const feetOffset = 25 * scale;
            for (let i = 0; i < counts[type]; i++) {
                // Aparecen a los extremos para evitar spawn camp sobre el jugador
                const spawnX = Math.random() < 0.5 
                    ? Math.max(30, Math.random() * (this.width * 0.22))
                    : Math.min(this.width - 30, this.width - Math.random() * (this.width * 0.22));
                // Se genera anclado con precisión sobre el suelo base
                this.enemies.push(new Enemy(spawnX, floorY - feetOffset, type));
            }
        });
    }

    /**
     * Invoca al Jefe de la Zona alineado con precisión al suelo base
     */
    startBoss(config) {
        this.bossActive = true;
        playBossBattleMusic(this.currentZone);
        this.syncMusicWithGameState();
        const floorY = this.getFloorY();
        const bossX = Math.max(120, this.width - Math.min(220, this.width * 0.3));
        const bossScale = 1.6;
        const bossFeetOffset = 25 * bossScale; // 40px
        const boss = new Enemy(bossX, floorY - bossFeetOffset, 'boss');

        boss.name = config.name;
        boss.hp = config.hp;
        boss.maxHp = config.hp;
        boss.color = config.color;
        boss.element = config.element || 'fire';
        boss.secondaryElement = config.secondaryElement || null;
        boss.accentColor = config.accent || config.color;
        boss.elementalProfile = ELEMENTAL_ATTACKS[boss.element] || ELEMENTAL_ATTACKS.fire;
        this.enemies.push(boss);
        sound.playBossAlert();
        this.vibrate(40);
        this.floatingTexts.push(new FloatingText(this.width / 2, this.height / 3, `⚠ BOSS: ${config.name} ⚠`, config.color, 28));
    }

    /**
     * Inflige daño a un jugador concreto sin compartir su salud con el resto.
     */
    damagePlayer(amount = 5, target = this.player) {
        const playerTarget = target || this.player;
        if (!playerTarget || playerTarget.isGhost || this.teamInvulnerableTimer > 0 || this.state !== 'PLAYING' || amount <= 0) return;

        const actualDamage = Math.min(playerTarget.hp, amount);
        playerTarget.hp = Math.max(0, playerTarget.hp - actualDamage);
        playerTarget.invulnerableTimer = 34;
        this.teamInvulnerableTimer = 34; // ~550ms de invulnerabilidad compartida

        sound.playDamage();
        this.vibrate(35);
        this.screenShake = 14;
        this.damageFlash = 12;

        this.floatingTexts.push(new FloatingText(playerTarget.x, playerTarget.y - 32, `-${Math.round(actualDamage)}`, '#ff0055', 24));

        // Empuje ligero
        playerTarget.knockbackVx = playerTarget.facingRight ? -7 : 7;
        playerTarget.vy = -3.5;

        this.updateHUD();

        if (playerTarget.hp <= 0) {
            playerTarget.isDead = true;
            playerTarget.isGhost = true;
            playerTarget.hp = 0;
            playerTarget.isAttacking = false;
            playerTarget.attackTimer = 0;
            playerTarget.attackCooldown = 0;
            playerTarget.hitEnemies.clear();
            playerTarget.energy = 0;
            playerTarget.vx = 0;
            playerTarget.vy = 0;

            const alivePlayers = this.players.filter(player => !player.isGhost && !player.isDead);
            if (this.playerCount === 1 || alivePlayers.length === 0) {
                this.triggerGameOver();
            }
        }
    }

    triggerBossDeathExplosion(boss) {
        if (boss.deathExplosionTriggered) return;
        boss.deathExplosionTriggered = true;

        const config = this.bossExplosionConfig;
        this.explosions.push(new ExplosionEffect(boss.x, boss.y, config.radius, boss.color));
        this.screenShake = Math.max(this.screenShake, config.screenShake);
        sound.playBossSlam();
        this.vibrate(70);

        for (let i = 0; i < config.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 10;
            this.particles.push(new Particle(
                boss.x,
                boss.y - 12,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                i % 4 === 0 ? '#ffffff' : boss.color,
                3 + Math.random() * 4,
                24 + Math.floor(Math.random() * 20)
            ));
        }

        const affectedPlayers = this.players
            .map(player => ({ player, distance: Math.hypot(player.x - boss.x, player.y - boss.y) }))
            .filter(({ distance }) => distance < config.radius);
        if (affectedPlayers.length === 0) return;

        const closest = affectedPlayers.reduce((nearest, current) =>
            current.distance < nearest.distance ? current : nearest
        );
        affectedPlayers.forEach(({ player, distance }) => {
            const falloff = 1 - distance / config.radius;
            const directionX = player.x - boss.x;
            const directionY = player.y - boss.y;
            const directionLength = Math.hypot(directionX, directionY) || 1;
            player.knockbackVx = (directionX / directionLength) * config.knockback * falloff;
            player.vy = Math.min(player.vy, -config.knockback * 0.3 * falloff);
        });
        const damage = config.minDamage +
            (config.maxDamage - config.minDamage) * (1 - closest.distance / config.radius);
        this.damagePlayer(damage, closest.player);
        this.screenShake = Math.max(this.screenShake, config.screenShake);
        const directionX = closest.player.x - boss.x;
        const directionY = closest.player.y - boss.y;
        const directionLength = Math.hypot(directionX, directionY) || 1;
        const falloff = 1 - closest.distance / config.radius;
        closest.player.knockbackVx = (directionX / directionLength) *
            config.knockback * falloff;
        closest.player.vy = Math.min(closest.player.vy, -config.knockback * 0.3 * falloff);
    }

    /**
     * REGLA OBLIGATORIA DE CURACIÓN: Límite máximo estricto de 100 HP
     */
    healPlayer(amount, x, y, target = this.player) {
        const playerTarget = target || this.player;
        if (!playerTarget || playerTarget.hp >= playerTarget.maxHp) return;

        const actualHeal = Math.min(amount, playerTarget.maxHp - playerTarget.hp);
        playerTarget.hp = Math.min(playerTarget.maxHp, playerTarget.hp + actualHeal);
        sound.playHeal();
        this.floatingTexts.push(new FloatingText(x, y - 42, `+${actualHeal} ❤️`, '#00ff88', 22));
        this.updateHUD();
    }

    /**
     * REGLA OBLIGATORIA DE MONEDAS: Acumulación y persistencia
     */
    addCoins(amount, x, y, player = this.players[0]) {
        const playerIndex = Math.max(0, this.players.indexOf(player));
        this.playerProgress[playerIndex].coins += amount;
        sound.playCoin();
        this.floatingTexts.push(new FloatingText(
            x, y - 22, `P${playerIndex + 1} +${amount} 🪙`, '#ffcc00', 20
        ));
        this.saveProgress();
    }

    damageEnemyWithWeapon(player, enemy, weapon, damage, hitTargets = player.hitEnemies, attackType = player.attackType) {
        if (enemy.isDead || hitTargets.has(enemy)) return;
        hitTargets.add(enemy);
        const appliedDamage = enemy.type === 'boss'
            ? damage * (BOSS_WEAPON_DAMAGE_MULTIPLIERS[weapon.id] || 1)
            : damage;
        enemy.hp -= appliedDamage;
        player.energy = Math.min(100, player.energy + 10);
        this.updateHUD();
        this.combo++;
        this.comboTimer = 90;
        if (this.combo === 8) this.syncMusicWithGameState();
        sound.playHit();
        player.triggerCombatFlash();
        this.floatingTexts.push(new FloatingText(
            enemy.x,
            enemy.y - 30,
            Math.round(appliedDamage).toString(),
            attackType === 'special' ? '#ffffff' : weapon.color,
            attackType === 'special' ? 26 : 20
        ));

        for (let index = 0; index < 7; index++) {
            this.particles.push(new Particle(
                enemy.x, enemy.y - 15,
                (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8,
                weapon.color, 3.5, 22
            ));
        }

        if (weapon.kind === 'whip' && enemy.type !== 'boss') {
            enemy.knockbackVx = (player.facingRight ? 1 : -1) * 5;
        }

        if (enemy.hp > 0 || enemy.isDead) return;
        enemy.isDead = true;
        this.totalKills++;
        for (let index = 0; index < 18; index++) {
            this.particles.push(new Particle(
                enemy.x, enemy.y - 20,
                (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12,
                enemy.color, 4, 35
            ));
        }

        if (enemy.type === 'boss') {
            this.totalBosses++;
            this.addCoins(100, enemy.x, enemy.y, player);
            this.healPlayer(50, player.x, player.y, player);
            this.triggerBossDeathExplosion(enemy);
        } else {
            this.addCoins(10, enemy.x, enemy.y, player);
            this.healPlayer(40, player.x, player.y, player);
        }
        if (player.effects.enabled && player.effects.defeatEnergy) {
            player.emitEffectBurst('defeat', Math.round(14 * player.effectDensity()));
        }
        this.saveProgress();
    }

    /**
     * Resuelve ataques cuerpo a cuerpo, armas de proyectil y daño de área.
     */
    checkCombatCollisions() {
        this.players.forEach(player => {
            if (player.isGhost || player.isDead || !player.isAttacking) return;
            const weapon = player.attackWeapon || player.weapon || WEAPONS.whip;
            const multiplier = player.attackType === 'heavy' ? 1.35 :
                (player.attackType === 'special' ? 2 : 1);
            const damage = weapon.damage * multiplier;
            const active = player.attackElapsed >= weapon.windup &&
                player.attackElapsed < weapon.windup + weapon.activeFrames;

            if (weapon.kind === 'projectile') {
                if (!player.attackImpactResolved && player.attackElapsed >= weapon.windup) {
                    const direction = player.facingRight ? 1 : -1;
                    const projectile = new Projectile(
                        player.x + direction * 24,
                        player.y - 12,
                        direction * weapon.projectileSpeed,
                        0,
                        weapon.color,
                        false,
                        damage
                    );
                    projectile.owner = player;
                    projectile.weapon = weapon;
                    projectile.attackType = player.attackType;
                    projectile.radius = weapon.impactRadius;
                    projectile.rangeRemaining = weapon.reach;
                    this.projectiles.push(projectile);
                    player.attackImpactResolved = true;
                }
                return;
            }

            if (weapon.kind === 'aoe') {
                if (!player.attackImpactResolved && player.attackElapsed >= weapon.windup) {
                    player.attackImpactResolved = true;
                    const floorY = this.getFloorY();
                    const centerX = player.x + (player.facingRight ? 1 : -1) * 18;
                    this.explosions.push(new ExplosionEffect(centerX, floorY, weapon.impactRadius, weapon.color));
                    this.screenShake = Math.max(this.screenShake, 9);
                    for (let index = 0; index < 22; index++) {
                        this.particles.push(new Particle(
                            centerX, floorY - 2,
                            (Math.random() - 0.5) * 12, -Math.random() * 7,
                            weapon.color, 3 + Math.random() * 2, 22
                        ));
                    }
                    this.enemies.forEach(enemy => {
                        const distanceX = Math.abs(enemy.x - centerX);
                        const distanceY = Math.abs(enemy.y + enemy.feetOffset - floorY);
                        if (distanceX <= weapon.impactRadius + enemy.width / 2 &&
                            distanceY <= enemy.feetOffset + 42) {
                            this.damageEnemyWithWeapon(player, enemy, weapon, damage);
                        }
                    });
                }
                return;
            }

            if (!active) return;
            this.enemies.forEach(enemy => {
                if (enemy.isDead || player.hitEnemies.has(enemy)) return;
                const dx = enemy.x - player.x;
                const inDirection = player.facingRight ? dx > 0 : dx < 0;
                const reach = weapon.reach + enemy.width / 2;
                const verticalReach = enemy.height / 2 + weapon.impactRadius;
                if (inDirection && Math.abs(dx) <= reach &&
                    Math.abs(enemy.y - player.y) <= verticalReach) {
                    this.damageEnemyWithWeapon(player, enemy, weapon, damage);
                }
            });
        });

        const floorY = this.getFloorY();
        for (let index = this.projectiles.length - 1; index >= 0; index--) {
            const projectile = this.projectiles[index];
            projectile.update(this.width, floorY);
            if (!projectile.active) {
                this.projectiles.splice(index, 1);
                continue;
            }

            let blockedByPlatform = false;
            for (const platform of this.platforms || []) {
                const nearestX = Math.max(platform.x, Math.min(projectile.x, platform.x + platform.w));
                const nearestY = Math.max(platform.y, Math.min(projectile.y, platform.y + platform.h));
                if (Math.hypot(projectile.x - nearestX, projectile.y - nearestY) <= projectile.radius) {
                    blockedByPlatform = true;
                    for (let particle = 0; particle < 6; particle++) {
                        this.particles.push(new Particle(
                            projectile.x, projectile.y,
                            (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4,
                            projectile.color, 3, 14
                        ));
                    }
                    break;
                }
            }
            if (blockedByPlatform) {
                this.projectiles.splice(index, 1);
                continue;
            }

            if (!projectile.isHostile) {
                const target = this.enemies.find(enemy => {
                    if (enemy.isDead) return false;
                    const hitX = Math.max(0, Math.abs(projectile.x - enemy.x) - enemy.width / 2);
                    const hitY = Math.max(0, Math.abs(projectile.y - (enemy.y - 8)) - enemy.height / 2);
                    return Math.hypot(hitX, hitY) <= projectile.radius;
                });
                if (target) {
                    this.damageEnemyWithWeapon(
                        projectile.owner,
                        target,
                        projectile.weapon || WEAPONS.blaster,
                        projectile.damage,
                        projectile.hitTargets,
                        projectile.attackType
                    );
                    for (let particle = 0; particle < 12; particle++) {
                        this.particles.push(new Particle(
                            projectile.x, projectile.y,
                            (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8,
                            projectile.color, 3.5, 20
                        ));
                    }
                    this.projectiles.splice(index, 1);
                }
                continue;
            }

            const livingPlayers = this.players.filter(player => !player.isGhost && !player.isDead);
            if (livingPlayers.length === 0) {
                this.projectiles.splice(index, 1);
                continue;
            }
            const target = livingPlayers.reduce((nearest, player) =>
                Math.hypot(projectile.x - player.x, projectile.y - player.y) <
                Math.hypot(projectile.x - nearest.x, projectile.y - nearest.y) ? player : nearest
            );
            const hitX = Math.max(0, Math.abs(projectile.x - target.x) - target.width / 2);
            const hitY = Math.max(0, Math.abs(projectile.y - (target.y + 3)) - target.height / 2);
            if (Math.hypot(hitX, hitY) <= projectile.radius + (projectile.isFalling ? 8 : 4)) {
                this.damagePlayer(projectile.damage, target);
                for (let particle = 0; particle < 12; particle++) {
                    this.particles.push(new Particle(
                        projectile.x, projectile.y,
                        (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8,
                        projectile.color, 3.5, 20
                    ));
                }
                this.projectiles.splice(index, 1);
            }
        }
    }

    /**
     * Actualización de la barra de estado (HUD)
     */
    updateHUD() {
        this.player = this.getActivePlayer() || this.player || this.players[0] || null;
        if (!this.player) return;

        const updateHealthBar = (barId, textId, player, label = 'P1') => {
            const bar = document.getElementById(barId);
            const text = document.getElementById(textId);
            if (!bar || !text || !player) return;

            const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
            bar.style.width = `${hpPercent}%`;

            if (hpPercent >= 60) {
                bar.style.background = 'linear-gradient(90deg, #00ff88, #00f3ff)';
                bar.style.boxShadow = '0 0 12px rgba(0, 243, 255, 0.6)';
            } else if (hpPercent >= 30) {
                bar.style.background = 'linear-gradient(90deg, #ffcc00, #ff8800)';
                bar.style.boxShadow = '0 0 12px rgba(255, 204, 0, 0.6)';
            } else {
                bar.style.background = 'linear-gradient(90deg, #ff0055, #ff0000)';
                bar.style.boxShadow = '0 0 15px rgba(255, 0, 85, 0.9)';
            }

            text.innerText = `❤️ ${label}: ${Math.round(player.hp)} / ${Math.round(player.maxHp)}`;
        };

        updateHealthBar('hp-bar', 'hp-text', this.player, 'P1');
        const p1WeaponSelect = document.getElementById('p1-weapon-select');
        if (p1WeaponSelect && this.players[0]?.weapon) {
            const p1Weapons = this.playerProgress[0].purchasedWeapons;
            if (p1WeaponSelect.options.length !== p1Weapons.length ||
                [...p1WeaponSelect.options].some((option, index) => option.value !== p1Weapons[index])) {
                p1WeaponSelect.replaceChildren(...p1Weapons.map(id =>
                    new Option(WEAPONS[id].name, id)
                ));
            }
            p1WeaponSelect.value = this.players[0].weapon.id;
        }

        const p2 = this.players[1];
        const p2Section = document.querySelector('.p2-health-section');
        const p2WeaponSection = document.getElementById('p2-weapon-section');
        if (p2Section) {
            p2Section.classList.toggle('hidden', !p2);
        }
        if (p2WeaponSection) {
            p2WeaponSection.classList.toggle('hidden', !p2);
        }
        const p2Coins = document.getElementById('hud-p2-coins');
        if (p2Coins) p2Coins.classList.toggle('hidden', !p2);
        if (p2) {
            updateHealthBar('p2-hp-bar', 'p2-hp-text', p2, 'P2');
            const p2WeaponSelect = document.getElementById('p2-weapon-select');
            if (p2WeaponSelect && p2.weapon) {
                const p2Weapons = this.playerProgress[1].purchasedWeapons;
                if (p2WeaponSelect.options.length !== p2Weapons.length ||
                    [...p2WeaponSelect.options].some((option, index) => option.value !== p2Weapons[index])) {
                    p2WeaponSelect.replaceChildren(...p2Weapons.map(id =>
                        new Option(WEAPONS[id].name, id)
                    ));
                }
                p2WeaponSelect.value = p2.weapon.id;
            }
        }

        // Barra de energía
        const energyBar = document.getElementById('energy-bar');
        energyBar.style.width = `${this.player.energy}%`;
        const energyText = document.getElementById('energy-text');

        if (this.player.energy >= 100) {
            energyBar.classList.add('energy-full');
            energyText.innerText = '⚡ [L] ESPECIAL LISTO!';
        } else {
            energyBar.classList.remove('energy-full');
            energyText.innerText = `⚡ ENERGÍA: ${Math.round(this.player.energy)} / 100`;
        }

        // Monedas, Zona y Oleadas
        document.getElementById('hud-coins').innerText = `P1 🪙 ${this.playerProgress[0].coins}`;
        if (p2Coins) p2Coins.innerText = `P2 🪙 ${this.playerProgress[1].coins}`;
        const currentZoneTitle = ZONE_SCENES[this.currentZone - 1]?.name || `ZONA ${this.currentZone}`;
        document.getElementById('hud-zone').innerText = `ZONA ${this.currentZone}: ${currentZoneTitle}`;
        document.getElementById('hud-wave').innerText = this.bossActive 
            ? '⚠ COMBATE DE JEFE' 
            : `OLEADA ${this.currentWave} / ${this.maxWaves}`;

        // Contador de Combo
        const comboEl = document.getElementById('combo-display');
        if (this.combo > 1) {
            comboEl.classList.add('combo-active');
            comboEl.innerText = `COMBO x${this.combo}`;
        } else {
            comboEl.classList.remove('combo-active');
        }

        // Botón especial en controles táctiles (brillo pulsante al estar listo)
        const specialBtn = document.getElementById('btn-touch-special');
        if (specialBtn) {
            if (this.player.energy >= 100) {
                specialBtn.classList.add('energy-ready');
            } else {
                specialBtn.classList.remove('energy-ready');
            }
        }

        // Botón de sonido adaptado a iconos en móvil
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            const isCompact = window.innerWidth <= 768;
            soundBtn.innerText = isCompact ? (sound.enabled ? '🔊' : '🔇') : `🔊 SONIDO: ${sound.enabled ? 'ON' : 'OFF'}`;
        }

        // Botón de pantalla completa en HUD
        const fsBtn = document.getElementById('btn-fullscreen-hud');
        if (fsBtn) {
            fsBtn.innerText = (document.fullscreenElement || document.webkitFullscreenElement) ? '🗗' : '⛶';
        }
    }

    /**
     * Pantalla de Fin de Juego (Game Over)
     */
    triggerGameOver() {
        this.state = 'GAMEOVER';
        musicManager.stop();
        document.getElementById('hud').classList.add('hidden');

        const stats = document.getElementById('gameover-stats');
        stats.innerHTML = `
            <div class="result-stats-card">
                <p>Oleada Alcanzada: <strong>${this.currentWave} / ${this.maxWaves}</strong> (Zona ${this.currentZone})</p>
                <p>Monedas: <strong style="color: #ffcc00;">P1 ${this.playerProgress[0].coins} / P2 ${this.playerProgress[1].coins} 🪙</strong></p>
                <p>Enemigos Eliminados: <strong>${this.totalKills}</strong></p>
            </div>
        `;
        this.showOverlay('gameover-overlay');
    }

    /**
     * Pantalla de Victoria Absoluta
     */
    triggerVictory() {
        this.state = 'VICTORY';
        musicManager.stop();
        document.getElementById('hud').classList.add('hidden');

        const stats = document.getElementById('victory-stats');
        stats.innerHTML = `
            <div class="result-stats-card" style="border-color: #00ff88;">
                <p style="color: #00ff88; font-size: 1.3rem;">¡Has conquistado las 11 Zonas y derrotado a todos los Jefes!</p>
                <p>Monedas finales: <strong style="color: #ffcc00;">P1 ${this.playerProgress[0].coins} / P2 ${this.playerProgress[1].coins} 🪙</strong></p>
                <p>Jefes Derrotados: <strong>${this.totalBosses} / 11 👑</strong></p>
            </div>
        `;
        this.showOverlay('victory-overlay');
    }

    /**
     * Ciclo de actualización lógica (Update)
     */
    update(deltaTime = 1) {
        this.input.pollGamepads();
        if (this.particles.length > 360) this.particles.splice(0, this.particles.length - 360);
        if (this.state !== 'PLAYING') {
            if (this.state === 'GAMEOVER' || this.state === 'VICTORY' || this.state === 'MENU') {
                for (let i = this.explosions.length - 1; i >= 0; i--) {
                    this.explosions[i].update();
                    if (this.explosions[i].life <= 0) this.explosions.splice(i, 1);
                }
            }
            return;
        }

        const floorY = this.getFloorY();
        this.gameTime++;

        if (this.teamInvulnerableTimer > 0) this.teamInvulnerableTimer--;

        // Cada jugador consume únicamente las acciones asignadas a su entrada
        this.players.forEach((player, index) => {
            const playerId = index === 0 ? 'p1' : 'p2';
            const weaponChanges = this.input.consumeWeaponChanges(playerId);
            for (let change = 0; change < weaponChanges; change++) {
                this.cyclePlayerWeapon(index);
            }
            if (player.isGhost || player.isDead) {
                player.update({ moveLeft: false, moveRight: false, jump: false, crouch: false }, this.platforms, floorY, this.width, deltaTime);
                this.input.consumeAttacks(playerId);
                return;
            }
            player.update(this.input.getActions(playerId), this.platforms, floorY, this.width, deltaTime);
            this.input.consumeAttacks(playerId).forEach(type => {
                if (player.attack(type) && type === 'special') {
                    sound.playSpecial();
                }
            });
        });

        // Actualizar enemigos
        let allDead = true;
        this.enemies.forEach(e => {
            const livingPlayers = this.players.filter(player => !player.isGhost && !player.isDead);
            const target = livingPlayers.length > 0
                ? livingPlayers.reduce((nearest, player) =>
                    Math.hypot(player.x - e.x, player.y - e.y) <
                    Math.hypot(nearest.x - e.x, nearest.y - e.y) ? player : nearest
                )
                : { x: this.width / 2, y: floorY - 30 };
            e.update(
                target,
                this.projectiles,
                floorY,
                this.width,
                (dmg) => { this.damagePlayer(dmg, target); },
                this.platforms,
                this.particles,
                (shake) => { this.screenShake = shake; },
                deltaTime
            );
            if (!e.isDead) allDead = false;
        });

        // Comprobación de final de oleada
        if (allDead && this.enemies.length > 0) {
            if (this.bossActive) {
                if (this.currentZone < ZONE_SCENES.length) {
                    this.bossActive = false;
                    this.setZone(this.currentZone + 1);
                    this.currentWave = 1;
                    this.revivePlayersForNextZone();
                    this.startWave();
                } else {
                    this.triggerVictory();
                }
            } else {
                this.currentWave++;
                this.startWave();
            }
        }

        this.checkCombatCollisions();
        if (this.particles.length > 360) this.particles.splice(0, this.particles.length - 360);

        // Decaimiento del contador de combo
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.combo = 0;
                this.updateHUD();
                this.syncMusicWithGameState();
            }
        }

        // Actualización de partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update();
            if (this.explosions[i].life <= 0) this.explosions.splice(i, 1);
        }

        // Actualización de textos flotantes
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            this.floatingTexts[i].update();
            if (this.floatingTexts[i].life <= 0) this.floatingTexts.splice(i, 1);
        }

        if (this.screenShake > 0) this.screenShake--;
        if (this.damageFlash > 0) this.damageFlash--;
    }

    /**
     * Renderizado gráfico completo (Canvas Draw)
     */
    draw() {
        this.ctx.save();

        // Efecto de vibración de pantalla (Screen Shake)
        if (this.screenShake > 0 && this.state === 'PLAYING') {
            const rx = (Math.random() - 0.5) * this.screenShake;
            const ry = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(rx, ry);
        }

        const scene = ZONE_SCENES[this.currentZone - 1] || ZONE_SCENES[0];
        const background = this.activeBackground;
        if (background && background.complete && background.naturalWidth > 0) {
            this.ctx.drawImage(background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, scene.colors[0]);
            grad.addColorStop(1, scene.colors[1]);
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Cuadrícula cyberpunk animada en el suelo
        const floorY = this.getFloorY();
        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += 45) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, floorY);
            this.ctx.stroke();
        }

        // Línea Neón del Piso (Específica por Zona)
        const currentFloorColor = scene.accent;
        this.ctx.strokeStyle = currentFloorColor;
        this.ctx.shadowColor = currentFloorColor;
        this.ctx.shadowBlur = 18;
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, floorY);
        this.ctx.lineTo(this.width, floorY);
        this.ctx.stroke();

        // Renderizado de plataformas flotantes con color temático de zona
        const currentPlatColor = scene.accent;
        this.ctx.strokeStyle = currentPlatColor;
        this.ctx.shadowColor = currentPlatColor;
        this.ctx.shadowBlur = 14;
        this.ctx.lineWidth = 2.5;
        this.platforms.forEach(p => {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            this.ctx.fillRect(p.x, p.y, p.w, p.h);
            this.ctx.strokeRect(p.x, p.y, p.w, p.h);
        });

        // Renderizado de entidades durante la partida
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.players.forEach(player => player.draw(this.ctx));
            this.enemies.forEach(e => e.draw(this.ctx));
            this.projectiles.forEach(pr => pr.draw(this.ctx));
            this.particles.forEach(pt => pt.draw(this.ctx));
            this.floatingTexts.forEach(ft => ft.draw(this.ctx));
        } else if (this.state === 'MENU') {
            // Partículas flotantes de ambiente para el Menú
            if (Math.random() < 0.25) {
                this.particles.push(new Particle(
                    Math.random() * this.width, this.height + 10,
                    (Math.random() - 0.5) * 1.5, -Math.random() * 2.5,
                    '#00f3ff', 2.5, 90
                ));
            }
            this.particles.forEach(pt => { pt.update(); pt.draw(this.ctx); });
        }

        this.explosions.forEach(explosion => explosion.draw(this.ctx));

        // Flash de daño rojo al recibir golpe
        if (this.damageFlash > 0) {
            this.ctx.fillStyle = 'rgba(255, 0, 85, 0.22)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        if (!document.getElementById('customization-overlay').classList.contains('hidden')) {
            this.renderCustomizationPreview();
        }

        this.ctx.restore();
    }

    drawZoneLandmark(scene, floorY) {
        const ctx = this.ctx;
        const scale = Math.max(0.38, Math.min(1.2, this.width / 1200, this.height / 720));
        const centerX = this.width / 2;
        const baseY = floorY - 8;
        const accent = scene.accent;
        const glow = (color = accent) => {
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 18;
            ctx.lineWidth = Math.max(2, 3 * scale);
        };
        const line = (x1, y1, x2, y2) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        };
        const polygon = points => {
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
            ctx.closePath();
            ctx.stroke();
        };

        ctx.save();
        ctx.translate(centerX, baseY);
        ctx.scale(scale, scale);
        glow();

        switch (this.currentZone) {
            case 1: {
                // Torre de Tokio y pasos peatonales de Shibuya.
                const top = -300;
                polygon([[-112, 0], [-18, top], [18, top], [112, 0]]);
                [-210, -145, -78].forEach(y => {
                    const halfWidth = ((-y) / -top) * 18 + 8;
                    line(-halfWidth, y, halfWidth, y);
                });
                line(-82, -78, 82, -210);
                line(82, -78, -82, -210);
                for (let x = -300; x <= 300; x += 82) {
                    ctx.globalAlpha = 0.65;
                    ctx.fillRect(x, -8, 38, 4);
                }
                break;
            }
            case 2: {
                // Torre Eiffel junto al contorno del Arco del Triunfo.
                polygon([[-120, 0], [-74, -92], [-42, -188], [-15, -278], [15, -278], [42, -188], [74, -92], [120, 0]]);
                line(-82, -92, 82, -92);
                line(-48, -188, 48, -188);
                line(-108, -42, 108, -42);
                line(-75, -92, 48, -188);
                line(75, -92, -48, -188);
                ctx.beginPath();
                ctx.arc(220, -34, 54, Math.PI, 0);
                line(166, -34, 274, -34);
                line(185, -34, 185, 0);
                line(255, -34, 255, 0);
                break;
            }
            case 3: {
                // Rascacielos y grandes pantallas de Times Square.
                const buildings = [
                    [-310, -230, 90, 230], [-205, -300, 108, 300],
                    [-75, -205, 104, 205], [55, -270, 110, 270],
                    [190, -220, 96, 220]
                ];
                buildings.forEach(([x, y, width, height], index) => {
                    ctx.strokeRect(x, y, width, height);
                    ctx.globalAlpha = 0.22;
                    ctx.fillRect(x + 8, y + 20, width - 16, Math.min(72, height / 3));
                    ctx.globalAlpha = 1;
                    if (index % 2 === 0) line(x + 18, y + 86, x + width - 18, y + 86);
                });
                break;
            }
            case 4: {
                // Big Ben y rueda del London Eye.
                ctx.strokeRect(-205, -258, 92, 258);
                polygon([[-218, -258], [-159, -310], [-100, -258]]);
                ctx.beginPath();
                ctx.arc(-159, -202, 24, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(170, -120, 108, 0, Math.PI * 2);
                ctx.stroke();
                line(170, -228, 170, -12);
                line(62, -120, 278, -120);
                line(94, -196, 246, -44);
                line(94, -44, 246, -196);
                break;
            }
            case 5: {
                // Puerta de Brandeburgo con columnas y cuadriga.
                ctx.strokeRect(-170, -170, 340, 170);
                ctx.strokeRect(-190, -188, 380, 18);
                for (let x = -130; x <= 130; x += 52) {
                    ctx.strokeRect(x - 12, -170, 24, 170);
                }
                ctx.strokeRect(-206, -16, 412, 16);
                ctx.beginPath();
                ctx.arc(0, -208, 16, Math.PI, 0);
                ctx.stroke();
                line(-34, -208, 34, -208);
                break;
            }
            case 6: {
                // Torre N Seoul elevada sobre una colina digital.
                polygon([[-240, 0], [-170, -36], [-105, -27], [-35, -66], [40, -52], [112, -88], [190, -55], [250, 0]]);
                line(0, -70, 0, -270);
                ctx.strokeRect(-42, -198, 84, 28);
                ctx.strokeRect(-28, -236, 56, 24);
                polygon([[-16, -236], [-10, -270], [10, -270], [16, -236]]);
                break;
            }
            case 7: {
                // Columna del Ángel con una figura alada estilizada.
                ctx.strokeRect(-32, -216, 64, 216);
                ctx.strokeRect(-52, -226, 104, 14);
                ctx.strokeRect(-72, -12, 144, 12);
                line(0, -226, 0, -272);
                ctx.beginPath();
                ctx.arc(0, -288, 10, 0, Math.PI * 2);
                ctx.stroke();
                polygon([[-5, -278], [-72, -306], [-42, -264], [0, -246], [42, -264], [72, -306], [5, -278]]);
                break;
            }
            case 8: {
                // Pirámides de Guiza con retícula de energía.
                polygon([[-300, 0], [-188, -176], [-76, 0]]);
                polygon([[-84, 0], [74, -236], [232, 0]]);
                polygon([[194, 0], [282, -128], [370, 0]]);
                for (let y = -32; y > -220; y -= 38) {
                    const spread = (Math.abs(y) / 236) * 158;
                    line(74 - spread, y, 74 + spread, y);
                }
                line(-188, -176, -76, 0);
                line(-188, -176, -300, 0);
                break;
            }
            default:
                break;
        }

        ctx.restore();
    }

    /**
     * Bucle de animación continuo (Game Loop)
     */
    loop() {
        if (this.loopRunning) return;
        this.loopRunning = true;
        this.lastFrameTimestamp = null;
        this.accumulator = 0;
        this.animationFrameId = requestAnimationFrame(timestamp => this.runFrame(timestamp));
    }

    runFrame(timestamp) {
        if (!this.loopRunning) return;

        if (this.lastFrameTimestamp === null) {
            this.lastFrameTimestamp = timestamp;
        }
        const elapsed = Math.min(timestamp - this.lastFrameTimestamp, this.maxFrameDeltaMs);
        this.lastFrameTimestamp = timestamp;
        this.accumulator = Math.min(
            this.accumulator + elapsed,
            this.fixedStepMs * this.maxUpdatesPerFrame
        );

        let updates = 0;
        while (this.accumulator + 1e-7 >= this.fixedStepMs && updates < this.maxUpdatesPerFrame) {
            this.update(this.fixedStepMs / (1000 / 60));
            this.accumulator = Math.max(0, this.accumulator - this.fixedStepMs);
            updates++;
        }

        if (updates > 0) this.draw();
        this.animationFrameId = requestAnimationFrame(nextTimestamp => this.runFrame(nextTimestamp));
    }
}

// Inicialización automática tras cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game;
    window.setZone = zoneNumber => game.setZone(zoneNumber);
    game.loop();
});
