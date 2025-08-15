export class UIController {
    constructor(diceManager, renderer3D) {
        this.diceManager = diceManager;
        this.renderer3D = renderer3D;
        this.currentResults = null;
        
        this.setupEventListeners();
        this.updateDiceCountDisplay();
    }

    setupEventListeners() {
        // Dice selection buttons
        const diceButtons = document.querySelectorAll('.dice-button');
        
        diceButtons.forEach(button => {
            const diceType = button.dataset.dice;
            
            // Handle both touch and mouse interactions properly
            let pressTimer = null;
            let longPressTriggered = false;
            
            // Primary click/tap handler for adding dice
            const handleAddDice = () => {
                if (!longPressTriggered) {
                    // Add dice when clicked/tapped
                    this.handleDiceAdd(diceType);
                }
                longPressTriggered = false;
            };
            
            // Long press handler for reset
            const startLongPress = () => {
                longPressTriggered = false;
                pressTimer = setTimeout(() => {
                    longPressTriggered = true;
                    this.handleDiceReset(diceType);
                    navigator.vibrate && navigator.vibrate(50); // Haptic feedback
                }, 500);
            };
            
            const cancelLongPress = () => {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
            };
            
            // Touch events (mobile)
            button.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent mouse events from firing
                startLongPress();
            });

            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                cancelLongPress();
                // Add dice on touch end if long press wasn't triggered
                setTimeout(() => handleAddDice(), 10);
            });

            button.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                cancelLongPress();
                longPressTriggered = false;
            });

            // Mouse events (desktop) - only if no touch events
            button.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // Left click only
                    startLongPress();
                }
            });

            button.addEventListener('mouseup', (e) => {
                if (e.button === 0) {
                    cancelLongPress();
                    handleAddDice();
                }
            });

            button.addEventListener('mouseleave', () => {
                cancelLongPress();
                longPressTriggered = false;
            });

            // Prevent context menu on long press
            button.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });

        // Roll button
        document.getElementById('roll-button').addEventListener('click', () => {
            this.handleRoll();
        });

        // Clear all button
        document.getElementById('clear-all-button').addEventListener('click', () => {
            this.handleClearAll();
        });

        // Reroll controls
        document.getElementById('reroll-selected').addEventListener('click', () => {
            this.handleRerollSelected();
        });

        document.getElementById('remove-selected').addEventListener('click', () => {
            this.handleRemoveSelected();
        });

        // Drawer toggle
        document.getElementById('drawer-handle').addEventListener('click', (e) => {
            // Don't toggle if clicking on the quick roll button
            if (!e.target.closest('.quick-roll-btn')) {
                this.toggleDrawer();
            }
        });

        // Quick roll button
        document.getElementById('quick-roll-button').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent drawer toggle
            this.handleRoll();
        });
    }

    handleDiceAdd(diceType) {
        this.diceManager.addDice(diceType);
        this.updateDiceCountDisplay();
        this.animateDiceButton(diceType);
    }

    handleDiceReset(diceType) {
        this.diceManager.resetDice(diceType);
        this.updateDiceCountDisplay();
        this.showResetFeedback(diceType);
    }

    handleClearAll() {
        this.diceManager.resetAllDice();
        this.updateDiceCountDisplay();
        this.clearResults();
        this.collapseDrawer();
        this.showMessage('All dice cleared');
    }

    async handleRoll() {
        const totalDice = this.diceManager.getTotalDiceCount();
        if (totalDice === 0) {
            this.showMessage('Please select some dice to roll!');
            return;
        }

        this.setRollingState(true);
        
        try {
            // Start 3D animation
            const dicePool = this.diceManager.getDicePool();
            const animationPromise = this.renderer3D.rollDice(dicePool);
            
            // Calculate results
            const results = this.diceManager.rollAllDice();
            
            // Wait for animation to complete
            await animationPromise;
            
            this.currentResults = results;
            this.displayResults(results);
            
        } catch (error) {
            console.error('Error during roll:', error);
            this.showMessage('Error occurred during roll');
        } finally {
            this.setRollingState(false);
        }
    }

    handleRerollSelected() {
        if (this.diceManager.getSelectedDiceCount() === 0) {
            this.showMessage('Please select dice to reroll');
            return;
        }

        const results = this.diceManager.rerollSelectedDice();
        this.currentResults = results;
        this.displayResults(results);
        this.showMessage('Selected dice rerolled');
    }

    handleRemoveSelected() {
        if (this.diceManager.getSelectedDiceCount() === 0) {
            this.showMessage('Please select dice to remove');
            return;
        }

        const results = this.diceManager.removeSelectedDice();
        this.currentResults = results;
        this.displayResults(results);
        this.showMessage('Selected dice removed');
    }

    updateDiceCountDisplay() {
        const dicePool = this.diceManager.getDicePool();
        
        Object.keys(dicePool).forEach(type => {
            const countElement = document.getElementById(`count-${type}`);
            const count = dicePool[type].count;
            
            if (countElement) {
                countElement.textContent = count;
                countElement.classList.toggle('active', count > 0);
            }
        });

        this.updateRollButton();
    }

    updateRollButton() {
        const rollButton = document.getElementById('roll-button');
        const quickRollButton = document.getElementById('quick-roll-button');
        const totalDice = this.diceManager.getTotalDiceCount();
        
        if (totalDice === 0) {
            rollButton.textContent = 'Select Dice';
            rollButton.disabled = true;
            quickRollButton.textContent = 'Roll';
            quickRollButton.disabled = true;
        } else {
            rollButton.textContent = `Roll ${totalDice} Dice`;
            rollButton.disabled = false;
            quickRollButton.textContent = totalDice === 1 ? 'Roll' : `Roll ${totalDice}`;
            quickRollButton.disabled = false;
        }
    }

    displayResults(results) {
        const individualResults = document.getElementById('individual-results');
        const groupTotals = document.getElementById('group-totals');
        const grandTotal = document.getElementById('grand-total');
        const rerollControls = document.getElementById('reroll-controls');

        // Clear previous results
        individualResults.innerHTML = '';
        groupTotals.innerHTML = '';

        // Display individual dice results
        Object.keys(results.byType).forEach(type => {
            const typeData = results.byType[type];
            
            typeData.rolls.forEach(die => {
                if (!die.removed) {
                    const dieElement = document.createElement('div');
                    dieElement.className = `dice-result ${die.selected ? 'selected' : ''}`;
                    dieElement.textContent = `${type}: ${die.value}`;
                    dieElement.dataset.dieId = die.id;
                    
                    dieElement.addEventListener('click', () => {
                        this.handleDiceResultClick(die.id);
                    });
                    
                    individualResults.appendChild(dieElement);
                }
            });

            // Display group totals
            if (typeData.count > 0) {
                const groupElement = document.createElement('div');
                groupElement.className = 'group-total';
                groupElement.textContent = `${typeData.count}${type} total: ${typeData.total}`;
                groupTotals.appendChild(groupElement);
            }
        });

        // Display grand total
        grandTotal.textContent = `Grand Total: ${results.grandTotal}`;

        // Show reroll controls
        rerollControls.style.display = 'flex';

        // Expand drawer to show results
        this.expandDrawer();

        // Add fade-in animation
        document.getElementById('results-panel').classList.add('fade-in');
        setTimeout(() => {
            document.getElementById('results-panel').classList.remove('fade-in');
        }, 300);
    }

    handleDiceResultClick(dieId) {
        this.diceManager.toggleDiceSelection(dieId);
        
        // Update visual state
        const dieElement = document.querySelector(`[data-die-id="${dieId}"]`);
        if (dieElement) {
            dieElement.classList.toggle('selected');
        }

        this.updateRerollControls();
    }

    updateRerollControls() {
        const selectedCount = this.diceManager.getSelectedDiceCount();
        const rerollButton = document.getElementById('reroll-selected');
        const removeButton = document.getElementById('remove-selected');

        rerollButton.textContent = selectedCount > 0 ? 
            `Reroll ${selectedCount} dice` : 'Reroll Selected';
        removeButton.textContent = selectedCount > 0 ? 
            `Remove ${selectedCount} dice` : 'Remove Selected';
    }

    setRollingState(rolling) {
        const rollButton = document.getElementById('roll-button');
        const quickRollButton = document.getElementById('quick-roll-button');
        const diceButtons = document.querySelectorAll('.dice-button');
        
        if (rolling) {
            rollButton.textContent = 'Rolling...';
            rollButton.disabled = true;
            quickRollButton.textContent = 'Rolling...';
            quickRollButton.disabled = true;
            diceButtons.forEach(btn => btn.style.pointerEvents = 'none');
            document.body.classList.add('dice-rolling');
        } else {
            this.updateRollButton();
            diceButtons.forEach(btn => btn.style.pointerEvents = 'auto');
            document.body.classList.remove('dice-rolling');
        }
    }

    clearResults() {
        document.getElementById('individual-results').innerHTML = '';
        document.getElementById('group-totals').innerHTML = '';
        document.getElementById('grand-total').textContent = '';
        document.getElementById('reroll-controls').style.display = 'none';
        this.currentResults = null;
    }

    animateDiceButton(diceType) {
        const button = document.querySelector(`[data-dice="${diceType}"]`);
        if (button) {
            button.style.transform = 'scale(1.1)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    }

    showResetFeedback(diceType) {
        const button = document.querySelector(`[data-dice="${diceType}"]`);
        if (button) {
            button.style.background = 'linear-gradient(135deg, #e94560, #f39c12)';
            setTimeout(() => {
                button.style.background = '';
            }, 300);
        }
        this.showMessage(`${diceType} reset to 0`);
    }

    toggleDrawer() {
        const drawer = document.getElementById('bottom-drawer');
        const isExpanded = drawer.classList.contains('drawer-expanded');
        
        if (isExpanded) {
            drawer.classList.remove('drawer-expanded');
            drawer.classList.add('drawer-collapsed');
        } else {
            drawer.classList.remove('drawer-collapsed');
            drawer.classList.add('drawer-expanded');
        }
    }

    expandDrawer() {
        const drawer = document.getElementById('bottom-drawer');
        drawer.classList.remove('drawer-collapsed');
        drawer.classList.add('drawer-expanded');
    }

    collapseDrawer() {
        const drawer = document.getElementById('bottom-drawer');
        drawer.classList.remove('drawer-expanded');
        drawer.classList.add('drawer-collapsed');
    }

    showMessage(text) {
        // Simple message system - could be enhanced with a toast notification
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-toast';
        messageDiv.textContent = text;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(102, 126, 234, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 1000;
            font-size: 14px;
            backdrop-filter: blur(10px);
            animation: fadeInOut 2s ease-in-out;
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 2000);
    }

    destroy() {
        // Clean up event listeners if needed
        document.querySelectorAll('.dice-button').forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
    }
}