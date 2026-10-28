const RPG_CONFIG = Object.freeze({
    storageKey: 'neonStickRpgProgress',
    maxLevel: 99,
    maxMasteryLevel: 40,
    maxRememberedEvents: 400,
    xp: Object.freeze({
        enemyBase: 8,
        enemyPerHp: 0.04,
        bossBase: 90,
        bossPerHp: 0.025,
        wave: 12,
        zone: 75,
        dodge: 2,
        comboMilestone: 6,
        maxComboMilestonesPerChain: 2,
        levelBase: 100,
        levelPer: 35,
        lateLevelStart: 10,
        lateLevelPer: 12
    }),
    weaponXp: Object.freeze({
        hit: 3,
        kill: 10,
        bossHit: 3,
        bossKill: 20,
        levelBase: 30,
        levelPer: 14,
        levelQuadratic: 2
    }),
    ranks: Object.freeze([
        { id: 'F', name: 'INICIADO', color: '#9aa4b2', icon: '◇', level: 1, totalXp: 0, description: 'Enlace inicial al núcleo.', reward: 'Insignia de iniciación' },
        { id: 'E', name: 'RECLUTA', color: '#69d7ff', icon: '◈', level: 3, totalXp: 300, description: 'Primeras señales de sincronía.', reward: 'Título Recluta' },
        { id: 'D', name: 'OPERADOR', color: '#48e0c0', icon: '⬡', level: 7, totalXp: 1800, description: 'Control estable del combate.', reward: 'Insignia de operador' },
        { id: 'C', name: 'VANGUARDIA', color: '#b7ef54', icon: '✧', level: 13, totalXp: 5500, description: 'Capaz de sostener el frente.', reward: 'Título Vanguardia' },
        { id: 'B', name: 'ELITE', color: '#ffd15a', icon: '✦', level: 22, totalXp: 21000, description: 'Rendimiento de élite confirmado.', reward: 'Insignia Elite' },
        { id: 'A', name: 'VÉRTICE', color: '#ff9c52', icon: '✷', level: 36, totalXp: 45000, description: 'Dominio avanzado de la arena.', reward: 'Título Vértice' },
        { id: 'S', name: 'SINGULAR', color: '#ff5c88', icon: '✹', level: 50, totalXp: 75000, description: 'Una presencia excepcional.', reward: 'Insignia Singular' },
        { id: 'SS', name: 'ASCENDENTE', color: '#c17bff', icon: '✺', level: 67, totalXp: 120000, description: 'Sincronía de nivel extraordinario.', reward: 'Título Ascendente' },
        { id: 'SSS', name: 'SOBERANO', color: '#57edff', icon: '✸', level: 85, totalXp: 190000, description: 'El límite conocido del sistema.', reward: 'Emblema Soberano' }
    ]),
    trials: Object.freeze([
        { kills: 12, waves: 2, rules: 'Derrota 12 enemigos y completa dos oleadas.' },
        { kills: 30, waves: 5, bosses: 1, rules: 'Completa cinco oleadas y derrota un jefe.' },
        { kills: 55, waves: 8, bosses: 2, zones: 1, rules: 'Completa una zona y derrota dos jefes.' },
        { kills: 80, waves: 12, bosses: 3, zones: 2, rules: 'Completa dos zonas, 12 oleadas y derrota tres jefes.' },
        { kills: 110, waves: 18, bosses: 4, zones: 4, rules: 'Completa cuatro zonas y derrota cuatro jefes.' },
        { kills: 150, waves: 25, bosses: 6, zones: 6, noDamage: true, rules: 'Completa seis zonas sin recibir daño, 25 oleadas y derrota seis jefes.' },
        { kills: 190, waves: 32, bosses: 9, zones: 10, noDamage: true, rules: 'Completa diez zonas sin recibir daño y derrota nueve jefes.' },
        { kills: 240, waves: 42, bosses: 13, zones: 16, noDamage: true, rules: 'Completa 16 zonas sin recibir daño y derrota 13 jefes.' }
    ]),
    missions: Object.freeze([
        { id: 'combat-12', name: 'LIMPIEZA DE SECTOR', description: 'Derrota 12 enemigos.', type: 'kills', target: 12, reward: 60 },
        { id: 'combo-3', name: 'CADENA DE IMPACTO', description: 'Alcanza tres hitos de combo.', type: 'combos', target: 3, reward: 70 },
        { id: 'waves-5', name: 'RITMO DE GUERRA', description: 'Completa cinco oleadas.', type: 'waves', target: 5, reward: 80 },
        { id: 'boss-1', name: 'PROTOCOLO TITÁN', description: 'Derrota un jefe de zona.', type: 'bosses', target: 1, reward: 90 },
        { id: 'zones-2', name: 'RUTA DE NEÓN', description: 'Completa dos zonas.', type: 'zones', target: 2, reward: 100 },
        { id: 'dodge-5', name: 'VENTANA FANTASMA', description: 'Esquiva cinco ataques durante un dash.', type: 'dodges', target: 5, reward: 50 },
        { id: 'coop-wave', name: 'SINCRONÍA DOBLE', description: 'Completa una oleada con P1 y P2 contribuyendo.', type: 'coopWaves', target: 1, reward: 70 }
    ]),
    weaponMastery: Object.freeze({
        xpPerHit: 3,
        xpPerKill: 10,
        xpPerBossHit: 3,
        xpPerBossKill: 20,
        ranks: Object.freeze([
            { id: 'F', level: 1, reward: 'Insignia de práctica' },
            { id: 'E', level: 3, reward: 'Título de iniciado' },
            { id: 'D', level: 5, reward: 'Emblema calibrado' },
            { id: 'C', level: 8, reward: 'Título especialista' },
            { id: 'B', level: 12, reward: 'Insignia de veterano' },
            { id: 'A', level: 17, reward: 'Título experto' },
            { id: 'S', level: 23, reward: 'Emblema de maestría' },
            { id: 'SS', level: 31, reward: 'Título virtuoso' },
            { id: 'SSS', level: 40, reward: 'Emblema legendario' }
        ]),
        weapons: Object.freeze({
            dagger: { challenge: 'RÁFAGA PRECISA', metric: 'hits', target: 120, reward: 'Título Aguja Neón' },
            sword: { challenge: 'FILO CONSTANTE', metric: 'kills', target: 45, reward: 'Título Guardafilo' },
            plasma: { challenge: 'SOBRECARGA TITÁN', metric: 'bossHits', target: 18, reward: 'Título Plasma Ascendente' },
            hammer: { challenge: 'IMPACTO DE VACÍO', metric: 'kills', target: 35, reward: 'Título Quebracascos' },
            whip: { challenge: 'ARCO DE TORMENTA', metric: 'hits', target: 140, reward: 'Título Conducto Neón' },
            blaster: { challenge: 'PUNTERÍA CRIO', metric: 'bossHits', target: 15, reward: 'Título Tirador Glacial' },
            cyberDaggers: { challenge: 'CORTE EN CADENA', metric: 'hits', target: 130, reward: 'Título Sombra Cibernética' },
            seismicHammer: { challenge: 'FALLA SÍSMICA', metric: 'bossKills', target: 8, reward: 'Título Epicentro' }
        })
    })
});

function createRpgProfile() {
    return {
        version: 2,
        rankIndex: 0,
        level: 1,
        xp: 0,
        totalXp: 0,
        rankHistory: [{ rank: 'F', at: Date.now(), condition: 'Registro inicial' }],
        completedAscensions: [],
        trial: null,
        missionProgress: {},
        completedMissions: [],
        unlockedRewards: [RPG_CONFIG.ranks[0].reward],
        stats: { kills: 0, bosses: 0, waves: 0, zones: 0, combos: 0, dodges: 0, coopWaves: 0 },
        recentEventIds: [],
        xpHistory: [],
        weaponMastery: Object.fromEntries(Object.keys(WEAPONS).map(weaponId => [
            weaponId,
            {
                level: 1,
                xp: 0,
                totalXp: 0,
                hits: 0,
                kills: 0,
                bossHits: 0,
                bossKills: 0,
                combos: 0,
                challengeProgress: 0,
                challengeCompleted: false,
                unlockedRewards: [RPG_CONFIG.weaponMastery.ranks[0].reward]
            }
        ]))
    };
}

function escapeRpgMarkup(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function weaponMasteryXpForNextLevel(level) {
    const config = RPG_CONFIG.weaponXp;
    return Math.floor(
        config.levelBase + level * config.levelPer + level * level * config.levelQuadratic
    );
}

function normalizeRpgProfile(saved) {
    const profile = createRpgProfile();
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return profile;

    const maxRankIndex = RPG_CONFIG.ranks.length - 1;
    profile.rankIndex = Number.isInteger(saved.rankIndex)
        ? Math.max(0, Math.min(maxRankIndex, saved.rankIndex))
        : 0;
    profile.level = Number.isFinite(saved.level)
        ? Math.max(1, Math.min(RPG_CONFIG.maxLevel, Math.floor(saved.level)))
        : 1;
    const highestLevelRank = RPG_CONFIG.ranks.reduce((highest, rank, index) =>
        rank.level <= profile.level ? index : highest, 0);
    profile.rankIndex = Math.min(profile.rankIndex, highestLevelRank);
    const savedXp = Number.isFinite(saved.xp) ? Math.max(0, Math.floor(saved.xp)) : 0;
    const nextLevelXp = Math.floor(
        RPG_CONFIG.xp.levelBase + profile.level * RPG_CONFIG.xp.levelPer +
        Math.max(0, profile.level - RPG_CONFIG.xp.lateLevelStart) * RPG_CONFIG.xp.lateLevelPer
    );
    profile.xp = Math.min(savedXp, profile.level < RPG_CONFIG.maxLevel ? nextLevelXp - 1 : 0);
    profile.totalXp = Number.isFinite(saved.totalXp)
        ? Math.max(profile.xp, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(saved.totalXp)))
        : profile.xp;
    profile.rankHistory = Array.isArray(saved.rankHistory)
        ? saved.rankHistory.filter(item =>
            item && RPG_CONFIG.ranks.some(rank => rank.id === item.rank) &&
            Number.isFinite(item.at) && typeof item.condition === 'string'
        ).slice(-40)
        : profile.rankHistory;
    const savedAscensions = Array.isArray(saved.completedAscensions)
        ? new Set(saved.completedAscensions.filter(id =>
            RPG_CONFIG.ranks.slice(1).some(rank => rank.id === id)
        ))
        : new Set();
    profile.completedAscensions = [];
    for (let index = 1; index <= profile.rankIndex; index++) {
        const rankId = RPG_CONFIG.ranks[index].id;
        if (!savedAscensions.has(rankId)) break;
        profile.completedAscensions.push(rankId);
    }
    profile.rankIndex = profile.completedAscensions.length;
    while (profile.rankIndex > 0) {
        const rank = RPG_CONFIG.ranks[profile.rankIndex];
        if (profile.level >= rank.level && profile.totalXp >= rank.totalXp) break;
        profile.rankIndex--;
        profile.completedAscensions.pop();
    }
    profile.unlockedRewards = RPG_CONFIG.ranks
        .slice(0, profile.rankIndex + 1)
        .map(rank => rank.reward);
    profile.completedMissions = Array.isArray(saved.completedMissions)
        ? [...new Set(saved.completedMissions.filter(id =>
            RPG_CONFIG.missions.some(mission => mission.id === id)
        ))]
        : [];
    if (saved.missionProgress && typeof saved.missionProgress === 'object') {
        RPG_CONFIG.missions.forEach(mission => {
            const value = Number(saved.missionProgress[mission.id]);
            if (Number.isFinite(value)) {
                profile.missionProgress[mission.id] = Math.max(0, Math.min(mission.target, Math.floor(value)));
            }
        });
    }
    RPG_CONFIG.missions.forEach(mission => {
        if (profile.missionProgress[mission.id] >= mission.target &&
            !profile.completedMissions.includes(mission.id)) {
            profile.completedMissions.push(mission.id);
        }
    });
    if (saved.stats && typeof saved.stats === 'object') {
        Object.keys(profile.stats).forEach(stat => {
            const value = Number(saved.stats[stat]);
            if (Number.isFinite(value)) profile.stats[stat] = Math.max(0, Math.floor(value));
        });
    }
    if (saved.weaponMastery && typeof saved.weaponMastery === 'object') {
        Object.keys(profile.weaponMastery).forEach(weaponId => {
            const weapon = saved.weaponMastery[weaponId];
            if (!weapon || typeof weapon !== 'object') return;
            const mastery = profile.weaponMastery[weaponId];
            mastery.level = Number.isFinite(weapon.level)
                ? Math.max(1, Math.min(RPG_CONFIG.maxMasteryLevel, Math.floor(weapon.level)))
                : 1;
            const levelLimit = weaponMasteryXpForNextLevel(mastery.level);
            mastery.xp = Number.isFinite(weapon.xp)
                ? Math.max(0, Math.min(levelLimit - 1, Math.floor(weapon.xp)))
                : 0;
            mastery.totalXp = Number.isFinite(weapon.totalXp)
                ? Math.max(mastery.xp, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(weapon.totalXp)))
                : mastery.xp;
            ['hits', 'kills', 'bossHits', 'bossKills', 'combos', 'challengeProgress'].forEach(stat => {
                const value = Number(weapon[stat]);
                if (Number.isFinite(value)) mastery[stat] = Math.max(0, Math.floor(value));
            });
            const challenge = RPG_CONFIG.weaponMastery.weapons[weaponId];
            mastery.challengeProgress = Math.min(challenge.target, mastery.challengeProgress);
            mastery.challengeCompleted = Boolean(weapon.challengeCompleted) ||
                mastery.challengeProgress >= challenge.target;
            const rankIndex = RPG_CONFIG.weaponMastery.ranks.reduce((highest, rank, index) =>
                rank.level <= mastery.level ? index : highest, 0);
            mastery.unlockedRewards = RPG_CONFIG.weaponMastery.ranks
                .slice(0, rankIndex + 1)
                .map(rank => rank.reward);
            if (mastery.challengeCompleted) mastery.unlockedRewards.push(challenge.reward);
        });
    }
    if (Array.isArray(saved.recentEventIds)) {
        profile.recentEventIds = saved.recentEventIds
            .filter(id => typeof id === 'string' && id.length <= 180)
            .slice(-RPG_CONFIG.maxRememberedEvents);
    }
    if (Array.isArray(saved.xpHistory)) {
        profile.xpHistory = saved.xpHistory
            .filter(entry => entry && Number.isFinite(entry.at) &&
                Number.isFinite(entry.amount) && entry.amount > 0 &&
                typeof entry.reason === 'string')
            .map(entry => ({
                at: entry.at,
                amount: Math.min(Number.MAX_SAFE_INTEGER, Math.floor(entry.amount)),
                reason: entry.reason.slice(0, 80)
            }))
            .slice(-20);
    }
    if (saved.trial && typeof saved.trial === 'object' &&
        saved.trial.rank === RPG_CONFIG.ranks[profile.rankIndex + 1]?.id &&
        ['active', 'failed', 'completed'].includes(saved.trial.status)) {
        const requirements = RPG_CONFIG.trials[profile.rankIndex];
        const progress = {};
        ['kills', 'waves', 'bosses', 'zones'].forEach(key => {
            const value = Number(saved.trial.progress?.[key]);
            progress[key] = Number.isFinite(value)
                ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value)))
                : 0;
        });
        profile.trial = {
            rank: saved.trial.rank,
            status: requirements.noDamage && saved.trial.status === 'active' &&
                saved.trial.noDamage !== true ? 'failed' : saved.trial.status,
            noDamage: requirements.noDamage === true,
            progress
        };
    }
    return profile;
}

class RpgProgression {
    constructor(onChange = () => {}) {
        this.onChange = onChange;
        this.profiles = [0, 1].map(index => this.readProfile(index));
    }

    readProfile(index) {
        try {
            const saved = JSON.parse(localStorage.getItem(`${RPG_CONFIG.storageKey}.P${index + 1}`) || 'null');
            return normalizeRpgProfile(saved);
        } catch (error) {
            console.warn(`No se pudo leer el progreso RPG de P${index + 1}; se inicia un perfil seguro.`, error);
            return createRpgProfile();
        }
    }

    profileFor(playerId) {
        if (playerId !== 'P1' && playerId !== 'P2') {
            throw new RangeError(`Identificador de jugador RPG no válido: ${playerId}`);
        }
        return this.profiles[playerId === 'P1' ? 0 : 1];
    }

    saveProfile(playerId) {
        const profile = this.profileFor(playerId);
        try {
            localStorage.setItem(`${RPG_CONFIG.storageKey}.${playerId}`, JSON.stringify(profile));
        } catch (error) {
            console.error(`No se pudo guardar el progreso RPG de ${playerId}.`, error);
            return false;
        }
        this.onChange(playerId);
        return true;
    }

    saveAll() {
        ['P1', 'P2'].forEach(playerId => this.saveProfile(playerId));
    }

    reset() {
        this.profiles = [createRpgProfile(), createRpgProfile()];
        ['P1', 'P2'].forEach(playerId => {
            try {
                localStorage.removeItem(`${RPG_CONFIG.storageKey}.${playerId}`);
            } catch (error) {
                console.error(`No se pudo borrar el progreso RPG de ${playerId}.`, error);
            }
            this.saveProfile(playerId);
        });
    }

    xpForNextLevel(level) {
        const xp = RPG_CONFIG.xp;
        return Math.floor(
            xp.levelBase + level * xp.levelPer +
            Math.max(0, level - xp.lateLevelStart) * xp.lateLevelPer
        );
    }

    addXpHistory(profile, amount, reason) {
        profile.xpHistory.push({
            at: Date.now(),
            amount,
            reason: String(reason).slice(0, 80)
        });
        profile.xpHistory = profile.xpHistory.slice(-20);
    }

    applyGeneralXp(profile, amount, reason) {
        const reward = Math.max(0, Math.floor(amount));
        if (reward === 0) return 0;
        profile.xp += reward;
        profile.totalXp = Math.min(Number.MAX_SAFE_INTEGER, profile.totalXp + reward);
        this.addXpHistory(profile, reward, reason);
        while (profile.level < RPG_CONFIG.maxLevel) {
            const required = this.xpForNextLevel(profile.level);
            if (profile.xp < required) break;
            profile.xp -= required;
            profile.level++;
        }
        this.tryPromote(profile, reason);
        return reward;
    }

    awardXp(playerId, amount, eventId, reason) {
        const profile = this.profileFor(playerId);
        if (profile.recentEventIds.includes(eventId)) return 0;
        profile.recentEventIds.push(eventId);
        if (profile.recentEventIds.length > RPG_CONFIG.maxRememberedEvents) {
            profile.recentEventIds.splice(0, profile.recentEventIds.length - RPG_CONFIG.maxRememberedEvents);
        }

        const reward = Math.max(0, Math.floor(amount));
        this.applyGeneralXp(profile, reward, reason);
        this.saveProfile(playerId);
        return reward;
    }

    recordEvent(playerId, type, eventId, data = {}) {
        const profile = this.profileFor(playerId);
        if (profile.recentEventIds.includes(eventId)) return 0;
        const xp = RPG_CONFIG.xp;
        let reward = 0;
        let stat;
        let missionType;
        let trialType;

        if (type === 'kill') {
            const maxHp = Number.isFinite(data.maxHp) ? data.maxHp : 50;
            reward = data.boss
                ? Math.min(300, Math.round(xp.bossBase + maxHp * xp.bossPerHp))
                : Math.min(40, Math.round(xp.enemyBase + maxHp * xp.enemyPerHp));
            stat = data.boss ? 'bosses' : 'kills';
            missionType = data.boss ? 'bosses' : 'kills';
            trialType = stat;
        } else if (type === 'wave') {
            reward = xp.wave;
            stat = missionType = trialType = 'waves';
        } else if (type === 'zone') {
            reward = xp.zone;
            stat = missionType = trialType = 'zones';
        } else if (type === 'combo') {
            reward = xp.comboMilestone;
            stat = missionType = 'combos';
        } else if (type === 'dodge') {
            reward = xp.dodge;
            stat = missionType = 'dodges';
        } else if (type === 'coopWave') {
            stat = missionType = 'coopWaves';
        } else {
            throw new RangeError(`Evento RPG desconocido: ${type}`);
        }

        profile.recentEventIds.push(eventId);
        if (profile.recentEventIds.length > RPG_CONFIG.maxRememberedEvents) {
            profile.recentEventIds.splice(0, profile.recentEventIds.length - RPG_CONFIG.maxRememberedEvents);
        }
        if (stat) profile.stats[stat]++;
        if (trialType && profile.trial?.status === 'active') {
            profile.trial.progress[trialType]++;
            this.checkTrial(profile);
        }
        const missionBonus = missionType ? this.advanceMissions(profile, missionType) : 0;
        this.applyGeneralXp(profile, reward, type);
        this.saveProfile(playerId);
        return reward + missionBonus;
    }

    recordWeaponEvent(playerId, weaponId, type, eventId, isBoss = false) {
        const profile = this.profileFor(playerId);
        const weapon = profile.weaponMastery[weaponId];
        const challenge = RPG_CONFIG.weaponMastery.weapons[weaponId];
        if (!weapon || !challenge || profile.recentEventIds.includes(eventId)) return null;
        if (!['hit', 'kill', 'combo'].includes(type)) {
            throw new RangeError(`Evento de dominio de arma desconocido: ${type}`);
        }

        profile.recentEventIds.push(eventId);
        if (profile.recentEventIds.length > RPG_CONFIG.maxRememberedEvents) {
            profile.recentEventIds.splice(0, profile.recentEventIds.length - RPG_CONFIG.maxRememberedEvents);
        }
        const config = RPG_CONFIG.weaponXp;
        let reward = 0;
        if (type === 'hit') {
            weapon.hits++;
            reward = config.hit;
            if (isBoss) {
                weapon.bossHits++;
                reward += config.bossHit;
            }
        } else if (type === 'kill') {
            weapon.kills++;
            reward = config.kill;
            if (isBoss) {
                weapon.bossKills++;
                reward += config.bossKill;
            }
        } else {
            weapon.combos++;
            reward = RPG_CONFIG.weaponMastery.xpPerHit;
        }

        const metricValue = weapon[challenge.metric];
        weapon.challengeProgress = Math.min(challenge.target, metricValue);
        if (!weapon.challengeCompleted && Number.isFinite(metricValue) && metricValue >= challenge.target) {
            weapon.challengeCompleted = true;
            weapon.unlockedRewards.push(challenge.reward);
            reward += challenge.xpReward || 80;
        }
        weapon.xp += reward;
        weapon.totalXp = Math.min(Number.MAX_SAFE_INTEGER, weapon.totalXp + reward);
        while (weapon.level < RPG_CONFIG.maxMasteryLevel) {
            const required = weaponMasteryXpForNextLevel(weapon.level);
            if (weapon.xp < required) break;
            weapon.xp -= required;
            weapon.level++;
        }
        const highestRank = RPG_CONFIG.weaponMastery.ranks.reduce((highest, rank, index) =>
            rank.level <= weapon.level ? index : highest, 0);
        weapon.unlockedRewards = RPG_CONFIG.weaponMastery.ranks
            .slice(0, highestRank + 1)
            .map(rank => rank.reward);
        if (weapon.challengeCompleted) weapon.unlockedRewards.push(challenge.reward);
        this.saveProfile(playerId);
        return {
            xp: reward,
            level: weapon.level,
            rank: RPG_CONFIG.weaponMastery.ranks[highestRank].id,
            challengeCompleted: weapon.challengeCompleted
        };
    }

    advanceMissions(profile, type) {
        let bonusXp = 0;
        RPG_CONFIG.missions.forEach(mission => {
            if (mission.type !== type || profile.completedMissions.includes(mission.id)) return;
            profile.missionProgress[mission.id] = Math.min(
                mission.target,
                (profile.missionProgress[mission.id] || 0) + 1
            );
            if (profile.missionProgress[mission.id] < mission.target) return;
            profile.completedMissions.push(mission.id);
            const playerId = this.profiles[0] === profile ? 'P1' : 'P2';
            this.awardXp(playerId, mission.reward, `mission:${mission.id}`, `Misión: ${mission.name}`);
            bonusXp += mission.reward;
        });
        return bonusXp;
    }

    startTrial(playerId) {
        const profile = this.profileFor(playerId);
        const nextRank = RPG_CONFIG.ranks[profile.rankIndex + 1];
        if (!nextRank || profile.level < nextRank.level || profile.totalXp < nextRank.totalXp) return false;
        if (profile.trial?.rank === nextRank.id && profile.trial.status === 'active') return false;
        const requirements = RPG_CONFIG.trials[profile.rankIndex];
        profile.trial = {
            rank: nextRank.id,
            status: 'active',
            noDamage: requirements.noDamage === true,
            failureReason: '',
            progress: { kills: 0, waves: 0, bosses: 0, zones: 0 }
        };
        this.saveProfile(playerId);
        return true;
    }

    failTrial(playerId, reason = 'Prueba interrumpida') {
        const profile = this.profileFor(playerId);
        if (profile.trial?.status !== 'active') return false;
        profile.trial.status = 'failed';
        profile.trial.failureReason = String(reason).slice(0, 100);
        this.saveProfile(playerId);
        return true;
    }

    recordTrialDamage(playerId) {
        const trial = this.profileFor(playerId).trial;
        if (trial?.status !== 'active' || !trial.noDamage) return false;
        return this.failTrial(playerId, 'Recibiste daño durante una prueba sin impactos');
    }

    checkTrial(profile) {
        const trial = profile.trial;
        if (!trial || trial.status !== 'active') return;
        const requirements = RPG_CONFIG.trials[profile.rankIndex];
        const complete = Object.entries(requirements)
            .filter(([, value]) => Number.isFinite(value))
            .every(([key, value]) =>
            trial.progress[key] >= value
        );
        if (complete) {
            trial.status = 'completed';
            this.tryPromote(profile, `Prueba de ascenso ${trial.rank} completada`);
        }
    }

    tryPromote(profile, condition) {
        const nextRank = RPG_CONFIG.ranks[profile.rankIndex + 1];
        if (!nextRank || profile.level < nextRank.level || profile.totalXp < nextRank.totalXp ||
            profile.trial?.rank !== nextRank.id || profile.trial.status !== 'completed' ||
            profile.completedAscensions.includes(nextRank.id)) return false;
        profile.rankIndex++;
        profile.completedAscensions.push(nextRank.id);
        profile.unlockedRewards.push(nextRank.reward);
        profile.rankHistory.push({ rank: nextRank.id, at: Date.now(), condition });
        profile.rankHistory = profile.rankHistory.slice(-40);
        profile.trial = null;
        return true;
    }

    getMissionProgress(profile, mission) {
        return Math.min(mission.target, profile.missionProgress[mission.id] || 0);
    }
}
