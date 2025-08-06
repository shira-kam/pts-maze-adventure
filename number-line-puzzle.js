// PT's Maze Adventure - Number Line Puzzle (Levels 4-9)
// Creates an EXACT replica of the original number line puzzle mechanics

class NumberLinePuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'number_line');
        
        // Get operations and terms from new configuration structure
        this.operations = config.numberLine?.operations || config.operations || ['addition'];
        this.terms = config.numberLine?.terms || '2';
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Get or create level-specific problem tracking
        if (this.preventRepetition) {
            const trackingKey = `numberline_problems_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = new Set();
            }
            this.usedProblems = game[trackingKey];
        }
        
        console.log(`Level ${level} number line operations: ${this.operations.join(', ')}, terms: ${this.terms}`);
        console.log(`Problem tracking enabled: ${this.preventRepetition}`);
    }

    /**
     * Generate a number line puzzle based on equation type
     * Replicates the createNumberLinePuzzle function exactly
     */
    generatePuzzle() {
        let puzzle;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            puzzle = this.createNumberLinePuzzle();
            attempts++;
            
            // If tracking is disabled, return immediately
            if (!this.preventRepetition) {
                break;
            }
            
            // Create problem key for tracking
            const problemKey = puzzle.equation;
            
            // If problem hasn't been used, mark it as used and return
            if (!this.usedProblems.has(problemKey)) {
                this.usedProblems.add(problemKey);
                console.log(`New number line problem: ${problemKey}, total used: ${this.usedProblems.size}`);
                break;
            }
            
        } while (attempts < maxAttempts);
        
        // Fallback: if all problems exhausted, reset tracking and use current problem
        if (attempts >= maxAttempts && this.preventRepetition) {
            console.log('All number line problems used, resetting tracking for this level');
            this.usedProblems.clear();
            const problemKey = puzzle.equation;
            this.usedProblems.add(problemKey);
        }
        
        return puzzle;
    }
    
    /**
     * Create a single number line puzzle without tracking
     * Replicates the createNumberLinePuzzle function logic exactly
     */
    createNumberLinePuzzle() {
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'number_line');
        const numberLineConfig = config.numberLine || {};
        
        const minA = numberLineConfig.minA || 1;
        const maxA = numberLineConfig.maxA || 8;
        const minB = numberLineConfig.minB || 1;
        const maxB = numberLineConfig.maxB || 8;
        const maxResult = numberLineConfig.maxResult || 12;

        let equation, answer, title, num1, num2, num3;
        
        if (this.terms === '2') {
            // 2 terms: A+B and/or A-B based on operations selection
            const availableOps = [];
            if (this.operations.includes('addition')) availableOps.push('addition');
            if (this.operations.includes('subtraction')) availableOps.push('subtraction');
            
            // If no operations selected, default to addition
            if (availableOps.length === 0) availableOps.push('addition');
            
            const selectedOp = availableOps[Math.floor(Math.random() * availableOps.length)];
            
            if (selectedOp === 'addition') {
                // A + B
                num1 = Math.floor(Math.random() * (maxA - minA + 1)) + minA;
                const maxNum2 = Math.min(maxB, maxResult - num1);
                if (maxNum2 >= minB) {
                    num2 = Math.floor(Math.random() * (maxNum2 - minB + 1)) + minB;
                    answer = num1 + num2;
                    equation = `${num1} + ${num2}`;
                    title = `${num1} + ${num2} = ?`;
                } else {
                    // Fallback if constraints too tight
                    num1 = minA;
                    num2 = minB;
                    answer = num1 + num2;
                    equation = `${num1} + ${num2}`;
                    title = `${num1} + ${num2} = ?`;
                }
            } else {
                // A - B
                num1 = Math.floor(Math.random() * (maxA - minA + 1)) + minA;
                const maxNum2 = Math.min(maxB, num1);
                if (maxNum2 >= minB) {
                    num2 = Math.floor(Math.random() * (maxNum2 - minB + 1)) + minB;
                    answer = num1 - num2;
                    equation = `${num1} - ${num2}`;
                    title = `${num1} - ${num2} = ?`;
                } else {
                    // Fallback if constraints too tight
                    num1 = Math.max(minA, minB);
                    num2 = minB;
                    answer = num1 - num2;
                    equation = `${num1} - ${num2}`;
                    title = `${num1} - ${num2} = ?`;
                }
            }
        } else if (this.terms === '3') {
            // 3 terms: Generate patterns based on selected operations
            const minC = numberLineConfig.minC || 1;
            const maxC = numberLineConfig.maxC || 4;
            
            const patterns = [];
            
            // If only addition selected: A+B+C
            if (this.operations.includes('addition') && !this.operations.includes('subtraction')) {
                patterns.push(
                    { ops: ['+', '+'], fmt: (a, b, c) => `${a} + ${b} + ${c}`, title: (a, b, c) => `<span style="color: red;">${a}</span> + <span style="color: blue;">${b}</span> + <span style="color: green;">${c}</span> = ?`, calc: (a, b, c) => a + b + c }
                );
            }
            // If only subtraction selected: A-B-C  
            else if (this.operations.includes('subtraction') && !this.operations.includes('addition')) {
                patterns.push(
                    { ops: ['-', '-'], fmt: (a, b, c) => `${a} - ${b} - ${c}`, title: (a, b, c) => `<span style="color: red;">${a}</span> - <span style="color: blue;">${b}</span> - <span style="color: green;">${c}</span> = ?`, calc: (a, b, c) => a - b - c }
                );
            }
            // If both selected: A+B+C, A-B-C, A-B+C, A+B-C
            else {
                patterns.push(
                    { ops: ['+', '+'], fmt: (a, b, c) => `${a} + ${b} + ${c}`, title: (a, b, c) => `<span style="color: red;">${a}</span> + <span style="color: blue;">${b}</span> + <span style="color: green;">${c}</span> = ?`, calc: (a, b, c) => a + b + c },
                    { ops: ['-', '-'], fmt: (a, b, c) => `${a} - ${b} - ${c}`, title: (a, b, c) => `<span style="color: red;">${a}</span> - <span style="color: blue;">${b}</span> - <span style="color: green;">${c}</span> = ?`, calc: (a, b, c) => a - b - c },
                    { ops: ['-', '+'], fmt: (a, b, c) => `${a} - ${b} + ${c}`, title: (a, b, c) => `<span style="color: red;">${a}</span> - <span style="color: blue;">${b}</span> + <span style="color: green;">${c}</span> = ?`, calc: (a, b, c) => a - b + c },
                    { ops: ['+', '-'], fmt: (a, b, c) => `${a} + ${b} - ${c}`, title: (a, b, c) => `<span style="color: red;">${a}</span> + <span style="color: blue;">${b}</span> - <span style="color: green;">${c}</span> = ?`, calc: (a, b, c) => a + b - c }
                );
            }
            
            // If no patterns available (shouldn't happen), default to addition
            if (patterns.length === 0) {
                patterns.push(
                    { ops: ['+', '+'], fmt: (a, b, c) => `${a} + ${b} + ${c}`, title: (a, b, c) => `<span style="color: red;">${a}</span> + <span style="color: blue;">${b}</span> + <span style="color: green;">${c}</span> = ?`, calc: (a, b, c) => a + b + c }
                );
            }
            
            let tries = 0;
            let valid = false;
            while (!valid && tries < 100) {
                const pattern = patterns[Math.floor(Math.random() * patterns.length)];
                num1 = Math.floor(Math.random() * (maxA - minA + 1)) + minA;
                num2 = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
                num3 = Math.floor(Math.random() * (maxC - minC + 1)) + minC;
                
                // Calculate step by step and validate
                let intermediate1, intermediate2;
                if (pattern.ops[0] === '+') {
                    intermediate1 = num1 + num2;
                } else {
                    intermediate1 = num1 - num2;
                }
                if (pattern.ops[1] === '+') {
                    intermediate2 = intermediate1 + num3;
                } else {
                    intermediate2 = intermediate1 - num3;
                }
                
                // All intermediate and final results must be >= 0 and <= maxResult
                if (
                    num1 >= 0 && num1 <= maxResult &&
                    intermediate1 >= 0 && intermediate1 <= maxResult &&
                    intermediate2 >= 0 && intermediate2 <= maxResult
                ) {
                    valid = true;
                    answer = intermediate2;
                    equation = pattern.fmt(num1, num2, num3);
                    title = pattern.title(num1, num2, num3);
                }
                tries++;
            }
            
            // Fallback: if no valid combination found, use simple A+B+C with constrained values
            if (!valid) {
                num1 = Math.min(minA, Math.floor(maxResult / 3));
                num2 = Math.min(minB, Math.floor(maxResult / 3));
                num3 = Math.min(minC, maxResult - num1 - num2);
                answer = num1 + num2 + num3;
                equation = `${num1} + ${num2} + ${num3}`;
                title = `<span style="color: red;">${num1}</span> + <span style="color: blue;">${num2}</span> + <span style="color: green;">${num3}</span> = ?`;
            }
        }
        
        // Generate wrong answers (within ±4 of correct)
        const wrongAnswers = [];
        const maxDistance = 4;
        let attempts = 0;
        const maxAttempts = 50;
        
        while (wrongAnswers.length < 2 && attempts < maxAttempts) {
            let offset;
            do {
                offset = Math.floor(Math.random() * (maxDistance * 2 + 1)) - maxDistance;
            } while (offset === 0);
            
            const wrong = answer + offset;
            
            // Ensure answer is valid (0 to maxResult range) and unique
            if (wrong >= 0 && wrong <= maxResult && 
                wrong !== answer && !wrongAnswers.includes(wrong)) {
                wrongAnswers.push(wrong);
            }
            
            attempts++;
        }
        
        // Fallback: if we can't generate enough close answers, use broader range
        while (wrongAnswers.length < 2) {
            const wrong = Math.floor(Math.random() * (maxResult + 1)); // 0 to maxResult
            if (wrong !== answer && !wrongAnswers.includes(wrong)) {
                wrongAnswers.push(wrong);
            }
        }
        
        const allAnswers = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        
        // Store puzzle data on door object (required for game integration)
        this.door.mathAnswer = answer;
        this.door.mathStartPosition = 0;
        this.door.foxPosition = 0;
        
        return {
            title,
            answer,
            allAnswers,
            equation,
            num1,
            num2,
            num3
        };
    }

    /**
     * Initialize the number line interface
     * Uses configurable number line length
     */
    initializeNumberLine() {
        const level = game.selectedDifficulty;
        
        // Get number line configuration
        const config = configManager.getPuzzleConfig(level, 'number_line');
        const numberLineLength = config.numberLine?.length || 12;
        
        // Clear any existing keyboard handlers
        if (game.currentKeyHandler) {
            document.removeEventListener('keydown', game.currentKeyHandler);
            game.currentKeyHandler = null;
        }
        
        // Create the number grid (0 to numberLineLength)
        const numberGrid = document.getElementById('numberGrid');
        const gridLabels = document.getElementById('gridLabels');
        
        // Store PT canvases for each cell
        this.door.ptCanvases = {};
        
        // Create grid cells and labels
        for (let i = 0; i <= numberLineLength; i++) {
            // Create grid cell
            const cell = document.createElement('div');
            cell.style.cssText = `
                width: 40px;
                height: 40px;
                border: 1px solid #333;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
                background: white;
            `;

            // Special styling for cell 0 in levels 0+ or test mode
            if (i === 0 && (level >= 0 || game.testMode)) {
                cell.style.background = 'black';
            }
            
            // Create PT canvas for this cell
            const canvas = document.createElement('canvas');
            canvas.width = 40;
            canvas.height = 40;
            canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            `;
            
            cell.appendChild(canvas);
            this.door.ptCanvases[i] = canvas;
            
            // Add click handler
            cell.onclick = () => this.movePTToPosition(i);
            
            numberGrid.appendChild(cell);
            
            // Create label
            const label = document.createElement('div');
            label.textContent = i;
            label.style.cssText = `
                cursor: pointer;
                padding: 2px;
                border-radius: 3px;
            `;

            // Special styling for label 0 in levels 0+ or test mode
            if (i === 0 && (level >= 0 || game.testMode)) {
                label.style.background = 'black';
                label.style.color = 'white';
            }
            
            // Add click handler to label
            label.onclick = () => this.movePTToPosition(i);
            
            gridLabels.appendChild(label);
        }
        
        // Set up keyboard handler
        const keyHandler = (e) => this.numberLineKeyHandler(e);
        document.addEventListener('keydown', keyHandler);
        game.currentKeyHandler = keyHandler;
        
        // Position PT at starting position (always 0)
        this.movePTToPosition(0);
    }

    /**
     * Move PT to specified position with visual feedback
     * Uses configurable number line length
     */
    movePTToPosition(position) {
        const level = game.selectedDifficulty;
        
        // Get number line configuration
        const config = configManager.getPuzzleConfig(level, 'number_line');
        const numberLineLength = config.numberLine?.length || 12;
        
        // Validate position
        if (position < 0 || position > numberLineLength) return;
        
        // Update door position
        this.door.foxPosition = position;
        
        // Clear all PT canvases
        Object.values(this.door.ptCanvases).forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        
        // Reset all grid cell colors
        const cells = document.querySelectorAll('#numberGrid > div');
        cells.forEach((cell, index) => {
            if (index === 0 && (level >= 0 || game.testMode)) {
                cell.style.background = 'black'; // Preserve special cell 0 color
            } else {
                cell.style.background = 'white';
            }
        });
        
        // Apply color coding based on movement
        const startPos = this.door.mathStartPosition;
        const currentPos = position;
        
        cells.forEach((cell, index) => {
            if (index === startPos && index !== 0) {
                // Start position (green) - unless it's cell 0 which stays black
                cell.style.background = '#32CD32';
            } else if (index === currentPos) {
                if (index === 0 && (level >= 0 || game.testMode)) {
                    // Keep cell 0 black but draw PT on it
                } else if (currentPos < startPos) {
                    // Current position left of start (blue)
                    cell.style.background = '#4169E1';
                } else if (currentPos > startPos) {
                    // Current position right of start (orange)
                    cell.style.background = '#FF8C00';
                } else {
                    // Current position = start position (green)
                    cell.style.background = '#32CD32';
                }
            } else if ((index > startPos && index < currentPos) || (index < startPos && index > currentPos)) {
                // Trail cells between start and current
                if (currentPos > startPos) {
                    // Moving right (orange trail)
                    cell.style.background = '#FF8C00';
                } else {
                    // Moving left (blue trail)
                    cell.style.background = '#4169E1';
                }
            }
        });
        
        // Draw PT at current position
        const canvas = this.door.ptCanvases[position];
        const ctx = canvas.getContext('2d');
        
        if (currentMovementSprites && currentMovementSprites.complete) {
            // Draw PT sprite (frame 5 from movement sprite)
            const frameWidth = 160;
            const frameHeight = 160;
            const frameIndex = 5;
            
            ctx.drawImage(
                currentMovementSprites,
                frameIndex * frameWidth, 0, frameWidth, frameHeight,
                0, 0, 40, 40
            );
        }
    }

    /**
     * Handle keyboard input for number line
     * Replicates the numberLineKeyHandler function exactly
     */
    numberLineKeyHandler(e) {
        const level = game.selectedDifficulty;

        // Only handle keys for levels 0+ and when puzzle is active
        if (level < 0 || !game.puzzleActive) return;

        // Check if modal is visible
        const modal = document.getElementById('puzzleModal');
        if (modal.style.display !== 'block') return;
        
        const currentPos = this.door.foxPosition;
        
        // Get number line configuration
        const config = configManager.getPuzzleConfig(level, 'number_line');
        const numberLineLength = config.numberLine?.length || 12;
        
        switch (e.key) {
            case 'ArrowLeft':
                if (currentPos > 0) {
                    this.movePTToPosition(currentPos - 1);
                }
                break;
            case 'ArrowRight':
                if (currentPos < numberLineLength) {
                    this.movePTToPosition(currentPos + 1);
                }
                break;
        }
    }

    /**
     * Check the number line answer
     * Replicates the checkNumberLineAnswer function exactly
     */
    checkNumberLineAnswer() {
        const level = game.selectedDifficulty;
        const currentPos = this.door.foxPosition;
        const correctAnswer = this.door.mathAnswer;
        
        // Remove keyboard listeners
        if (game.currentKeyHandler) {
            document.removeEventListener('keydown', game.currentKeyHandler);
            game.currentKeyHandler = null;
        }
        
        const title = document.getElementById('puzzleTitle');
        const result = document.getElementById('puzzleResult');
        
        if (currentPos === correctAnswer) {
            // Correct answer
            title.innerHTML = `${correctAnswer} ✓`;
            result.innerHTML = '👍';
            result.style.fontSize = '48px';
            
            // Open door and update visuals
            this.door.open = true;
            this.door.color = '#B8F2B8'; // Light green
            
            // Complete rocket boost movement if applicable
            if (game.rocketBoostActive) {
                game.rocketBoostMovement.complete();
            }
            
            // Update score
            updateScore(1);
            
            // Weaken ghost when puzzle is solved correctly
            if (game.ghost && game.ghost.isActive) {
                game.ghost.onPuzzleSolved();
            }
            
            // Close modal after delay
            setTimeout(() => {
                const modal = document.getElementById('puzzleModal');
                modal.style.display = 'none';
                game.puzzleActive = false;
                result.innerHTML = '';
            }, 800);
            
        } else {
            // Wrong answer
            result.innerHTML = '👎';
            result.style.fontSize = '48px';
            
            // Clear feedback after delay
            setTimeout(() => {
                result.innerHTML = '';
            }, 1500);
            
            // Track attempts and apply difficulty-based penalties
            if (!this.door.currentProblemAttempts) {
                this.door.currentProblemAttempts = 0;
            }
            this.door.currentProblemAttempts++;
            
            // Apply penalty based on difficulty
            let pointsToDeduct;
            if (game.selectedDifficulty === 1) { // Easy
                pointsToDeduct = -1;
            } else if (game.selectedDifficulty === 2) { // Medium
                pointsToDeduct = this.door.currentProblemAttempts === 1 ? -1 : -2;
            } else { // Hard
                pointsToDeduct = -2;
            }
            updateScore(pointsToDeduct);
            
            // Re-add keyboard listeners for retry
            const keyHandler = (e) => this.numberLineKeyHandler(e);
            document.addEventListener('keydown', keyHandler);
            game.currentKeyHandler = keyHandler;
        }
    }

    /**
     * Render the complete number line puzzle
     * Replicates the showPuzzle number line section exactly
     */
    render() {
        // Get existing modal elements
        const modal = document.getElementById('puzzleModal');
        const title = document.getElementById('puzzleTitle');
        const question = document.getElementById('puzzleQuestion');
        const options = document.getElementById('puzzleOptions');
        
        // Show modal and set puzzle active state
        game.puzzleActive = true;
        modal.style.display = 'block';
        
        // Generate the puzzle
        const puzzle = this.generatePuzzle();
        
        // Set title
        title.innerHTML = puzzle.title;
        question.innerHTML = '';
        
        // Get number line configuration
        const config = configManager.getPuzzleConfig(game.selectedDifficulty, 'number_line');
        const numberLineLength = config.numberLine?.length || 12;
        const gridColumns = numberLineLength + 1; // 0 to numberLineLength
        const containerWidth = (gridColumns + 3) * 40; // 40px per cell + 2px gap
        // Create interface with number line and multiple choice
        options.innerHTML = `
            <div class="numberline-container" style="margin: 20px auto; max-width: ${containerWidth}px;">
                <div class="number-grid" id="numberGrid" style="
                    display: grid;
                    grid-template-columns: repeat(${gridColumns}, 40px);
                    gap: 2px;
                    border: 2px solid #666;
                    margin-bottom: 10px;
                    background: white;
                    padding: 5px;
                    border-radius: 10px;
                    justify-content: center;
                    width: fit-content;
                    margin: 0 auto 10px auto;
                "></div>
                <div class="grid-labels" id="gridLabels" style="
                    display: grid;
                    grid-template-columns: repeat(${gridColumns}, 40px);
                    gap: 2px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: bold;
                    justify-content: center;
                    width: fit-content;
                    margin: 0 auto;
                "></div>
            </div>
            <div style="margin-top: 20px;">
                <div id="answerButtons" style="display: flex; gap: 15px; justify-content: center;">
                </div>
            </div>
        `;
        
        // Create answer buttons
        const answerContainer = document.getElementById('answerButtons');
        puzzle.allAnswers.forEach(ans => {
            const button = document.createElement('button');
            button.textContent = ans;
            button.style.cssText = `
                padding: 15px 25px;
                font-size: 18px;
                font-weight: bold;
                border: 2px solid #4CAF50;
                border-radius: 8px;
                background: white;
                color: #4CAF50;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            button.onmouseover = () => {
                button.style.background = '#4CAF50';
                button.style.color = 'white';
            };
            button.onmouseout = () => {
                button.style.background = 'white';
                button.style.color = '#4CAF50';
            };
            // Use existing checkAnswer function - this is critical!
            button.onclick = () => checkAnswer(ans === puzzle.answer, 'math', this.door, button);
            answerContainer.appendChild(button);
        });
        
        // Initialize the number line interface
        this.initializeNumberLine();
        
        console.log(`Number Line Puzzle: ${puzzle.equation} = ${puzzle.answer}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NumberLinePuzzle;
}