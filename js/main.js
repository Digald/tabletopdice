import { DiceManager } from './DiceManager.js';
import { DiceRenderer2D } from './DiceRenderer2D.js';
import { UIController } from './UIController.js';

class DiceRollerApp {
    constructor() {
        this.diceManager = null;
        this.renderer2D = null;
        this.uiController = null;
        
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize core components
            this.diceManager = new DiceManager();
            
            // Initialize 2D renderer
            const diceContainer = document.getElementById('dice-container');
            if (!diceContainer) {
                throw new Error('Dice container not found');
            }
            
            this.renderer2D = new DiceRenderer2D(diceContainer);
            
            // Initialize UI controller
            this.uiController = new UIController(this.diceManager, this.renderer2D);

            // Add message toast styles to document
            this.addDynamicStyles();

            console.log('Dice Roller App initialized successfully');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Failed to initialize Dice Roller App:', error);
            this.showErrorMessage('Failed to initialize app. Please refresh and try again.');
        }
    }


    addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                85% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }

            .message-toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(233, 69, 96, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                z-index: 1000;
                font-size: 14px;
                backdrop-filter: blur(10px);
                animation: fadeInOut 2s ease-in-out;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                max-width: 300px;
                text-align: center;
                pointer-events: none;
            }

            /* Loading animation for dice */
            .dice-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #f39c12;
                font-size: 18px;
                text-align: center;
            }

            .dice-loading::after {
                content: '⚀⚁⚂⚃⚄⚅';
                animation: diceLoading 1s infinite;
            }

            @keyframes diceLoading {
                0% { opacity: 0.3; }
                50% { opacity: 1; }
                100% { opacity: 0.3; }
            }

            /* Accessibility improvements */
            .dice-button:focus {
                outline: 2px solid #f39c12;
                outline-offset: 2px;
            }

            .primary-button:focus,
            .secondary-button:focus {
                outline: 2px solid #f39c12;
                outline-offset: 2px;
            }

            .dice-result:focus {
                outline: 2px solid #f39c12;
                outline-offset: 2px;
            }

            /* Enhanced mobile interactions */
            @media (max-width: 768px) {
                .dice-button {
                    touch-action: manipulation;
                    -webkit-touch-callout: none;
                    -webkit-user-select: none;
                    user-select: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.showMessage('Welcome! Tap dice icons to select, hold to reset. Roll some dice!');
        }, 500);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(233, 69, 96, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 1001;
            max-width: 300px;
            font-size: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showMessage(text) {
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-toast';
        messageDiv.textContent = text;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 2000);
    }

    // Public API for debugging/testing
    getDiceManager() {
        return this.diceManager;
    }

    getRenderer2D() {
        return this.renderer2D;
    }

    getUIController() {
        return this.uiController;
    }

    // Cleanup method
    destroy() {
        if (this.uiController) {
            this.uiController.destroy();
        }
        if (this.renderer2D) {
            this.renderer2D.destroy();
        }
    }
}

// Initialize the app when the script loads
const app = new DiceRollerApp();

// Make app globally available for debugging
window.diceApp = app;

// Handle page unload cleanup
window.addEventListener('beforeunload', () => {
    app.destroy();
});

// Export for module systems
export default DiceRollerApp;