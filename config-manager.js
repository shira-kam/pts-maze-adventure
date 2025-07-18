// PT's Maze Adventure - Configuration Manager
// Provides easy access to JSON-based level and character configuration data

class ConfigManager {
    constructor() {
        this.gameConfig = null;
        this.isLoaded = false;
    }

    /**
     * Load configuration from JSON file
     * @returns {Promise<object>} Game configuration object
     */
    async loadConfig() {
        if (this.isLoaded && this.gameConfig) {
            console.log('Config already loaded, returning cached config');
            return this.gameConfig;
        }

        try {
            console.log('Loading game configuration from game-config.json...');
            const response = await fetch('game-config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.gameConfig = await response.json();
            this.isLoaded = true;
            console.log('Game configuration loaded successfully:', this.gameConfig);
            console.log('Available levels:', Object.keys(this.gameConfig.levels));
            console.log('Available puzzles:', Object.keys(this.gameConfig.puzzles));
            return this.gameConfig;
        } catch (error) {
            console.error('Error loading game configuration:', error);
            // Return minimal fallback config
            this.gameConfig = {
                puzzles: {},
                levels: {},
                characters: {
                    PT: {
                        name: 'PT the Elephant',
                        movement: 'PT-sprite.svg',
                        bonus: 'PT-Bonus-Sprite.svg'
                    }
                }
            };
            this.isLoaded = true;
            console.log('Using fallback configuration');
            return this.gameConfig;
        }
    }

    /**
     * Get complete configuration for a specific level
     * @param {number} level - Level number
     * @returns {object} Level configuration object
     */
    getLevelConfig(level) {
        if (!this.gameConfig || !this.gameConfig.levels || !this.gameConfig.levels[level]) {
            console.warn(`No configuration found for level ${level}`);
            return null;
        }
        return this.gameConfig.levels[level];
    }

    /**
     * Check if a level has rocket boost feature
     * @param {number} level - Level number
     * @param {string} feature - Feature name (e.g., 'rocket_boost')
     * @returns {boolean} True if level has the feature
     */
    hasFeature(level, feature) {
        const config = this.getLevelConfig(level);
        if (!config || !config.assets) return false;
        
        // rocket_boost is determined by bonus asset being true
        if (feature === 'rocket_boost') {
            return config.assets.bonus === true;
        }
        
        // Add other features as needed
        return false;
    }

    /**
     * Get asset configuration for a specific level
     * @param {number} level - Level number
     * @returns {object} Asset configuration
     */
    getAssetConfig(level) {
        const config = this.getLevelConfig(level);
        return config ? config.assets || {} : {};
    }

    /**
     * Get puzzle configuration for a specific level and puzzle type
     * @param {number} level - Level number
     * @param {string} puzzleType - Puzzle type (e.g., 'simple_arithmetic', 'word_emoji_matching')
     * @returns {object} Merged puzzle configuration (defaults + level overrides)
     */
    getPuzzleConfig(level, puzzleType) {
        if (!this.gameConfig || !this.gameConfig.puzzles || !this.gameConfig.puzzles[puzzleType]) {
            console.warn(`No default puzzle configuration found for type: ${puzzleType}`);
            return null;
        }

        // Start with default puzzle configuration
        const defaultConfig = JSON.parse(JSON.stringify(this.gameConfig.puzzles[puzzleType]));
        
        // Get level-specific overrides
        const levelConfig = this.getLevelConfig(level);
        if (levelConfig && levelConfig.puzzles && levelConfig.puzzles[puzzleType]) {
            const levelOverrides = levelConfig.puzzles[puzzleType];
            
            // Deep merge level overrides with defaults
            return this.deepMerge(defaultConfig, levelOverrides);
        }

        return defaultConfig;
    }

    /**
     * Get animation configuration for a specific level
     * @param {number} level - Level number
     * @returns {object} Animation configuration
     */
    getAnimationConfig(level) {
        const config = this.getLevelConfig(level);
        return config ? config.animation || { celebrationFrames: 20, frameDelay: 25 } : { celebrationFrames: 20, frameDelay: 25 };
    }

    /**
     * Get celebration sprite configuration for a specific level
     * @param {number} level - Level number
     * @returns {object} Celebration sprite configuration
     */
    getCelebrationSpriteConfig(level) {
        const config = this.getLevelConfig(level);
        if (config && config.assets && config.assets.celebration) {
            return config.assets.celebration;
        }
        return { frames: 20, frameWidth: 200, frameHeight: 200 };
    }

    /**
     * Get list of all available levels
     * @returns {number[]} Array of level numbers
     */
    getAvailableLevels() {
        if (!this.gameConfig || !this.gameConfig.levels) {
            return [];
        }
        return Object.keys(this.gameConfig.levels).map(level => parseInt(level)).sort((a, b) => a - b);
    }

    /**
     * Get list of playable levels (excludes debug-only levels)
     * @returns {number[]} Array of playable level numbers
     */
    getPlayableLevels() {
        if (!this.gameConfig || !this.gameConfig.levels) {
            return [];
        }
        
        return Object.keys(this.gameConfig.levels)
            .filter(level => this.gameConfig.levels[level].playable === true)
            .map(level => parseInt(level))
            .sort((a, b) => a - b);
    }

    /**
     * Check if a level is playable (not debug-only)
     * @param {number} level - Level number
     * @returns {boolean} True if level is playable
     */
    isLevelPlayable(level) {
        const config = this.getLevelConfig(level);
        return config ? config.playable === true : false;
    }

    /**
     * Get list of available characters
     * @returns {string[]} Array of character names
     */
    getAvailableCharacters() {
        if (!this.gameConfig || !this.gameConfig.characters) {
            return ['PT']; // Default fallback
        }
        return Object.keys(this.gameConfig.characters);
    }

    /**
     * Get character configuration
     * @param {string} characterName - Name of the character
     * @returns {Object} Character configuration object
     */
    getCharacterConfig(characterName) {
        if (!this.gameConfig || !this.gameConfig.characters) {
            console.warn('No character configuration found, using PT defaults');
            return {
                name: 'PT the Elephant',
                movement: 'PT-sprite.svg',
                celebration: 'PT-celebrate.png',
                gameOver: 'PT-game-over.png',
                bonus: { '9': 'PT-Bonus-Sprite.svg', '10': 'PT-Bonus-Sprite.svg' }
            };
        }

        const character = this.gameConfig.characters[characterName];
        if (!character) {
            console.warn(`Character '${characterName}' not found, using PT defaults`);
            return this.getCharacterConfig('PT');
        }

        return character;
    }

    /**
     * Get character-specific asset path
     * @param {string} characterName - Name of the character
     * @param {string} assetType - Type of asset (movement, celebration, gameOver)
     * @param {number} level - Level number (for level-specific assets)
     * @returns {string} Asset path
     */
    getCharacterAssetPath(characterName, assetType, level = null) {
        const character = this.getCharacterConfig(characterName);
        
        switch (assetType) {
            case 'movement':
                return character.movement;
            case 'celebration':
                return level ? `level-${level}/${character.celebration}` : character.celebration;
            case 'gameOver':
                return character.gameOver;
            case 'bonus':
                if (level && character.bonus && character.bonus[level.toString()]) {
                    return character.bonus[level.toString()];
                }
                return character.bonus?.['9'] || 'PT-Bonus-Sprite.svg'; // Fallback
            default:
                console.warn(`Unknown asset type: ${assetType}`);
                return '';
        }
    }

    /**
     * Get character configuration
     * @param {string} characterName - Character name (e.g., 'PT')
     * @returns {object} Character configuration
     */
    getCharacterConfig(characterName = 'PT') {
        if (!this.gameConfig || !this.gameConfig.characters) {
            return { name: 'PT the Elephant', movement: 'PT-sprite.svg', bonus: 'PT-Bonus-Sprite.svg' };
        }
        return this.gameConfig.characters[characterName] || this.gameConfig.characters['PT'];
    }

    /**
     * Check if level has bonus features (hearts/speed boost)
     * @param {number} level - Level number
     * @returns {boolean} True if level has bonus features
     */
    hasBonusFeatures(level) {
        const config = this.getLevelConfig(level);
        return config && config.assets && (config.assets.bonus || config.assets.hearts);
    }

    /**
     * Check if level has hearts
     * @param {number} level - Level number
     * @returns {boolean} True if level has hearts
     */
    hasHearts(level) {
        const config = this.getLevelConfig(level);
        return config && config.assets && config.assets.hearts === true;
    }

    /**
     * Check if level has bonus items
     * @param {number} level - Level number
     * @returns {boolean} True if level has bonus items
     */
    hasBonus(level) {
        const config = this.getLevelConfig(level);
        return config && config.assets && config.assets.bonus === true;
    }

    /**
     * Validate that game configuration is loaded
     * @returns {boolean} True if configuration is loaded
     */
    isConfigLoaded() {
        return this.isLoaded && this.gameConfig !== null;
    }

    /**
     * Deep merge two objects
     * @param {object} target - Target object
     * @param {object} source - Source object
     * @returns {object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Get the door type for a puzzle type
     * @param {string} puzzleType - Puzzle type (e.g., 'simple_arithmetic')
     * @returns {string} Door type (e.g., 'ma')
     */
    getPuzzleDoorType(puzzleType) {
        if (!this.gameConfig || !this.gameConfig.puzzles || !this.gameConfig.puzzles[puzzleType]) {
            console.warn(`No puzzle config found for type: ${puzzleType}`);
            return null;
        }
        const doorType = this.gameConfig.puzzles[puzzleType].doorType;
        return doorType;
    }

    /**
     * Get puzzle type by door type
     * @param {string} doorType - Door type (e.g., 'ma')
     * @returns {string} Puzzle type (e.g., 'simple_arithmetic')
     */
    getPuzzleTypeByDoorType(doorType) {
        if (!this.gameConfig || !this.gameConfig.puzzles) {
            return null;
        }
        
        for (const puzzleType in this.gameConfig.puzzles) {
            if (this.gameConfig.puzzles[puzzleType].doorType === doorType) {
                return puzzleType;
            }
        }
        
        return null;
    }

    /**
     * Get required textures for a level based on its puzzle configuration
     * @param {number} level - Level number
     * @returns {string[]} Array of texture names (e.g., ['wall', 'open', 'ma', 'we', 'endpoint'])
     */
    getRequiredTextures(level) {
        const levelConfig = this.getLevelConfig(level);
        if (!levelConfig) {
            console.warn(`No level config found for level ${level}, using default textures`);
            return ['wall', 'open', 'endpoint'];
        }

        const textures = ['wall', 'open', 'endpoint']; // Always needed

        // Add puzzle-specific textures based on level configuration
        if (levelConfig.puzzles) {
            for (const puzzleType in levelConfig.puzzles) {
                const puzzleConfig = this.gameConfig.puzzles[puzzleType];
                if (puzzleConfig && puzzleConfig.doorType) {
                    textures.push(puzzleConfig.doorType);
                }
            }
        }

        // Add asset-specific textures
        if (levelConfig.assets) {
            if (levelConfig.assets.hearts) {
                textures.push('heart');
            }
            if (levelConfig.assets.bonus) {
                textures.push('bonus');
            }
        }

        // console.log(`Level ${level} required textures:`, textures);
        return textures;
    }
}

// Create global instance for immediate use
const configManager = new ConfigManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}