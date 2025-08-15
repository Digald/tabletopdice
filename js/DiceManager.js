export class DiceManager {
    constructor() {
        this.dicePool = {
            d20: { count: 0, results: [] },
            d12: { count: 0, results: [] },
            d10: { count: 0, results: [] },
            d100: { count: 0, results: [] },
            d8: { count: 0, results: [] },
            d6: { count: 0, results: [] },
            d4: { count: 0, results: [] },
            d2: { count: 0, results: [] }
        };
        
        this.selectedDice = new Set(); // For reroll/remove functionality
    }

    addDice(type, count = 1) {
        if (this.dicePool[type]) {
            this.dicePool[type].count += count;
            return this.dicePool[type].count;
        }
        return 0;
    }

    removeDice(type, count = 1) {
        if (this.dicePool[type]) {
            this.dicePool[type].count = Math.max(0, this.dicePool[type].count - count);
            return this.dicePool[type].count;
        }
        return 0;
    }

    resetDice(type) {
        if (this.dicePool[type]) {
            this.dicePool[type].count = 0;
            this.dicePool[type].results = [];
            return 0;
        }
        return 0;
    }

    resetAllDice() {
        Object.keys(this.dicePool).forEach(type => {
            this.dicePool[type].count = 0;
            this.dicePool[type].results = [];
        });
        this.selectedDice.clear();
    }

    getDicePool() {
        return { ...this.dicePool };
    }

    getTotalDiceCount() {
        return Object.values(this.dicePool).reduce((total, dice) => total + dice.count, 0);
    }

    getDiceTypes() {
        return Object.keys(this.dicePool);
    }

    getDiceSides(type) {
        const sidesMap = {
            d20: 20,
            d12: 12,
            d10: 10,
            d100: 100,
            d8: 8,
            d6: 6,
            d4: 4,
            d2: 2
        };
        return sidesMap[type] || 6;
    }

    rollSingleDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    rollAllDice() {
        const results = {};
        let totalGrand = 0;

        Object.keys(this.dicePool).forEach(type => {
            const { count } = this.dicePool[type];
            if (count > 0) {
                const sides = this.getDiceSides(type);
                const rolls = [];
                let totalForType = 0;

                for (let i = 0; i < count; i++) {
                    const roll = this.rollSingleDie(sides);
                    rolls.push({
                        value: roll,
                        id: `${type}_${i}_${Date.now()}`,
                        selected: false,
                        removed: false
                    });
                    totalForType += roll;
                }

                this.dicePool[type].results = rolls;
                results[type] = {
                    rolls,
                    total: totalForType,
                    count
                };
                totalGrand += totalForType;
            }
        });

        return {
            byType: results,
            grandTotal: totalGrand,
            timestamp: Date.now()
        };
    }

    rerollSelectedDice() {
        let totalGrand = 0;
        const rerolledResults = {};

        Object.keys(this.dicePool).forEach(type => {
            const { results } = this.dicePool[type];
            if (results.length > 0) {
                let totalForType = 0;
                const sides = this.getDiceSides(type);
                
                results.forEach(die => {
                    if (!die.removed) {
                        if (this.selectedDice.has(die.id)) {
                            die.value = this.rollSingleDie(sides);
                            die.selected = false; // Deselect after reroll
                        }
                        totalForType += die.value;
                    }
                });

                rerolledResults[type] = {
                    rolls: results,
                    total: totalForType,
                    count: results.filter(r => !r.removed).length
                };
                totalGrand += totalForType;
            }
        });

        this.selectedDice.clear();
        
        return {
            byType: rerolledResults,
            grandTotal: totalGrand,
            timestamp: Date.now()
        };
    }

    toggleDiceSelection(diceId) {
        if (this.selectedDice.has(diceId)) {
            this.selectedDice.delete(diceId);
        } else {
            this.selectedDice.add(diceId);
        }
        
        // Update the selected state in the results
        Object.values(this.dicePool).forEach(({ results }) => {
            results.forEach(die => {
                if (die.id === diceId) {
                    die.selected = this.selectedDice.has(diceId);
                }
            });
        });
    }

    removeSelectedDice() {
        let totalGrand = 0;
        const updatedResults = {};

        Object.keys(this.dicePool).forEach(type => {
            const { results } = this.dicePool[type];
            if (results.length > 0) {
                let totalForType = 0;
                
                results.forEach(die => {
                    if (this.selectedDice.has(die.id)) {
                        die.removed = true;
                        die.selected = false;
                    }
                    if (!die.removed) {
                        totalForType += die.value;
                    }
                });

                updatedResults[type] = {
                    rolls: results,
                    total: totalForType,
                    count: results.filter(r => !r.removed).length
                };
                totalGrand += totalForType;
            }
        });

        this.selectedDice.clear();
        
        return {
            byType: updatedResults,
            grandTotal: totalGrand,
            timestamp: Date.now()
        };
    }

    getSelectedDiceCount() {
        return this.selectedDice.size;
    }
}