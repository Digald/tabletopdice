// Utility functions for the dice rolling app

export const DiceUtils = {
    // Debounce function for performance optimization
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    // Throttle function for scroll/resize events
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Random number generator with better distribution
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Format dice notation (e.g., "2d6+3")
    formatDiceNotation(count, sides, modifier = 0) {
        let notation = `${count}d${sides}`;
        if (modifier > 0) notation += `+${modifier}`;
        else if (modifier < 0) notation += `${modifier}`;
        return notation;
    },

    // Parse dice notation string
    parseDiceNotation(notation) {
        const match = notation.match(/(\d+)d(\d+)([+-]\d+)?/i);
        if (!match) return null;
        
        return {
            count: parseInt(match[1]),
            sides: parseInt(match[2]),
            modifier: match[3] ? parseInt(match[3]) : 0
        };
    },

    // Calculate statistics for dice rolls
    calculateStats(rolls) {
        if (!rolls.length) return null;
        
        const sum = rolls.reduce((acc, val) => acc + val, 0);
        const sorted = [...rolls].sort((a, b) => a - b);
        
        return {
            sum,
            average: sum / rolls.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            median: sorted.length % 2 === 0 
                ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                : sorted[Math.floor(sorted.length / 2)],
            count: rolls.length
        };
    },

    // Check if device supports touch
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Get device type
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(ua)) {
            return 'tablet';
        }
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    },

    // Generate unique ID
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Deep clone object
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = this.deepClone(obj[key]);
            });
            return copy;
        }
    },

    // Format time for display
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    },

    // Validate dice configuration
    validateDiceConfig(config) {
        const validDiceTypes = ['d2', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
        const errors = [];

        if (!config || typeof config !== 'object') {
            errors.push('Invalid configuration object');
            return { valid: false, errors };
        }

        Object.keys(config).forEach(diceType => {
            if (!validDiceTypes.includes(diceType)) {
                errors.push(`Invalid dice type: ${diceType}`);
            }

            const diceData = config[diceType];
            if (!diceData || typeof diceData !== 'object') {
                errors.push(`Invalid data for ${diceType}`);
                return;
            }

            if (typeof diceData.count !== 'number' || diceData.count < 0) {
                errors.push(`Invalid count for ${diceType}: must be non-negative number`);
            }

            if (diceData.count > 100) {
                errors.push(`Too many dice for ${diceType}: maximum 100 per type`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Performance monitor
    performanceMonitor: {
        start(label) {
            if (typeof performance !== 'undefined') {
                performance.mark(`${label}-start`);
            }
        },

        end(label) {
            if (typeof performance !== 'undefined') {
                performance.mark(`${label}-end`);
                performance.measure(label, `${label}-start`, `${label}-end`);
                
                const measure = performance.getEntriesByName(label)[0];
                return measure ? measure.duration : 0;
            }
            return 0;
        }
    },

    // Local storage helpers
    storage: {
        save(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
                return false;
            }
        },

        load(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Failed to load from localStorage:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Failed to remove from localStorage:', error);
                return false;
            }
        }
    },

    // Animation helpers
    animation: {
        easeInOut(t) {
            return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
        },

        easeOut(t) {
            return 1 - (1 - t) * (1 - t);
        },

        lerp(start, end, t) {
            return start + (end - start) * t;
        }
    }
};

export default DiceUtils;