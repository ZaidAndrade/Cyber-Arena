/**
 * ==========================================================================
 * NEON STICK: CYBER ARENA - ENTIDADES, JUGADOR, ENEMIGOS Y ARMAS
 * ==========================================================================
 */

const GAME_UNIT_SPEED = 5.0;
const PLAYER_DASH_SPEED = 25;
const PLAYER_DASH_DURATION = 15;

// El arsenal original conserva sus IDs y estadísticas; la expansión usa IDs propios.
const WEAPONS = {
    dagger: {
        id: 'dagger', name: 'DAGGER NEON', price: 750,
        damageMult: 0.85, reachMult: 0.75, speed: 1.45,
        kind: 'melee', damage: 15 * 0.85, reach: 44 * 0.75,
        cooldown: Math.round(22 / 1.45), windup: 4, activeFrames: 8, recovery: 4,
        impactRadius: 52 * 0.75, color: '#00ffcc',
        elementalEffect: 'virus',
        effectLabel: 'Virus Neón',
        desc: 'Súper rápida, bajo consumo y velocidad de ráfaga.'
    },
    sword: {
        id: 'sword', name: 'NEON SWORD', price: 1500,
        damageMult: 1.5, reachMult: 1.35, speed: 1.0,
        kind: 'melee', damage: 15 * 1.5, reach: 44 * 1.35,
        cooldown: Math.round(22 / 1.0), windup: 5, activeFrames: 10, recovery: 5,
        impactRadius: 52 * 1.35, color: '#00f3ff',
        elementalEffect: 'plasma',
        effectLabel: 'Quemadura de Plasma',
        desc: '+50% Daño, +35% Alcance, hoja de plasma equilibrada.'
    },
    plasma: {
        id: 'plasma', name: 'PLASMA BLADE', price: 3000,
        damageMult: 2.2, reachMult: 1.6, speed: 1.1,
        kind: 'melee', damage: 15 * 2.2, reach: 44 * 1.6,
        cooldown: Math.round(22 / 1.1), windup: 5, activeFrames: 9, recovery: 4,
        impactRadius: 52 * 1.6, color: '#ff00aa',
        elementalEffect: 'plasmaDevastating',
        effectLabel: 'Plasma Incandescente + Armadura -15%',
        desc: 'Daño devastador con ráfagas y estela de partículas.'
    },
    hammer: {
        id: 'hammer', name: 'VOID HAMMER', price: 5000,
        damageMult: 3.5, reachMult: 1.85, speed: 0.65,
        kind: 'melee', damage: 15 * 3.5, reach: 44 * 1.85,
        cooldown: Math.round(22 / 0.65), windup: 9, activeFrames: 11, recovery: 14,
        impactRadius: 52 * 1.85, color: '#b000ff',
        elementalEffect: 'shock',
        effectLabel: 'Aturdimiento y Onda Expansiva',
        desc: 'Poder cósmico destructor y onda expansiva colosal.'
    },
    whip: {
        id: 'whip', name: 'LÁTIGO DE NEÓN', price: 1800, damage: 12, damageMult: 0.9,
        reach: 132, reachMult: 2.2, speed: 0.9, cooldown: 34, windup: 6,
        activeFrames: 10, recovery: 8, kind: 'whip', expansion: true, color: '#00ffcc',
        elementalEffect: 'electric',
        effectLabel: 'Electrochoque en Cadena',
        impactRadius: 42,
        desc: 'Barrido de arco de largo alcance; golpea a varios enemigos.'
    },
    blaster: {
        id: 'blaster', name: 'BLÁSTER DE ENERGÍA', price: 2600, damage: 11, damageMult: 0.85,
        reach: 560, reachMult: 2.4, speed: 1.0, cooldown: 28, windup: 5,
        activeFrames: 1, recovery: 6, projectileSpeed: 10, impactRadius: 13,
        kind: 'projectile', expansion: true, color: '#37e7ff',
        elementalEffect: 'cryo',
        effectLabel: 'Ralentización y Congelación Crio',
        desc: 'Dispara proyectiles de energía con alcance largo.'
    },
    cyberDaggers: {
        id: 'cyberDaggers', name: 'DAGAS CIBERNÉTICAS', price: 1200, damage: 7, damageMult: 0.55,
        reach: 48, reachMult: 0.8, speed: 1.9, cooldown: 12, windup: 1,
        activeFrames: 5, recovery: 4, impactRadius: 24, kind: 'melee', expansion: true, color: '#a7ffec',
        elementalEffect: 'cyberBleed',
        effectLabel: 'Desangrado Cibernético (3 cargas)',
        desc: 'Golpes cuerpo a cuerpo veloces con alcance corto.'
    },
    seismicHammer: {
        id: 'seismicHammer', name: 'MARTILLO SÍSMICO', price: 6200, damage: 24, damageMult: 1.8,
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
    }

    update(width, floorY = 9999) {
        const previousX = this.x;
        const previousY = this.y;
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
            this.energy = 0;
            sound.playSpecial();
        } else if (type === 'heavy') {
            sound.playHeavySlash();
        } else {
            sound.playSlash();
        }

        this.isAttacking = true;
        this.attackType = type;
        this.hitEnemies.clear();

        // Duración y enfriamiento calibrados
        this.attackTimer = weapon.windup + weapon.activeFrames + weapon.recovery;
        this.attackCooldown = weapon.cooldown;
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
        const progress = attacking
            ? Math.max(0, Math.min(1, this.attackElapsed / Math.max(1, weapon.windup + weapon.activeFrames)))
            : 0;
        const swingAngle = attacking ? (progress - 0.5) * 0.9 : -0.12;

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
        ctx.shadowBlur = attacking ? 24 : 13;

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
        this.type = type; // 'basic', 'fast', 'heavy', 'special', 'boss'
        this.vx = 0;
        this.vy = 0;
        this.knockbackVx = 0;
        this.isDead = false;
        this.deathExplosionTriggered = false;
        this.facingRight = true;
        this.attackCooldown = Math.floor(Math.random() * 15);
        this.isAttacking = false;
        this.attackAnim = 0;
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
        this.effectResistances = {
            plasmaBurn: 1,
            stun: 1,
            cryoSlow: 1,
            cryoFreeze: 1,
            electroShock: 1
        };
        this.lastStatusSource = null;

        this.speed = GAME_UNIT_SPEED;
        this.damageMultiplier = 1;

        // Estadísticas por tipo; la velocidad de desplazamiento es uniforme.
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
        } else if (type === 'boss') {
            this.hp = 400; this.maxHp = 400; this.color = '#ff00aa';
            this.width = 50; this.scale = 1.6; this.score = 100; this.phase = 1;
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
        this.feetOffset = 25 * this.scale;
        this.height = this.feetOffset * 2;

        this.animFrame = Math.random() * 10;
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
        return burnDamage;
    }

    update(player, projectiles, floorY, arenaWidth, onMeleeDamage, platforms = [], particles = null, onScreenShake = null, deltaTime = 1, onStatusDamage = null) {
        if (this.isDead) return;

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
        this.facingRight = dx > 0;
        const dist = Math.abs(dx);
        const vertDist = Math.abs(dy);

        // =========================================================================
        // MECÁNICAS AVANZADAS DE JEFE SUPREMO
        // =========================================================================
        if (this.type === 'boss') {
            const ratio = this.hp / this.maxHp;
            if (ratio <= 0.3) this.phase = 3;
            else if (ratio <= 0.6) this.phase = 2;
            else this.phase = 1;

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
            if (this.meteorCooldown > 0) this.meteorCooldown -= attackTimeScale * deltaTime;
            if (this.meteorCooldown <= 0 && this.slamState === 'idle') {
                this.meteorCooldown = this.phase === 3 ? 80 : (this.phase === 2 ? 100 : 120);
                sound.playBossAlert();

                // Proyectil que cae verticalmente desde el cielo apuntado al jugador
                const mX = player.x + (Math.random() - 0.5) * 30;
                projectiles.push(new Projectile(mX, -30, (Math.random() - 0.5) * 1.5, 10, projectileColor, true, bossDamage, true));

                if (this.phase >= 2) {
                    setTimeout(() => {
                        projectiles.push(new Projectile(player.x, -30, 0, 10.5, projectileColor, true, bossDamage, true));
                    }, 200);
                }
            }

            // -----------------------------------------------------------------
            // ATAQUE DE SALTO Y CAÍDA DIRECTA DEL JEFE SOBRE EL JUGADOR (BOSS SLAM)
            // -----------------------------------------------------------------
            if (this.slamCooldown > 0) this.slamCooldown -= attackTimeScale * deltaTime;

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
                    this.slamCooldown = this.phase === 3 ? 55 : (this.phase === 2 ? 70 : 85);
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
        const movementSpeed = this.speed * (this.cryoSlowTimer > 0 ? 0.5 : 1);
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
                        this.attackCooldown = bossShot ? 88 : 96;
                    }
                } else {
                    // Ataque cuerpo a cuerpo rápido y contundente
                    this.isAttacking = true;
                    this.attackAnim = this.type === 'fast' ? 7 : (this.type === 'heavy' ? 11 : 9);
                    // Cooldowns reducidos a la mitad para mayor velocidad de ataque
                    this.attackCooldown = this.type === 'fast' ? 20 : (this.type === 'heavy' ? 38 : (this.type === 'boss' ? 24 : 28));

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
        this.x += (this.vx + this.knockbackVx) * deltaTime;
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

        // 3. Dibujo de la figura del enemigo perfectamente alineada a sus pies
        ctx.save();
        ctx.translate(this.x, this.y);

        const dir = this.facingRight ? 1 : -1;
        const statusColor = this.cryoFreezeTimer > 0 || this.cryoSlowTimer > 0
            ? '#7ceeff'
            : this.electroShockTimer > 0 ? '#e8ff4a'
            : this.poisonTimer > 0 ? '#8dff00'
            : this.plasmaBurnTimer > 0 && Math.floor(this.plasmaBurnTimer / 4) % 2 === 0
                ? (this.plasmaBurnDamage >= 4 ? '#ff35c9' : '#ff8a1d')
                : this.armorBreakTimer > 0 ? '#ff5c9a'
                : this.type === 'boss' && this.phase === 3 ? '#ff0033' : this.color;
        const c = statusColor;

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

        // Barra de vida superior para Boss
        if (this.type === 'boss') {
            ctx.restore();
            ctx.save();
            const bWidth = 140;
            const bHeight = 8;
            const barX = this.x - bWidth / 2;
            const barY = this.y - 30 * scale - 24;

            ctx.fillStyle = 'rgba(5, 5, 15, 0.85)';
            ctx.fillRect(barX, barY, bWidth, bHeight);

            ctx.fillStyle = c;
            ctx.shadowColor = c;
            ctx.shadowBlur = 10;
            ctx.fillRect(barX, barY, Math.max(0, (this.hp / this.maxHp)) * bWidth, bHeight);

            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, bWidth, bHeight);
        }

        ctx.restore();
    }
}
