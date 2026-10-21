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

    const weights = survivalMode || zone >= 8
        ? [
            ['cyberBrawler', 38],
            ['cyberNinja', 25],
            ['cyberKamikaze', 25],
            ['cyberRanger', 8],
            ['heavy', 4]
        ]
        : zone >= 4
            ? [
                ['cyberNinja', 29],
                ['cyberRanger', 29],
                ['cyberKamikaze', 27],
                ['basic', 6],
                ['fast', 5],
                ['drone', 2],
                ['shield', 2]
            ]
            : [
                ['basic', 39],
                ['cyberRanger', 34],
                ['cyberNinja', 15],
                ['fast', 7],
                ['special', 3],
                ['drone', 2]
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
