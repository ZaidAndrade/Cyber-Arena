function buildEnemyWave(zone, wave, survivalMode = false) {
    const count = survivalMode
        ? Math.min(8, 6 + Math.floor((wave - 1) / 4))
        : 6 + Math.floor(Math.random() * 3);
    const counts = {};
    const add = type => { counts[type] = (counts[type] || 0) + 1; };

    if (survivalMode || zone >= 8) {
        add('cyberBrawler');
        add('cyberBrawler');
        add('cyberNinja');
        add('cyberKamikaze');
    } else if (zone >= 4) {
        add('cyberNinja');
        add('cyberRanger');
        add('cyberKamikaze');
    } else {
        add('basic');
        add('basic');
        add('cyberRanger');
        add('cyberRanger');
    }

    if (survivalMode || (zone >= 2 && wave >= 2)) {
        add('drone');
    }
    if (wave >= 2 && zone >= 3) add('assaultTrooper');
    if (wave >= 2 && zone >= 6 && zone < 9) add('magnetUnit');
    if (wave >= 2 && zone >= 9 && zone < 12) add('corrosiveMutant');
    if (wave >= 2 && zone >= 12) add('dimensionalInfiltrator');

    const weights = survivalMode || zone >= 12
        ? [
            ['cyberBrawler', 28],
            ['cyberNinja', 18],
            ['cyberKamikaze', 18],
            ['cyberRanger', 8],
            ['heavy', 4],
            ['assaultTrooper', 6],
            ['magnetUnit', 6],
            ['corrosiveMutant', 6],
            ['dimensionalInfiltrator', 6]
        ]
        : zone >= 9
            ? [
                ['cyberBrawler', 28],
                ['cyberNinja', 19],
                ['cyberKamikaze', 18],
                ['cyberRanger', 8],
                ['heavy', 4],
                ['assaultTrooper', 8],
                ['magnetUnit', 8],
                ['corrosiveMutant', 7]
            ]
        : zone >= 8
            ? [
                ['cyberBrawler', 30],
                ['cyberNinja', 20],
                ['cyberKamikaze', 20],
                ['cyberRanger', 10],
                ['heavy', 5],
                ['assaultTrooper', 7],
                ['magnetUnit', 8]
            ]
        : zone >= 7
            ? [
                ['cyberNinja', 27],
                ['cyberRanger', 22],
                ['cyberKamikaze', 24],
                ['basic', 6],
                ['fast', 5],
                ['drone', 2],
                ['shield', 2],
                ['assaultTrooper', 7],
                ['magnetUnit', 5]
            ]
        : zone >= 4
            ? [
                ['cyberNinja', 27],
                ['cyberRanger', 28],
                ['cyberKamikaze', 27],
                ['basic', 6],
                ['fast', 5],
                ['drone', 2],
                ['shield', 2],
                ['assaultTrooper', 3]
            ]
            : [
                ['basic', zone >= 3 ? 37 : 39],
                ['cyberRanger', zone >= 3 ? 32 : 34],
                ['cyberNinja', 15],
                ['fast', 7],
                ['special', 3],
                ['drone', 2],
                ...(zone >= 3 ? [['assaultTrooper', 4]] : [])
            ];

    while (Object.values(counts).reduce((total, value) => total + value, 0) < count) {
        const roll = Math.random() * 100;
        let accumulatedWeight = 0;
        const selected = weights.find(([, weight]) => {
            accumulatedWeight += weight;
            return roll < accumulatedWeight;
        });
        add(selected ? selected[0] : weights[0][0]);
    }

    return counts;
}

function buildArenaElementConfig(zone, survivalMode = false) {
    const advancedArena = survivalMode || zone >= 7;
    return {
        electricWalls: true,
        jumpPads: survivalMode || zone >= 3 ? [0.28, 0.72] : [],
        ceilingLasers: advancedArena ? [0.38, 0.62] : []
    };
}
