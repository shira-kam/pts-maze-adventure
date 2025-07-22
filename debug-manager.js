// PT's Maze Adventure - Debug Manager
// Extracted debug system for comprehensive game testing and development

// Debug state management
const debugState = {
    celebrationSprites: {}, // Stores loaded celebration sprites for each character and level
    animationFrames: {}, // Stores current animation frame for each celebration
    animationTimers: {}, // Stores animation timer IDs
    isAnimating: {} // Tracks animation state for each celebration
};

/**
 * Toggle debug mode on/off
 * Activated by Shift+Ctrl+D keyboard shortcut
 */
function toggleDebugMode() {
    const debugScreen = document.getElementById('debugScreen');
    
    if (game.debugMode) {
        // Close debug mode
        game.debugMode = false;
        debugScreen.style.display = 'none';
        
        // Stop all debug animations
        stopAllDebugAnimations();
    } else {
        // Open debug mode
        game.debugMode = true;
        debugScreen.style.display = 'block';
        
        console.log('🐛 Debug mode opening - generating content...');
        
        // Generate dynamic debug content
        if (configManager && !configManager.config) {
            console.log('📋 Loading config first...');
            configManager.loadConfig().then(() => {
                console.log('✅ Config loaded successfully');
                generateAllDebugContent();
            }).catch(() => {
                console.warn('⚠️ Config load failed, using fallbacks');
                generateAllDebugContent();
            });
        } else {
            generateAllDebugContent();
        }
    }
}

/**
 * Generate all debug content (called after config is loaded or for fallback)
 */
function generateAllDebugContent() {
    try {
        generateDebugCharacterSelection();
        console.log('✓ Character selection generated');
        
        generateDebugLevelButtons();
        console.log('✓ Level buttons generated');
        
        generateDebugCelebrationItems();
        console.log('✓ Celebration items generated');
        
        loadDebugCelebrationSprites();
        console.log('✓ Sprites loading initiated');
        
        // Update current level display
        updateDebugCurrentLevel();
        console.log('✓ Current level updated');
        
        console.log('🐛 Debug content generation complete');
    } catch (error) {
        console.error('❌ Error generating debug content:', error);
    }
}

/**
 * Update debug current level display
 */
function updateDebugCurrentLevel() {
    const currentLevelSpan = document.getElementById('debugCurrentLevel');
    if (currentLevelSpan) {
        currentLevelSpan.textContent = game.selectedDifficulty || 1;
    }
}

/**
 * Jump to specific level for testing
 * @param {number} level - Level number to jump to
 */
function jumpToLevel(level) {
    // Get selected character and difficulty from debug mode
    const selectedCharacterRadio = document.querySelector('input[name="debugCharacter"]:checked');
    const selectedDifficultyRadio = document.querySelector('input[name="debugDifficulty"]:checked');
    
    if (selectedCharacterRadio) {
        game.selectedCharacter = selectedCharacterRadio.value;
        console.log(`Debug: Selected character: ${game.selectedCharacter}`);
    }
    
    if (selectedDifficultyRadio) {
        game.difficultyMode = selectedDifficultyRadio.value;
        console.log(`Debug: Selected difficulty: ${game.difficultyMode}`);
    }
    
    // Set the target level
    game.selectedDifficulty = level;
    console.log(`Debug: Jumping to level ${level}`);
    
    // Load character sprites if needed
    loadCharacterSprites().then(() => {
        console.log('Debug: Character sprites loaded, starting level');
        
        // Close debug mode
        closeDebugMode();
        
        // Hide all screens and show game
        document.getElementById('characterSelectionScreen').style.display = 'none';
        document.getElementById('difficultyScreen').style.display = 'none';
        document.getElementById('levelSelectionScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('finalScoreScreen').style.display = 'none';
        document.getElementById('celebrationScreen').style.display = 'none';
        
        // Initialize the game at the selected level
        initializeGame();
        
        // Update debug level display
        updateDebugCurrentLevel();
        
    }).catch(error => {
        console.error('Debug: Error loading character sprites:', error);
        alert('Error loading character sprites. Check console for details.');
    });
}

/**
 * Close debug mode
 */
function closeDebugMode() {
    game.debugMode = false;
    document.getElementById('debugScreen').style.display = 'none';
    stopAllDebugAnimations();
}

/**
 * Generate character selection radio buttons for debug mode
 * Creates dynamic character options based on configuration
 */
function generateDebugCharacterSelection() {
    const container = document.getElementById('debugCharacterSelection');
    if (!container) {
        console.error('❌ debugCharacterSelection container not found');
        return;
    }
    
    container.innerHTML = '';
    
    console.log('🔍 Checking configManager:', {
        configManager: !!configManager,
        config: configManager?.config ? 'exists' : 'missing',
        configType: typeof configManager?.config,
        configKeys: configManager?.config ? Object.keys(configManager.config) : 'no config',
        characters: configManager?.config?.characters ? Object.keys(configManager.config.characters) : 'missing'
    });
    
    if (configManager && configManager.config && configManager.config.characters) {
        const characters = configManager.config.characters;
        let isFirst = true;
        
        Object.keys(characters).forEach(characterKey => {
            const character = characters[characterKey];
            
            const label = document.createElement('label');
            label.style.cssText = 'display: flex; align-items: center; gap: 10px; color: #fff; font-size: 18px; cursor: pointer;';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'debugCharacter';
            input.value = characterKey;
            input.style.transform = 'scale(1.5)';
            input.checked = isFirst; // Select first character by default
            
            // Add event listener to reload celebration sprites when character changes
            input.addEventListener('change', reloadDebugCelebrationSprites);
            
            const span = document.createElement('span');
            span.style.cssText = 'color: #fff; font-weight: bold;';
            span.textContent = `${character.name || characterKey}`;
            
            label.appendChild(input);
            label.appendChild(span);
            container.appendChild(label);
            
            isFirst = false;
        });
    } else {
        console.warn('⚠️  ConfigManager not available, using fallback characters');
        // Fallback characters if configManager isn't available
        const fallbackCharacters = ['PT', 'Enderman'];
        
        fallbackCharacters.forEach((characterKey, index) => {
            const label = document.createElement('label');
            label.style.cssText = 'display: flex; align-items: center; gap: 10px; color: #fff; font-size: 18px; cursor: pointer;';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'debugCharacter';
            input.value = characterKey;
            input.style.transform = 'scale(1.5)';
            input.checked = index === 0; // Select first character by default
            
            // Add event listener to reload celebration sprites when character changes
            input.addEventListener('change', reloadDebugCelebrationSprites);
            
            const span = document.createElement('span');
            span.style.cssText = 'color: #fff; font-weight: bold;';
            span.textContent = characterKey;
            
            label.appendChild(input);
            label.appendChild(span);
            container.appendChild(label);
        });
    }
}

/**
 * Reload debug celebration sprites when character changes
 */
function reloadDebugCelebrationSprites() {
    loadDebugCelebrationSprites();
}

/**
 * Load all celebration sprites for debug mode
 * Creates sprite objects for each character-level combination
 */
function loadDebugCelebrationSprites() {
    console.log('🖼️ Loading debug celebration sprites...');
    
    const selectedCharacterRadio = document.querySelector('input[name="debugCharacter"]:checked');
    if (!selectedCharacterRadio) {
        console.warn('No character selected, cannot load sprites');
        return;
    }
    
    const selectedCharacter = selectedCharacterRadio.value;
    console.log(`Selected character: ${selectedCharacter}`);
    
    let levelsToLoad = [];
    
    if (configManager && configManager.config && configManager.config.levels) {
        const levels = configManager.config.levels;
        levelsToLoad = Object.keys(levels).filter(levelKey => levels[levelKey].playable);
        console.log('Using config levels:', levelsToLoad);
    } else {
        levelsToLoad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
        console.log('Using fallback levels:', levelsToLoad);
    }
    
    // Clear existing sprites
    debugState.celebrationSprites = {};
    debugState.animationFrames = {};
    debugState.isAnimating = {};
    
    // Load sprites for all levels
    levelsToLoad.forEach(levelKey => {
        const spriteKey = `${selectedCharacter}-${levelKey}`;
        const spritePath = `level-${levelKey}/${selectedCharacter}-celebrate.png`;
        
        console.log(`🔄 Loading sprite: ${spritePath}`);
        
        const sprite = new Image();
        sprite.onload = function() {
            debugState.celebrationSprites[spriteKey] = sprite;
            console.log(`✅ Loaded ${spritePath} (${sprite.width}x${sprite.height})`);
            
            // Initialize animation state
            debugState.animationFrames[spriteKey] = 0;
            debugState.animationTimers[spriteKey] = 0;
            debugState.isAnimating[spriteKey] = false;
        };
        sprite.onerror = function() {
            console.warn(`❌ Failed to load ${spritePath}`);
        };
        sprite.src = spritePath;
    });
}

/**
 * Play celebration animation in debug mode
 */
function debugPlayCelebration(character, level) {
    const spriteKey = `${character}-${level}`;
    console.log(`▶ Starting animation for ${spriteKey}`);
    
    // Initialize animation state
    debugState.isAnimating[spriteKey] = true;
    debugState.animationFrames[spriteKey] = 0;
    debugState.animationTimers[spriteKey] = 0;
    
    // Start animation loop
    animateDebugCelebration(character, level);
}

/**
 * Stop specific celebration animation in debug mode
 */
function debugStopCelebration(character, level) {
    const spriteKey = `${character}-${level}`;
    debugState.isAnimating[spriteKey] = false;
}

/**
 * Stop all debug animations
 */
function stopAllDebugAnimations() {
    // Reset animation states (requestAnimationFrame stops automatically)
    Object.keys(debugState.isAnimating).forEach(key => {
        debugState.isAnimating[key] = false;
    });
}

/**
 * Generate level jump buttons for debug mode
 */
function generateDebugLevelButtons() {
    const container = document.getElementById('debugLevelButtons');
    if (!container) {
        console.error('❌ debugLevelButtons container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (configManager && configManager.config) {
        const levels = configManager.config.levels || {};
        Object.keys(levels)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(levelKey => {
                const level = levels[levelKey];
                // Debug mode shows ALL levels (playable and debug-only)
                const button = document.createElement('button');
                button.className = 'debug-button';
                const labelSuffix = level.playable ? '' : ' (Debug Only)';
                button.textContent = `Level ${levelKey}${labelSuffix}`;
                button.onclick = () => jumpToLevel(parseInt(levelKey));
                container.appendChild(button);
            });
    } else {
        console.warn('⚠️  ConfigManager not available, using fallback levels');
        // Fallback levels if configManager isn't available
        const fallbackLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        
        fallbackLevels.forEach(levelNum => {
            const button = document.createElement('button');
            button.className = 'debug-button';
            button.textContent = `Level ${levelNum}`;
            button.onclick = () => jumpToLevel(levelNum);
            container.appendChild(button);
        });
    }
}

/**
 * Generate celebration animation items for debug mode
 */
function generateDebugCelebrationItems() {
    const container = document.getElementById('debugCelebrationGrid');
    if (!container) {
        console.error('❌ debugCelebrationGrid container not found');
        return;
    }
    
    container.innerHTML = '';
    
    let levelsToProcess = [];
    
    if (configManager && configManager.config) {
        const levels = configManager.config.levels || {};
        // Debug mode shows ALL levels (playable and debug-only)
        levelsToProcess = Object.keys(levels)
            .sort((a, b) => parseInt(a) - parseInt(b));
    } else {
        console.warn('⚠️  ConfigManager not available, using fallback levels');
        levelsToProcess = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    }
    
    levelsToProcess.forEach(levelKey => {
        const item = document.createElement('div');
        item.className = 'celebration-item';
        
        const title = document.createElement('h4');
        const isPlayable = configManager?.config?.levels?.[levelKey]?.playable !== false;
        const debugSuffix = isPlayable ? '' : ' (Debug Only)';
        title.textContent = `Level ${levelKey}${debugSuffix}`;
        
        const canvas = document.createElement('canvas');
        canvas.className = 'celebration-preview';
        canvas.width = 200;
        canvas.height = 200;
        canvas.id = `debugCanvas-${levelKey}`;
        
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';
        
        const playBtn = document.createElement('button');
        playBtn.className = 'debug-button';
        playBtn.textContent = '▶ Play';
        playBtn.style.marginRight = '5px';
        playBtn.onclick = () => {
            const selectedCharacterRadio = document.querySelector('input[name="debugCharacter"]:checked');
            if (selectedCharacterRadio) {
                debugPlayCelebration(selectedCharacterRadio.value, levelKey);
            }
        };
        
        const stopBtn = document.createElement('button');
        stopBtn.className = 'debug-button';
        stopBtn.textContent = '⏸ Stop';
        stopBtn.onclick = () => {
            const selectedCharacterRadio = document.querySelector('input[name="debugCharacter"]:checked');
            if (selectedCharacterRadio) {
                debugStopCelebration(selectedCharacterRadio.value, levelKey);
            }
        };
        
        controls.appendChild(playBtn);
        controls.appendChild(stopBtn);
        
        item.appendChild(title);
        item.appendChild(canvas);
        item.appendChild(controls);
        container.appendChild(item);
    });
}

/**
 * Animate debug celebration sprites using the same logic as the main game
 * Reuses calculateFrameProperties and getCelebrationConfig from main game
 */
function animateDebugCelebration(character, level) {
    const spriteKey = `${character}-${level}`;
    const sprite = debugState.celebrationSprites[spriteKey];
    const canvas = document.getElementById(`debugCanvas-${level}`);
    
    if (!sprite || !canvas || !debugState.isAnimating[spriteKey] || !sprite.complete) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
        // Use the same frame calculation logic as the main game
        const frameProps = calculateFrameProperties(sprite, level);
        const { frameWidth, frameHeight, framesPerRow, totalFrames } = frameProps;
        
        // Get current frame
        let currentFrame = debugState.animationFrames[spriteKey] || 0;
        
        // Calculate frame position (same as main game)
        const row = Math.floor(currentFrame / framesPerRow);
        const col = currentFrame % framesPerRow;
        const frameX = col * frameWidth;
        const frameY = row * frameHeight;
        
        // Scale to fit debug canvas (smaller than main game)
        const scaleX = canvas.width / frameWidth;
        const scaleY = canvas.height / frameHeight;
        const scale = Math.min(scaleX, scaleY) * 0.8; // 80% of canvas size for debug
        
        const scaledWidth = frameWidth * scale;
        const scaledHeight = frameHeight * scale;
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;
        
        // Draw current frame
        ctx.drawImage(
            sprite,
            frameX, frameY, frameWidth, frameHeight,
            offsetX, offsetY, scaledWidth, scaledHeight
        );
        
        // Update frame counter (same timing as main game)
        debugState.animationTimers[spriteKey]++;
        const config = getCelebrationConfig(level);
        const frameDelay = config?.frameDelay || 6; // Use config or default
        
        if (debugState.animationTimers[spriteKey] >= frameDelay) {
            currentFrame = (currentFrame + 1) % totalFrames;
            debugState.animationFrames[spriteKey] = currentFrame;
            debugState.animationTimers[spriteKey] = 0;
        }
        
    } catch (error) {
        console.warn(`Debug animation error for ${spriteKey}:`, error);
        // Fallback to simple animation if config functions fail
        const currentFrame = (debugState.animationFrames[spriteKey] || 0);
        debugState.animationFrames[spriteKey] = (currentFrame + 1) % 40;
        
        // Simple draw of first frame
        ctx.drawImage(sprite, 0, 0, 200, 200, 10, 10, canvas.width-20, canvas.height-20);
    }
    
    // Continue animation loop
    if (debugState.isAnimating[spriteKey]) {
        requestAnimationFrame(() => animateDebugCelebration(character, level));
    }
}

// Initialize debug system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard shortcut for debug mode (Shift+Ctrl+D)
    document.addEventListener('keydown', function(event) {
        if (event.shiftKey && event.ctrlKey && event.key === 'D') {
            event.preventDefault();
            toggleDebugMode();
        }
    });
});

// Export functions for global access
if (typeof window !== 'undefined') {
    window.debugManager = {
        toggleDebugMode,
        closeDebugMode,
        jumpToLevel,
        debugPlayCelebration,
        debugStopCelebration
    };
}