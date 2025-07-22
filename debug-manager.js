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
    if (!configManager || !configManager.config) return;
    
    const selectedCharacterRadio = document.querySelector('input[name="debugCharacter"]:checked');
    if (!selectedCharacterRadio) return;
    
    const selectedCharacter = selectedCharacterRadio.value;
    const config = configManager.config;
    const levels = config.levels || {};
    
    // Clear existing sprites
    debugState.celebrationSprites = {};
    debugState.animationFrames = {};
    debugState.isAnimating = {};
    
    // Load sprites for all playable levels
    Object.keys(levels).forEach(levelKey => {
        const level = levels[levelKey];
        if (level.playable) {
            const spriteKey = `${selectedCharacter}-${levelKey}`;
            const spritePath = `level-${levelKey}/${selectedCharacter}-celebrate.png`;
            
            const sprite = new Image();
            sprite.onload = function() {
                debugState.celebrationSprites[spriteKey] = sprite;
                console.log(`Debug: Loaded ${spritePath}`);
                
                // Initialize animation state
                debugState.animationFrames[spriteKey] = 0;
                debugState.isAnimating[spriteKey] = false;
            };
            sprite.onerror = function() {
                console.warn(`Debug: Failed to load ${spritePath}`);
            };
            sprite.src = spritePath;
        }
    });
}

/**
 * Play celebration animation in debug mode
 */
function debugPlayCelebration(character, level) {
    const spriteKey = `${character}-${level}`;
    debugState.isAnimating[spriteKey] = true;
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
    // Stop all animation timers
    Object.keys(debugState.animationTimers).forEach(key => {
        if (debugState.animationTimers[key]) {
            clearTimeout(debugState.animationTimers[key]);
            delete debugState.animationTimers[key];
        }
    });
    
    // Reset animation states
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
                if (level.playable) {
                    const button = document.createElement('button');
                    button.className = 'debug-button';
                    button.textContent = `Level ${levelKey}`;
                    button.onclick = () => jumpToLevel(parseInt(levelKey));
                    container.appendChild(button);
                }
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
        levelsToProcess = Object.keys(levels)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .filter(levelKey => levels[levelKey].playable);
    } else {
        console.warn('⚠️  ConfigManager not available, using fallback levels');
        levelsToProcess = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
    }
    
    levelsToProcess.forEach(levelKey => {
        const item = document.createElement('div');
        item.className = 'celebration-item';
        
        const title = document.createElement('h4');
        title.textContent = `Level ${levelKey}`;
        
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
 * Animate debug celebration sprites
 * Handles the animation loop for celebration previews
 */
function animateDebugCelebration(character, level) {
    const spriteKey = `${character}-${level}`;
    const sprite = debugState.celebrationSprites[spriteKey];
    const canvas = document.getElementById(`debugCanvas-${level}`);
    
    if (!sprite || !canvas || !debugState.isAnimating[spriteKey]) return;
    
    const ctx = canvas.getContext('2d');
    const frameWidth = 200;
    const frameHeight = 200;
    const totalFrames = 40; // Default frame count
    
    // Get current frame
    let currentFrame = debugState.animationFrames[spriteKey] || 0;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate source position
    const sourceX = (currentFrame % 5) * frameWidth;
    const sourceY = Math.floor(currentFrame / 5) * frameHeight;
    
    // Draw current frame
    ctx.drawImage(sprite, sourceX, sourceY, frameWidth, frameHeight, 0, 0, canvas.width, canvas.height);
    
    // Update frame
    currentFrame++;
    if (currentFrame >= totalFrames) {
        currentFrame = 0;
    }
    debugState.animationFrames[spriteKey] = currentFrame;
    
    // Schedule next frame if still animating
    if (debugState.isAnimating[spriteKey]) {
        debugState.animationTimers[spriteKey] = setTimeout(() => {
            animateDebugCelebration(character, level);
        }, 100); // ~10 FPS for debug preview
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