/**
 * Ghost class for the Maze of Marvels game
 * Handles ghost AI, movement, rendering, and player interaction
 */
class Ghost {
    constructor(level, gameConfig) {
        this.level = level;
        this.config = gameConfig.ghost;
        
        // Defensive check for ghost config
        if (!this.config) {
            console.error('Ghost config is undefined! Using fallback values.');
            this.config = {
                enabled: true,
                globalSettings: {
                    baseSpeed: 0.05,
                    speedByDifficulty: { easy: 0.01, neutral: 0.05, hard: 0.1 },
                    heartsStolen: { easy: 1, neutral: 2, hard: 3 },
                    puzzlesToWeaken: 1,
                    strengthLevels: 5
                },
                sprites: {
                    strong: "ghost-strong.png",
                    medium: "ghost-medium.png", 
                    weak: "ghost-weak.png"
                }
            };
        }
        
        // Ghost state - will be set near endpoint when maze is loaded
        this.x = 1; // Starting grid position (temporary)
        this.y = 1;
        
        // Debug ghost strength initialization
        console.log('Ghost config globalSettings:', this.config.globalSettings);
        console.log('strengthLevels from config:', this.config.globalSettings.strengthLevels);
        
        this.strength = this.config.globalSettings.strengthLevels; // Start at full strength
        this.puzzlesSolved = 0;
        
        console.log('Ghost strength set to:', this.strength);
        this.isActive = this.config.enabled;
        
        // Movement properties
        this.speed = this.config.globalSettings.baseSpeed;
        this.lastMoveTime = 0;
        this.moveInterval = 1000 / this.speed; // Convert speed to milliseconds between moves
        this.lastPosition = { x: this.x, y: this.y }; // Track previous position to avoid backtracking
        this.stuckCounter = 0; // Track how long ghost has been stuck
        this.positionHistory = []; // Track recent positions to detect loops
        this.maxHistoryLength = 6; // Remember last 6 positions
        this.randomModeCounter = 0; // Force random movement for a few turns after loop detection
        
        // Sprite properties
        this.currentSprite = null;
        this.spriteLoaded = false;
        
        // Game references (will be set when integrated)
        this.game = null;
        this.maze = null;
        
        console.log('Ghost initialized:', {
            level: this.level,
            strength: this.strength,
            speed: this.speed,
            isActive: this.isActive,
            config: this.config,
            strengthLevels: this.config?.globalSettings?.strengthLevels
        });
        
        // Load initial sprite
        this.loadSprite();
    }
    
    /**
     * Load the appropriate sprite based on current strength
     */
    loadSprite() {
        let spriteName;
        
        if (this.strength >= 4) {
            spriteName = this.config.sprites.strong;
        } else if (this.strength >= 2) {
            spriteName = this.config.sprites.medium;
        } else if (this.strength > 0) {
            spriteName = this.config.sprites.weak;
        } else {
            // Ghost is gone
            this.isActive = false;
            return;
        }
        
        // Create new image element
        this.currentSprite = new Image();
        this.currentSprite.onload = () => {
            this.spriteLoaded = true;
            console.log('Ghost sprite loaded:', spriteName);
        };
        this.currentSprite.onerror = () => {
            console.warn('Failed to load ghost sprite:', spriteName);
            // Use fallback placeholder
            this.createPlaceholderSprite();
        };
        
        this.currentSprite.src = spriteName;
    }
    
    /**
     * Create a simple placeholder sprite for testing
     */
    createPlaceholderSprite() {
        // Create a canvas element as placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        // Draw a simple ghost shape based on strength
        ctx.fillStyle = this.getStrengthColor();
        ctx.fillRect(0, 0, 40, 40);
        
        // Add some basic ghost features
        ctx.fillStyle = 'white';
        ctx.fillRect(8, 8, 8, 8); // Left eye
        ctx.fillRect(24, 8, 8, 8); // Right eye
        
        // Convert to image
        this.currentSprite = new Image();
        this.currentSprite.src = canvas.toDataURL();
        this.spriteLoaded = true;
        
        console.log('Ghost placeholder sprite created');
    }
    
    /**
     * Get color based on ghost strength for placeholder
     */
    getStrengthColor() {
        switch(this.strength) {
            case 5: return '#8B0000'; // Dark red (very strong)
            case 4: return '#8B0000'; // Dark red (strong)
            case 3: return '#DC143C'; // Crimson (strong)
            case 2: return '#FF4500'; // Orange red (medium)  
            case 1: return '#FFA500'; // Orange (weak)
            default: return '#D3D3D3'; // Light gray (defeated)
        }
    }
    
    /**
     * Update ghost state (called each frame)
     */
    update(currentTime, game) {
        if (!this.isActive) return;
        
        this.game = game;
        
        // Don't move if puzzle is active (modal pause)
        if (game && game.puzzleActive) {
            return;
        }
        
        // Don't move if game is over or celebrating
        if (game && (game.gameOverActive || game.celebrating)) {
            return;
        }
        
        // Don't move if player is already dead (score <= 0)
        if (game && game.score <= 0) {
            return;
        }
        
        // Check if it's time to move
        if (currentTime - this.lastMoveTime >= this.moveInterval) {
            this.moveTowardPlayer();
            this.lastMoveTime = currentTime;
        }
        
        // Check collision with player
        this.checkPlayerCollision();
    }
    
    /**
     * Create a flood fill map from player position
     * @param {number} playerX - Player grid X position
     * @param {number} playerY - Player grid Y position  
     * @returns {Map} Map of position keys to distances from player
     */
    createFloodFillMap(playerX, playerY) {
        const floodMap = new Map();
        const queue = [{x: playerX, y: playerY, distance: 0}];
        
        // Mark player position as distance 0
        floodMap.set(`${playerX},${playerY}`, 0);
        
        while (queue.length > 0) {
            const current = queue.shift();
            const currentDistance = current.distance;
            
            // Check all 4 directions
            const directions = [
                {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
            ];
            
            for (const dir of directions) {
                const newX = current.x + dir.x;
                const newY = current.y + dir.y;
                const posKey = `${newX},${newY}`;
                
                // Skip if already visited or can't move there
                if (floodMap.has(posKey) || !this.canMoveTo(newX, newY)) {
                    continue;
                }
                
                // Mark this position with distance and add to queue
                const newDistance = currentDistance + 1;
                floodMap.set(posKey, newDistance);
                queue.push({x: newX, y: newY, distance: newDistance});
            }
        }
        
        return floodMap;
    }
    
    /**
     * Flood fill pathfinding movement toward player
     */
    moveTowardPlayer() {
        if (!this.game || !this.game.player) {
            return;
        }
        
        // Current ghost position
        const ghostGridX = Math.round(this.x);
        const ghostGridY = Math.round(this.y);
        
        // Get player position in grid coordinates
        const playerGridX = Math.round(this.game.player.x / 40);
        const playerGridY = Math.round(this.game.player.y / 40);
        
        // Create flood fill map from player position
        const floodMap = this.createFloodFillMap(playerGridX, playerGridY);
        
        // Check if ghost can reach player at all
        const ghostPosKey = `${ghostGridX},${ghostGridY}`;
        if (!floodMap.has(ghostPosKey)) {
            console.log('Ghost cannot reach player - no valid path exists');
            return;
        }
        
        // Find best adjacent move (lowest distance on flood map)
        const currentDistance = floodMap.get(ghostPosKey);
        const directions = [
            {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
        ];
        
        let bestMove = null;
        let bestDistance = currentDistance;
        
        for (const dir of directions) {
            const newX = ghostGridX + dir.x;
            const newY = ghostGridY + dir.y;
            const newPosKey = `${newX},${newY}`;
            
            // Skip if can't move there
            if (!this.canMoveTo(newX, newY)) {
                continue;
            }
            
            // Check distance on flood map
            const newDistance = floodMap.get(newPosKey);
            if (newDistance !== undefined && newDistance < bestDistance) {
                bestDistance = newDistance;
                bestMove = {x: newX, y: newY, distance: newDistance};
            }
        }
        
        // Make the best move
        if (bestMove) {
            this.lastPosition.x = ghostGridX;
            this.lastPosition.y = ghostGridY;
            
            this.x = bestMove.x;
            this.y = bestMove.y;
            console.log(`Ghost moved (flood fill) to: ${this.x}, ${this.y} [distance to player: ${bestMove.distance}]`);
        } else {
            console.log('Ghost stuck - no better moves available');
        }
    }
    
    /**
     * Check if ghost can move to a specific grid position
     * @param {number} gridX - Target grid X coordinate
     * @param {number} gridY - Target grid Y coordinate
     * @returns {boolean} True if position is valid and not a wall
     */
    canMoveTo(gridX, gridY) {
        if (!this.game || !this.game.paths) {
            return false;
        }
        
        // Convert grid coordinates to pixel coordinates
        const pixelX = gridX * 40;
        const pixelY = gridY * 40;
        
        // Check if this position is in the paths array (open space)
        const isOpenPath = this.game.paths.some(path => 
            path.x === pixelX && path.y === pixelY
        );
        
        return isOpenPath;
    }
    
    /**
     * Check if ghost has caught the player
     */
    checkPlayerCollision() {
        if (!this.game || !this.game.player) return;
        
        // Convert player pixel position to grid position for comparison
        const playerGridX = Math.round(this.game.player.x / 40);
        const playerGridY = Math.round(this.game.player.y / 40);
        const ghostGridX = Math.round(this.x);
        const ghostGridY = Math.round(this.y);
        
        // Check if ghost and player are in same grid position
        if (ghostGridX === playerGridX && ghostGridY === playerGridY) {
            this.catchPlayer();
        }
    }
    
    /**
     * Handle catching the player
     */
    catchPlayer() {
        if (!this.game) return;
        
        // Don't catch if game is already over or player already dead
        if (this.game.gameOverActive || this.game.celebrating || this.game.score <= 0) {
            return;
        }
        
        console.log('🔥 Ghost caught player!');
        
        // Get hearts to steal based on difficulty
        const heartsToSteal = this.getHeartsToSteal();
        
        // Steal hearts using the game's existing updateScore function
        // Note: updateScore is a global function in index.html
        if (typeof updateScore === 'function') {
            updateScore(-heartsToSteal); // Negative points to subtract hearts
        } else {
            // Fallback: direct score manipulation
            this.game.score = Math.max(0, this.game.score - heartsToSteal);
        }
        
        console.log(`💔 Ghost stole ${heartsToSteal} hearts! Score now: ${this.game.score}`);
        
        // Show character caught by ghost modal with black background
        this.showCharacterCaughtByGhostModal();
        
        // Check if player died
        if (this.game.score <= 0) {
            console.log('💀 Player died! Game over.');
            // Game over logic will be handled by existing game systems
        }
    }
    
    /**
     * Get number of hearts to steal based on difficulty
     */
    getHeartsToSteal() {
        const difficultyMap = {
            'easy': 'easy',
            'medium': 'neutral', // medium difficulty maps to neutral config
            'neutral': 'neutral',
            'hard': 'hard'
        };
        
        const configKey = difficultyMap[this.game.difficultyMode] || 'neutral';
        return this.config.globalSettings.heartsStolen[configKey] || 1;
    }
    
    
    /**
     * Teleport player back to starting position
     */
    teleportPlayerToStart() {
        if (!this.game || !this.game.playerStartPosition) return;
        
        // Teleport to stored starting position
        this.game.player.x = this.game.playerStartPosition.x;
        this.game.player.y = this.game.playerStartPosition.y;
        
        console.log(`⚡ Player teleported to start: (${this.game.player.x}, ${this.game.player.y})`);
    }
    
    /**
     * Reset ghost to its starting position near the endpoint
     */
    resetToStartingPosition() {
        if (this.game && this.game.watering_hole && this.game.paths) {
            this.setStartingPosition(this.game.watering_hole, this.game.paths);
            console.log(`👻 Ghost reset to starting position: (${this.x}, ${this.y})`);
        }
    }
    
    /**
     * Show character caught by ghost modal with black background effect
     */
    showCharacterCaughtByGhostModal() {
        console.log('👻 BOO! You got caught!');
        
        // Change background to black
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.background = 'black';
        }
        
        // Show modal with proper CSS class
        const modal = document.getElementById('ghostCaughtModal');
        if (modal) {
            console.log('Ghost caught modal element found, adding show class');
            console.log('Modal inline style before:', modal.style.display);
            
            // Remove any inline display style that might be conflicting
            modal.style.display = '';
            modal.classList.add('show');
            
            console.log('Modal classes after adding show:', modal.className);
            console.log('Modal inline style after:', modal.style.display);
            console.log('Modal computed display style:', window.getComputedStyle(modal).display);
            
            // Load and animate ghost caught sprite
            const canvas = document.getElementById('ghostCaughtSprite');
            if (canvas) {
                // Set canvas to reasonable size, sprite will be scaled to fit
                canvas.width = 400;
                canvas.height = 400;
                
                // Initialize animation state (similar to defeated animation)
                this.game.characterCaughtByGhostActive = true;
                this.game.characterCaughtByGhostFrame = 0;
                this.game.characterCaughtByGhostTimer = 0;
                
                // Load character caught by ghost sprite
                this.characterCaughtByGhostSprite = new Image();
                this.characterCaughtByGhostSprite.onload = () => {
                    console.log('Character caught by ghost sprite loaded, starting animation');
                    this.animateCharacterCaughtByGhost();
                };
                this.characterCaughtByGhostSprite.onerror = () => {
                    console.warn('Failed to load character caught by ghost sprite, using fallback');
                    this.drawCharacterCaughtByGhostFallback(canvas);
                };
                this.characterCaughtByGhostSprite.src = 'character-caught-by-ghost-sprite.png';
            }
        }
        
        // Pause ghost movement during modal
        this.game.puzzleActive = true; // Reuse existing pause mechanism
    }
    
    /**
     * Handle character caught by ghost modal dismissal
     */
    dismissCharacterCaughtByGhost() {
        // Hide modal using CSS class
        const modal = document.getElementById('ghostCaughtModal');
        if (modal) {
            modal.classList.remove('show');
        }
        
        // Restore normal background
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.background = '';
        }
        
        // Teleport player back to starting position
        this.teleportPlayerToStart();
        
        // Reset ghost to starting position
        this.resetToStartingPosition();
        
        // Stop character caught by ghost animation
        if (this.game.characterCaughtByGhostActive) {
            this.game.characterCaughtByGhostActive = false;
        }
        
        // Resume ghost movement
        this.game.puzzleActive = false;
        
        console.log('Character caught by ghost modal dismissed');
    }
    
    /**
     * Show ghost defeated modal with yellow background effect
     * Delays showing until puzzle modal is closed to avoid conflicts
     */
    showGhostDefeatedModal() {
        console.log('🎉 You defeated the ghost!');
        
        // Change background to yellow immediately
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.background = 'yellow';
        }
        
        // Delay modal showing to allow puzzle modal to close first
        setTimeout(() => {
            console.log('Showing ghost defeated modal after delay');
            
            // Show modal with proper CSS class
            const modal = document.getElementById('ghostDefeatedModal');
            if (modal) {
                console.log('Ghost defeated modal element found, adding show class');
                console.log('Modal inline style before:', modal.style.display);
                
                // Remove any inline display style that might be conflicting
                modal.style.display = '';
                modal.classList.add('show');
                
                console.log('Modal classes after adding show:', modal.className);
                console.log('Modal inline style after:', modal.style.display);
                console.log('Modal computed display style:', window.getComputedStyle(modal).display);
                console.log('Modal z-index:', window.getComputedStyle(modal).zIndex);
                
                // Check if puzzle modal is still visible and force close it
                const puzzleModal = document.getElementById('puzzleModal');
                if (puzzleModal) {
                    console.log('Puzzle modal display before:', window.getComputedStyle(puzzleModal).display);
                    console.log('Puzzle modal z-index:', window.getComputedStyle(puzzleModal).zIndex);
                    
                    // Force close puzzle modal to avoid conflicts
                    puzzleModal.style.display = 'none';
                    console.log('Forced puzzle modal to close');
                }
                
                // Set up ghost defeated animation using existing celebration system pattern
                const canvas = document.getElementById('ghostDefeatedSprite');
                if (canvas) {
                    // Set canvas to reasonable size, sprite will be scaled to fit
                    canvas.width = 400;
                    canvas.height = 400;
                    
                    // Initialize animation state (similar to celebration animation)
                    this.game.ghostDefeatedActive = true;
                    this.game.ghostDefeatedFrame = 0;
                    this.game.ghostDefeatedTimer = 0;
                    
                    // Load ghost defeated sprite
                    this.ghostDefeatedSprite = new Image();
                    this.ghostDefeatedSprite.onload = () => {
                        console.log('Ghost defeated sprite loaded, starting animation');
                        this.animateGhostDefeated();
                    };
                    this.ghostDefeatedSprite.onerror = () => {
                        console.warn('Failed to load ghost defeated sprite, using fallback');
                        this.drawGhostDefeatedFallback(canvas);
                    };
                    this.ghostDefeatedSprite.src = 'ghost-defeated-sprite.png';
                }
            }
            
            // Don't set puzzleActive here since puzzle modal is already closed
        }, 500); // 500ms delay to ensure puzzle modal is fully dismissed
    }
    
    /**
     * Handle ghost defeated modal dismissal
     */
    dismissGhostDefeated() {
        // Hide modal using CSS class
        const modal = document.getElementById('ghostDefeatedModal');
        if (modal) {
            modal.classList.remove('show');
        }
        
        // Restore normal background
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.style.background = '';
        }
        
        // Stop ghost defeated animation
        if (this.game.ghostDefeatedActive) {
            this.game.ghostDefeatedActive = false;
        }
        
        // Resume game (though ghost is defeated)
        this.game.puzzleActive = false;
        
        console.log('Ghost defeated modal dismissed');
    }
    
    /**
     * Animate the ghost defeated sprite (adapted from celebration animation system)
     */
    animateGhostDefeated() {
        if (!this.game.ghostDefeatedActive) return;
        
        const canvas = document.getElementById('ghostDefeatedSprite');
        const ctx = canvas.getContext('2d');
        
        if (this.ghostDefeatedSprite.complete) {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Ghost defeated sprite properties (horizontal layout, 10 frames)
            const totalFrames = 10;
            const frameWidth = 322;  // Your specified sprite frame width
            const frameHeight = 275; // Your specified sprite frame height
            const framesPerRow = 10; // Horizontal layout
            
            // Calculate current frame position in sprite sheet
            const row = Math.floor(this.game.ghostDefeatedFrame / framesPerRow);
            const col = this.game.ghostDefeatedFrame % framesPerRow;
            const frameX = col * frameWidth;
            const frameY = row * frameHeight;
            
            // Auto-scaling and centering (like celebration animation)
            const scaleX = canvas.width / frameWidth;
            const scaleY = canvas.height / frameHeight;
            const scale = Math.min(scaleX, scaleY) * 0.9; // 90% of canvas for padding
            
            const scaledWidth = frameWidth * scale;
            const scaledHeight = frameHeight * scale;
            const offsetX = (canvas.width - scaledWidth) / 2;
            const offsetY = (canvas.height - scaledHeight) / 2;
            
            // Draw current frame (scaled and centered)
            ctx.drawImage(
                this.ghostDefeatedSprite,
                frameX, frameY, frameWidth, frameHeight, // Source frame
                offsetX, offsetY, scaledWidth, scaledHeight // Destination (scaled and centered)
            );
            
            // Frame timing (similar to celebration)
            this.game.ghostDefeatedTimer++;
            const frameDelay = 8; // Adjust speed as needed
            if (this.game.ghostDefeatedTimer >= frameDelay) {
                // Play once - don't loop back to start
                if (this.game.ghostDefeatedFrame < totalFrames - 1) {
                    this.game.ghostDefeatedFrame++;
                    this.game.ghostDefeatedTimer = 0;
                } else {
                    // Animation complete - stop at last frame
                    console.log('Ghost defeated animation completed');
                    // Could set this.game.ghostDefeatedActive = false; to stop completely
                    // But leaving true keeps it on last frame
                }
            }
        }
        
        // Continue animation loop  
        requestAnimationFrame(() => this.animateGhostDefeated());
    }
    
    /**
     * Draw fallback ghost defeated visual if sprite fails to load
     */
    drawGhostDefeatedFallback(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw simple ghost defeated visual
        ctx.fillStyle = '#FFD700'; // Gold
        ctx.fillRect(canvas.width/2 - 50, canvas.height/2 - 50, 100, 100);
        ctx.fillStyle = 'green';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉', canvas.width/2, canvas.height/2 + 15);
    }
    
    /**
     * Animate the character caught by ghost sprite (15 frames, play once)
     */
    animateCharacterCaughtByGhost() {
        if (!this.game.characterCaughtByGhostActive) return;
        
        const canvas = document.getElementById('ghostCaughtSprite');
        const ctx = canvas.getContext('2d');
        
        if (this.characterCaughtByGhostSprite.complete) {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Character caught by ghost sprite properties (horizontal layout, 16 frames)
            const totalFrames = 16;
            const frameWidth = 322;  // Your specified sprite frame width
            const frameHeight = 275; // Your specified sprite frame height
            const framesPerRow = 16; // Horizontal layout
            
            // Calculate current frame position in sprite sheet
            const row = Math.floor(this.game.characterCaughtByGhostFrame / framesPerRow);
            const col = this.game.characterCaughtByGhostFrame % framesPerRow;
            const frameX = col * frameWidth;
            const frameY = row * frameHeight;
            
            // Auto-scaling and centering (like celebration animation)
            const scaleX = canvas.width / frameWidth;
            const scaleY = canvas.height / frameHeight;
            const scale = Math.min(scaleX, scaleY) * 0.9; // 90% of canvas for padding
            
            const scaledWidth = frameWidth * scale;
            const scaledHeight = frameHeight * scale;
            const offsetX = (canvas.width - scaledWidth) / 2;
            const offsetY = (canvas.height - scaledHeight) / 2;
            
            // Draw current frame (scaled and centered)
            ctx.drawImage(
                this.characterCaughtByGhostSprite,
                frameX, frameY, frameWidth, frameHeight, // Source frame
                offsetX, offsetY, scaledWidth, scaledHeight // Destination (scaled and centered)
            );
            
            // Frame timing (similar to defeated animation)
            this.game.characterCaughtByGhostTimer++;
            const frameDelay = 8; // Adjust speed as needed
            if (this.game.characterCaughtByGhostTimer >= frameDelay) {
                // Play once - don't loop back to start
                if (this.game.characterCaughtByGhostFrame < totalFrames - 1) {
                    this.game.characterCaughtByGhostFrame++;
                    this.game.characterCaughtByGhostTimer = 0;
                } else {
                    // Animation complete - stop at last frame
                    console.log('Character caught by ghost animation completed');
                    // Could set this.game.characterCaughtByGhostActive = false; to stop completely
                    // But leaving true keeps it on last frame
                }
            }
        }
        
        // Continue animation loop  
        requestAnimationFrame(() => this.animateCharacterCaughtByGhost());
    }
    
    /**
     * Draw fallback character caught by ghost visual if sprite fails to load
     */
    drawCharacterCaughtByGhostFallback(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw simple character caught by ghost visual
        ctx.fillStyle = '#8B0000'; // Dark red
        ctx.fillRect(canvas.width/2 - 50, canvas.height/2 - 50, 100, 100);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👻', canvas.width/2, canvas.height/2 + 15);
    }
    
    /**
     * Replay character caught by ghost animation
     */
    replayCharacterCaughtByGhost() {
        console.log('Replaying character caught by ghost animation');
        
        // Reset animation state and restart
        if (this.game.characterCaughtByGhostActive) {
            this.game.characterCaughtByGhostFrame = 0;
            this.game.characterCaughtByGhostTimer = 0;
            
            // Animation will continue automatically since characterCaughtByGhostActive is still true
            // The animateCharacterCaughtByGhost() loop is already running
        } else {
            // If animation wasn't active, restart it
            this.game.characterCaughtByGhostActive = true;
            this.game.characterCaughtByGhostFrame = 0;
            this.game.characterCaughtByGhostTimer = 0;
            
            // Start the animation loop
            if (this.characterCaughtByGhostSprite && this.characterCaughtByGhostSprite.complete) {
                this.animateCharacterCaughtByGhost();
            }
        }
    }
    
    /**
     * Replay ghost defeated animation
     */
    replayGhostDefeated() {
        console.log('Replaying ghost defeated animation');
        
        // Reset animation state and restart
        if (this.game.ghostDefeatedActive) {
            this.game.ghostDefeatedFrame = 0;
            this.game.ghostDefeatedTimer = 0;
            
            // Animation will continue automatically since ghostDefeatedActive is still true
            // The animateGhostDefeated() loop is already running
        } else {
            // If animation wasn't active, restart it
            this.game.ghostDefeatedActive = true;
            this.game.ghostDefeatedFrame = 0;
            this.game.ghostDefeatedTimer = 0;
            
            // Start the animation loop
            if (this.ghostDefeatedSprite && this.ghostDefeatedSprite.complete) {
                this.animateGhostDefeated();
            }
        }
    }
    
    /**
     * Called when a puzzle is solved to weaken the ghost
     */
    onPuzzleSolved() {
        if (!this.isActive) return;
        
        this.puzzlesSolved++;
        console.log('Ghost: Puzzle solved, count:', this.puzzlesSolved);
        
        // Check if ghost should weaken
        if (this.puzzlesSolved >= this.config.globalSettings.puzzlesToWeaken) {
            this.weaken();
            this.puzzlesSolved = 0; // Reset counter for next strength level
        }
    }
    
    /**
     * Reduce ghost strength by one level
     */
    weaken() {
        this.strength--;
        console.log('Ghost weakened to strength:', this.strength);
        
        // Update skull display
        this.updateSkullDisplay();
        
        if (this.strength <= 0) {
            this.isActive = false;
            console.log('Ghost disappeared!');
            
            // Show ghost defeated modal with yellow background
            this.showGhostDefeatedModal();
        } else {
            // Load new sprite for weakened state
            this.loadSprite();
        }
    }
    
    /**
     * Render the ghost on the canvas
     */
    render(ctx, cellSize, offsetX, offsetY) {
        if (!this.isActive || !this.spriteLoaded) return;
        
        // Calculate pixel position from grid position
        const pixelX = this.x * cellSize + offsetX;
        const pixelY = this.y * cellSize + offsetY;
        
        // Draw the ghost sprite bigger than cell size, centered on the cell
        if (this.currentSprite) {
            const ghostSize = cellSize * 1.5; // 50% larger than cell
            const centerOffsetX = (cellSize - ghostSize) / 2; // Center horizontally
            const centerOffsetY = (cellSize - ghostSize) / 2; // Center vertically
            
            ctx.drawImage(
                this.currentSprite,
                pixelX + centerOffsetX,
                pixelY + centerOffsetY,
                ghostSize,
                ghostSize
            );
        }
        
        // Debug: Show strength level
        if (window.debugMode) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText(
                `S:${this.strength} P:${this.puzzlesSolved}`,
                pixelX,
                pixelY - 5
            );
        }
    }
    
    /**
     * Set ghost difficulty based on selected game difficulty
     */
    setDifficulty(difficulty) {
        const difficultyMap = {
            'easy': 'easy',
            'neutral': 'neutral', 
            'hard': 'hard'
        };
        
        const configKey = difficultyMap[difficulty] || 'neutral';
        this.speed = this.config.globalSettings.speedByDifficulty[configKey];
        this.moveInterval = 1000 / this.speed;
        
        console.log('Ghost difficulty set to:', difficulty, 'speed:', this.speed);
    }
    
    /**
     * Show and update the skull display in the UI
     */
    updateSkullDisplay() {
        const skullElement = document.getElementById('ghostStrength');
        if (!skullElement) return;
        
        if (this.isActive && this.strength > 0) {
            // Show skulls based on current strength
            const skulls = '☠️'.repeat(this.strength);
            skullElement.textContent = skulls;
            skullElement.style.display = 'block';
            console.log(`Ghost skull display: ${skulls} (strength: ${this.strength})`);
        } else {
            // Hide skull display when ghost is gone
            skullElement.style.display = 'none';
            console.log('Ghost skull display hidden (ghost defeated)');
        }
    }
    
    /**
     * Initialize skull display when ghost is created
     */
    initializeSkullDisplay() {
        if (this.isActive) {
            this.updateSkullDisplay();
        }
    }
    
    /**
     * Add current position to history and check for loops
     */
    addToPositionHistory(x, y) {
        const positionKey = `${x},${y}`;
        this.positionHistory.push(positionKey);
        
        // Keep history manageable
        if (this.positionHistory.length > this.maxHistoryLength) {
            this.positionHistory.shift();
        }
        
        // Check for loops (position appears 3+ times in recent history)
        const occurrences = this.positionHistory.filter(pos => pos === positionKey).length;
        return occurrences >= 3;
    }
    
    /**
     * Clear position history to break loops and activate random mode
     */
    clearPositionHistory() {
        this.positionHistory = [];
        this.lastPosition = { x: -999, y: -999 }; // Reset anti-backtrack too
        this.randomModeCounter = 4; // Force 4 turns of random movement
        console.log('Ghost broke out of loop - activating random mode for 4 turns');
    }
    
    /**
     * Set ghost starting position near the endpoint
     * @param {object} watering_hole - The endpoint/watering hole position from maze data
     * @param {Array} paths - Available path positions
     */
    setStartingPosition(watering_hole, paths) {
        if (!watering_hole || !paths) {
            console.warn('Ghost: No endpoint or paths data, using default position');
            return;
        }
        
        // Convert endpoint pixel position to grid position
        const endpointGridX = watering_hole.x / 40;
        const endpointGridY = watering_hole.y / 40;
        
        console.log('Ghost: Endpoint at grid position:', endpointGridX, endpointGridY);
        
        // Find the closest open path to the endpoint
        let closestPath = null;
        let minDistance = Infinity;
        
        paths.forEach(path => {
            // Convert path pixel position to grid position
            const pathGridX = path.x / 40;
            const pathGridY = path.y / 40;
            
            // Calculate distance from endpoint
            const distance = Math.abs(pathGridX - endpointGridX) + Math.abs(pathGridY - endpointGridY);
            
            if (distance < minDistance && distance > 0) { // Don't place ghost on endpoint itself
                minDistance = distance;
                closestPath = { x: pathGridX, y: pathGridY };
            }
        });
        
        if (closestPath) {
            this.x = closestPath.x;
            this.y = closestPath.y;
            console.log('Ghost: Starting position set to grid:', this.x, this.y);
        } else {
            console.warn('Ghost: No suitable starting position found, keeping default');
        }
    }
}