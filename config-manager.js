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
    async loadConfig(forceReload = false) {
        if (this.isLoaded && this.gameConfig && !forceReload) {
            console.log('Config already loaded, returning cached config');
            return this.gameConfig;
        }

        try {
            console.log('Loading game configuration from game-config.json...');
            // Add cache busting parameter to prevent browser caching
            const cacheBuster = forceReload ? `?v=${Date.now()}` : '';
            const response = await fetch(`game-config.json${cacheBuster}`);
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
                },
                ghost: {
                    enabled: true,
                    globalSettings: {
                        baseSpeed: 0.8,
                        speedByDifficulty: {
                            easy: 0.5,
                            neutral: 0.8,
                            hard: 1.2
                        },
                        heartsStolen: {
                            easy: 1,
                            neutral: 2,
                            hard: 3
                        },
                        puzzlesToWeaken: 1,
                        strengthLevels: 5
                    },
                    sprites: {
                        strong: "ghost-strong.png",
                        medium: "ghost-medium.png",
                        weak: "ghost-weak.png"
                    }
                }
            };
            this.isLoaded = true;
            console.log('Using fallback configuration');
            return this.gameConfig;
        }
    }

    /**
     * Deep merge two objects
     * @param {object} target - Target object
     * @param {object} source - Source object to merge
     * @returns {object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    // If both target and source have the key and both are objects, merge recursively
                    if (result[key] && typeof result[key] === 'object') {
                        result[key] = this.deepMerge(result[key], source[key]);
                    } else {
                        result[key] = source[key];
                    }
                } else {
                    // For primitive values or arrays, replace directly
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    /**
     * Update configuration with custom settings
     * @param {object} customConfig - Custom configuration object
     */
    updateConfig(customConfig) {
        if (!this.gameConfig) {
            console.warn('No base config loaded, cannot update with custom config');
            return;
        }
        
        console.log('Updating game configuration with custom settings...');
        console.log('Custom config to apply:', customConfig);
        
        // Deep merge custom config with existing config
        this.gameConfig = this.deepMerge(this.gameConfig, customConfig);
        
        console.log('Game configuration updated successfully');
        console.log('Updated levels:', this.gameConfig.levels);
    }

    /**
     * Check if custom config is available and apply it
     */
    checkAndApplyCustomConfig() {
        if (window.customGameConfig) {
            console.log('Found custom game config, applying...');
            this.updateConfig(window.customGameConfig);
            return true;
        }
        return false;
    }

    /**
     * Force reload configuration with custom settings
     * Used when settings are applied mid-session
     */
    async reloadWithCustomConfig() {
        if (window.customGameConfig) {
            console.log('Reloading configuration with custom settings...');
            
            // Reload base config first
            const response = await fetch('game-config.json');
            if (response.ok) {
                this.gameConfig = await response.json();
                this.isLoaded = true;
            }
            
            // Apply custom config
            this.updateConfig(window.customGameConfig);
            console.log('Configuration reloaded with custom settings');
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
        
        // Get level-specific overrides from the puzzle array
        const levelConfig = this.getLevelConfig(level);
        if (levelConfig && levelConfig.puzzles && Array.isArray(levelConfig.puzzles)) {
            // Find the specific puzzle in the array
            const levelPuzzle = levelConfig.puzzles.find(puzzle => puzzle.type === puzzleType);
            if (levelPuzzle) {
                // Create a copy without the 'type' property for merging
                const levelOverrides = { ...levelPuzzle };
                delete levelOverrides.type;
                
                // Deep merge level overrides with defaults
                return this.deepMerge(defaultConfig, levelOverrides);
            }
        }

        return defaultConfig;
    }

    /**
     * Get specific puzzle configuration for a particular door instance
     * @param {number} level - Level number
     * @param {string} puzzleType - Puzzle type
     * @param {string} obstacleCode - Obstacle code (ob1, ob2, etc.)
     * @returns {object} Puzzle configuration for the specific instance
     */
    getSpecificPuzzleConfig(level, puzzleType, obstacleCode) {
        if (!this.gameConfig || !this.gameConfig.puzzles || !this.gameConfig.puzzles[puzzleType]) {
            console.warn(`No default puzzle configuration found for type: ${puzzleType}`);
            return null;
        }

        // Start with default puzzle configuration
        const defaultConfig = JSON.parse(JSON.stringify(this.gameConfig.puzzles[puzzleType]));
        
        // Get level-specific configuration
        const levelConfig = this.getLevelConfig(level);
        if (levelConfig && levelConfig.puzzles && Array.isArray(levelConfig.puzzles)) {
            // Find the puzzle index based on obstacle code
            const puzzleIndex = this.getObstacleIndex(level, obstacleCode);
            
            if (puzzleIndex !== -1 && puzzleIndex < levelConfig.puzzles.length) {
                const levelPuzzle = levelConfig.puzzles[puzzleIndex];
                
                // Verify this is the correct puzzle type
                if (levelPuzzle && levelPuzzle.type === puzzleType) {
                    // Create a copy without the 'type' property for merging
                    const levelOverrides = { ...levelPuzzle };
                    delete levelOverrides.type;
                    
                    // Deep merge level overrides with defaults
                    return this.deepMerge(defaultConfig, levelOverrides);
                }
            }
        }

        return defaultConfig;
    }

    /**
     * Get the array index for a specific obstacle code
     * @param {number} level - Level number  
     * @param {string} obstacleCode - Obstacle code (ob1, ob2, etc.)
     * @returns {number} Array index (-1 if not found)
     */
    getObstacleIndex(level, obstacleCode) {
        // Extract the number from obstacle code (ob1 -> 1, ob2 -> 2, etc.)
        const match = obstacleCode.match(/^ob(\d+)$/);
        if (match) {
            const obstacleNumber = parseInt(match[1]);
            // Convert to 0-based array index
            return obstacleNumber - 1;
        }
        return -1;
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
     * Get puzzle mapping array for a level
     * @param {number} level - Level number
     * @returns {string[]} Array of puzzle types in order (e.g., ['number_line', 'word_emoji_matching'])
     */
    getPuzzleMapping(level) {
        const levelConfig = this.getLevelConfig(level);
        
        if (!levelConfig || !levelConfig.puzzles || !Array.isArray(levelConfig.puzzles)) {
            console.warn(`No puzzle array found for level ${level}`);
            return [];
        }
        
        return levelConfig.puzzles.map(puzzle => puzzle.type);
    }

    /**
     * Get obstacle code for a puzzle type in a specific level
     * @param {number} level - Level number
     * @param {string} puzzleType - Puzzle type (e.g., 'simple_arithmetic')
     * @returns {string|null} Obstacle code (e.g., 'ob1', 'ob2') or null if not found
     */
    getObstacleCode(level, puzzleType) {
        const puzzleMapping = this.getPuzzleMapping(level);
        const index = puzzleMapping.indexOf(puzzleType);
        
        if (index === -1) {
            console.warn(`Puzzle type '${puzzleType}' not found in level ${level}`);
            return null;
        }
        
        return `ob${index + 1}`; // ob1, ob2, ob3, etc.
    }

    /**
     * Get puzzle type from obstacle code for a specific level
     * @param {number} level - Level number
     * @param {string} obstacleCode - Obstacle code (e.g., 'ob1', 'ob2')
     * @returns {string|null} Puzzle type or null if not found
     */
    getPuzzleTypeFromObstacle(level, obstacleCode) {
        // Extract number from obstacle code (ob1 -> 1, ob2 -> 2, etc.)
        const match = obstacleCode.match(/^ob(\d+)$/);
        if (!match) {
            console.warn(`Invalid obstacle code format: ${obstacleCode}`);
            return null;
        }
        
        const obstacleIndex = parseInt(match[1]) - 1; // Convert to 0-based index
        const puzzleMapping = this.getPuzzleMapping(level);
        
        if (obstacleIndex < 0 || obstacleIndex >= puzzleMapping.length) {
            console.warn(`Obstacle index ${obstacleIndex + 1} out of range for level ${level}`);
            return null;
        }
        
        return puzzleMapping[obstacleIndex];
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

        // Add generic obstacle textures based on puzzle count
        const puzzleMapping = this.getPuzzleMapping(level);
        for (let i = 0; i < puzzleMapping.length; i++) {
            textures.push(`obstacle${i + 1}`); // obstacle1.png, obstacle2.png, etc.
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

        console.log(`Level ${level} required textures:`, textures);
        return textures;
    }
}

// Create global instance for immediate use
const configManager = new ConfigManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}