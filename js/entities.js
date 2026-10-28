/**
 * ==========================================================================
 * NEON STICK: CYBER ARENA - ENTIDADES, JUGADOR, ENEMIGOS Y ARMAS
 * ==========================================================================
 */

const GAME_UNIT_SPEED = 5.0;
const PLAYER_DASH_SPEED = 25;
const PLAYER_DASH_DURATION = 15;
const PLAYER_SPECIAL_CHARGE_FRAMES = 8;
const PLAYER_SPECIAL_ANIMATION_FRAMES = 24;
const PLAYER_SPECIAL_COOLDOWN_FRAMES = 48;
const DEFAULT_PLAYER_UPGRADES = Object.freeze({
    hpLevel: 0,
    energyLevel: 0,
    coinComboLevel: 0
});

// El arsenal original conserva sus IDs y estadísticas; la expansión usa IDs propios.
const WEAPONS = {
    dagger: {
        id: 'dagger', name: 'DAGGER NEON', price: 750,
        reachMult: 0.75, speed: 1.45,
        kind: 'melee', damage: 25, reach: 44 * 0.75,
        cooldown: Math.round(22 / 1.45), windup: 4, activeFrames: 8, recovery: 4,
        impactRadius: 52 * 0.75, color: '#00ffcc',
        elementalEffect: 'virus',
        effectLabel: 'Virus Neón',
        desc: 'Súper rápida, bajo consumo y velocidad de ráfaga.'
    },
    sword: {
        id: 'sword', name: 'NEON SWORD', price: 1500,
        reachMult: 1.35, speed: 1.0,
        kind: 'melee', damage: 44, reach: 44 * 1.35,
        cooldown: Math.round(22 / 1.0), windup: 5, activeFrames: 10, recovery: 5,
        impactRadius: 52 * 1.35, color: '#00f3ff',
        elementalEffect: 'plasma',
        effectLabel: 'Quemadura de Plasma',
        desc: 'Daño equilibrado, buen alcance y hoja de plasma.'
    },
    plasma: {
        id: 'plasma', name: 'PLASMA BLADE', price: 3000,
        reachMult: 1.6, speed: 1.1,
        kind: 'melee', damage: 70, reach: 44 * 1.6,
        cooldown: Math.round(22 / 1.1), windup: 5, activeFrames: 9, recovery: 4,
        impactRadius: 52 * 1.6, color: '#ff00aa',
        elementalEffect: 'plasmaDevastating',
        effectLabel: 'Plasma Incandescente + Armadura -15%',
        desc: 'Daño devastador con ráfagas y estela de partículas.'
    },
    hammer: {
        id: 'hammer', name: 'VOID HAMMER', price: 5000,
        reachMult: 1.85, speed: 0.65,
        kind: 'melee', damage: 92, reach: 44 * 1.85,
        cooldown: Math.round(22 / 0.65), windup: 9, activeFrames: 11, recovery: 14,
        impactRadius: 52 * 1.85, color: '#b000ff',
        elementalEffect: 'shock',
        effectLabel: 'Aturdimiento y Onda Expansiva',
        desc: 'Poder cósmico destructor y onda expansiva colosal.'
    },
    whip: {
        id: 'whip', name: 'LÁTIGO DE NEÓN', price: 1800, damage: 39,
        reach: 132, reachMult: 2.2, speed: 0.9, cooldown: 34, windup: 6,
        activeFrames: 10, recovery: 8, kind: 'whip', expansion: true, color: '#00ffcc',
        elementalEffect: 'electric',
        effectLabel: 'Electrochoque en Cadena',
        impactRadius: 42,
        desc: 'Barrido de arco de largo alcance; golpea a varios enemigos.'
    },
    blaster: {
        id: 'blaster', name: 'BLÁSTER DE ENERGÍA', price: 2600, damage: 33,
        reach: 560, reachMult: 2.4, speed: 1.0, cooldown: 28, windup: 5,
        activeFrames: 1, recovery: 6, projectileSpeed: 10, impactRadius: 13,
        kind: 'projectile', expansion: true, color: '#37e7ff',
        elementalEffect: 'cryo',
        effectLabel: 'Ralentización y Congelación Crio',
        desc: 'Dispara proyectiles de energía con alcance largo.'
    },
    cyberDaggers: {
        id: 'cyberDaggers', name: 'DAGAS CIBERNÉTICAS', price: 1200, damage: 28,
        reach: 48, reachMult: 0.8, speed: 1.9, cooldown: 12, windup: 1,
        activeFrames: 5, recovery: 4, impactRadius: 24, kind: 'melee', expansion: true, color: '#a7ffec',
        elementalEffect: 'cyberBleed',
        effectLabel: 'Desangrado Cibernético (3 cargas)',
        desc: 'Golpes cuerpo a cuerpo veloces con alcance corto.'
    },
    seismicHammer: {
        id: 'seismicHammer', name: 'MARTILLO SÍSMICO', price: 6200, damage: 100,
        reach: 142, reachMult: 1.5, speed: 0.62, cooldown: 68, windup: 18,
        activeFrames: 1, recovery: 24, impactRadius: 142, kind: 'aoe', expansion: true,
        color: '#c58cff',
        elementalEffect: 'seismic',
        effectLabel: 'Choque Sísmico y Derribo',
        desc: 'Golpe pesado telegrafiado con onda sísmica de área.'
    }
};

function normalizeWeaponId(weaponId) {
    const migratedId = weaponId === 'daggers' ? 'cyberDaggers' : weaponId;
    return WEAPONS[migratedId] ? migratedId : 'sword';
}

const DEFAULT_PLAYER_EFFECTS = {
    enabled: true,
    auraStyle: 'orbit',
    runTrail: true,
    dashTrail: true,
    jumpLand: true,
    combatFlash: true,
    defeatEnergy: true,
    color: '#00f3ff',
    intensity: 70,
    density: 55,
    reduced: false
};

const ELEMENTAL_ATTACKS = {
    fire: {
        name: 'Fuego',
        color: '#ff8a1d',
        accent: '#ffd166',
        projectileColor: '#ff5a36',
        particleColor: '#ffbe0b',
        damage: 12,
        speed: 6.4,
        range: 320,
        cooldown: 90,
        duration: 26,
        radius: 52,
        telegraph: 22,
        blastRadius: 48
    },
    air: {
        name: 'Aire',
        color: '#7fe7ff',
        accent: '#dffaff',
        projectileColor: '#c9f6ff',
        particleColor: '#7dd3fc',
        damage: 10,
        speed: 7.1,
        range: 360,
        cooldown: 100,
        duration: 34,
        radius: 60,
        telegraph: 20,
        blastRadius: 42
    },
    earth: {
        name: 'Tierra',
        color: '#d4a373',
        accent: '#f9d59c',
        projectileColor: '#b08968',
        particleColor: '#e9c46a',
        damage: 14,
        speed: 5.6,
        range: 300,
        cooldown: 110,
        duration: 28,
        radius: 72,
        telegraph: 24,
        blastRadius: 60
    },
    water: {
        name: 'Agua',
        color: '#47c3ff',
        accent: '#b6f3ff',
        projectileColor: '#4ecdc4',
        particleColor: '#7be0ff',
        damage: 11,
        speed: 6.1,
        range: 340,
        cooldown: 95,
        duration: 30,
        radius: 64,
        telegraph: 23,
        blastRadius: 52
    }
};

const MAX_COSMETIC_PARTICLES = 72;

function addBoundedParticle(particles, particle, limit = 360) {
    if (particles.length >= limit) particles.splice(0, particles.length - limit + 1);
    particles.push(particle);
}

/**
 * Clase Partícula para efectos visuales neón
 */
class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxLife = life;
        this.life = life;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.life--;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        const progress = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = progress;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * progress, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ExplosionEffect {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.life = 32;
        this.maxLife = 32;
    }

    update() {
        this.life--;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        const progress = 1 - this.life / this.maxLife;
        const alpha = this.life / this.maxLife;
        const radius = Math.max(1, progress * this.radius);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 8 * alpha + 2;
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 28;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.45;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 0.68, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class ShockwaveEffect extends ExplosionEffect {
    draw(ctx) {
        if (this.life <= 0) return;
        const progress = 1 - this.life / this.maxLife;
        const alpha = this.life / this.maxLife;
        const radius = Math.max(1, progress * this.radius);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 7 * alpha + 2;
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, radius, Math.max(3, radius * 0.18), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.55;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, radius * 0.68, Math.max(2, radius * 0.12), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

class ElectricArcEffect {
    constructor(x1, y1, x2, y2, color = '#dfff43') {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
        this.life = 12;
        this.maxLife = 12;
        this.jag = Array.from({ length: 7 }, () => (Math.random() - 0.5) * 18);
    }

    update() {
        this.life--;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 18;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        for (let index = 1; index < this.jag.length - 1; index++) {
            const progress = index / (this.jag.length - 1);
            ctx.lineTo(
                this.x1 + (this.x2 - this.x1) * progress,
                this.y1 + (this.y2 - this.y1) * progress + this.jag[index]
            );
        }
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        ctx.restore();
    }
}

class SeismicCrackEffect {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.color = '#db8cff';
        this.life = 48;
        this.maxLife = 48;
    }

    update() {
        this.life--;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5;
        for (let branch = 0; branch < 3; branch++) {
            const startX = this.x + this.direction * branch * 13;
            const length = 18 + branch * 9;
            ctx.beginPath();
            ctx.moveTo(startX, this.y);
            ctx.lineTo(startX + this.direction * length * 0.55, this.y - 4 - branch);
            ctx.lineTo(startX + this.direction * length, this.y + 3);
            ctx.lineTo(startX + this.direction * (length + 9), this.y - 3);
            ctx.stroke();
        }
        ctx.restore();
    }
}

/**
 * Texto flotante para daño, curación y monedas
 */
class FloatingText {
    constructor(x, y, text, color, size = 20) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.vy = -1.6;
        this.life = 45;
        this.maxLife = 45;
    }

    update() {
        this.y += this.vy;
        this.life--;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.font = `900 ${this.size}px 'Orbitron', sans-serif`;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

/**
 * Proyectiles hostiles y especiales
 */
class Projectile {
    constructor(x, y, vx, vy, color, isHostile = true, damage = 5, isFalling = false, guidance = null) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.isHostile = isHostile;
        this.damage = damage;
        this.radius = isHostile ? (isFalling ? 8 : 6) : 9;
        this.active = true;
        this.isFalling = isFalling;
        this.guidance = guidance;
        this.speed = Math.hypot(vx, vy);
        this.angle = Math.atan2(vy, vx);
        this.owner = null;
        this.rangeRemaining = Infinity;
        this.hitTargets = new Set();
        this.magneticDeflectCooldown = 0;
    }

    update(width, floorY = 9999) {
        const previousX = this.x;
        const previousY = this.y;
        this.magneticDeflectCooldown = Math.max(0, this.magneticDeflectCooldown - 1);
        if (this.guidance && this.guidance.target) {
            const dx = this.guidance.target.x - this.x;
            const dy = this.guidance.target.y + 3 - this.y;
            const targetAngle = Math.atan2(dy, dx);
            const angleDelta = Math.atan2(
                Math.sin(targetAngle - this.angle),
                Math.cos(targetAngle - this.angle)
            );
            const maxTurn = this.guidance.turnRate;
            this.angle += Math.max(-maxTurn, Math.min(maxTurn, angleDelta));
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        }

        this.x += this.vx;
        this.y += this.vy;
        if (Number.isFinite(this.rangeRemaining)) {
            this.rangeRemaining -= Math.hypot(this.x - previousX, this.y - previousY);
            if (this.rangeRemaining <= 0) this.active = false;
        }
        if (this.x < -60 || this.x > width + 60 || this.y > floorY + 30 || this.y < -150) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.save();

        // Estela vertical si es proyectil meteórico / lluvia de plasma
        if (this.isFalling) {
            const grad = ctx.createLinearGradient(this.x, this.y - 36, this.x, this.y);
            grad.addColorStop(0, 'rgba(255, 0, 85, 0)');
            grad.addColorStop(1, 'rgba(255, 0, 85, 0.7)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(this.x - this.radius * 1.3, this.y);
            ctx.lineTo(this.x + this.radius * 1.3, this.y);
            ctx.lineTo(this.x, this.y - 38);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.isFalling ? 22 : 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Estela brillante interna
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class NeonJumpPad {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 56;
        this.cooldowns = new Map();
        this.pulse = Math.random() * Math.PI * 2;
        this.activationTime = 0;
    }

    canLaunch(entity) {
        return (this.cooldowns.get(entity) || 0) <= 0;
    }

    launch(entity) {
        this.cooldowns.set(entity, 36);
        this.activationTime = 18;
        entity.vy = -18;
        entity.isGrounded = false;
    }

    update(deltaTime = 1) {
        this.pulse += 0.08 * deltaTime;
        this.activationTime = Math.max(0, this.activationTime - deltaTime);
        this.cooldowns.forEach((remaining, entity) => {
            if (remaining <= deltaTime) this.cooldowns.delete(entity);
            else this.cooldowns.set(entity, remaining - deltaTime);
        });
    }

    draw(ctx, colors = {}) {
        const pulse = 0.65 + Math.sin(this.pulse) * 0.2;
        const padColor = colors.padCyan || '#00f3ff';
        ctx.save();
        ctx.fillStyle = 'rgba(0, 243, 255, 0.18)';
        ctx.strokeStyle = padColor;
        ctx.shadowColor = padColor;
        ctx.shadowBlur = 10 + pulse * 8;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(this.x - this.width / 2, this.y - 9, this.width, 9, 4);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 13);
        ctx.lineTo(this.x, this.y - (this.activationTime > 0 ? 40 : 29));
        ctx.moveTo(this.x, this.y - 29);
        ctx.lineTo(this.x - 8, this.y - 20);
        ctx.moveTo(this.x, this.y - 29);
        ctx.lineTo(this.x + 8, this.y - 20);
        ctx.stroke();
        if (this.activationTime > 0) {
            ctx.globalAlpha = this.activationTime / 18;
            ctx.strokeStyle = '#7ceeff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y - 14, 18 + (18 - this.activationTime) * 1.6, 7, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

class NeonCeilingLaser {
    constructor(x, floorY, phaseOffset = 0) {
        this.x = x;
        this.floorY = floorY;
        this.width = 18;
        this.beamEndY = floorY - 24;
        this.warningDuration = 180;
        this.activeDuration = 120;
        this.cycleDuration = this.warningDuration + this.activeDuration;
        this.cycleTimer = phaseOffset % this.cycleDuration;
        this.hitCooldowns = new WeakMap();
    }

    get isActive() {
        return this.cycleTimer >= this.warningDuration;
    }

    update(deltaTime = 1) {
        this.cycleTimer = (this.cycleTimer + deltaTime) % this.cycleDuration;
    }

    canHit(entity) {
        return (this.hitCooldowns.get(entity) || 0) <= 0;
    }

    markHit(entity) {
        this.hitCooldowns.set(entity, 45);
    }

    tickHitCooldown(entity, deltaTime = 1) {
        const remaining = this.hitCooldowns.get(entity) || 0;
        if (remaining > 0) this.hitCooldowns.set(entity, Math.max(0, remaining - deltaTime));
    }

    draw(ctx, time = 0, colors = {}) {
        const warning = !this.isActive;
        const color = warning
            ? (colors.electricYellow || '#ffcc00')
            : (colors.laserRed || '#ff2638');
        const blink = warning ? (Math.sin(time * 0.35) > 0 ? 1 : 0.22) : 1;
        ctx.save();
        ctx.globalAlpha = warning ? blink : 0.9;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = warning ? 14 : 30;
        ctx.fillRect(this.x - this.width / 2, 0, this.width, this.beamEndY);
        ctx.globalAlpha *= 0.45;
        ctx.fillRect(this.x - this.width, 0, this.width * 2, this.beamEndY);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = warning ? '#fff2a6' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, this.beamEndY);
        ctx.stroke();
        ctx.restore();
    }
}

/**
 * Clase Jugador (Stickman Neón)
 */
class Player {
    constructor(x, y, playerId = 'P1') {
        this.x = x;
        this.y = y;
        this.playerId = playerId;
        this.vx = 0;
        this.vy = 0;
        this.width = 30;
        this.height = 65;
        this.hp = 100;
        this.maxHp = 100;
        this.energy = 0;
        this.maxEnergy = 100;
        this.upgrades = { ...DEFAULT_PLAYER_UPGRADES };

        this.isGrounded = false;
        this.isCrouching = false;
        this.facingRight = true;
        this.isDead = false;
        this.isGhost = false;
        this.isAttacking = false;
        this.attackType = null; // 'light', 'heavy', 'special'
        this.attackTimer = 0;
        this.attackCooldown = 0;
        this.attackElapsed = 0;
        this.attackImpactResolved = false;
        this.attackWeapon = null;
        this.hitEnemies = new Set(); // Evita daño múltiple por frame en un solo swing

        this.invulnerableTimer = 0;
        this.electricStunTimer = 0;
        this.edgeShockCooldown = 0;
        this.dashTimer = 0;
        this.dashCooldown = 0;
        this.dashDirection = 1;
        this.dashFrame = 0;
        this.dashReadyFlash = 0;
        this.dashAfterimages = [];
        this.animFrame = 0;
        this.weapon = WEAPONS.whip;
        this.color = '#00f3ff';
        this.accentColor = '#ffffff';
        this.nickname = '';
        this.knockbackVx = 0;
        this.effects = { ...DEFAULT_PLAYER_EFFECTS };
        this.effectParticles = [];
        this.effectFrame = 0;
        this.combatFlashTimer = 0;
        this.state = 'alive';
        this.previousState = 'alive';
        this.stateTimer = 0;
        this.deathAnimationTimer = 0;
        this.respawnTimer = 0;

        // Articulaciones para animación cinemática
        this.legAngle = 0;
        this.armAngle = 0;
    }

    setState(nextState) {
        const validStates = ['alive', 'hit', 'downed', 'dead', 'ghost', 'waitingRespawn', 'respawning', 'revived'];
        if (!validStates.includes(nextState)) {
            throw new RangeError(`Estado de jugador no válido: ${nextState}`);
        }

        this.previousState = this.state || 'alive';
        this.state = nextState;
        this.stateTimer = nextState === 'hit' ? 10 : 0;
        this.isGhost = ['ghost', 'waitingRespawn', 'respawning'].includes(nextState);
        this.isDead = ['dead', 'ghost', 'waitingRespawn', 'respawning'].includes(nextState);
        return nextState;
    }

    update(actions, platforms, floorY, arenaWidth, deltaTime = 1) {
        if (this.isGhost || this.isDead) {
            this.vx = 0;
            this.vy = 0;
            this.isAttacking = false;
            this.attackTimer = 0;
            this.attackCooldown = 0;
            this.attackElapsed = 0;
            this.attackImpactResolved = false;
            this.attackWeapon = null;
            this.hitEnemies.clear();
            this.isCrouching = false;
            this.dashTimer = 0;
            this.dashAfterimages.length = 0;
            this.effectFrame += deltaTime;
            this.updateEffectParticles();
            if (this.combatFlashTimer > 0) this.combatFlashTimer--;
            if (this.invulnerableTimer > 0) this.invulnerableTimer--;
            if (this.effects.enabled && this.effectFrame % 6 === 0) {
                this.emitEffectBurst('trail', 1, this.facingRight ? -1 : 1);
            }
            return;
        }

        const wasGrounded = this.isGrounded;
        this.electricStunTimer = Math.max(0, this.electricStunTimer - deltaTime);
        this.edgeShockCooldown = Math.max(0, this.edgeShockCooldown - deltaTime);
        const speed = GAME_UNIT_SPEED;
        this.vx = 0;

        // Movimiento horizontal
        if (actions.moveLeft) {
            this.vx = -speed;
            this.facingRight = false;
        }
        if (actions.moveRight) {
            this.vx = speed;
            this.facingRight = true;
        }
        const wasDashCoolingDown = this.dashCooldown > 0;
        if (wasDashCoolingDown) {
            this.dashCooldown = Math.max(0, this.dashCooldown - deltaTime);
            if (this.dashCooldown === 0) this.dashReadyFlash = 60;
        }
        if (this.dashReadyFlash > 0) {
            this.dashReadyFlash = Math.max(0, this.dashReadyFlash - deltaTime);
        }
        for (let index = this.dashAfterimages.length - 1; index >= 0; index--) {
            this.dashAfterimages[index].life -= deltaTime;
            if (this.dashAfterimages[index].life <= 0) this.dashAfterimages.splice(index, 1);
        }

        if (actions.dash && this.dashCooldown <= 0) {
            this.dashDirection = actions.moveLeft && !actions.moveRight
                ? -1
                : actions.moveRight && !actions.moveLeft
                    ? 1
                    : this.facingRight ? 1 : -1;
            this.facingRight = this.dashDirection > 0;
            this.dashTimer = PLAYER_DASH_DURATION;
            this.dashCooldown = 72;
            this.rpgDashRewarded = false;
            this.invulnerableTimer = Math.max(this.invulnerableTimer, 24);
            this.dashFrame = 0;
            this.dashReadyFlash = 0;
            this.dashAfterimages.length = 0;
            this.vy = 0;
        }

        this.vx += this.knockbackVx;
        this.knockbackVx *= Math.pow(0.82, deltaTime);
        this.effectFrame += deltaTime;

        if (actions.jump && this.isGrounded) {
            this.vy = -13.0;
            this.isGrounded = false;
            sound.playJump();
            this.emitEffectBurst('jump', Math.round(5 * this.effectDensity()));
        }
        this.isCrouching = actions.crouch;

        // Gravedad e integración física
        if (this.dashTimer > 0) {
            if (this.dashFrame % 3 === 0) {
                this.dashAfterimages.push({
                    x: this.x,
                    y: this.y,
                    facingRight: this.dashDirection > 0,
                    color: this.accentColor || this.effects.color || this.color,
                    life: 14,
                    maxLife: 14
                });
                if (this.dashAfterimages.length > 5) this.dashAfterimages.shift();
            }
            this.dashFrame += deltaTime;
            this.vx = this.dashDirection * PLAYER_DASH_SPEED;
            this.vy = 0;
            this.x += this.vx * deltaTime;
            this.dashTimer = Math.max(0, this.dashTimer - deltaTime);
        } else {
            this.vy += 0.58 * deltaTime;
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        }

        // Límites horizontales de la arena (No salir de pantalla)
        const margin = 25;
        if (this.x < margin) this.x = margin;
        if (this.x > arenaWidth - margin) this.x = arenaWidth - margin;

        this.feetOffset = 28;

        // Colisión con el piso base
        if (this.y + this.feetOffset >= floorY) {
            this.y = floorY - this.feetOffset;
            this.vy = 0;
            this.isGrounded = true;
        }

        // Colisión con plataformas flotantes
        platforms.forEach(p => {
            if (this.vy >= 0 &&
                this.x + 18 > p.x && this.x - 18 < p.x + p.w &&
                this.y + this.feetOffset >= p.y && this.y + this.feetOffset <= p.y + 16) {
                this.y = p.y - this.feetOffset;
                this.vy = 0;
                this.isGrounded = true;
            }
        });

        if (!this.isGrounded && this.y + this.feetOffset >= floorY) {
            this.y = floorY - this.feetOffset;
            this.vy = 0;
            this.isGrounded = true;
        }

        if (!wasGrounded && this.isGrounded && this.effects.enabled && this.effects.jumpLand) {
            this.emitEffectBurst('land', Math.round(7 * this.effectDensity()));
        }
        if (this.effects.enabled) {
            if (this.isGrounded && Math.abs(this.vx) > speed * 0.7 &&
                this.effects.runTrail && this.effectFrame % 4 === 0) {
                this.emitEffectBurst('trail', 1, this.facingRight ? -1 : 1);
            }
            if (this.dashTimer > 0 && this.effects.dashTrail && this.effectFrame % 2 < deltaTime) {
                this.emitEffectBurst('dash', 3, this.dashDirection);
            }
            if (Math.abs(this.knockbackVx) > 4.5 && this.effects.dashTrail && this.effectFrame % 2 === 0) {
                this.emitEffectBurst('dash', 2, this.knockbackVx > 0 ? -1 : 1);
            }
        }

        this.updateEffectParticles();
        if (this.combatFlashTimer > 0) this.combatFlashTimer--;

        if (this.state === 'hit') {
            this.stateTimer -= deltaTime;
            if (this.stateTimer <= 0) this.setState('alive');
        }

        // Decaimiento de invulnerabilidad
        if (this.invulnerableTimer > 0) {
            this.invulnerableTimer--;
        }

        // Temporizador de ataque
        if (this.attackTimer > 0) {
            this.attackTimer--;
            this.attackElapsed += deltaTime;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
                this.hitEnemies.clear();
            }
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }

        // Ciclo de animación de caminar
        if (Math.abs(this.vx) > 0.1 && this.isGrounded) {
            this.animFrame += 0.22 * deltaTime;
            this.legAngle = Math.sin(this.animFrame) * 0.65;
            this.armAngle = -Math.sin(this.animFrame) * 0.65;
        } else {
            this.legAngle = 0;
            this.armAngle = 0;
        }
    }

    attack(type) {
        if (this.isGhost || this.isDead || this.attackCooldown > 0 || this.isAttacking) return false;

        const weapon = this.weapon || WEAPONS.whip;

        if (type === 'special') {
            if (this.energy < 100) return false;
            sound.playSpecial();
            this.attackTimer = PLAYER_SPECIAL_ANIMATION_FRAMES;
            this.attackCooldown = Math.max(weapon.cooldown, PLAYER_SPECIAL_COOLDOWN_FRAMES);
        } else if (type === 'heavy') {
            sound.playHeavySlash();
        } else {
            sound.playSlash();
        }

        this.isAttacking = true;
        this.attackType = type;
        this.hitEnemies.clear();

        // Duración y enfriamiento calibrados
        if (type !== 'special') {
            this.attackTimer = weapon.windup + weapon.activeFrames + weapon.recovery;
            this.attackCooldown = weapon.cooldown;
        }
        this.attackElapsed = 0;
        this.attackImpactResolved = false;
        this.attackWeapon = weapon;
        return true;
    }

    effectDensity() {
        if (!this.effects.enabled) return 0;
        const density = Math.max(0, Math.min(100, this.effects.density)) / 100;
        return density * (this.effects.reduced ? 0.35 : 1);
    }

    updateEffectParticles() {
        for (let i = this.effectParticles.length - 1; i >= 0; i--) {
            const particle = this.effectParticles[i];
            particle.update();
            if (particle.life <= 0) this.effectParticles.splice(i, 1);
        }
    }

    emitEffectBurst(kind, count, direction = 0) {
        if (!this.effects.enabled || this.effects.density <= 0) return;
        const color = this.effects.color;
        const intensity = Math.max(0, Math.min(1.5, this.effects.intensity / 70));
        if (intensity === 0) return;
        const reducedScale = this.effects.reduced ? 0.45 : 1;
        const originX = this.x - direction * 12;
        const originY = this.y + 9;

        for (let i = 0; i < count; i++) {
            let vx = (Math.random() - 0.5) * 4;
            let vy = -Math.random() * 4;
            let life = 20;
            let size = 2.5;
            if (kind === 'trail' || kind === 'dash') {
                vx = direction * (1 + Math.random() * 2);
                vy = (Math.random() - 0.5) * 2;
                life = kind === 'dash' ? 20 : 14;
                size = kind === 'dash' ? 3.5 : 2.5;
            } else if (kind === 'land') {
                vx = (Math.random() - 0.5) * 6;
                vy = -Math.random() * 3;
                life = 16;
                size = 3;
            } else if (kind === 'combat' || kind === 'defeat') {
                const angle = Math.random() * Math.PI * 2;
                const velocity = (kind === 'defeat' ? 3.5 : 2.5) + Math.random() * 3;
                vx = Math.cos(angle) * velocity;
                vy = Math.sin(angle) * velocity;
                life = kind === 'defeat' ? 30 : 18;
                size = kind === 'defeat' ? 3.5 : 2.5;
            }
            addBoundedParticle(this.effectParticles, new Particle(
                originX,
                originY,
                vx * reducedScale * intensity,
                vy * reducedScale * intensity,
                color,
                size * reducedScale * intensity,
                Math.max(8, Math.round(life * reducedScale))
            ), MAX_COSMETIC_PARTICLES);
        }
    }

    triggerCombatFlash() {
        if (!this.effects.enabled || !this.effects.combatFlash) return;
        this.combatFlashTimer = this.effects.reduced ? 5 : 9;
        this.emitEffectBurst('combat', Math.round(5 * this.effectDensity()));
    }

    drawEffects(ctx) {
        const effects = this.effects;
        if (this.isAttacking && this.attackType === 'special') {
            const progress = Math.min(1, this.attackElapsed / PLAYER_SPECIAL_CHARGE_FRAMES);
            const pulse = Math.sin(Date.now() / 35) * 4;
            const color = this.weapon?.color || this.color;
            ctx.save();
            ctx.globalAlpha = Math.min(0.85, 0.28 + progress * 0.5);
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 18 + progress * 24;
            ctx.lineWidth = 2 + progress * 2;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y - 8, 24 + progress * 12 + pulse, 36 + progress * 12 + pulse, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha *= 0.65;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y - 8, 16 + progress * 8 - pulse * 0.35, 28 + progress * 8 - pulse * 0.35, 0, 0, Math.PI * 2);
            ctx.stroke();
            for (let index = 0; index < 6; index++) {
                const angle = Date.now() / 180 + index * Math.PI / 3;
                const radius = 27 + progress * 13;
                ctx.beginPath();
                ctx.arc(
                    this.x + Math.cos(angle) * radius,
                    this.y - 8 + Math.sin(angle) * radius * 1.25,
                    2 + progress * 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            ctx.restore();
        }
        if (!effects || !effects.enabled) return;

        const intensity = Math.max(0, Math.min(1.5, effects.intensity / 70));
        if (intensity === 0) return;
        const pulse = effects.reduced ? 0 : Math.sin(Date.now() / 160) * 2;
        if (effects.auraStyle && effects.auraStyle !== 'none') {
            ctx.save();
            ctx.strokeStyle = effects.color;
            ctx.fillStyle = effects.color;
            ctx.shadowColor = effects.color;
            ctx.shadowBlur = (effects.reduced ? 7 : 16) * intensity;
            ctx.globalAlpha = Math.min(0.85, (0.25 + intensity * 0.22) * intensity);
            ctx.lineWidth = effects.reduced ? 2 : 2.5;
            if (effects.auraStyle === 'orbit') {
                for (let i = 0; i < (effects.reduced ? 2 : 3); i++) {
                    const angle = Date.now() / (effects.reduced ? 1100 : 700) + i * Math.PI * 2 / 3;
                    const x = this.x + Math.cos(angle) * 22;
                    const y = this.y - 14 + Math.sin(angle) * 24;
                    ctx.beginPath();
                    ctx.arc(x, y, effects.reduced ? 2 : 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.ellipse(this.x, this.y - 8, 23 + pulse, 34 + pulse, 0, 0, Math.PI * 2);
                ctx.stroke();
            } else if (effects.auraStyle === 'ring') {
                ctx.beginPath();
                ctx.ellipse(this.x, this.y - 5, 25 + pulse, 38 + pulse, 0, 0, Math.PI * 2);
                ctx.stroke();
                if (!effects.reduced) {
                    ctx.globalAlpha *= 0.45;
                    ctx.beginPath();
                    ctx.ellipse(this.x, this.y - 5, 31 - pulse, 44 - pulse, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
            } else if (effects.auraStyle === 'flame') {
                const flicker = effects.reduced ? 0 : Math.sin(Date.now() / 75) * 3;
                ctx.beginPath();
                ctx.ellipse(this.x, this.y - 5, 22 + pulse, 36 + flicker, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha *= 0.22;
                ctx.fill();
            }
            ctx.restore();
        }

        if (this.combatFlashTimer > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(0.65, this.combatFlashTimer / 14);
            ctx.fillStyle = effects.color;
            ctx.shadowColor = effects.color;
            ctx.shadowBlur = 16 * intensity;
            ctx.beginPath();
            ctx.arc(this.x, this.y - 12, 18 * intensity, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        this.effectParticles.forEach(particle => particle.draw(ctx));
    }

    draw(ctx) {
        this.drawDashAfterimages(ctx);
        this.drawEffects(ctx);
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.isCrouching) {
            ctx.translate(0, 5);
            ctx.scale(1, 0.8);
        }

        if (this.isGhost) {
            const ghostAlpha = 0.5 + Math.sin(Date.now() / 140) * 0.18;
            ctx.globalAlpha = ghostAlpha;
            ctx.strokeStyle = '#d9f7ff';
            ctx.shadowColor = '#d9f7ff';
            ctx.shadowBlur = 14;
            ctx.setLineDash([6, 6]);
        } else if (this.invulnerableTimer > 0) {
            ctx.globalAlpha = this.dashTimer > 0
                ? 0.6 + Math.sin(Date.now() / 25) * 0.2
                : Math.floor(Date.now() / 60) % 2 === 0 ? 0.35 : 1;
        }

        const dir = this.facingRight ? 1 : -1;
        const cyan = this.color;

        ctx.strokeStyle = cyan;
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 14;
        ctx.lineWidth = 3.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Cabeza con aura
        ctx.beginPath();
        ctx.arc(0, -22, 9, 0, Math.PI * 2);
        ctx.stroke();

        // Ojo neón estilo visor
        ctx.fillStyle = this.accentColor;
        ctx.beginPath();
        ctx.arc(3 * dir, -22, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Torso
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.lineTo(0, 10);
        ctx.stroke();

        // Piernas articuladas
        const legLen = 18;
        ctx.beginPath();
        // Pierna Izquierda
        ctx.moveTo(0, 10);
        ctx.lineTo(-Math.sin(this.legAngle) * legLen * dir, 10 + Math.cos(this.legAngle) * legLen);
        // Pierna Derecha
        ctx.moveTo(0, 10);
        ctx.lineTo(Math.sin(this.legAngle) * legLen * dir, 10 + Math.cos(this.legAngle) * legLen);
        ctx.stroke();

        // El punto local (0, 0) del arma coincide con la articulación de la mano.
        const armX = dir * 14;
        const armY = -this.height * 0.2 + 2 + Math.sin(this.armAngle) * 2;
        const weapon = this.isAttacking
            ? (this.attackWeapon || this.weapon || WEAPONS.whip)
            : (this.weapon || WEAPONS.whip);
        this.drawArms(ctx, armX, armY, weapon.id === 'cyberDaggers');

        if (this.isGhost) {
            ctx.strokeStyle = '#d9f7ff';
            ctx.shadowColor = '#d9f7ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, -22, 11, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -13);
            ctx.lineTo(0, 10);
            ctx.stroke();
            ctx.restore();
            return;
        }

        this.drawWeapon(ctx, weapon, armX, armY, dir);
        ctx.fillStyle = cyan;
        ctx.shadowColor = cyan;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(armX, armY, 3, 0, Math.PI * 2);
        ctx.fill();
        if (weapon.id === 'cyberDaggers') {
            ctx.beginPath();
            ctx.arc(-armX, armY, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        ctx.save();
        ctx.font = "700 14px 'Orbitron', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillStyle = this.playerId === 'P2' ? '#ff00aa' : this.accentColor;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.fillText(this.nickname || this.playerId, this.x, this.y - 43);
        const cooldownRatio = this.dashCooldown / 72;
        const dashReady = this.dashCooldown <= 0;
        const indicatorColor = dashReady ? '#00ffcc' : '#b000ff';
        ctx.font = "700 9px 'Orbitron', sans-serif";
        ctx.fillStyle = indicatorColor;
        ctx.shadowColor = indicatorColor;
        ctx.shadowBlur = this.dashReadyFlash > 0 ? 14 : 8;
        ctx.fillText(
            this.dashReadyFlash > 0 ? 'DASH LISTO!' : dashReady ? 'DASH OK' : `DASH ${(this.dashCooldown / 60).toFixed(1)}s`,
            this.x,
            this.y - 55
        );
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(12, 16, 32, 0.85)';
        ctx.fillRect(this.x - 18, this.y - 51, 36, 3);
        ctx.fillStyle = indicatorColor;
        ctx.fillRect(this.x - 18, this.y - 51, 36 * (1 - cooldownRatio), 3);
        ctx.restore();
    }

    drawArms(ctx, handX, handY, dualWield = false) {
        const shoulderY = -this.height * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(handX, handY);
        if (dualWield) {
            ctx.moveTo(0, shoulderY);
            ctx.lineTo(-handX, handY);
        }
        ctx.stroke();
    }

    drawWeapon(ctx, weapon, armX, armY, direction) {
        const reach = Math.max(24, weapon.reach || 40);
        const attacking = this.isAttacking;
        const progress = attacking && this.attackType === 'special'
            ? Math.max(0, Math.min(1, this.attackElapsed / PLAYER_SPECIAL_ANIMATION_FRAMES))
            : attacking
                ? Math.max(0, Math.min(1, this.attackElapsed / Math.max(1, weapon.windup + weapon.activeFrames)))
                : 0;
        const swingAngle = !attacking
            ? -0.12
            : this.attackType === 'special'
                ? progress < 0.34
                    ? -0.9
                    : -0.9 + ((progress - 0.34) / 0.66) * 1.75
                : (progress - 0.5) * 0.9;

        ctx.save();
        ctx.translate(armX, armY);
        ctx.scale(direction, 1);
        ctx.rotate(swingAngle);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = weapon.color;
        ctx.fillStyle = weapon.color;
        ctx.shadowColor = weapon.color;
        ctx.shadowBlur = attacking ? (this.attackType === 'special' ? 34 : 24) : 13;

        switch (weapon.id) {
            case 'dagger': {
                const bladeLength = reach;
                ctx.strokeStyle = '#00ffcc';
                ctx.fillStyle = 'rgba(0, 255, 204, 0.42)';
                ctx.beginPath();
                ctx.moveTo(7, -4);
                ctx.lineTo(bladeLength, 0);
                ctx.lineTo(7, 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(bladeLength - 2, 0);
                ctx.stroke();
                ctx.strokeStyle = '#d9fff7';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(5, -7);
                ctx.lineTo(5, 7);
                ctx.moveTo(4, 0);
                ctx.lineTo(-5, 0);
                ctx.stroke();
                break;
            }
            case 'sword': {
                const bladeLength = reach;
                ctx.strokeStyle = '#00f3ff';
                ctx.fillStyle = 'rgba(0, 243, 255, 0.42)';
                ctx.beginPath();
                ctx.moveTo(8, -5);
                ctx.lineTo(bladeLength - 4, -2);
                ctx.lineTo(bladeLength, 0);
                ctx.lineTo(bladeLength - 4, 2);
                ctx.lineTo(8, 5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(bladeLength - 4, 0);
                ctx.stroke();
                ctx.strokeStyle = '#b8ffff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(7, -8);
                ctx.lineTo(7, 8);
                ctx.moveTo(4, 0);
                ctx.lineTo(-7, 0);
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-1, -3, 5, 6);
                break;
            }
            case 'plasma': {
                const bladeLength = reach;
                ctx.strokeStyle = '#ff00aa';
                ctx.fillStyle = 'rgba(255, 0, 170, 0.5)';
                ctx.beginPath();
                ctx.moveTo(8, -8);
                ctx.lineTo(bladeLength * 0.42, -7);
                ctx.lineTo(bladeLength * 0.52, -11);
                ctx.lineTo(bladeLength * 0.65, -6);
                ctx.lineTo(bladeLength - 4, -3);
                ctx.lineTo(bladeLength, 0);
                ctx.lineTo(bladeLength - 4, 3);
                ctx.lineTo(bladeLength * 0.68, 7);
                ctx.lineTo(bladeLength * 0.54, 4);
                ctx.lineTo(bladeLength * 0.4, 9);
                ctx.lineTo(8, 7);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.strokeStyle = '#ffd6f5';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(12, 0);
                ctx.lineTo(bladeLength - 5, 0);
                ctx.stroke();
                for (let index = 0; index < 3; index++) {
                    const x = bladeLength * (0.35 + index * 0.2);
                    ctx.fillStyle = index % 2 ? '#ffccf2' : '#ff4dcc';
                    ctx.beginPath();
                    ctx.arc(x, (index % 2 ? -1 : 1) * (6 + Math.sin(Date.now() / 55 + index) * 3), 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.strokeStyle = '#ffc4ef';
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(5, -9);
                ctx.lineTo(5, 9);
                ctx.moveTo(4, 0);
                ctx.lineTo(-8, 0);
                ctx.stroke();
                break;
            }
            case 'hammer':
            case 'seismicHammer': {
                const handleLength = Math.max(38, reach - (weapon.id === 'hammer' ? 17 : 25));
                const headWidth = weapon.id === 'hammer' ? 29 : 35;
                const headHeight = weapon.id === 'hammer' ? 25 : 31;
                ctx.strokeStyle = '#eadbff';
                ctx.lineWidth = weapon.id === 'hammer' ? 7 : 9;
                ctx.beginPath();
                ctx.moveTo(3, 3);
                ctx.lineTo(handleLength, -headHeight * 0.18);
                ctx.stroke();
                ctx.strokeStyle = '#7d37c7';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(7, 3);
                ctx.lineTo(handleLength, -headHeight * 0.18);
                ctx.stroke();
                const headX = handleLength - 3;
                ctx.fillStyle = weapon.id === 'hammer' ? '#8d42df' : '#9450d1';
                ctx.strokeStyle = weapon.id === 'hammer' ? '#e3b8ff' : '#f1d7ff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(headX - headWidth * 0.42, -headHeight * 0.65);
                ctx.lineTo(headX + headWidth * 0.35, -headHeight * 0.65);
                ctx.lineTo(headX + headWidth * 0.52, -headHeight * 0.42);
                ctx.lineTo(headX + headWidth * 0.52, headHeight * 0.42);
                ctx.lineTo(headX + headWidth * 0.35, headHeight * 0.65);
                ctx.lineTo(headX - headWidth * 0.42, headHeight * 0.65);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#f7eaff';
                ctx.shadowBlur = 8;
                ctx.fillRect(headX - headWidth * 0.25, -3, headWidth * 0.5, 6);
                if (weapon.id === 'seismicHammer' && attacking &&
                    this.attackElapsed >= weapon.windup &&
                    this.attackElapsed < weapon.windup + weapon.activeFrames) {
                    ctx.globalAlpha = 0.7;
                    ctx.strokeStyle = '#dba7ff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.ellipse(0, 43, reach * 0.7, 7, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
            }
            case 'whip': {
                const whipReach = weapon.reach;
                const wave = attacking ? Math.sin(progress * Math.PI) : 0.15;
                const tipY = attacking ? 6 - wave * 52 : 8;
                ctx.strokeStyle = '#00ffcc';
                ctx.lineWidth = attacking ? 4 : 3;
                ctx.beginPath();
                ctx.moveTo(4, 0);
                ctx.bezierCurveTo(
                    whipReach * 0.28, -28 - wave * 26,
                    whipReach * 0.7, 35 - wave * 52,
                    whipReach, tipY
                );
                ctx.stroke();
                ctx.fillStyle = '#e3ffff';
                [0.28, 0.52, 0.76, 0.94].forEach((point, index) => {
                    const nodeX = whipReach * point;
                    const nodeY = Math.sin(progress * Math.PI + point * Math.PI) * (attacking ? 12 : 3);
                    ctx.beginPath();
                    ctx.arc(nodeX, nodeY, index === 3 ? 3 : 2, 0, Math.PI * 2);
                    ctx.fill();
                });
                if (attacking) {
                    ctx.globalAlpha = 0.2;
                    ctx.lineWidth = 12;
                    ctx.stroke();
                }
                break;
            }
            case 'blaster': {
                ctx.fillStyle = '#12475b';
                ctx.strokeStyle = '#37e7ff';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(-4, -7);
                ctx.lineTo(18, -7);
                ctx.lineTo(25, -3);
                ctx.lineTo(25, 3);
                ctx.lineTo(18, 7);
                ctx.lineTo(4, 7);
                ctx.lineTo(0, 13);
                ctx.lineTo(-5, 13);
                ctx.lineTo(-2, 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#9ff8ff';
                ctx.fillRect(7, -3, 12, 2);
                ctx.fillStyle = '#00f3ff';
                ctx.shadowBlur = 18;
                ctx.beginPath();
                ctx.arc(23, 0, attacking ? 4 : 2.5, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'cyberDaggers': {
                const bladeLength = reach;
                const drawDagger = (offsetY, angle) => {
                    ctx.save();
                    ctx.translate(0, offsetY);
                    ctx.rotate(angle);
                    ctx.strokeStyle = '#168dff';
                    ctx.fillStyle = 'rgba(36, 119, 255, 0.38)';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(5, -3);
                    ctx.lineTo(bladeLength, 0);
                    ctx.lineTo(5, 3);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.strokeStyle = '#c9f6ff';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(8, 0);
                    ctx.lineTo(bladeLength - 2, 0);
                    ctx.stroke();
                    ctx.restore();
                };
                drawDagger(-5, attacking ? -0.28 : -0.16);
                drawDagger(5, attacking ? 0.28 : 0.16);
                ctx.strokeStyle = '#a7ffec';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(4, -7);
                ctx.lineTo(4, 7);
                ctx.stroke();
                break;
            }
            default:
                ctx.restore();
                throw new RangeError(`No existe un dibujo para el arma: ${weapon.id}`);
        }

        ctx.restore();

        if (weapon.id === 'cyberDaggers') {
            ctx.save();
            ctx.translate(-armX, armY);
            ctx.scale(direction, 1);
            ctx.rotate(attacking ? 0.22 : 0.12);
            ctx.strokeStyle = '#168dff';
            ctx.fillStyle = 'rgba(36, 119, 255, 0.38)';
            ctx.shadowColor = '#45b8ff';
            ctx.shadowBlur = 14;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(3, -3);
            ctx.lineTo(reach * 0.82, 0);
            ctx.lineTo(3, 3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = '#c9f6ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(6, 0);
            ctx.lineTo(reach * 0.78, 0);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawDashAfterimages(ctx) {
        this.dashAfterimages.forEach(image => {
            const alpha = (image.life / image.maxLife) * 0.45;
            const direction = image.facingRight ? 1 : -1;
            ctx.save();
            ctx.translate(image.x, image.y);
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = image.color;
            ctx.shadowColor = image.color;
            ctx.shadowBlur = 18;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, -22, 9, 0, Math.PI * 2);
            ctx.moveTo(0, -13);
            ctx.lineTo(0, 10);
            ctx.moveTo(0, -7);
            ctx.lineTo(14 * direction, -1);
            ctx.moveTo(0, -7);
            ctx.lineTo(-10 * direction, 1);
            ctx.moveTo(0, 10);
            ctx.lineTo(-8, 27);
            ctx.moveTo(0, 10);
            ctx.lineTo(8, 27);
            ctx.stroke();
            ctx.restore();
        });
    }
}

/**
 * Clase Enemigo con IA por tipos
 */
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.knockbackVx = 0;
        this.isDead = false;
        this.deathExplosionTriggered = false;
        this.facingRight = true;
        this.attackCooldown = Math.floor(Math.random() * 15);
        this.isAttacking = false;
        this.attackAnim = 0;
        this.targetPlayer = null;
        this.targetDecisionTimer = Math.random() * 30;
        this.evadeTimer = 0;
        this.evadeCooldown = 0;
        this.evadeScanTimer = Math.random() * 8;
        this.evadeDirection = 1;
        this.shotChargeTimer = 0;
        this.shotTarget = null;
        this.shotSpeed = 0;
        this.shotTurnRate = 0;
        this.shotSpread = 0;
        this.plasmaBurnTimer = 0;
        this.plasmaBurnTickTimer = 30;
        this.plasmaBurnDamage = 0;
        this.poisonTimer = 0;
        this.poisonTickTimer = 15;
        this.poisonDamage = 1.2;
        this.lastStatusDamageColor = '#ff9a35';
        this.armorBreakTimer = 0;
        this.cyberCutTimer = 0;
        this.cyberCutStacks = 0;
        this.cryoSlowTimer = 0;
        this.cryoFreezeTimer = 0;
        this.stunTimer = 0;
        this.electroShockTimer = 0;
        this.edgeShockCooldown = 0;
        this.effectResistances = {
            plasmaBurn: 1,
            stun: 1,
            cryoSlow: 1,
            cryoFreeze: 1,
            electroShock: 1
        };
        this.lastStatusSource = null;
        this.shieldFlashTimer = 0;
        this.rageMode = false;
        this.ragePulse = 0;
        this.magneticChargeTimer = 0;
        this.magneticPulseTimer = 0;
        this.magneticCooldown = 0;
        this.trooperAimTimer = 0;
        this.trooperAimTarget = null;
        this.trooperBurstShots = 0;
        this.trooperShotTimer = 0;
        this.trooperBurstCooldown = 0;
        this.acidTelegraphTimer = 0;
        this.acidPoolTimer = 0;
        this.acidPoolTickTimer = 0;
        this.acidPoolX = x;
        this.teleportWarningTimer = 0;
        this.teleportTargetX = x;
        this.teleportRecoveryTimer = 0;
        this.teleportCooldown = 0;

        this.speed = GAME_UNIT_SPEED;
        this.damageMultiplier = 1;
        this.knockbackResistance = 1;

        // Estadísticas y velocidad específicas de cada arquetipo.
        if (type === 'basic') {
            this.hp = 50; this.maxHp = 50; this.color = '#ff0055';
            this.width = 25; this.scale = 1.0; this.score = 10;
        } else if (type === 'fast') {
            this.hp = 35; this.maxHp = 35; this.color = '#ffcc00';
            this.width = 22; this.scale = 0.9; this.score = 10;
        } else if (type === 'heavy') {
            this.hp = 100; this.maxHp = 100; this.color = '#b000ff';
            this.width = 35; this.scale = 1.25; this.score = 10;
        } else if (type === 'special') {
            this.hp = 70; this.maxHp = 70; this.color = '#00ff88';
            this.width = 28; this.scale = 1.0; this.score = 10;
        } else if (type === 'drone') {
            this.hp = 46; this.maxHp = 46; this.color = '#ff315c';
            this.width = 34; this.scale = 1; this.score = 15;
            this.height = 24; this.feetOffset = 12;
            this.hoverY = y;
            this.hoverPhase = Math.random() * Math.PI * 2;
            this.fireCooldown = 2.5 * 60;
        } else if (type === 'shield') {
            this.hp = 105; this.maxHp = 105; this.color = '#30dfff';
            this.width = 32; this.scale = 1.1; this.score = 15;
            this.shieldFlashTimer = 0;
            this.shieldFacingLocked = false;
        } else if (type === 'cyberNinja') {
            this.hp = 42; this.maxHp = 42; this.color = '#ff00aa';
            this.width = 24; this.scale = 0.95; this.score = 18;
            this.speed = GAME_UNIT_SPEED * 1.8;
            this.ninjaDashCooldown = 55 + Math.random() * 35;
            this.ninjaDashTimer = 0;
            this.ninjaDashDirection = 1;
            this.ninjaDashHit = false;
        } else if (type === 'cyberBrawler') {
            this.hp = 125; this.maxHp = 125; this.color = '#ffae00';
            this.width = 38; this.scale = 1.3; this.score = 20;
            this.knockbackResistance = 0.18;
            this.punchChargeTimer = 0;
            this.punchCooldown = 55;
            this.punchTarget = null;
        } else if (type === 'cyberKamikaze') {
            this.hp = 42; this.maxHp = 42; this.color = '#ff2638';
            this.width = 27; this.scale = 1; this.score = 16;
            this.speed = GAME_UNIT_SPEED * 1.15;
            this.detonationTimer = 0;
            this.detonationStarted = false;
        } else if (type === 'cyberRanger') {
            this.hp = 44; this.maxHp = 44; this.color = '#39ff88';
            this.width = 27; this.scale = 1; this.score = 17;
            this.rangerSafeDistance = 235;
            this.fireCooldown = 120;
        } else if (type === 'magnetUnit') {
            this.hp = 78; this.maxHp = 78; this.color = '#4bdcff';
            this.width = 31; this.scale = 1.05; this.score = 20;
            this.speed = GAME_UNIT_SPEED * 0.78;
            this.magneticCooldown = 150;
            this.attackCooldown = 35;
        } else if (type === 'assaultTrooper') {
            this.hp = 48; this.maxHp = 48; this.color = '#a4ff58';
            this.width = 27; this.scale = 1; this.score = 18;
            this.speed = GAME_UNIT_SPEED * 0.9;
            this.trooperBurstCooldown = 80;
            this.attackCooldown = 30;
        } else if (type === 'corrosiveMutant') {
            this.hp = 62; this.maxHp = 62; this.color = '#b8ff38';
            this.width = 30; this.scale = 1.05; this.score = 20;
            this.speed = GAME_UNIT_SPEED * 0.82;
            this.acidCooldown = 145;
        } else if (type === 'dimensionalInfiltrator') {
            this.hp = 40; this.maxHp = 40; this.color = '#c184ff';
            this.width = 24; this.scale = 0.92; this.score = 22;
            this.speed = GAME_UNIT_SPEED * 1.05;
            this.teleportCooldown = 100;
            this.attackCooldown = 28;
        } else if (type === 'boss') {
            this.hp = 400; this.maxHp = 400; this.color = '#ff00aa';
            this.width = 50; this.scale = 1.6; this.score = 100; this.phase = 1;
            this.phaseTransitionTimer = 0;
            this.phaseAttackCooldown = 150;
            this.phaseAttackChargeTimer = 0;
            this.phaseAttackTargetX = x;
            this.phaseAttackTargetY = y;
            this.meteorFollowupTimer = 0;
            this.meteorFollowupX = 0;
            this.element = 'fire';
            this.secondaryElement = null;
            this.accentColor = this.color;
            this.elementalProfile = ELEMENTAL_ATTACKS[this.element] || ELEMENTAL_ATTACKS.fire;
            // Estados avanzados de ataque para Jefes: Salto y caída directa al jugador
            this.slamState = 'idle'; // 'idle', 'charge', 'rising', 'falling', 'recovery'
            this.slamTimer = 0;
            this.slamCooldown = 75; // Salto y caída agresiva y rápida
            this.slamTargetX = 0;
            this.slamTargetY = 0;
            this.shockwaveRadius = 0;
            this.meteorCooldown = 110; // Lluvia orbital de plasma más frecuente
        }

        // Medida exacta de los pies respecto al centro geométrico: 25 * scale
        // Esto garantiza que toquen el suelo base de forma 100% matemática sin flotar
        if (type !== 'drone') {
            this.feetOffset = 25 * this.scale;
            this.height = this.feetOffset * 2;
        }

        this.animFrame = Math.random() * 10;
    }

    updateProjectileEvasion(projectiles, deltaTime, arenaWidth) {
        if (!['cyberNinja', 'cyberRanger'].includes(this.type)) return false;

        this.evadeCooldown = Math.max(0, this.evadeCooldown - deltaTime);
        this.evadeScanTimer = Math.max(0, this.evadeScanTimer - deltaTime);
        if (this.type === 'cyberNinja' && this.ninjaDashTimer > 0) {
            this.evadeTimer = 0;
            return false;
        }
        if (this.evadeTimer > 0) {
            this.evadeTimer = Math.max(0, this.evadeTimer - deltaTime);
            this.vx = this.evadeDirection * this.speed * (this.type === 'cyberNinja' ? 1.45 : 1.2);
            return true;
        }
        if (this.evadeCooldown > 0 || this.evadeScanTimer > 0) return false;

        this.evadeScanTimer = 8;
        const enemyCenterY = this.y - 8;
        const threat = projectiles.find(projectile => {
            if (projectile.isHostile || !projectile.active) return false;
            const relativeX = projectile.x - this.x;
            const relativeY = projectile.y - enemyCenterY;
            const speedSquared = projectile.vx * projectile.vx + projectile.vy * projectile.vy;
            if (speedSquared === 0) return false;

            const timeToClosest = -(relativeX * projectile.vx + relativeY * projectile.vy) / speedSquared;
            if (timeToClosest < 1 || timeToClosest > 8) return false;

            const closestX = relativeX + projectile.vx * timeToClosest;
            const closestY = relativeY + projectile.vy * timeToClosest;
            return Math.hypot(closestX, closestY) <= this.width * 0.55 + projectile.radius + 4
                ? projectile
                : false;
        });
        if (!threat) return false;

        const atLeftEdge = this.x <= this.width * 0.6;
        const atRightEdge = this.x >= arenaWidth - this.width * 0.6;
        const preferredDirection = Math.abs(threat.vx) > 0.5
            ? -Math.sign(threat.vx)
            : this.facingRight ? -1 : 1;
        this.evadeDirection = atLeftEdge ? 1 : atRightEdge ? -1 : preferredDirection;
        this.evadeTimer = this.type === 'cyberNinja' ? 7 : 9;
        this.evadeCooldown = 90 + Math.random() * 30;
        this.vx = this.evadeDirection * this.speed * (this.type === 'cyberNinja' ? 1.45 : 1.2);
        return true;
    }

    updateCyberBehavior(player, projectiles, floorY, arenaWidth, onMeleeDamage, onAreaDamage, onSelfDestruct, particles, deltaTime, onHazardDamage) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.abs(dx);
        const timeScale = this.cryoSlowTimer > 0 ? 0.5 : 1;
        this.facingRight = dx > 0;
        this.vx = 0;

        if (this.type === 'cyberNinja') {
            this.ninjaDashCooldown = Math.max(0, this.ninjaDashCooldown - timeScale * deltaTime);
            if (this.ninjaDashTimer > 0) {
                this.vx = this.ninjaDashDirection * this.speed * 3.4;
                this.ninjaDashTimer = Math.max(0, this.ninjaDashTimer - timeScale * deltaTime);
                if (!this.ninjaDashHit &&
                    Math.abs(player.x - this.x) <= 34 &&
                    Math.abs(dy) < 45 &&
                    onMeleeDamage) {
                    this.ninjaDashHit = true;
                    onMeleeDamage(7 * this.damageMultiplier);
                }
                if (particles && Math.random() < 0.75) {
                    particles.push(new Particle(
                        this.x - this.ninjaDashDirection * 12,
                        this.y - 8,
                        -this.ninjaDashDirection * (2 + Math.random() * 3),
                        (Math.random() - 0.5) * 3,
                        this.color,
                        3.5,
                        14
                    ));
                }
            } else if (distance >= 135 && distance <= 285 && this.ninjaDashCooldown <= 0) {
                this.ninjaDashDirection = Math.sign(dx) || 1;
                this.ninjaDashTimer = 9;
                this.ninjaDashCooldown = 105;
                this.ninjaDashHit = false;
            } else {
                this.vx = this.facingRight ? this.speed : -this.speed;
            }
        } else if (this.type === 'cyberBrawler') {
            this.punchCooldown = Math.max(0, this.punchCooldown - timeScale * deltaTime);
            if (this.punchChargeTimer > 0) {
                this.punchChargeTimer = Math.max(0, this.punchChargeTimer - timeScale * deltaTime);
                this.punchTarget = player;
                this.isAttacking = true;
                this.attackAnim = 8;
                if (this.punchChargeTimer === 0) {
                    if (Math.abs(player.x - this.x) <= 78 && Math.abs(dy) <= 48 && onMeleeDamage) {
                        onMeleeDamage(11 * this.damageMultiplier);
                    }
                    this.punchCooldown = 88;
                    this.isAttacking = false;
                    this.punchTarget = null;
                }
            } else if (distance <= 78 && Math.abs(dy) <= 48 && this.punchCooldown <= 0) {
                this.punchChargeTimer = 24;
                this.punchTarget = player;
                this.vx = 0;
            } else if (distance > 58) {
                this.vx = this.facingRight ? this.speed : -this.speed;
            }
            if (this.punchChargeTimer > 0 && particles && Math.random() < 0.55) {
                particles.push(new Particle(
                    this.x + (Math.random() - 0.5) * this.width,
                    this.y - 12,
                    (Math.random() - 0.5) * 2,
                    -1 - Math.random() * 2,
                    '#fff06a',
                    3,
                    16
                ));
            }
        } else if (this.type === 'cyberKamikaze') {
            if (this.detonationStarted) {
                this.detonationTimer = Math.max(0, this.detonationTimer - deltaTime);
                this.vx = 0;
                if (particles && Math.random() < 0.8) {
                    const color = Math.floor(this.detonationTimer / 5) % 2 === 0 ? '#ffffff' : this.color;
                    particles.push(new Particle(
                        this.x + (Math.random() - 0.5) * this.width,
                        this.y - 10,
                        (Math.random() - 0.5) * 5,
                        (Math.random() - 0.5) * 5,
                        color,
                        3 + Math.random() * 2,
                        16
                    ));
                }
                if (this.detonationTimer === 0) {
                    const blastRadius = 80;
                    if (particles) {
                        for (let index = 0; index < 24; index++) {
                            const angle = (Math.PI * 2 * index) / 24;
                            const speed = 3 + Math.random() * 5;
                            particles.push(new Particle(
                                this.x,
                                this.y - 8,
                                Math.cos(angle) * speed,
                                Math.sin(angle) * speed,
                                index % 2 === 0 ? '#ffffff' : this.color,
                                3 + Math.random() * 3,
                                22
                            ));
                        }
                    }
                    if (onAreaDamage) {
                        onAreaDamage(this.x, this.y, blastRadius, 16 * this.damageMultiplier);
                    } else if (Math.hypot(dx, dy) <= blastRadius && onMeleeDamage) {
                        onMeleeDamage(16 * this.damageMultiplier);
                    }
                    this.hp = 0;
                    if (onSelfDestruct) onSelfDestruct(this, player);
                    else this.isDead = true;
                    return;
                }
            } else if (distance < 40 && Math.abs(dy) < 55) {
                this.detonationStarted = true;
                this.detonationTimer = 60;
                this.vx = 0;
            } else {
                this.vx = this.facingRight ? this.speed : -this.speed;
            }
        } else if (this.type === 'cyberRanger') {
            const safeDistance = this.rangerSafeDistance;
            if (distance < safeDistance - 28) {
                this.vx = this.facingRight ? -this.speed * 0.9 : this.speed * 0.9;
            } else if (distance > safeDistance + 48) {
                this.vx = this.facingRight ? this.speed * 0.7 : -this.speed * 0.7;
            }

            this.fireCooldown -= timeScale * deltaTime;
            if (this.fireCooldown <= 0) {
                const angle = Math.atan2(player.y - (this.y - 12), player.x - this.x);
                const projectileSpeed = 6;
                projectiles.push(new Projectile(
                    this.x,
                    this.y - 12,
                    Math.cos(angle) * projectileSpeed,
                    Math.sin(angle) * projectileSpeed,
                    this.color,
                    true,
                    7 * this.damageMultiplier
                ));
                this.fireCooldown = 120;
            }
            if (particles && Math.random() < 0.18) {
                particles.push(new Particle(
                    this.x + (this.facingRight ? -10 : 10),
                    this.y - 12,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    this.color,
                    2.5,
                    14
                ));
            }
        } else if (this.type === 'magnetUnit') {
            this.attackCooldown = Math.max(0, this.attackCooldown - timeScale * deltaTime);
            this.magneticCooldown = Math.max(0, this.magneticCooldown - timeScale * deltaTime);
            if (this.magneticChargeTimer > 0) {
                this.magneticChargeTimer = Math.max(0, this.magneticChargeTimer - timeScale * deltaTime);
                if (this.magneticChargeTimer === 0) {
                    this.magneticPulseTimer = 34;
                    this.magneticCooldown = 220;
                }
            } else if (this.magneticPulseTimer > 0) {
                this.magneticPulseTimer = Math.max(0, this.magneticPulseTimer - deltaTime);
                projectiles.forEach(projectile => {
                    if (projectile.isHostile || !projectile.active || projectile.magneticDeflectCooldown > 0 ||
                        Math.hypot(projectile.x - this.x, projectile.y - (this.y - 8)) > 78) return;
                    const angle = Math.atan2(projectile.y - this.y, projectile.x - this.x);
                    projectile.angle = angle;
                    projectile.vx = Math.cos(angle) * projectile.speed;
                    projectile.vy = Math.sin(angle) * projectile.speed;
                    projectile.guidance = null;
                    projectile.magneticDeflectCooldown = 45;
                });
            } else if (this.magneticCooldown <= 0 && distance <= 260) {
                this.magneticChargeTimer = 30;
            }
            if (distance > 54) {
                this.vx = this.facingRight ? this.speed : -this.speed;
            } else if (this.attackCooldown <= 0 && Math.abs(dy) < 48) {
                this.isAttacking = true;
                this.attackAnim = 9;
                this.attackCooldown = 42;
                if (onMeleeDamage) onMeleeDamage(6 * this.damageMultiplier);
            }
        } else if (this.type === 'assaultTrooper') {
            this.attackCooldown = Math.max(0, this.attackCooldown - timeScale * deltaTime);
            const targetInRange = distance >= 70 && distance <= 230 && Math.abs(dy) < 70;
            if (this.trooperAimTimer > 0) {
                this.trooperAimTimer = Math.max(0, this.trooperAimTimer - timeScale * deltaTime);
                this.vx = 0;
                if (this.trooperAimTimer === 0) this.trooperBurstShots = 3;
            } else if (this.trooperBurstShots > 0) {
                this.vx = 0;
                this.trooperShotTimer -= deltaTime;
                if (this.trooperShotTimer <= 0) {
                    const angle = Math.atan2(player.y - (this.y - 12), player.x - this.x) +
                        (Math.random() - 0.5) * 0.08;
                    projectiles.push(new Projectile(
                        this.x + (this.facingRight ? 12 : -12),
                        this.y - 12,
                        Math.cos(angle) * 5.3,
                        Math.sin(angle) * 5.3,
                        this.color,
                        true,
                        4 * this.damageMultiplier
                    ));
                    this.trooperBurstShots--;
                    this.trooperShotTimer = 12;
                    if (this.trooperBurstShots === 0) this.trooperBurstCooldown = 175;
                }
            } else {
                this.trooperBurstCooldown = Math.max(0, this.trooperBurstCooldown - timeScale * deltaTime);
                if (distance < 56 && Math.abs(dy) < 46) {
                    if (this.attackCooldown <= 0) {
                        this.isAttacking = true;
                        this.attackAnim = 8;
                        this.attackCooldown = 48;
                        if (onMeleeDamage) onMeleeDamage(6 * this.damageMultiplier);
                    }
                } else if (targetInRange && this.trooperBurstCooldown <= 0) {
                    this.trooperAimTarget = { x: player.x, y: player.y };
                    this.trooperAimTimer = 24;
                } else if (distance < 120) {
                    this.vx = this.facingRight ? -this.speed * 0.7 : this.speed * 0.7;
                } else if (distance > 180) {
                    this.vx = this.facingRight ? this.speed : -this.speed;
                }
            }
        } else if (this.type === 'corrosiveMutant') {
            this.acidCooldown = Math.max(0, this.acidCooldown - timeScale * deltaTime);
            if (this.acidPoolTimer > 0) {
                this.acidPoolTimer = Math.max(0, this.acidPoolTimer - deltaTime);
                this.acidPoolTickTimer -= deltaTime;
                if (this.acidPoolTickTimer <= 0) {
                    this.acidPoolTickTimer = 32;
                    if (onHazardDamage) onHazardDamage(this.acidPoolX, floorY, 58, 3.5 * this.damageMultiplier);
                }
            }
            if (this.acidTelegraphTimer > 0) {
                this.acidTelegraphTimer = Math.max(0, this.acidTelegraphTimer - timeScale * deltaTime);
                this.vx = 0;
                if (this.acidTelegraphTimer === 0) {
                    this.acidPoolX = Math.max(60, Math.min(arenaWidth - 60, this.acidPoolX));
                    this.acidPoolTimer = 132;
                    this.acidPoolTickTimer = 0;
                    this.acidCooldown = 250;
                }
            } else if (this.acidCooldown <= 0 && distance >= 105 && distance <= 260 && Math.abs(dy) < 80) {
                this.acidPoolX = player.x;
                this.acidTelegraphTimer = 36;
                this.vx = 0;
            } else if (distance > 155) {
                this.vx = this.facingRight ? this.speed : -this.speed;
            } else if (distance < 95) {
                this.vx = this.facingRight ? -this.speed * 0.65 : this.speed * 0.65;
            }
        } else if (this.type === 'dimensionalInfiltrator') {
            this.attackCooldown = Math.max(0, this.attackCooldown - timeScale * deltaTime);
            this.teleportCooldown = Math.max(0, this.teleportCooldown - timeScale * deltaTime);
            if (this.teleportWarningTimer > 0) {
                this.teleportWarningTimer = Math.max(0, this.teleportWarningTimer - timeScale * deltaTime);
                this.vx = 0;
                if (this.teleportWarningTimer === 0) {
                    this.x = Math.max(30, Math.min(arenaWidth - 30, this.teleportTargetX));
                    this.y = floorY - this.feetOffset;
                    this.vx = 0;
                    this.teleportRecoveryTimer = 24;
                    this.teleportCooldown = 220;
                }
            } else if (this.teleportRecoveryTimer > 0) {
                this.teleportRecoveryTimer = Math.max(0, this.teleportRecoveryTimer - deltaTime);
                this.vx = 0;
            } else if (this.teleportCooldown <= 0 && distance >= 90 && distance <= 280) {
                const preferredX = player.x + (this.facingRight ? 58 : -58);
                const alternateX = player.x - (this.facingRight ? 58 : -58);
                this.teleportTargetX = preferredX >= 30 && preferredX <= arenaWidth - 30
                    ? preferredX
                    : Math.max(30, Math.min(arenaWidth - 30, alternateX));
                this.teleportWarningTimer = 25;
                this.vx = 0;
            } else if (distance < 48 && Math.abs(dy) < 44) {
                if (this.attackCooldown <= 0) {
                    this.isAttacking = true;
                    this.attackAnim = 8;
                    this.attackCooldown = 45;
                    if (onMeleeDamage) onMeleeDamage(7 * this.damageMultiplier);
                }
            } else {
                this.vx = this.facingRight ? this.speed : -this.speed;
            }
        }

        this.updateProjectileEvasion(projectiles, deltaTime, arenaWidth);
        if (this.cryoSlowTimer > 0) this.vx *= 0.5;
        this.vy += 0.58 * deltaTime;
        this.x += (this.vx + this.knockbackVx * this.knockbackResistance) * deltaTime;
        this.knockbackVx *= Math.pow(0.78, deltaTime);
        this.y += this.vy * deltaTime;
        this.x = Math.max(20, Math.min(arenaWidth - 20, this.x));
        if (this.y + this.feetOffset >= floorY) {
            this.y = floorY - this.feetOffset;
            this.vy = 0;
        }
        if (this.attackAnim > 0) {
            this.attackAnim = Math.max(0, this.attackAnim - deltaTime);
            if (this.attackAnim === 0 && this.punchChargeTimer <= 0) this.isAttacking = false;
        }
        this.animFrame += (Math.abs(this.vx) > 0.1 ? 0.28 : 0.08) * deltaTime;
    }

    applyElementalStatus(status, duration, source, strength = 1) {
        const resistance = Math.max(0, Math.min(1, this.effectResistances[status] ?? 1));
        if (resistance === 0) return false;

        const adjustedDuration = duration * resistance;
        if (status === 'poison') {
            if (this.poisonTimer <= 0) this.poisonTickTimer = 15;
            this.poisonTimer = Math.max(this.poisonTimer, adjustedDuration);
            this.poisonDamage = Math.max(this.poisonDamage, strength);
        } else if (status === 'plasmaBurn') {
            if (this.plasmaBurnTimer <= 0) this.plasmaBurnTickTimer = 30;
            this.plasmaBurnTimer = Math.max(this.plasmaBurnTimer, adjustedDuration);
            this.plasmaBurnDamage = Math.max(this.plasmaBurnDamage, strength * resistance);
        } else if (status === 'armorBreak') {
            this.armorBreakTimer = Math.max(this.armorBreakTimer, adjustedDuration);
        } else if (status === 'cyberCut') {
            this.cyberCutStacks = Math.min(3, this.cyberCutStacks + 1);
            this.cyberCutTimer = Math.max(this.cyberCutTimer, adjustedDuration);
        } else if (status === 'cryoSlow') {
            this.cryoSlowTimer = Math.max(this.cryoSlowTimer, adjustedDuration);
        } else if (status === 'cryoFreeze') {
            this.cryoFreezeTimer = Math.max(this.cryoFreezeTimer, adjustedDuration);
        } else if (status === 'stun') {
            this.stunTimer = Math.max(this.stunTimer, adjustedDuration);
        } else if (status === 'electroShock') {
            this.electroShockTimer = Math.max(this.electroShockTimer, adjustedDuration);
        } else {
            throw new RangeError(`Estado elemental no válido: ${status}`);
        }
        this.lastStatusSource = source || this.lastStatusSource;
        return true;
    }

    updateStatusEffects(deltaTime = 1, particles = null) {
        let burnDamage = 0;
        const wasPoisoned = this.poisonTimer > 0;
        if (wasPoisoned) {
            this.poisonTimer = Math.max(0, this.poisonTimer - deltaTime);
            this.poisonTickTimer -= deltaTime;
            while (this.poisonTickTimer <= 0) {
                burnDamage += this.poisonDamage;
                this.poisonTickTimer += 15;
                this.lastStatusDamageColor = '#9dff32';
            }
            if (particles && Math.random() < 0.45) {
                particles.push(new Particle(
                    this.x + (Math.random() - 0.5) * this.width,
                    this.y - Math.random() * 24,
                    (Math.random() - 0.5) * 1.8,
                    -0.5 - Math.random() * 1.6,
                    '#8dff00',
                    1.5 + Math.random() * 1.5,
                    18
                ));
            }
        }
        const wasBurning = this.plasmaBurnTimer > 0;
        if (wasBurning) {
            this.plasmaBurnTimer = Math.max(0, this.plasmaBurnTimer - deltaTime);
            this.plasmaBurnTickTimer -= deltaTime;
            while (this.plasmaBurnTickTimer <= 0) {
                burnDamage += this.plasmaBurnDamage;
                this.plasmaBurnTickTimer += 30;
                this.lastStatusDamageColor = this.plasmaBurnDamage >= 4 ? '#ff45c8' : '#ff9a35';
            }
            if (particles && Math.random() < 0.35) {
                particles.push(new Particle(
                    this.x + (Math.random() - 0.5) * this.width,
                    this.y - Math.random() * 28,
                    (Math.random() - 0.5) * 2.5,
                    -1 - Math.random() * 2,
                    this.plasmaBurnDamage >= 4 ? '#ff00aa' : '#ff8a1d',
                    2 + Math.random() * 2,
                    18
                ));
            }
        }
        this.armorBreakTimer = Math.max(0, this.armorBreakTimer - deltaTime);
        this.cyberCutTimer = Math.max(0, this.cyberCutTimer - deltaTime);
        if (this.cyberCutTimer === 0) this.cyberCutStacks = 0;
        this.cryoSlowTimer = Math.max(0, this.cryoSlowTimer - deltaTime);
        this.cryoFreezeTimer = Math.max(0, this.cryoFreezeTimer - deltaTime);
        this.stunTimer = Math.max(0, this.stunTimer - deltaTime);
        this.electroShockTimer = Math.max(0, this.electroShockTimer - deltaTime);
        this.shieldFlashTimer = Math.max(0, this.shieldFlashTimer - deltaTime);
        return burnDamage;
    }

    update(player, projectiles, floorY, arenaWidth, onMeleeDamage, platforms = [], particles = null, onScreenShake = null, deltaTime = 1, onStatusDamage = null, onAreaDamage = null, onSelfDestruct = null, onHazardDamage = null) {
        if (this.isDead) return;

        this.edgeShockCooldown = Math.max(0, this.edgeShockCooldown - deltaTime);
        const burnDamage = this.updateStatusEffects(deltaTime, particles);
        if (burnDamage > 0 && onStatusDamage) onStatusDamage(burnDamage, this);
        if (this.isDead) return;
        if (this.cryoFreezeTimer > 0 || this.stunTimer > 0 || this.electroShockTimer > 0) {
            this.vx = 0;
            this.knockbackVx = 0;
            this.isAttacking = false;
            this.attackAnim = 0;
            this.shotChargeTimer = 0;
            this.shotTarget = null;
            return;
        }

        if (['cyberNinja', 'cyberBrawler', 'cyberKamikaze', 'cyberRanger', 'magnetUnit', 'assaultTrooper', 'corrosiveMutant', 'dimensionalInfiltrator'].includes(this.type)) {
            this.updateCyberBehavior(
                player,
                projectiles,
                floorY,
                arenaWidth,
                onMeleeDamage,
                onAreaDamage,
                onSelfDestruct,
                particles,
                deltaTime,
                onHazardDamage
            );
            return;
        }

        if (this.type === 'drone') {
            this.facingRight = player.x > this.x;
            this.hoverPhase += 0.045 * deltaTime;
            const desiredY = this.hoverY + Math.sin(this.hoverPhase) * 9;
            this.y += (desiredY - this.y) * Math.min(1, 0.08 * deltaTime);
            const horizontalDistance = player.x - this.x;
            const safeDistance = 190;
            if (Math.abs(horizontalDistance) < safeDistance - 25) {
                this.vx = -Math.sign(horizontalDistance || 1) * this.speed * 0.75;
            } else if (Math.abs(horizontalDistance) > safeDistance + 45) {
                this.vx = Math.sign(horizontalDistance) * this.speed * 0.55;
            } else {
                this.vx = Math.sin(this.hoverPhase * 0.65) * 0.7;
            }
            if (this.cryoSlowTimer > 0) this.vx *= 0.5;
            this.x = Math.max(25, Math.min(arenaWidth - 25, this.x + this.vx * deltaTime));
            this.fireCooldown -= deltaTime * (this.cryoSlowTimer > 0 ? 0.5 : 1);
            if (this.fireCooldown <= 0) {
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                const speed = 5.2;
                projectiles.push(new Projectile(
                    this.x, this.y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    '#ff315c', true, 7 * this.damageMultiplier
                ));
                this.fireCooldown = 2.5 * 60;
            }
            if (particles && Math.random() < 0.25) {
                particles.push(new Particle(
                    this.x + (Math.random() - 0.5) * this.width,
                    this.y + 8,
                    (Math.random() - 0.5) * 1.5,
                    1 + Math.random() * 1.5,
                    '#ff315c', 2, 14
                ));
            }
            this.animFrame += 0.12 * deltaTime;
            return;
        }

        if (this.shotChargeTimer > 0) {
            this.shotChargeTimer -= this.cryoSlowTimer > 0 ? 0.5 * deltaTime : deltaTime;
            this.vx = 0;
            if (this.shotChargeTimer === 0 && this.shotTarget) {
                const dx = this.shotTarget.x - this.x;
                const dy = this.shotTarget.y + 3 - (this.y - 12 * this.scale);
                const angle = Math.atan2(dy, dx) + this.shotSpread;
                projectiles.push(new Projectile(
                    this.x,
                    this.y - 12 * this.scale,
                    Math.cos(angle) * this.shotSpeed,
                    Math.sin(angle) * this.shotSpeed,
                    this.color,
                    true,
                    5 * this.damageMultiplier,
                    false,
                    { target: player, turnRate: this.shotTurnRate }
                ));
                this.shotTarget = null;
            }
            return;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        if (this.type === 'shield') {
            if (Math.abs(dx) > 130) {
                this.facingRight = dx > 0;
                this.shieldFacingLocked = false;
            } else if (!this.shieldFacingLocked) {
                this.facingRight = dx > 0;
                this.shieldFacingLocked = true;
            }
        } else {
            this.facingRight = dx > 0;
        }
        const dist = Math.abs(dx);
        const vertDist = Math.abs(dy);

        // =========================================================================
        // MECÁNICAS AVANZADAS DE JEFE SUPREMO
        // =========================================================================
        if (this.type === 'boss') {
            const ratio = this.hp / this.maxHp;
            const reachedPhase = ratio <= 0.3 ? 3 : ratio <= 0.65 ? 2 : 1;
            if (reachedPhase > this.phase) {
                this.phase++;
                this.phaseTransitionTimer = 42;
                this.phaseAttackChargeTimer = 0;
                this.shotChargeTimer = 0;
                this.shotTarget = null;
                this.slamState = 'idle';
                this.slamCooldown = Math.max(this.slamCooldown, 65);
                this.phaseAttackCooldown = 120;
                this.vx = 0;
                this.vy = 0;
                if (particles) {
                    for (let index = 0; index < 14; index++) {
                        const angle = (index / 14) * Math.PI * 2;
                        particles.push(new Particle(
                            this.x,
                            this.y - 10,
                            Math.cos(angle) * (3 + Math.random() * 3),
                            Math.sin(angle) * (2 + Math.random() * 3),
                            this.accentColor || this.color,
                            3 + Math.random() * 2,
                            24
                        ));
                    }
                }
                sound.playBossAlert();
            }
            if (this.phaseTransitionTimer > 0) {
                this.phaseTransitionTimer = Math.max(0, this.phaseTransitionTimer - deltaTime);
                this.vx = 0;
                this.vy = 0;
                return;
            }
            if (ratio <= 0.5 && !this.rageMode) {
                this.rageMode = true;
                this.ragePulse = 1;
            }
            if (this.rageMode) {
                this.ragePulse = (this.ragePulse + 0.08 * deltaTime) % (Math.PI * 2);
                if (particles && Math.random() < 0.8) {
                    particles.push(new Particle(
                        this.x + (Math.random() - 0.5) * this.width * 1.4,
                        this.y - Math.random() * this.height,
                        (Math.random() - 0.5) * 2.5,
                        -0.5 - Math.random() * 2,
                        Math.random() < 0.5 ? '#ff3b30' : '#ff9a24',
                        2.5 + Math.random() * 2,
                        20
                    ));
                }
            }

            const elemental = this.elementalProfile || ELEMENTAL_ATTACKS.fire;
            const projectileColor = elemental.projectileColor || this.color;
            const bossDamage = (elemental.damage || 5) * this.damageMultiplier;

            // Decaimiento del efecto visual de onda expansiva en el suelo
            if (this.shockwaveRadius > 0) {
                this.shockwaveRadius += 8.5;
                if (this.shockwaveRadius > 125) {
                    this.shockwaveRadius = 0;
                }
            }

            // -----------------------------------------------------------------
            // ATAQUE DE LLUVIA DE PLASMA QUE CAE DIRECTAMENTE AL JUGADOR
            // -----------------------------------------------------------------
            const attackTimeScale = this.cryoSlowTimer > 0 ? 0.5 : 1;
            if (this.meteorFollowupTimer > 0) {
                this.meteorFollowupTimer = Math.max(0, this.meteorFollowupTimer - deltaTime);
                if (this.meteorFollowupTimer === 0 && !this.isDead) {
                    projectiles.push(new Projectile(
                        this.meteorFollowupX, -30, 0, 10.5,
                        projectileColor, true, bossDamage, true
                    ));
                }
            }

            if (this.phaseAttackChargeTimer > 0) {
                this.phaseAttackChargeTimer = Math.max(
                    0,
                    this.phaseAttackChargeTimer - attackTimeScale * deltaTime
                );
                this.vx = 0;
                if (this.phaseAttackChargeTimer === 0) {
                    const projectileCount = this.phase === 3 ? 5 : 3;
                    if (this.element === 'fire') {
                        for (let index = 0; index < projectileCount; index++) {
                            const offset = index - (projectileCount - 1) / 2;
                            const x = Math.max(
                                24,
                                Math.min(arenaWidth - 24, this.phaseAttackTargetX + offset * 42)
                            );
                            projectiles.push(new Projectile(
                                x, -30, 0, 9.5 + this.phase * 0.35,
                                projectileColor, true, bossDamage, true
                            ));
                        }
                    } else if (this.element === 'earth') {
                        const direction = Math.sign(this.phaseAttackTargetX - this.x) || 1;
                        for (let index = 0; index < projectileCount; index++) {
                            projectiles.push(new Projectile(
                                this.x + direction * (18 + index * 4),
                                floorY - 10 - index * 13,
                                direction * (4.2 + this.phase * 0.35),
                                0,
                                projectileColor,
                                true,
                                bossDamage,
                                false
                            ));
                        }
                    } else if (this.element === 'water') {
                        const direction = Math.sign(this.phaseAttackTargetX - this.x) || 1;
                        for (let index = 0; index < projectileCount; index++) {
                            projectiles.push(new Projectile(
                                this.x + direction * 20,
                                floorY - 10 - index * 20,
                                direction * (4.3 + this.phase * 0.35),
                                0,
                                projectileColor,
                                true,
                                bossDamage,
                                false
                            ));
                        }
                    } else {
                        const baseAngle = Math.atan2(
                            this.phaseAttackTargetY - (this.y - 12 * this.scale),
                            this.phaseAttackTargetX - this.x
                        );
                        const spread = 0.24;
                        const speed = 7.2;
                        for (let index = 0; index < projectileCount; index++) {
                            const offset = index - (projectileCount - 1) / 2;
                            const angle = baseAngle + offset * spread;
                            projectiles.push(new Projectile(
                                this.x,
                                this.y - 12 * this.scale,
                                Math.cos(angle) * speed,
                                Math.sin(angle) * speed,
                                projectileColor,
                                true,
                                bossDamage,
                                false
                            ));
                        }
                    }
                    this.phaseAttackCooldown = this.phase === 3 ? 210 : 260;
                }
                return;
            }

            this.phaseAttackCooldown = Math.max(
                0,
                this.phaseAttackCooldown - attackTimeScale * deltaTime
            );
            if (this.phase >= 2 && this.phaseAttackCooldown <= 0 && this.slamState === 'idle') {
                this.phaseAttackTargetX = player.x;
                this.phaseAttackTargetY = player.y;
                this.phaseAttackChargeTimer = this.element === 'earth' ? 34 : 28;
                this.vx = 0;
                sound.playBossAlert();
                return;
            }

            if (this.meteorCooldown > 0) {
                this.meteorCooldown -= attackTimeScale * deltaTime * (this.rageMode ? 1.5 : 1);
            }
            if (this.meteorCooldown <= 0 && this.slamState === 'idle') {
                this.meteorCooldown = 120;
                sound.playBossAlert();

                // Proyectil que cae verticalmente desde el cielo apuntado al jugador
                const mX = player.x + (Math.random() - 0.5) * 30;
                projectiles.push(new Projectile(mX, -30, (Math.random() - 0.5) * 1.5, 10, projectileColor, true, bossDamage, true));

                if (this.rageMode) {
                    this.meteorFollowupTimer = 18;
                    this.meteorFollowupX = Math.max(24, Math.min(arenaWidth - 24, player.x));
                }
            }

            // -----------------------------------------------------------------
            // ATAQUE DE SALTO Y CAÍDA DIRECTA DEL JEFE SOBRE EL JUGADOR (BOSS SLAM)
            // -----------------------------------------------------------------
            if (this.slamCooldown > 0) {
                this.slamCooldown -= attackTimeScale * deltaTime * (this.rageMode ? 2 : 1);
            }

            // Si el jugador está subido en una plataforma alta, el jefe prepara su caída de inmediato
            if (player.y < this.y - 65 && this.slamCooldown > 20 && this.slamState === 'idle') {
                this.slamCooldown = 18;
            }

            // Iniciar ataque de caída directa
            if (this.slamCooldown <= 0 && this.slamState === 'idle') {
                this.slamState = 'charge';
                this.slamTimer = 16; // Carga telegrafiada rápida
                this.slamTargetX = player.x;
                this.slamTargetY = player.y;
                this.vx = 0;
                sound.playBossCharge();
            }

            // 1. FASE DE CARGA TELEGRAFIADA (Retícula en la posición del jugador)
            if (this.slamState === 'charge') {
                this.slamTimer -= attackTimeScale * deltaTime;
                this.vx = 0;
                this.slamTargetX = player.x;
                this.slamTargetY = player.y;

                if (particles && Math.random() < 0.7) {
                    particles.push(new Particle(
                        this.x + (Math.random() - 0.5) * 40,
                        this.y + this.feetOffset,
                        (Math.random() - 0.5) * 4, -Math.random() * 6,
                        '#ff0055', 3.5, 18
                    ));
                }

                if (this.slamTimer <= 0) {
                    this.slamState = 'rising';
                    this.vy = -19 * attackTimeScale; // Gran impulso vertical ascendente
                    sound.playJump();
                }
                return;
            }

            // 2. FASE ASCENDENTE (Vuela hacia la posición vertical del jugador)
            if (this.slamState === 'rising') {
                const targetDx = this.slamTargetX - this.x;
                this.vx = targetDx * 0.16;

                if (particles && Math.random() < 0.5) {
                    particles.push(new Particle(this.x, this.y + 40, (Math.random() - 0.5) * 3, 4, '#ff00aa', 4, 16));
                }

                // Cúspide del salto o salida superior de pantalla
                if (this.vy >= -1 || this.y < 80) {
                    this.slamState = 'falling';
                    this.slamTargetX = player.x; // Bloquea la coordenada exacta del jugador
                    this.slamTargetY = player.y;
                    this.x = this.slamTargetX; // Cae directamente alineado al jugador
                    this.vx = 0;
                    this.vy = 25; // Caída meteórica súper veloz
                }
            }

            // 3. FASE DE CAÍDA DIRECTA EN PICADA SOBRE EL JUGADOR
            if (this.slamState === 'falling') {
                this.vx = 0;
                this.vy = 25 * attackTimeScale;

                if (particles) {
                    for (let p = 0; p < 2; p++) {
                        particles.push(new Particle(
                            this.x + (Math.random() - 0.5) * 28,
                            this.y - 25,
                            (Math.random() - 0.5) * 2, -5,
                            '#ff0055', 4.5, 14
                        ));
                    }
                }

                // Aterriza en el suelo base alineado con exactitud
                let landed = false;
                if (this.y + this.feetOffset >= floorY) {
                    this.y = floorY - this.feetOffset;
                    this.vy = 0;
                    landed = true;
                }

                if (landed) {
                    // ¡IMPACTO CONTUNDENTE DIRECTO TRAS LA CAÍDA EN SUELO BASE!
                    this.slamState = 'recovery';
                    this.slamTimer = 12;
                    this.slamCooldown = 85;
                    this.shockwaveRadius = 15;
                    sound.playBossSlam();
                    if (onScreenShake) onScreenShake(20);

                    if (particles) {
                        for (let k = 0; k < 26; k++) {
                            const pAng = (k / 26) * Math.PI * 2;
                            particles.push(new Particle(
                                this.x, floorY - 2,
                                Math.cos(pAng) * (5 + Math.random() * 8),
                                Math.sin(pAng) * (2 + Math.random() * 5) - 3,
                                '#ff0055', 4, 30
                            ));
                        }
                    }

                    // DAÑO POR CAÍDA DIRECTA:
                    // Si el jugador no esquivó a tiempo y está en la zona de choque
                    const hitX = Math.abs(player.x - this.x) < 90;
                    const hitY = Math.abs(player.y - this.y) < 60;
                    if (hitX && hitY && onMeleeDamage) {
                        onMeleeDamage(5 * this.damageMultiplier);
                    }
                    return;
                }
            }

            // 4. FASE DE RECUPERACIÓN TRAS EL IMPACTO
            if (this.slamState === 'recovery') {
                this.slamTimer -= attackTimeScale * deltaTime;
                this.vx = 0;
                if (this.slamTimer <= 0) {
                    this.slamState = 'idle';
                }
                return;
            }
        }

        // =========================================================================
        // MOVIMIENTO Y ATAQUE VELOZ DE ENEMIGOS
        // =========================================================================
        const movementSpeed = this.speed *
            (this.cryoSlowTimer > 0 ? 0.5 : 1) *
            (this.type === 'boss' && this.rageMode ? 1.3 : 1);
        const attackRange = (this.type === 'boss') ? 80 : (this.type === 'special' ? 240 : 46);

        // Si el jugador está en una plataforma alta fuera del alcance vertical de cuerpo a cuerpo
        const playerOutOfVerticalReach = vertDist > 55 && this.type !== 'special' && this.type !== 'boss';

        if (dist > attackRange || playerOutOfVerticalReach) {
            if (playerOutOfVerticalReach && dist < 50) {
                // Merodear bajo la plataforma sin congelarse en el suelo base
                this.vx = Math.sin(this.animFrame * 0.6) * movementSpeed;
            } else {
                this.vx = this.facingRight ? movementSpeed : -movementSpeed;
            }
        } else {
            this.vx = 0;

            // Lógica de ataque con VELOCIDAD INCREMENTADA
            if (this.attackCooldown <= 0) {
                if (this.type === 'special' || (this.type === 'boss' && Math.random() < 0.45)) {
                    if (this.type !== 'boss' || this.slamState === 'idle') {
                        const bossShot = this.type === 'boss';
                        const speeds = bossShot ? [5.2, 6.1, 7] : [4.2, 5.1, 6];
                        const turnRates = bossShot ? [0.035, 0.05, 0.065] : [0.05, 0.07, 0.09];
                        const spreads = bossShot ? [-0.12, 0, 0.12] : [-0.24, 0, 0.24];
                        const variant = Math.floor(Math.random() * speeds.length);

                        this.shotChargeTimer = bossShot ? 22 : 30;
                        this.shotTarget = { x: player.x, y: player.y };
                        this.shotSpeed = speeds[variant];
                        this.shotTurnRate = turnRates[variant];
                        this.shotSpread = spreads[Math.floor(Math.random() * spreads.length)];
                        this.attackCooldown = bossShot
                            ? (this.rageMode ? 44 : 88)
                            : 96;
                    }
                } else {
                    // Ataque cuerpo a cuerpo rápido y contundente
                    this.isAttacking = true;
                    this.attackAnim = this.type === 'fast' ? 7 : (this.type === 'heavy' ? 11 : 9);
                    // Cooldowns reducidos a la mitad para mayor velocidad de ataque
                    this.attackCooldown = this.type === 'fast' ? 20 : (this.type === 'heavy' ? 38 :
                        (this.type === 'boss' ? (this.rageMode ? 12 : 24) : 28));

                    // =========================================================================
                    // CORRECCIÓN DEFINITIVA DE DAÑO FALSO EN PLATAFORMAS:
                    // Verificación estricta de distancia horizontal Y VERTICAL.
                    // Si el jugador está sobre una plataforma elevada, vertDist superará
                    // el alcance del golpe y no recibirá ningún daño falso.
                    // =========================================================================
                    const maxMeleeX = this.type === 'boss' ? 80 : 50;
                    const maxMeleeY = this.type === 'boss' ? 65 : 40;

                    if (onMeleeDamage && dist < maxMeleeX && vertDist < maxMeleeY) {
                        onMeleeDamage(5 * this.damageMultiplier);
                    }
                }
            }
        }

        if (this.attackCooldown > 0) {
            this.attackCooldown = Math.max(
                0,
                this.attackCooldown - (this.cryoSlowTimer > 0 ? 0.5 : 1) * deltaTime
            );
        }
        if (this.attackAnim > 0) {
            this.attackAnim--;
            if (this.attackAnim <= 0) this.isAttacking = false;
        }

        // Gravedad y posición
        this.vy += 0.58 * deltaTime;
        this.x += (this.vx + this.knockbackVx * this.knockbackResistance) * deltaTime;
        this.knockbackVx *= Math.pow(0.78, deltaTime);
        this.y += this.vy * deltaTime;

        // Límites de pantalla
        const margin = 20;
        if (this.x < margin) this.x = margin;
        if (this.x > arenaWidth - margin) this.x = arenaWidth - margin;

        // =========================================================================
        // SUELO BASE PRINCIPAL: Todos los enemigos y jefes se alinean perfectamente
        // al suelo base, eliminando cualquier espacio de flotación o anclaje no deseado.
        // =========================================================================
        if (this.y + this.feetOffset >= floorY) {
            this.y = floorY - this.feetOffset;
            this.vy = 0;
        }

        this.animFrame += 0.20 * deltaTime;
    }

    draw(ctx) {
        if (this.isDead) return;

        if (this.type === 'drone') {
            ctx.save();
            ctx.translate(this.x, this.y);
            const pulse = 0.75 + Math.sin(this.animFrame * 2) * 0.25;
            ctx.shadowColor = '#ff315c';
            ctx.shadowBlur = 18;
            ctx.fillStyle = '#26334d';
            ctx.strokeStyle = '#a9c4e8';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(-17, -9, 34, 18, 6);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ff315c';
            ctx.shadowColor = '#ff1744';
            ctx.shadowBlur = 22 * pulse;
            ctx.beginPath();
            ctx.ellipse(this.facingRight ? 8 : -8, 0, 5, 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#83dfff';
            ctx.lineWidth = 2;
            [-12, 12].forEach((x, index) => {
                const rotor = Math.sin(this.animFrame * 2.5 + index) * 7;
                ctx.beginPath();
                ctx.moveTo(x, -7);
                ctx.lineTo(x + rotor, -14);
                ctx.moveTo(x - 6 + rotor, -14);
                ctx.lineTo(x + 6 + rotor, -14);
                ctx.stroke();
            });
            ctx.restore();
            return;
        }

        if (this.evadeTimer > 0) {
            const evadeColor = this.type === 'cyberNinja' ? '#ff00aa' : '#39ff88';
            ctx.save();
            ctx.globalAlpha = 0.45 + this.evadeTimer * 0.05;
            ctx.strokeStyle = evadeColor;
            ctx.shadowColor = evadeColor;
            ctx.shadowBlur = 16;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.ellipse(
                this.x - this.evadeDirection * 14,
                this.y + this.feetOffset - 8,
                this.width * 0.65,
                Math.max(5, this.feetOffset * 0.25),
                0,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.font = "900 10px 'Orbitron', sans-serif";
            ctx.textAlign = 'center';
            ctx.fillText('¡ESQUIVA!', this.x, this.y - this.height - 5);
            ctx.restore();
        }

        if (this.shotChargeTimer > 0 && this.shotTarget) {
            const pulse = 0.55 + Math.sin(this.shotChargeTimer * 0.55) * 0.2;
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = pulse;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 18;
            ctx.setLineDash([7, 7]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - 12 * this.scale);
            ctx.lineTo(this.shotTarget.x, this.shotTarget.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(this.shotTarget.x, this.shotTarget.y, 13 + Math.sin(this.shotChargeTimer) * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.font = "900 11px 'Orbitron', sans-serif";
            ctx.textAlign = 'center';
            ctx.fillText('¡ESQUIVA!', this.shotTarget.x, this.shotTarget.y - 20);
            ctx.restore();
        }

        // 1. Dibujar retícula de impacto y advertencia en el suelo/plataforma en coordenadas de mundo
        if (this.type === 'boss' && (this.slamState === 'charge' || this.slamState === 'falling')) {
            ctx.save();
            ctx.strokeStyle = '#ff0055';
            ctx.fillStyle = 'rgba(255, 0, 85, 0.22)';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 16;
            ctx.lineWidth = 2.5;

            const targetY = this.slamTargetY ? this.slamTargetY + 30 : this.y;

            ctx.beginPath();
            ctx.ellipse(this.slamTargetX, targetY, 44, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Cruz de mira láser
            ctx.beginPath();
            ctx.moveTo(this.slamTargetX - 25, targetY);
            ctx.lineTo(this.slamTargetX + 25, targetY);
            ctx.moveTo(this.slamTargetX, targetY - 12);
            ctx.lineTo(this.slamTargetX, targetY + 12);
            ctx.stroke();

            // Texto de advertencia parpadeante
            ctx.font = "900 13px 'Orbitron', sans-serif";
            ctx.fillStyle = '#ff0055';
            ctx.textAlign = 'center';
            ctx.fillText("⚠ IMPACTO ⚠", this.slamTargetX, targetY - 20);
            ctx.restore();
        }

        // 2. Onda expansiva tras el impacto en el suelo base
        if (this.type === 'boss' && this.shockwaveRadius > 0) {
            ctx.save();
            const alpha = Math.max(0, 1 - (this.shockwaveRadius / 125));
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#ff0055';
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 18;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + this.feetOffset, this.shockwaveRadius, this.shockwaveRadius * 0.35, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'boss' && this.phaseAttackChargeTimer > 0) {
            ctx.save();
            const elemental = this.elementalProfile || ELEMENTAL_ATTACKS.fire;
            const warningColor = elemental.projectileColor || this.accentColor || this.color;
            const pulse = 0.55 + Math.sin(this.phaseAttackChargeTimer * 0.7) * 0.25;
            ctx.strokeStyle = warningColor;
            ctx.fillStyle = warningColor;
            ctx.shadowColor = warningColor;
            ctx.shadowBlur = 16;
            ctx.globalAlpha = pulse;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 5]);
            if (this.element === 'fire') {
                const count = this.phase === 3 ? 5 : 3;
                for (let index = 0; index < count; index++) {
                    const offset = index - (count - 1) / 2;
                    const x = this.phaseAttackTargetX + offset * 42;
                    ctx.beginPath();
                    ctx.ellipse(x, this.y + this.feetOffset, 18, 8, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
            } else if (this.element === 'earth' || this.element === 'water') {
                const count = this.phase === 3 ? 5 : 3;
                const direction = Math.sign(this.phaseAttackTargetX - this.x) || 1;
                ctx.beginPath();
                for (let index = 0; index < count; index++) {
                    const laneY = this.y + this.feetOffset - 10 - index * (this.element === 'water' ? 20 : 13);
                    ctx.moveTo(this.x, laneY);
                    ctx.lineTo(this.phaseAttackTargetX + direction * 18, laneY);
                }
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - 12 * this.scale);
                ctx.lineTo(this.phaseAttackTargetX, this.phaseAttackTargetY);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(this.phaseAttackTargetX, this.phaseAttackTargetY, 20, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.setLineDash([]);
            ctx.font = "900 11px 'Orbitron', sans-serif";
            ctx.textAlign = 'center';
            const warningText = this.element === 'fire' ? 'LLUVIA DE FUEGO'
                : this.element === 'air' ? 'RÁFAGA DE VIENTO'
                    : this.element === 'earth' ? 'ONDA SÍSMICA'
                        : 'OLEADA DE AGUA';
            ctx.fillText(warningText, this.phaseAttackTargetX, this.y + this.feetOffset - 20);
            ctx.restore();
        }

        if (this.type === 'boss' && this.phaseTransitionTimer > 0) {
            ctx.save();
            const alpha = 0.35 + Math.sin(this.phaseTransitionTimer * 0.6) * 0.2;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = this.accentColor || this.color;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 26;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y - 8, 42 + (42 - this.phaseTransitionTimer) * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'magnetUnit' && (this.magneticChargeTimer > 0 || this.magneticPulseTimer > 0)) {
            ctx.save();
            ctx.strokeStyle = this.magneticChargeTimer > 0 ? '#ffffff' : '#4bdcff';
            ctx.shadowColor = '#4bdcff';
            ctx.shadowBlur = 18;
            ctx.globalAlpha = this.magneticChargeTimer > 0 ? 0.45 : 0.8;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y - 8, 78, 42, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'corrosiveMutant' && (this.acidTelegraphTimer > 0 || this.acidPoolTimer > 0)) {
            ctx.save();
            const warning = this.acidTelegraphTimer > 0;
            const pulse = 0.65 + Math.sin(Date.now() / 100) * 0.2;
            ctx.strokeStyle = warning ? '#fff06a' : '#b8ff38';
            ctx.fillStyle = warning ? 'rgba(255, 240, 106, 0.14)' : 'rgba(184, 255, 56, 0.24)';
            ctx.shadowColor = warning ? '#fff06a' : '#8dff00';
            ctx.shadowBlur = 15;
            ctx.globalAlpha = warning ? pulse : 0.85;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(this.acidPoolX, this.y + this.feetOffset, 58, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            if (warning) {
                ctx.font = "900 11px 'Orbitron', sans-serif";
                ctx.textAlign = 'center';
                ctx.fillText('¡ÁCIDO!', this.acidPoolX, this.y + this.feetOffset - 17);
            }
            ctx.restore();
        }

        if (this.type === 'dimensionalInfiltrator' && this.teleportWarningTimer > 0) {
            ctx.save();
            ctx.strokeStyle = '#e8b8ff';
            ctx.fillStyle = 'rgba(193, 132, 255, 0.16)';
            ctx.shadowColor = '#c184ff';
            ctx.shadowBlur = 18;
            ctx.globalAlpha = 0.55 + Math.sin(Date.now() / 65) * 0.3;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(this.teleportTargetX, this.y + this.feetOffset, 22, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.font = "900 10px 'Orbitron', sans-serif";
            ctx.textAlign = 'center';
            ctx.fillText('¡SALTO!', this.teleportTargetX, this.y + this.feetOffset - 14);
            ctx.restore();
        }

        if (this.type === 'cyberBrawler' && this.punchChargeTimer > 0 && this.punchTarget) {
            ctx.save();
            ctx.strokeStyle = '#fff06a';
            ctx.fillStyle = 'rgba(255, 174, 0, 0.18)';
            ctx.shadowColor = '#ffae00';
            ctx.shadowBlur = 18;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([6, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - 12);
            ctx.lineTo(this.punchTarget.x, this.punchTarget.y - 12);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.ellipse(this.punchTarget.x, this.punchTarget.y + 8, 36, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'cyberKamikaze' && this.detonationStarted) {
            const flashColor = Math.floor(this.detonationTimer / 5) % 2 === 0 ? '#ffffff' : '#ff2638';
            ctx.save();
            ctx.strokeStyle = flashColor;
            ctx.fillStyle = 'rgba(255, 38, 56, 0.12)';
            ctx.shadowColor = flashColor;
            ctx.shadowBlur = 22;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + this.feetOffset, 80, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.font = "900 12px 'Orbitron', sans-serif";
            ctx.textAlign = 'center';
            ctx.fillText('¡DETONACIÓN!', this.x, this.y - 40);
            ctx.restore();
        }

        // 3. Dibujo de la figura del enemigo perfectamente alineada a sus pies
        ctx.save();
        ctx.translate(this.x, this.y);

        const dir = this.facingRight ? 1 : -1;
        const statusColor = this.type === 'boss' && this.phaseTransitionTimer > 0
            ? (this.accentColor || this.color)
            : this.type === 'boss' && this.rageMode
            ? (0.5 + Math.sin(this.ragePulse) * 0.5 > 0.5 ? '#ff321f' : '#ff9b24')
            : this.cryoFreezeTimer > 0 || this.cryoSlowTimer > 0
            ? '#7ceeff'
            : this.electroShockTimer > 0 ? '#e8ff4a'
            : this.poisonTimer > 0 ? '#8dff00'
            : this.plasmaBurnTimer > 0 && Math.floor(this.plasmaBurnTimer / 4) % 2 === 0
                ? (this.plasmaBurnDamage >= 4 ? '#ff35c9' : '#ff8a1d')
                : this.armorBreakTimer > 0 ? '#ff5c9a'
                : this.type === 'boss' && this.phase === 3 ? '#ff0033' : this.color;
        const c = this.type === 'cyberKamikaze' && this.detonationStarted
            ? (Math.floor(this.detonationTimer / 5) % 2 === 0 ? '#ffffff' : '#ff2638')
            : statusColor;

        if (this.type === 'cyberNinja' && this.ninjaDashTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#ff00aa';
            ctx.shadowColor = '#ff00aa';
            ctx.shadowBlur = 20;
            ctx.lineWidth = 4;
            [-17, -9].forEach(offset => {
                ctx.beginPath();
                ctx.ellipse(offset * (this.ninjaDashDirection || 1), -8, 14, 25, 0, 0, Math.PI * 2);
                ctx.stroke();
            });
            ctx.restore();
        }

        if (this.type === 'boss' && this.rageMode) {
            ctx.save();
            const pulseRadius = 32 + (0.5 + Math.sin(this.ragePulse) * 0.5) * 24;
            ctx.globalAlpha = 0.25;
            ctx.strokeStyle = '#ff4b24';
            ctx.shadowColor = '#ff321f';
            ctx.shadowBlur = 24;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(0, -10, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'cyberBrawler' && this.punchChargeTimer > 0) {
            ctx.save();
            const pulse = 0.2 + (0.5 + Math.sin(this.punchChargeTimer * 0.65) * 0.5) * 0.25;
            ctx.fillStyle = `rgba(255, 174, 0, ${pulse})`;
            ctx.strokeStyle = '#fff06a';
            ctx.shadowColor = '#ffae00';
            ctx.shadowBlur = 22;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, -8, 27, 34, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        if (this.plasmaBurnTimer > 0 || this.poisonTimer > 0 || this.cryoSlowTimer > 0 ||
            this.cryoFreezeTimer > 0 || this.electroShockTimer > 0 || this.armorBreakTimer > 0) {
            ctx.save();
            ctx.globalAlpha = this.cryoFreezeTimer > 0 ? 0.42 : 0.24;
            ctx.fillStyle = this.cryoFreezeTimer > 0 || this.cryoSlowTimer > 0
                ? '#49dfff'
                : this.electroShockTimer > 0 ? '#dfff43'
                : this.poisonTimer > 0 ? '#8dff00'
                : this.plasmaBurnDamage >= 4 ? '#ff00aa'
                : this.armorBreakTimer > 0 ? '#ff5c9a'
                : '#ff8a1d';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 22;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.width * 0.75, this.height * 0.72, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        if (this.cryoSlowTimer > 0 || this.cryoFreezeTimer > 0) {
            ctx.save();
            ctx.strokeStyle = '#a7f6ff';
            ctx.fillStyle = 'rgba(124, 238, 255, 0.55)';
            ctx.shadowColor = '#7ceeff';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 1.5;
            for (let index = 0; index < 5; index++) {
                const angle = Date.now() / 500 + index * Math.PI * 2 / 5;
                const crystalX = Math.cos(angle) * (this.width * 0.68);
                const crystalY = -12 + Math.sin(angle) * 14;
                ctx.beginPath();
                ctx.moveTo(crystalX, crystalY - 5);
                ctx.lineTo(crystalX + 3, crystalY);
                ctx.lineTo(crystalX, crystalY + 5);
                ctx.lineTo(crystalX - 3, crystalY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }
        if (this.cyberCutStacks > 0) {
            ctx.save();
            ctx.fillStyle = '#50cfff';
            ctx.shadowColor = '#168dff';
            ctx.shadowBlur = 14;
            for (let index = 0; index < this.cyberCutStacks; index++) {
                ctx.beginPath();
                ctx.arc(-6 + index * 6, -this.height * 0.66, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.strokeStyle = c;
        ctx.shadowColor = c;
        ctx.shadowBlur = this.type === 'boss' ? (this.slamState === 'charge' ? 32 : 22) : 12;
        ctx.lineWidth = this.type === 'heavy' || this.type === 'boss' ? 5 : 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const scale = this.scale || (this.type === 'boss' ? 1.6 : (this.type === 'heavy' ? 1.25 : (this.type === 'fast' ? 0.9 : 1.0)));
        const legAngle = Math.sin(this.animFrame) * 0.45;

        // Aura de furia o carga del Jefe
        if (this.type === 'boss' && (this.phase === 3 || this.slamState === 'charge')) {
            ctx.fillStyle = this.slamState === 'charge' ? 'rgba(255, 0, 85, 0.35)' : 'rgba(255, 0, 50, 0.2)';
            ctx.beginPath();
            ctx.arc(0, 0, 65, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.stunTimer > 0 || this.electroShockTimer > 0) {
            const orbit = Date.now() / 180;
            ctx.save();
            ctx.strokeStyle = this.electroShockTimer > 0 ? '#e8ff4a' : '#ff57f2';
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 14;
            ctx.lineWidth = 2;
            for (let index = 0; index < 3; index++) {
                const angle = orbit + index * Math.PI * 2 / 3;
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * 12, -this.height * 0.68 + Math.sin(angle) * 4, 3, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Pose de caída meteórica
        const isDiving = this.type === 'boss' && this.slamState === 'falling';

        // Cabeza
        ctx.beginPath();
        ctx.arc(0, isDiving ? -12 * scale : -20 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Ojo amenazante
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(3 * scale * dir, isDiving ? -12 * scale : -20 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Torso
        ctx.beginPath();
        ctx.moveTo(0, isDiving ? -4 * scale : -12 * scale);
        ctx.lineTo(0, isDiving ? 16 * scale : 10 * scale);
        ctx.stroke();

        // Piernas (Las puntas de los pies tocan exactamente 25 * scale)
        ctx.beginPath();
        if (isDiving) {
            // Piernas replegadas hacia atrás en pose de caída aerodinámica
            ctx.moveTo(0, 16 * scale);
            ctx.lineTo(-6 * scale * dir, 6 * scale);
            ctx.moveTo(0, 16 * scale);
            ctx.lineTo(6 * scale * dir, 6 * scale);
        } else {
            ctx.moveTo(0, 10 * scale);
            ctx.lineTo(-Math.sin(legAngle) * 15 * scale * dir, 25 * scale);
            ctx.moveTo(0, 10 * scale);
            ctx.lineTo(Math.sin(legAngle) * 15 * scale * dir, 25 * scale);
        }
        ctx.stroke();

        // Brazos y arma / ataque
        ctx.beginPath();
        if (isDiving) {
            // Brazos apuntando directamente hacia abajo
            ctx.moveTo(0, 0);
            ctx.lineTo(-10 * scale * dir, 25 * scale);
            ctx.moveTo(0, 0);
            ctx.lineTo(10 * scale * dir, 25 * scale);
        } else {
            ctx.moveTo(0, -8 * scale);
            const armReach = (this.isAttacking ? 22 : 13) * scale;
            ctx.lineTo(armReach * dir, (this.isAttacking ? -3 : 2) * scale);
        }
        ctx.stroke();

        if (this.type === 'cyberRanger') {
            ctx.save();
            ctx.strokeStyle = '#c5ffd9';
            ctx.shadowColor = '#39ff88';
            ctx.shadowBlur = 15;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(7 * dir * scale, -4 * scale);
            ctx.lineTo(22 * dir * scale, -7 * scale);
            ctx.lineTo(29 * dir * scale, -7 * scale);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'assaultTrooper') {
            ctx.save();
            ctx.strokeStyle = this.trooperAimTimer > 0 ? '#ffffff' : '#d5ffae';
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 13;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(7 * dir * scale, -4 * scale);
            ctx.lineTo(22 * dir * scale, -8 * scale);
            ctx.lineTo(30 * dir * scale, -8 * scale);
            ctx.stroke();
            if (this.trooperAimTimer > 0 && this.trooperAimTarget) {
                ctx.globalAlpha = 0.65;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(0, -12 * scale);
                ctx.lineTo(this.trooperAimTarget.x - this.x, this.trooperAimTarget.y - this.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            ctx.restore();
        }

        if (this.type === 'magnetUnit') {
            ctx.save();
            ctx.strokeStyle = '#a6f5ff';
            ctx.shadowColor = '#4bdcff';
            ctx.shadowBlur = 14;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(-12 * scale, -8 * scale, 7 * scale, -Math.PI / 2, Math.PI / 2);
            ctx.arc(12 * scale, -8 * scale, 7 * scale, Math.PI / 2, Math.PI * 1.5);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'corrosiveMutant') {
            ctx.save();
            ctx.strokeStyle = '#e1ff75';
            ctx.shadowColor = '#8dff00';
            ctx.shadowBlur = 12;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-10 * scale, -14 * scale);
            ctx.lineTo(-15 * scale, -22 * scale);
            ctx.moveTo(9 * scale, -15 * scale);
            ctx.lineTo(16 * scale, -21 * scale);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'dimensionalInfiltrator' && this.teleportRecoveryTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.35 + Math.sin(Date.now() / 45) * 0.2;
            ctx.strokeStyle = '#e8b8ff';
            ctx.shadowColor = '#c184ff';
            ctx.shadowBlur = 15;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, -8, 17, 29, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        if (this.type === 'shield') {
            const shieldX = dir * 17 * scale;
            ctx.save();
            ctx.fillStyle = this.shieldFlashTimer > 0
                ? `rgba(255,255,255,${0.35 + Math.sin(Date.now() / 20) * 0.25})`
                : 'rgba(48, 223, 255, 0.24)';
            ctx.strokeStyle = this.shieldFlashTimer > 0 ? '#ffffff' : '#39e9ff';
            ctx.shadowColor = '#30dfff';
            ctx.shadowBlur = this.shieldFlashTimer > 0 ? 28 : 16;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(shieldX, -20 * scale);
            ctx.lineTo(shieldX + dir * 10 * scale, -16 * scale);
            ctx.lineTo(shieldX + dir * 10 * scale, 12 * scale);
            ctx.lineTo(shieldX, 19 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // Barra de vida superior para Boss
        if (this.type === 'boss') {
            ctx.restore();
            ctx.save();
            const bWidth = 140;
            const bHeight = 8;
            const barX = this.x - bWidth / 2;
            const barY = this.y - 30 * scale - 24;

            ctx.font = "900 9px 'Orbitron', sans-serif";
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(this.name || 'JEFE', this.x, barY - 5);

            ctx.fillStyle = 'rgba(5, 5, 15, 0.85)';
            ctx.fillRect(barX, barY, bWidth, bHeight);

            ctx.fillStyle = c;
            ctx.shadowColor = c;
            ctx.shadowBlur = 10;
            ctx.fillRect(barX, barY, Math.max(0, (this.hp / this.maxHp)) * bWidth, bHeight);

            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, bWidth, bHeight);
            ctx.strokeStyle = 'rgba(255,255,255,0.85)';
            [0.35, 0.7].forEach(position => {
                const markerX = barX + bWidth * position;
                ctx.beginPath();
                ctx.moveTo(markerX, barY - 2);
                ctx.lineTo(markerX, barY + bHeight + 2);
                ctx.stroke();
            });

            ctx.font = "800 8px 'Orbitron', sans-serif";
            ctx.fillStyle = this.accentColor || '#ffffff';
            const phaseLabel = ['FASE I', 'FASE II', 'FASE III'][Math.max(0, this.phase - 1)];
            ctx.fillText(phaseLabel, this.x, barY + bHeight + 10);
        }

        ctx.restore();
    }
}

class DroneEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'drone');
    }
}

class ShieldEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 'shield');
    }
}

class CyberNinja extends Enemy {
    constructor(x, y) {
        super(x, y, 'cyberNinja');
    }
}

class CyberBrawler extends Enemy {
    constructor(x, y) {
        super(x, y, 'cyberBrawler');
    }
}

class CyberKamikaze extends Enemy {
    constructor(x, y) {
        super(x, y, 'cyberKamikaze');
    }
}

class CyberRanger extends Enemy {
    constructor(x, y) {
        super(x, y, 'cyberRanger');
    }
}
