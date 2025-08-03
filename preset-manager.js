/**
 * Preset Manager - Handles loading and applying learning package presets
 */

class PresetManager {
    constructor() {
        this.availablePresets = [];
        this.currentPreset = null;
        this.baseConfig = null;
    }

    /**
     * Load all available presets from the presets directory
     */
    async loadAvailablePresets() {
        try {
            const response = await fetch('presets/index.json');
            const data = await response.json();
            
            const presetPromises = data.presets.map(async (presetInfo) => {
                try {
                    const presetResponse = await fetch(`presets/${presetInfo.file}`);
                    const presetData = await presetResponse.json();
                    return {
                        ...presetData,
                        category: presetInfo.category,
                        order: presetInfo.order
                    };
                } catch (error) {
                    console.warn(`Failed to load preset: ${presetInfo.file}`, error);
                    return null;
                }
            });

            const presets = await Promise.all(presetPromises);
            this.availablePresets = presets.filter(preset => preset !== null);
            
            console.log('PresetManager: Loaded presets:', this.availablePresets.map(p => p.name));
            return this.availablePresets;
        } catch (error) {
            console.error('PresetManager: Failed to load presets:', error);
            return [];
        }
    }

    /**
     * Get a specific preset by ID
     */
    getPresetById(presetId) {
        return this.availablePresets.find(preset => preset.id === presetId);
    }

    /**
     * Load the base game configuration
     */
    async loadBaseConfig() {
        try {
            const response = await fetch('game-config.json');
            this.baseConfig = await response.json();
            console.log('PresetManager: Loaded base config');
            return this.baseConfig;
        } catch (error) {
            console.error('PresetManager: Failed to load base config:', error);
            return null;
        }
    }

    /**
     * Apply a preset to the base configuration
     * Returns merged configuration object
     */
    applyPreset(presetId, customConfig = null) {
        const preset = this.getPresetById(presetId);
        if (!preset) {
            console.error(`PresetManager: Preset not found: ${presetId}`);
            return this.baseConfig;
        }

        if (!this.baseConfig) {
            console.error('PresetManager: Base config not loaded');
            return null;
        }

        console.log(`PresetManager: Applying preset: ${preset.name}`);

        // Deep clone base config to avoid mutation
        const mergedConfig = JSON.parse(JSON.stringify(this.baseConfig));

        // Apply preset level configurations
        if (preset.levels) {
            Object.keys(preset.levels).forEach(levelKey => {
                if (mergedConfig.levels[levelKey]) {
                    // Merge preset level config over base level config
                    mergedConfig.levels[levelKey] = {
                        ...mergedConfig.levels[levelKey],
                        ...preset.levels[levelKey]
                    };
                }
            });
        }

        // Apply any custom configuration overrides
        if (customConfig && customConfig.levels) {
            Object.keys(customConfig.levels).forEach(levelKey => {
                if (mergedConfig.levels[levelKey]) {
                    mergedConfig.levels[levelKey] = {
                        ...mergedConfig.levels[levelKey],
                        ...customConfig.levels[levelKey]
                    };
                }
            });
        }

        this.currentPreset = preset;
        console.log('PresetManager: Configuration merged successfully');
        return mergedConfig;
    }

    /**
     * Check if a preset is currently active
     */
    hasActivePreset() {
        return this.currentPreset !== null;
    }

    /**
     * Get the current active preset
     */
    getCurrentPreset() {
        return this.currentPreset;
    }

    /**
     * Clear the current preset
     */
    clearPreset() {
        this.currentPreset = null;
    }

    /**
     * Get preset from session storage (for cross-page persistence)
     */
    getPresetFromSession() {
        try {
            const presetData = sessionStorage.getItem('selectedPreset');
            return presetData ? JSON.parse(presetData) : null;
        } catch (error) {
            console.error('PresetManager: Failed to parse preset from session:', error);
            return null;
        }
    }

    /**
     * Store preset in session storage
     */
    storePresetInSession(preset) {
        try {
            sessionStorage.setItem('selectedPreset', JSON.stringify(preset));
        } catch (error) {
            console.error('PresetManager: Failed to store preset in session:', error);
        }
    }

    /**
     * Get base preset from session storage (for custom settings)
     */
    getBasePresetFromSession() {
        try {
            const presetData = sessionStorage.getItem('basePreset');
            return presetData ? JSON.parse(presetData) : null;
        } catch (error) {
            console.error('PresetManager: Failed to parse base preset from session:', error);
            return null;
        }
    }

    /**
     * Generate a summary of active levels for a preset
     */
    getPresetSummary(presetId) {
        const preset = this.getPresetById(presetId);
        if (!preset || !preset.levels) return null;

        const activeLevels = [];
        const puzzleTypes = new Set();

        Object.keys(preset.levels).forEach(levelKey => {
            const level = preset.levels[levelKey];
            if (level.playable) {
                activeLevels.push(parseInt(levelKey));
                if (level.puzzles) {
                    level.puzzles.forEach(puzzle => {
                        puzzleTypes.add(puzzle.type);
                    });
                }
            }
        });

        return {
            name: preset.name,
            description: preset.description,
            activeLevels: activeLevels.sort((a, b) => a - b),
            puzzleTypes: Array.from(puzzleTypes),
            totalLevels: activeLevels.length
        };
    }
}

// Create global instance
window.presetManager = new PresetManager();