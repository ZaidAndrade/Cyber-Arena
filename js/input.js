/**
 * Acciones de entrada compartidas por teclado, táctil y mandos.
 */
class InputManager {
    constructor(onPause = () => {}, onGamepadChange = () => {}, onAudioSettings = () => {}) {
        this.onPause = onPause;
        this.onGamepadChange = onGamepadChange;
        this.onAudioSettings = onAudioSettings;
        this.gameplayInputBlocked = false;
        this.bindings = {
            p1: {
                KeyA: ['moveLeft'],
                KeyD: ['moveRight'],
                KeyW: ['jump'],
                KeyS: ['crouch'],
                Space: ['jump'],
                KeyJ: ['attackLight'],
                KeyK: ['attackHeavy'],
                KeyL: ['attackSpecial'],
                KeyQ: ['weaponNext'],
                ShiftLeft: ['dash']
            },
            p2: {
                ArrowLeft: ['moveLeft'],
                ArrowRight: ['moveRight'],
                ArrowUp: ['jump'],
                ArrowDown: ['crouch'],
                Enter: ['attack'],
                NumpadEnter: ['attack'],
                Digit1: ['attackLight'],
                Numpad1: ['attackLight'],
                Digit2: ['attackHeavy'],
                Numpad2: ['attackHeavy'],
                Digit3: ['attackSpecial'],
                Numpad3: ['attackSpecial'],
                Digit4: ['weaponNext'],
                Numpad4: ['weaponNext'],
                Digit0: ['attackSpecial'],
                Numpad0: ['attackSpecial'],
                KeyO: ['attackSpecial'],
                ShiftRight: ['dash']
            }
        };
        this.sources = {
            p1: { keyboard: new Set(), touch: new Set(), gamepad: new Set() },
            p2: { keyboard: new Set(), touch: new Set(), gamepad: new Set() }
        };
        this.attackQueues = { p1: [], p2: [] };
        this.dashQueues = { p1: 0, p2: 0 };
        this.weaponQueues = { p1: 0, p2: 0 };
        this.keyboardActions = { p1: new Map(), p2: new Map() };
        this.connectedGamepads = new Map();
        this.gamepadAssignments = new Map();
        this.gamepadAttackButtons = new Map();
        this.gamepadWeaponButtons = new Map();
        this.gamepadAudioButtons = new Map();
        this.playerCount = 0;

        this.handleKeyDown = event => this.onKeyDown(event);
        this.handleKeyUp = event => this.onKeyUp(event);
        this.handleGamepadChange = () => this.pollGamepads();
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('gamepadconnected', this.handleGamepadChange);
        window.addEventListener('gamepaddisconnected', this.handleGamepadChange);
    }

    onKeyDown(event) {
        if (this.gameplayInputBlocked) return;
        const isDashKey = event.code === 'ShiftLeft' || event.code === 'ShiftRight';
        if (event.target instanceof HTMLSelectElement && !isDashKey) return;
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
            event.preventDefault();
        }

        if (event.code === 'Escape' || event.code === 'KeyP') {
            this.onPause();
            return;
        }

        for (const playerId of ['p1', 'p2']) {
            if ((playerId === 'p1' && this.playerCount < 1) ||
                (playerId === 'p2' && this.playerCount < 2)) continue;

            const actions = this.bindings[playerId][event.code];
            if (!actions) continue;

            const active = this.keyboardActions[playerId];
            for (const action of actions) {
                if (action === 'weaponNext') {
                    if (!event.repeat) this.weaponQueues[playerId]++;
                    continue;
                }
                if (action === 'dash') {
                    if (!event.repeat) this.dashQueues[playerId]++;
                    continue;
                }
                if (action === 'attackLight' || action === 'attackHeavy' || action === 'attackSpecial') {
                    if (!event.repeat) {
                        const type = {
                            attackLight: 'light',
                            attackHeavy: 'heavy',
                            attackSpecial: 'special'
                        }[action];
                        this.attackQueues[playerId].push(type);
                    }
                    continue;
                }

                if (action === 'attack' && !active.has(action) && !event.repeat) {
                    this.attackQueues[playerId].push('light');
                }
                if (!active.has(action)) active.set(action, new Set());
                active.get(action).add(event.code);
            }
        }
    }

    onKeyUp(event) {
        for (const playerId of ['p1', 'p2']) {
            if ((playerId === 'p1' && this.playerCount < 1) ||
                (playerId === 'p2' && this.playerCount < 2)) continue;

            const actions = this.bindings[playerId][event.code];
            if (!actions) continue;
            for (const action of actions) {
                const keys = this.keyboardActions[playerId].get(action);
                if (!keys) continue;
                keys.delete(event.code);
                if (keys.size === 0) this.keyboardActions[playerId].delete(action);
            }
        }
    }

    setAction(playerId, action, isActive, source = 'touch') {
        const playerSources = this.sources[playerId];
        if (!playerSources || !playerSources[source]) {
            throw new Error(`Fuente de entrada desconocida: ${playerId}/${source}`);
        }
        if (!['moveLeft', 'moveRight', 'jump', 'crouch', 'attack'].includes(action)) {
            throw new Error(`Acción de entrada desconocida: ${action}`);
        }

        const sourceActions = playerSources[source];
        if (isActive) sourceActions.add(action);
        else sourceActions.delete(action);
    }

    pollGamepads() {
        if (typeof navigator.getGamepads !== 'function') return;

        const pads = Array.from(navigator.getGamepads()).filter(Boolean);
        const availableIndices = new Set(pads.map(pad => pad.index));
        let assignmentsChanged = false;

        for (const index of this.connectedGamepads.keys()) {
            if (availableIndices.has(index)) continue;
            this.connectedGamepads.delete(index);
            this.gamepadAssignments.delete(index);
            this.gamepadAttackButtons.delete(index);
            this.gamepadWeaponButtons.delete(index);
            this.gamepadAudioButtons.delete(index);
            assignmentsChanged = true;
        }

        for (const pad of pads) {
            this.connectedGamepads.set(pad.index, pad);
            if (this.gamepadAssignments.has(pad.index)) continue;

            const assignedPlayers = new Set(this.gamepadAssignments.values());
            const playerId = ['p1', 'p2'].find(id => !assignedPlayers.has(id)) || null;
            this.gamepadAssignments.set(pad.index, playerId);
            assignmentsChanged = true;
        }

        this.sources.p1.gamepad.clear();
        this.sources.p2.gamepad.clear();
        for (const pad of pads) {
            const playerId = this.gamepadAssignments.get(pad.index);
            if (!playerId ||
                (playerId === 'p1' && this.playerCount < 1) ||
                (playerId === 'p2' && this.playerCount < 2)) continue;

            const actions = this.sources[playerId].gamepad;
            const horizontal = pad.axes[0] || 0;
            const vertical = pad.axes[1] || 0;
            const buttonPressed = index => Boolean(pad.buttons[index]?.pressed);
            const audioButtonPressed = buttonPressed(8);
            const audioButtonActivated = audioButtonPressed && !this.gamepadAudioButtons.get(pad.index);
            if (audioButtonActivated) {
                this.onAudioSettings();
            }
            this.gamepadAudioButtons.set(pad.index, audioButtonPressed);
            const pressedAttackButtons = new Set();
            const pressedWeaponButtons = new Set();
            [
                [1, 'light'],
                [2, 'heavy'],
                [3, 'special']
            ].forEach(([buttonIndex, attackType]) => {
                if (!buttonPressed(buttonIndex)) return;
                pressedAttackButtons.add(buttonIndex);
                if (!this.gameplayInputBlocked && !audioButtonActivated &&
                    !this.gamepadAttackButtons.get(pad.index)?.has(buttonIndex)) {
                    this.attackQueues[playerId].push(attackType);
                }
            });
            this.gamepadAttackButtons.set(pad.index, pressedAttackButtons);
            if (buttonPressed(4)) {
                pressedWeaponButtons.add(4);
                if (!this.gameplayInputBlocked && !audioButtonActivated &&
                    !this.gamepadWeaponButtons.get(pad.index)?.has(4)) {
                    this.weaponQueues[playerId]++;
                }
            }
            this.gamepadWeaponButtons.set(pad.index, pressedWeaponButtons);
            if (this.gameplayInputBlocked || audioButtonActivated) continue;

            if (horizontal < -0.35 || buttonPressed(14)) actions.add('moveLeft');
            if (horizontal > 0.35 || buttonPressed(15)) actions.add('moveRight');
            if (vertical < -0.55 || buttonPressed(0) || buttonPressed(12)) actions.add('jump');
            if (vertical > 0.55 || buttonPressed(13)) actions.add('crouch');
            if (pressedAttackButtons.size > 0) actions.add('attack');
        }

        if (assignmentsChanged) {
            this.onGamepadChange(this.getConnectedGamepads());
        }
    }

    getConnectedGamepads() {
        return Array.from(this.connectedGamepads.values(), pad => ({
            index: pad.index,
            id: pad.id,
            assignedTo: this.gamepadAssignments.get(pad.index) || ''
        }));
    }

    assignGamepad(index, playerId) {
        if (!['p1', 'p2', ''].includes(playerId)) {
            throw new Error(`Jugador de entrada desconocido: ${playerId}`);
        }
        if (!this.connectedGamepads.has(index)) {
            throw new Error(`No hay un mando conectado en el índice ${index}`);
        }

        const currentPlayer = this.gamepadAssignments.get(index) || null;
        const existingIndex = Array.from(this.gamepadAssignments.entries())
            .find(([otherIndex, assignedTo]) => otherIndex !== index && assignedTo === playerId)?.[0];

        this.gamepadAssignments.set(index, playerId || null);
        if (existingIndex !== undefined && playerId) {
            this.gamepadAssignments.set(existingIndex, currentPlayer);
        }
        this.pollGamepads();
        this.onGamepadChange(this.getConnectedGamepads());
    }

    queueAttack(playerId, type = 'light') {
        const queue = this.attackQueues[playerId];
        if (!queue) throw new Error(`Jugador de entrada desconocido: ${playerId}`);
        queue.push(type);
    }

    setPlayerCount(playerCount) {
        if (playerCount !== 1 && playerCount !== 2) {
            throw new Error(`Cantidad de jugadores no válida: ${playerCount}`);
        }

        this.playerCount = playerCount;
        if (playerCount === 1) {
            this.keyboardActions.p2.clear();
            this.sources.p2.touch.clear();
            this.sources.p2.gamepad.clear();
            this.attackQueues.p2.length = 0;
            this.dashQueues.p2 = 0;
            this.weaponQueues.p2 = 0;
        }
        this.pollGamepads();
    }

    getActions(playerId) {
        const playerSources = this.sources[playerId];
        const keyboard = this.keyboardActions[playerId];
        if (!playerSources || !keyboard) {
            throw new Error(`Jugador de entrada desconocido: ${playerId}`);
        }

        const isActive = action =>
            keyboard.has(action) ||
            playerSources.touch.has(action) ||
            playerSources.gamepad.has(action);

        return {
            moveLeft: isActive('moveLeft'),
            moveRight: isActive('moveRight'),
            jump: isActive('jump'),
            crouch: isActive('crouch'),
            attack: isActive('attack')
        };
    }

    consumeAttacks(playerId) {
        const queue = this.attackQueues[playerId];
        if (!queue) throw new Error(`Jugador de entrada desconocido: ${playerId}`);
        return queue.splice(0);
    }

    queueDash(playerId) {
        if (!(playerId in this.dashQueues)) {
            throw new Error(`Jugador de entrada desconocido: ${playerId}`);
        }
        this.dashQueues[playerId]++;
    }

    consumeDashes(playerId) {
        if (!(playerId in this.dashQueues)) {
            throw new Error(`Jugador de entrada desconocido: ${playerId}`);
        }
        const count = this.dashQueues[playerId];
        this.dashQueues[playerId] = 0;
        return count;
    }

    consumeWeaponChanges(playerId) {
        if (!(playerId in this.weaponQueues)) {
            throw new Error(`Jugador de entrada desconocido: ${playerId}`);
        }
        const count = this.weaponQueues[playerId];
        this.weaponQueues[playerId] = 0;
        return count;
    }

    clearAttacks() {
        this.attackQueues.p1.length = 0;
        this.attackQueues.p2.length = 0;
        this.dashQueues.p1 = 0;
        this.dashQueues.p2 = 0;
        this.weaponQueues.p1 = 0;
        this.weaponQueues.p2 = 0;
    }

    clearActions() {
        this.keyboardActions.p1.clear();
        this.keyboardActions.p2.clear();
        Object.values(this.sources).forEach(playerSources => {
            playerSources.keyboard.clear();
            playerSources.touch.clear();
            playerSources.gamepad.clear();
        });
        this.clearAttacks();
    }

    setGameplayInputBlocked(blocked) {
        this.gameplayInputBlocked = Boolean(blocked);
        if (this.gameplayInputBlocked) this.clearActions();
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('gamepadconnected', this.handleGamepadChange);
        window.removeEventListener('gamepaddisconnected', this.handleGamepadChange);
    }
}
