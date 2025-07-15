// PT's Maze Adventure - Configuration Manager
// Provides easy access to level and character configuration data

class ConfigManager {
    constructor() {
        this.levelConfig = LEVEL_CONFIG;
        this.characterConfig = CHARACTER_CONFIG;
    }

    /**
     * Get complete configuration for a specific level
     * @param {number} level - Level number (1-10)
     * @returns {object} Level configuration object
     */
    getLevelConfig(level) {
        if (!this.levelConfig[level]) {
            console.warn(`No configuration found for level ${level}, using level 1 as fallback`);
            return this.levelConfig[1];
        }
        return this.levelConfig[level];
    }

    /**
     * Check if a level has a specific feature
     * @param {number} level - Level number (1-10)
     * @param {string} feature - Feature name (e.g., 'rocket_boost', 'basic_movement')
     * @returns {boolean} True if level has the feature
     */
    hasFeature(level, feature) {
        const config = this.getLevelConfig(level);
        return config.features && config.features.includes(feature);
    }

    /**
     * Get asset configuration for a specific level
     * @param {number} level - Level number (1-10)
     * @returns {object} Asset configuration
     */
    getAssetConfig(level) {
        const config = this.getLevelConfig(level);
        return config.assets || {};
    }

    /**
     * Get puzzle configuration for a specific level and door type
     * @param {number} level - Level number (1-10)
     * @param {string} doorType - Door type (e.g., 'math', 'reading', 'reading1', 'reading2')
     * @returns {object} Puzzle configuration
     */
    getPuzzleConfig(level, doorType) {
        const config = this.getLevelConfig(level);
        return config.puzzles && config.puzzles[doorType] ? config.puzzles[doorType] : null;
    }

    /**
     * Get animation configuration for a specific level
     * @param {number} level - Level number (1-10)
     * @returns {object} Animation configuration
     */
    getAnimationConfig(level) {
        const config = this.getLevelConfig(level);
        return config.animation || { celebrationFrames: 20, frameDelay: 25 };
    }

    /**
     * Get sprite configuration for a specific level and sprite type
     * @param {number} level - Level number (1-10)
     * @param {string} spriteType - Sprite type (e.g., 'celebrate', 'movement', 'bonus')
     * @returns {object} Sprite configuration with frames and dimensions
     */
    getSpriteConfig(level, spriteType) {
        const config = this.getLevelConfig(level);
        return config.assets && config.assets.sprites && config.assets.sprites[spriteType] 
            ? config.assets.sprites[spriteType] 
            : null;
    }

    /**
     * Get starting hearts for a specific level
     * @param {number} level - Level number (1-10)
     * @returns {number} Number of starting hearts
     */
    getStartingHearts(level) {
        const config = this.getLevelConfig(level);
        return config.startingHearts || 3;
    }

    /**
     * Get rocket boost configuration for a specific level
     * @param {number} level - Level number (1-10)
     * @returns {object|null} Rocket boost configuration or null if not available
     */
    getRocketBoostConfig(level) {
        const config = this.getLevelConfig(level);
        return config.rocketBoost || null;
    }

    /**
     * Get list of all available levels
     * @returns {number[]} Array of level numbers
     */
    getAvailableLevels() {
        return Object.keys(this.levelConfig).map(level => parseInt(level)).sort((a, b) => a - b);
    }

    /**
     * Get character configuration
     * @param {string} characterName - Character name (e.g., 'PT')
     * @returns {object} Character configuration
     */
    getCharacterConfig(characterName = 'PT') {
        return this.characterConfig[characterName] || this.characterConfig['PT'];
    }

    /**
     * Get list of available textures for a level
     * @param {number} level - Level number (1-10)
     * @returns {string[]} Array of texture names
     */
    getRequiredTextures(level) {
        const config = this.getLevelConfig(level);
        return config.assets && config.assets.textures ? config.assets.textures : [];
    }

    /**
     * Check if level has bonus features (hearts/speed boost)
     * @param {number} level - Level number (1-10)
     * @returns {boolean} True if level has bonus features
     */
    hasBonusFeatures(level) {
        const config = this.getLevelConfig(level);
        return config.assets && (config.assets.bonus || config.assets.hearts);
    }

    /**
     * Validate configuration for a specific level
     * @param {number} level - Level number (1-10)
     * @returns {object} Validation result with isValid boolean and any errors
     */
    validateLevelConfig(level) {
        const config = this.getLevelConfig(level);
        const errors = [];

        if (!config.difficulty) errors.push('Missing difficulty setting');
        if (!config.features || !Array.isArray(config.features)) errors.push('Missing or invalid features array');
        if (!config.puzzles || typeof config.puzzles !== 'object') errors.push('Missing puzzles configuration');
        if (!config.assets || typeof config.assets !== 'object') errors.push('Missing assets configuration');
        if (!config.animation || typeof config.animation !== 'object') errors.push('Missing animation configuration');

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Create global instance for immediate use
const configManager = new ConfigManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}