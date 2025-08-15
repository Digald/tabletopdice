export class DiceRenderer2D {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.diceAnimations = [];
        
        this.init();
    }

    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'dice-canvas-2d';
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 24px;
            background: transparent;
        `;
        
        // Clear any existing canvas and add the new one
        this.container.innerHTML = '';
        this.container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resize();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
        
        console.log('2D Dice Renderer initialized');
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    async rollDice(dicePool) {
        return new Promise((resolve) => {
            // Clear previous animations
            this.diceAnimations = [];
            
            // Create dice animations for each die in the pool
            let diceIndex = 0;
            const canvasRect = this.canvas.getBoundingClientRect();
            
            Object.keys(dicePool).forEach(type => {
                const count = dicePool[type].count;
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        const dice = {
                            type: type,
                            x: Math.random() * (canvasRect.width - 80) + 40,
                            y: Math.random() * (canvasRect.height - 80) + 40,
                            rotation: Math.random() * 360,
                            rotationSpeed: (Math.random() - 0.5) * 20,
                            scale: 1,
                            currentFace: 1,
                            finalFace: this.getDiceRoll(type),
                            animationProgress: 0,
                            bounceY: 0,
                            bounceSpeed: Math.random() * 0.3 + 0.2
                        };
                        this.diceAnimations.push(dice);
                        diceIndex++;
                    }
                }
            });
            
            // Start animation
            const animationDuration = 2000; // 2 seconds
            const startTime = Date.now();
            
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                
                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);
                
                // Update and draw each dice
                this.diceAnimations.forEach(dice => {
                    this.updateDiceAnimation(dice, progress);
                    this.drawDice(dice);
                });
                
                if (progress < 1) {
                    this.animationId = requestAnimationFrame(animate);
                } else {
                    // Animation complete
                    setTimeout(() => {
                        resolve();
                    }, 500); // Short delay to show final result
                }
            };
            
            animate();
        });
    }

    updateDiceAnimation(dice, progress) {
        // Smooth easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // Update rotation (slows down over time)
        const rotationMultiplier = Math.max(0, 1 - progress * 1.5);
        dice.rotation += dice.rotationSpeed * rotationMultiplier;
        
        // Update scale (slight bounce effect)
        const bounceScale = 1 + Math.sin(progress * Math.PI * 6) * 0.1 * (1 - progress);
        dice.scale = 0.8 + easeOut * 0.4 + bounceScale;
        
        // Update bouncing
        dice.bounceY = Math.sin(progress * Math.PI * 8) * 20 * (1 - easeOut);
        
        // Update face (rolls through numbers)
        if (progress < 0.8) {
            dice.currentFace = Math.floor(Math.random() * this.getDiceSides(dice.type)) + 1;
        } else {
            dice.currentFace = dice.finalFace;
        }
        
        dice.animationProgress = progress;
    }

    drawDice(dice) {
        const ctx = this.ctx;
        const size = 60 * dice.scale;
        
        ctx.save();
        
        // Translate to dice position
        ctx.translate(dice.x, dice.y + dice.bounceY);
        ctx.rotate(dice.rotation * Math.PI / 180);
        
        // Draw dice shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(-size/2 + 4, -size/2 + 4, size, size);
        
        // Draw dice background with glassmorphism effect
        const gradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
        ctx.fillStyle = gradient;
        
        // Rounded rectangle
        const radius = size * 0.15;
        ctx.beginPath();
        ctx.roundRect(-size/2, -size/2, size, size, radius);
        ctx.fill();
        
        // Draw dice border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Draw dice dots or number
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = `600 ${size * 0.4}px -apple-system, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (dice.type === 'd100') {
            // For d100, show two-digit number
            ctx.fillText(dice.currentFace.toString().padStart(2, '0'), 0, 0);
        } else if (dice.currentFace <= 6) {
            // For standard dice faces (1-6), draw dots
            this.drawDiceDots(ctx, dice.currentFace, size);
        } else {
            // For higher numbers, just show the number
            ctx.fillText(dice.currentFace.toString(), 0, 0);
        }
        
        // Draw dice type label
        ctx.font = `500 ${size * 0.14}px -apple-system, system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillText(dice.type, 0, size/2 - 6);
        
        ctx.restore();
    }

    drawDiceDots(ctx, face, size) {
        const dotSize = size * 0.08;
        const spacing = size * 0.25;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        
        // Define dot positions for each face
        const dotPositions = {
            1: [[0, 0]],
            2: [[-spacing, -spacing], [spacing, spacing]],
            3: [[-spacing, -spacing], [0, 0], [spacing, spacing]],
            4: [[-spacing, -spacing], [spacing, -spacing], [-spacing, spacing], [spacing, spacing]],
            5: [[-spacing, -spacing], [spacing, -spacing], [0, 0], [-spacing, spacing], [spacing, spacing]],
            6: [[-spacing, -spacing], [spacing, -spacing], [-spacing, 0], [spacing, 0], [-spacing, spacing], [spacing, spacing]]
        };
        
        const positions = dotPositions[face] || [];
        positions.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    getDiceRoll(type) {
        const sides = this.getDiceSides(type);
        return Math.floor(Math.random() * sides) + 1;
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

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.resize);
    }
}