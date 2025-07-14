# Code Refactoring Suggestions for PT's Maze Adventure

## Overview
This document outlines refactoring opportunities to improve code modularity and reduce repetitive maintenance when adding new levels to the game.

## Current Problems Identified

### 1. Hardcoded Level Ranges and Limits
**Issues:**
- Level progression logic scattered across multiple functions
- Hardcoded checks like `game.selectedDifficulty < 8` in various places
- Manual level range definitions for different puzzle types
- Scoring screen level limits hardcoded (recently fixed)

**Examples:**
```javascript
// Found in multiple locations:
if (game.selectedDifficulty < 8) { /* automatic progression */ }
if (game.selectedDifficulty === 8 || game.selectedDifficulty === 9) { /* triple add */ }
if (game.selectedDifficulty >= 4) { /* number line puzzles */ }
```

### 2. Repeated HTML Generation in Debug Mode
**Issues:**
- 10+ nearly identical celebration debug blocks manually coded
- Level jump buttons manually created for each level
- Debug interface requires manual updates for each new level

### 3. Duplicate Level-Specific Logic
**Issues:**
- Special handling for level 10 (uses level 9 assets) repeated in multiple functions
- Division tracking reset logic duplicated
- Asset loading patterns repeated with slight variations

### 4. Configuration Mixed with Code Logic
**Issues:**
- Puzzle type determination spread across multiple functions
- Level-specific behavior embedded in if-else chains
- Asset paths and special cases hardcoded throughout

## Proposed Refactoring Solutions

### 1. Centralized Game Configuration
```javascript
const GAME_CONFIG = {
    MAX_LEVELS: 10,
    LEVEL_RANGES: {
        BASIC_MATH: { min: 1, max: 3 },
        NUMBER_LINE: { min: 4, max: 7 },
        DIVISION: { min: 8, max: 10 },
        DIGRAPH: { min: 3, max: 7 },
        TRIPLE_ADD: { min: 8, max: 9 },
        MULTIPLICATION: { min: 10, max: 10 }
    },
    LEVEL_DEFINITIONS: {
        1: {
            name: "Introduction",
            puzzleTypes: { math: 'basic_math', reading: 'word_emoji' },
            celebrationFrames: 9,
            hasBonus: false,
            specialHandling: [],
            assets: ['grid.csv', 'Word-List.txt', 'celebrate.png']
        },
        // ... continue for all levels
        10: {
            name: "Debug Multiplication",
            puzzleTypes: { math: 'multiplication', reading: 'division' },
            celebrationFrames: 12,
            hasBonus: true,
            specialHandling: ['uses_level_9_assets', 'debug_only'],
            assets: ['PT-Bonus-Sprite.svg', 'bonus.png', 'heart.png']
        }
    }
};
```

### 2. Utility Functions for Level Logic
```javascript
// Replace scattered level checks with utility functions
function isInLevelRange(level, rangeName) {
    const range = GAME_CONFIG.LEVEL_RANGES[rangeName];
    return level >= range.min && level <= range.max;
}

function isLastLevel(level) {
    return level >= GAME_CONFIG.MAX_LEVELS;
}

function getPuzzleTypeForLevel(level, doorType) {
    const config = GAME_CONFIG.LEVEL_DEFINITIONS[level];
    return config.puzzleTypes[doorType] || doorType;
}
```

### 3. Dynamic Debug Interface Generation
```javascript
// Generate debug elements dynamically based on configuration
function generateDebugInterface() {
    generateDebugLevelButtons();
    generateDebugCelebrationItems();
}

function generateDebugLevelButtons() {
    const container = document.querySelector('#debugScreen .debug-section:first-child > div');
    container.innerHTML = '';
    
    for (let level = 1; level <= GAME_CONFIG.MAX_LEVELS; level++) {
        const config = GAME_CONFIG.LEVEL_DEFINITIONS[level];
        const isDebugOnly = config.specialHandling.includes('debug_only') ? ' (Debug)' : '';
        
        const button = document.createElement('button');
        button.className = 'debug-button';
        button.onclick = () => jumpToLevel(level);
        button.textContent = `Jump to Level ${level}${isDebugOnly}`;
        container.appendChild(button);
    }
}
```

### 4. Centralized Asset Management
```javascript
class AssetManager {
    static getAssetPath(level, assetType) {
        const config = GAME_CONFIG.LEVEL_DEFINITIONS[level];
        
        // Handle special cases like level 10 using level 9 assets
        if (config.specialHandling.includes('uses_level_9_assets')) {
            return `level-9/${assetType}`;
        }
        
        return `level-${level}/${assetType}`;
    }
    
    static async loadMazeCSV(level) {
        const csvPath = this.getAssetPath(level, 'grid.csv');
        const cacheBuster = '?v=' + Date.now() + '_' + Math.random();
        const response = await fetch(csvPath + cacheBuster);
        return response.text();
    }
    
    static loadCelebrationSprite(level) {
        const sprite = new Image();
        const config = GAME_CONFIG.LEVEL_DEFINITIONS[level];
        sprite.src = this.getAssetPath(level, 'celebrate.png') + '?v=' + Date.now();
        sprite.frames = config.celebrationFrames;
        return sprite;
    }
}
```

### 5. Level Initialization System
```javascript
class LevelInitializer {
    static async initializeLevel(level) {
        const config = GAME_CONFIG.LEVEL_DEFINITIONS[level];
        
        // Handle special initialization based on configuration
        config.specialHandling.forEach(handler => {
            this.handleSpecialCase(handler, level);
        });
        
        // Load assets based on configuration
        await this.loadLevelAssets(level, config);
        
        // Initialize level-specific features
        this.initializeLevelFeatures(level, config);
    }
    
    static handleSpecialCase(handlerType, level) {
        const handlers = {
            'division_tracking': () => this.resetDivisionTracking(),
            'bonus_mode': () => this.initializeBonusMode(),
            'debug_only': () => console.log(`Level ${level} is debug only`),
            'uses_level_9_assets': () => { /* handled in AssetManager */ }
        };
        
        handlers[handlerType]?.();
    }
    
    static resetDivisionTracking() {
        game.hasUsedAnswerOne = false;
        game.hasUsedDivideByOne = false;
    }
    
    static initializeBonusMode() {
        game.hasBonus = false;
        game.rocketCountdown = 0;
    }
}
```

### 6. Configuration-Driven Puzzle System
```javascript
// Replace complex if-else chains with configuration lookup
function showPuzzle(type, door) {
    const level = game.selectedDifficulty;
    const puzzleType = getPuzzleTypeForLevel(level, type);
    
    // Use factory pattern for puzzle creation
    const puzzle = PuzzleFactory.createPuzzle(puzzleType, door, level);
    puzzle.show();
}

class PuzzleFactory {
    static createPuzzle(puzzleType, door, level) {
        const puzzleClasses = {
            'basic_math': BasicMathPuzzle,
            'number_line': NumberLinePuzzle,
            'division': DivisionPuzzle,
            'multiplication': MultiplicationPuzzle,
            'word_emoji': WordEmojiPuzzle,
            'digraph': DigraphPuzzle
        };
        
        const PuzzleClass = puzzleClasses[puzzleType];
        return new PuzzleClass(door, level);
    }
}
```

## Implementation Benefits

### Adding New Levels (Current vs Proposed)
**Current Process:**
1. Create level directory and assets
2. Update hardcoded level limits in 5+ functions
3. Add debug buttons manually in HTML
4. Add celebration debug items manually
5. Update level progression logic
6. Add special cases to various functions
7. Test and debug missed updates

**Proposed Process:**
1. Create level directory and assets
2. Add single entry to `GAME_CONFIG.LEVEL_DEFINITIONS`
3. Update `MAX_LEVELS` if needed
4. Everything else updates automatically

### Maintenance Benefits
- **Single Source of Truth**: All level configuration in one place
- **Automatic UI Generation**: Debug interface updates automatically
- **Consistent Asset Loading**: No more copy-paste path construction
- **Type Safety**: Configuration structure can be validated
- **Testing**: Each component can be tested independently

### Code Quality Improvements
- **Separation of Concerns**: Configuration separate from logic
- **DRY Principle**: Eliminate code duplication
- **Extensibility**: Easy to add new puzzle types or level features
- **Maintainability**: Changes isolated to specific areas

## Implementation Priority

### Phase 1 (High Impact, Low Risk)
1. Create `GAME_CONFIG` object and utility functions
2. Replace hardcoded level checks with utility functions
3. Implement `AssetManager` for consistent asset loading

### Phase 2 (Medium Impact, Medium Risk)
1. Implement dynamic debug interface generation
2. Create `LevelInitializer` for special handling
3. Refactor scoring components (already started)

### Phase 3 (High Impact, Higher Risk)
1. Implement `PuzzleFactory` and puzzle class hierarchy
2. Create comprehensive level configuration system
3. Migrate all existing levels to new configuration format

## Testing Strategy
- Test each refactored component independently
- Maintain backward compatibility during transition
- Use debug mode extensively for validation
- Create configuration validation functions

This refactoring would transform the codebase from a "copy-paste and modify" approach to a clean, configuration-driven system that scales efficiently with new levels and features.