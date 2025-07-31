// PT's Maze Adventure - Multiplication Groups Puzzle (Level 10)
// Creates an EXACT replica of the original multiplication groups puzzle mechanics

class MultiplicationGroupsPuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'multiplication_groups');
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Initialize level-specific multiplication tracking
        if (this.preventRepetition) {
            const trackingKey = `multiplication_problems_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = new Set();
            }
            this.usedProblems = game[trackingKey];
        }
        
        // Initialize global multiplication tracking if it doesn't exist (for legacy compatibility)
        if (!game.usedMultiplicationProblems) {
            game.usedMultiplicationProblems = [];
        }
        
        console.log(`Level ${level} multiplication groups puzzle initialized`);
    }

    /**
     * Generate all valid multiplication pairs using configuration
     */
    generateValidPairs() {
        const pairs = [];
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'multiplication_groups');
        const multiplicationConfig = config.multiplication || {};
        
        // Use configuration or defaults
        const maxProduct = multiplicationConfig.maxProduct || 20;
        const minFactor = multiplicationConfig.minFactor || 2;
        const maxFactor = multiplicationConfig.maxFactor || 10;
        const excludeOne = multiplicationConfig.excludeOne !== false; // Default true
        
        console.log(`Level ${level} multiplication config:`, {
            maxProduct, minFactor, maxFactor, excludeOne
        });
        
        for (let a = minFactor; a <= maxFactor; a++) {
            // Skip 1 if excludeOne is true
            if (excludeOne && a === 1) continue;
            
            for (let b = minFactor; b <= maxFactor; b++) {
                // Skip 1 if excludeOne is true
                if (excludeOne && b === 1) continue;
                
                const product = a * b;
                
                // Apply product constraint
                if (product <= maxProduct) {
                    pairs.push({ a, b, product });
                }
            }
        }
        
        console.log(`Generated ${pairs.length} valid multiplication pairs for level ${level}`);
        return pairs;
    }

    /**
     * Generate a multiplication puzzle with tracking
     */
    generatePuzzle() {
        let puzzle;
        let attempts = 0;
        const maxAttempts = 100;
        
        const validPairs = this.generateValidPairs();
        
        do {
            // Pick a random valid pair
            const randomIndex = Math.floor(Math.random() * validPairs.length);
            const pair = validPairs[randomIndex];
            
            puzzle = {
                a: pair.a,
                b: pair.b,
                answer: pair.product,
                title: `${pair.a} × ${pair.b} = ?`
            };
            
            attempts++;
            
            // If tracking is disabled, return immediately
            if (!this.preventRepetition) {
                break;
            }
            
            // Create problem key for tracking
            const problemKey = `${puzzle.a}×${puzzle.b}`;
            
            // If problem hasn't been used, mark it as used and return
            if (!this.usedProblems.has(problemKey)) {
                this.usedProblems.add(problemKey);
                console.log(`New multiplication problem: ${problemKey}, total used: ${this.usedProblems.size}`);
                break;
            }
            
        } while (attempts < maxAttempts);
        
        // Fallback: if all problems exhausted, reset tracking and use current problem
        if (attempts >= maxAttempts && this.preventRepetition) {
            console.log('All multiplication problems used, resetting tracking for this level');
            this.usedProblems.clear();
            const problemKey = `${puzzle.a}×${puzzle.b}`;
            this.usedProblems.add(problemKey);
        }
        
        // Add problem to legacy tracking for compatibility
        if (!game.usedMultiplicationProblems.includes(`${puzzle.a},${puzzle.b}`)) {
            game.usedMultiplicationProblems.push(`${puzzle.a},${puzzle.b}`);
        }
        
        // Generate wrong answers
        const wrongAnswers = this.generateWrongAnswers(puzzle.answer);
        const allAnswers = [puzzle.answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        
        puzzle.allAnswers = allAnswers;
        
        console.log(`Multiplication Puzzle: ${puzzle.a} × ${puzzle.b} = ${puzzle.answer}`);
        
        return puzzle;
    }

    /**
     * Generate wrong answers for multiplication puzzle
     */
    generateWrongAnswers(correctAnswer) {
        const wrongAnswers = [];
        const maxDistance = 4;
        let attempts = 0;
        const maxAttempts = 50;
        
        while (wrongAnswers.length < 2 && attempts < maxAttempts) {
            let offset;
            do {
                offset = Math.floor(Math.random() * (maxDistance * 2 + 1)) - maxDistance;
            } while (offset === 0);
            
            const wrong = correctAnswer + offset;
            
            // Ensure answer is valid (1 to 20 range) and unique
            if (wrong >= 1 && wrong <= 20 && 
                wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
                wrongAnswers.push(wrong);
            }
            
            attempts++;
        }
        
        // Fallback: if we can't generate enough close answers, use broader range
        while (wrongAnswers.length < 2) {
            const wrong = Math.floor(Math.random() * 20) + 1; // 1 to 20
            if (wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
                wrongAnswers.push(wrong);
            }
        }
        
        return wrongAnswers;
    }

    /**
     * Create the multiplication groups HTML interface
     * EXACT replica of original UI - no text, click interactions, + - buttons only
     */
    createMultiplicationHTML(puzzle) {
        return `
            <div style="text-align: center; padding: 20px;">
                <div style="margin: 15px 0;">
                    <button style="
                        background: #2196F3;
                        color: white;
                        border: none;
                        padding: 12px 16px;
                        border-radius: 8px;
                        font-size: 18px;
                        cursor: pointer;
                        font-family: inherit;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        margin: 0 auto;
                    " onclick="multiplicationPuzzleInstance.speakMultiplicationProblem(${puzzle.a}, ${puzzle.b})">
                        🔊
                    </button>
                </div>
                <div id="redSquaresContainer" style="display: flex; gap: 15px; justify-content: center; margin: 20px 0; min-height: 120px; align-items: center; flex-wrap: wrap;">
                    <!-- Red squares will be added here -->
                </div>
                <div style="margin: 20px 0; text-align: center;">
                    <button onclick="multiplicationPuzzleInstance.removeRedSquare()" style="
                        background: white;
                        color: black;
                        border: 3px solid black;
                        border-radius: 50%;
                        font-size: 24px;
                        cursor: pointer;
                        font-weight: bold;
                        margin-right: 10px;
                        width: 60px;
                        height: 60px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    ">−</button>
                    <button onclick="multiplicationPuzzleInstance.addRedSquare()" style="
                        background: white;
                        color: black;
                        border: 3px solid black;
                        border-radius: 50%;
                        font-size: 24px;
                        cursor: pointer;
                        font-weight: bold;
                        width: 60px;
                        height: 60px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    ">+</button>
                </div>
                <div style="margin-top: 30px;">
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        ${puzzle.allAnswers.map(ans => `
                            <button style="
                                background: #4CAF50;
                                color: white;
                                border: none;
                                padding: 15px 25px;
                                margin: 5px;
                                border-radius: 25px;
                                font-size: 20px;
                                cursor: pointer;
                                font-family: inherit;
                                min-width: 80px;
                                transition: all 0.2s ease;
                                position: relative;
                            " onmouseover="this.style.background='#45a049';" 
                               onmouseout="this.style.background='#4CAF50';"
                               onclick="multiplicationPuzzleInstance.checkAnswer(${ans === puzzle.answer}, this, ${ans})">${ans}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Add a red square with synchronized dots
     * Replicates addRedSquare function exactly
     */
    addRedSquare() {
        const container = document.getElementById('redSquaresContainer');
        const existingSquares = container.querySelectorAll('.red-square');
        
        // Limit to reasonable number of squares
        if (existingSquares.length >= 10) {
            return;
        }
        
        // Get current number of dots from existing squares (for synchronization)
        let currentDots = 0;
        if (existingSquares.length > 0) {
            currentDots = existingSquares[0].querySelectorAll('.dot').length;
        }
        
        // Create new square
        const square = document.createElement('div');
        square.className = 'red-square';
        square.style.cssText = `
            width: 140px;
            height: 140px;
            border: 4px solid #DC143C;
            border-radius: 15px;
            background: #FFB6C1;
            display: inline-block;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            min-height: 140px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin: 10px;
            vertical-align: top;
        `;
        
        // Add click handler to add dots to all squares
        square.onclick = () => this.addDotToAllSquares();
        
        // Add the same number of dots as existing squares
        for (let i = 0; i < currentDots; i++) {
            this.createDotInSquare(square);
        }
        container.appendChild(square);
        console.log(`Added square, now have ${existingSquares.length + 1} squares with ${currentDots} dots each`);
    }

    /**
     * Create a dot in the specified square
     * Replicates createDotInSquare function exactly
     */
    createDotInSquare(square) {
        // Create dots container if it doesn't exist
        let dotsContainer = square.querySelector('.basket-dots');
        if (!dotsContainer) {
            dotsContainer = document.createElement('div');
            dotsContainer.className = 'basket-dots';
            dotsContainer.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                justify-content: center;
                align-items: center;
                height: 100%;
                width: 100%;
                padding: 8px;
                box-sizing: border-box;
            `;
            square.appendChild(dotsContainer);
        }
        const dot = document.createElement('div');
        dot.className = 'dot multiplication-dot';
        dot.style.cssText = `
            width: 30px;
            height: 30px;
            background: #8A2BE2;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            transition: all 0.2s ease;
        `;
        dot.textContent = '🟣';
        // Click on dot removes dots from all squares
        dot.onclick = (e) => {
            e.stopPropagation(); // Prevent square click
            this.removeDotFromAllSquares();
        };
        dotsContainer.appendChild(dot);
    }

    /**
     * Remove a red square (maintain at least 1)
     * Replicates removeRedSquare function exactly
     */
    removeRedSquare() {
        const container = document.getElementById('redSquaresContainer');
        const squares = container.querySelectorAll('.red-square');
        
        // Keep at least 1 square
        if (squares.length > 1) {
            container.removeChild(squares[squares.length - 1]);
            console.log(`Removed square, now have ${squares.length - 1} squares`);
        }
    }

    /**
     * Add one dot to all squares
     * Replicates addDotToAllSquares function exactly
     */
    addDotToAllSquares() {
        const squares = document.querySelectorAll('.red-square');
        
        squares.forEach(square => {
            const currentDots = square.querySelectorAll('.dot').length;
            
            // Limit dots per square
            if (currentDots >= 15) {
                return;
            }
            
            this.createDotInSquare(square);
        });
        
        const totalSquares = squares.length;
        const dotsPerSquare = squares.length > 0 ? squares[0].querySelectorAll('.dot').length : 0;
        console.log(`Added dots, now have ${totalSquares} squares with ${dotsPerSquare} dots each`);
    }

    /**
     * Remove one dot from all squares
     * Replicates removeDotFromAllSquares function exactly
     */
    removeDotFromAllSquares() {
        const squares = document.querySelectorAll('.red-square');
        
        squares.forEach(square => {
            const dots = square.querySelectorAll('.dot');
            if (dots.length > 0) {
                // Remove the dot from its parent container (basket-dots)
                const lastDot = dots[dots.length - 1];
                lastDot.parentNode.removeChild(lastDot);
            }
        });
        
        const totalSquares = squares.length;
        const dotsPerSquare = squares.length > 0 ? squares[0].querySelectorAll('.dot').length : 0;
        console.log(`Removed dots, now have ${totalSquares} squares with ${dotsPerSquare} dots each`);
    }

    /**
     * Check multiplication answer with dual validation and visual feedback
     * Shows thumbs up/down in squares and buttons to indicate which part was correct/wrong
     */
    checkAnswer(isCorrect, buttonElement, selectedAnswer) {
        const result = document.getElementById('puzzleResult');
        
        // Store puzzle data for feedback
        this.currentPuzzle = this.currentPuzzle || this.generatePuzzle();
        
        // Get current visual arrangement
        const squares = document.querySelectorAll('.red-square');
        const numSquares = squares.length;
        const dotsPerSquare = squares.length > 0 ? squares[0].querySelectorAll('.dot').length : 0;
        const visualProduct = numSquares * dotsPerSquare;
        
        // Initialize attempt counters if they don't exist
        if (!this.door.currentProblemAttempts) this.door.currentProblemAttempts = 0;
        this.door.currentProblemAttempts++;
        
        // Dual validation: both numerical answer AND visual arrangement must be correct
        const numericallyCorrect = isCorrect;
        // Visual is correct if it matches A×B OR B×A (both arrangements are valid)
        const expectedProduct = this.currentPuzzle.a * this.currentPuzzle.b;
        const visuallyCorrect = (visualProduct === expectedProduct) && 
                               ((numSquares === this.currentPuzzle.a && dotsPerSquare === this.currentPuzzle.b) ||
                                (numSquares === this.currentPuzzle.b && dotsPerSquare === this.currentPuzzle.a));
        const fullyCorrect = numericallyCorrect && visuallyCorrect;
        
        console.log(`Answer check: numerical=${numericallyCorrect}, visual=${visuallyCorrect} (${numSquares}×${dotsPerSquare}=${visualProduct}), selected=${selectedAnswer}`);
        
        // Add visual feedback to squares - ALWAYS show feedback based on visual arrangement
        squares.forEach(square => {
            // Clear any existing feedback
            const existingFeedback = square.querySelector('.feedback-indicator');
            if (existingFeedback) {
                existingFeedback.remove();
            }
            
            // Add feedback indicator based ONLY on visual arrangement
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'feedback-indicator';
            feedbackDiv.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                font-size: 24px;
                z-index: 10;
            `;
            feedbackDiv.innerHTML = visuallyCorrect ? '👍' : '👎';
            square.appendChild(feedbackDiv);
        });
        
        // Add visual feedback ONLY to the selected button
        const answerButtons = document.querySelectorAll('#puzzleOptions button');
        answerButtons.forEach(button => {
            // Clear any existing feedback
            const existingFeedback = button.querySelector('.feedback-indicator');
            if (existingFeedback) {
                existingFeedback.remove();
            }
            
            // Only add feedback to the selected button
            if (button === buttonElement) {
                const feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'feedback-indicator';
                feedbackDiv.style.cssText = `
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    font-size: 20px;
                    z-index: 10;
                `;
                feedbackDiv.innerHTML = numericallyCorrect ? '👍' : '👎';
                button.style.position = 'relative';
                button.appendChild(feedbackDiv);
            }
        });
        
        if (fullyCorrect) {
            // Correct answer!
            result.innerHTML = '👍';
            result.style.color = 'green';
            result.style.fontSize = '48px';
            
            // Mark door as open
            this.door.open = true;
            
            // Complete rocket boost movement if active
            if (game.rocketBoostActive) {
                game.rocketBoostMovement.complete();
            }
            
            // Give +1 point for correct answer
            updateScore(1);
            
            // Weaken ghost when puzzle is solved correctly
            if (game.ghost && game.ghost.isActive) {
                game.ghost.onPuzzleSolved();
            }
            
            // Reset attempt counters
            this.door.currentProblemAttempts = 0;
            
            // Change door color to match open path
            this.door.color = '#B8F2B8';
            
            setTimeout(() => {
                document.getElementById('puzzleModal').style.display = 'none';
                result.innerHTML = '';
                result.style.fontSize = '';
                game.puzzleActive = false;
                // Clear any multiplication door reference
                game.currentMultiplicationDoor = null;
            }, 1500);
        } else {
            // Wrong answer
            result.innerHTML = '👎';
            result.style.color = 'red';
            result.style.fontSize = '48px';
            
            // Provide helpful feedback
            if (numericallyCorrect && !visuallyCorrect) {
                console.log('Numerical answer correct, but visual arrangement is wrong');
            } else if (!numericallyCorrect && visuallyCorrect) {
                console.log('Visual arrangement correct, but wrong numerical answer selected');
            } else {
                console.log('Both numerical answer and visual arrangement are wrong');
            }
            
            // Deduct points based on difficulty mode
            let pointsToDeduct = 0;
            
            if (game.difficultyMode === 'easy') {
                pointsToDeduct = -1;
            } else if (game.difficultyMode === 'medium') {
                pointsToDeduct = -2;
            } else if (game.difficultyMode === 'hard') {
                pointsToDeduct = -3;
            }
            
            // Update both level and cumulative scores properly
            updateScore(pointsToDeduct);
            
            // Mark door as locked if too many attempts
            if (this.door.currentProblemAttempts >= 3) {
                this.door.open = false;
                console.log('Door locked due to too many incorrect attempts');
            }
        }
    }

    /**
     * Speak the multiplication problem aloud
     * Says "A groups of B" for problem A×B
     */
    speakMultiplicationProblem(a, b) {
        const textToSpeak = `${a} groups of ${b}`;
        console.log(`Speaking: "${textToSpeak}"`);
        
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 0.8; // Slightly slower for clarity
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Speech synthesis not supported in this browser');
        }
    }

    /**
     * Show modal with generated puzzle
     * EXACT replica of original showModal function - no changes
     */
    showModal() {
        const modal = document.getElementById('puzzleModal');
        const title = document.getElementById('puzzleTitle');
        const question = document.getElementById('puzzleQuestion');
        const options = document.getElementById('puzzleOptions');
        const result = document.getElementById('puzzleResult');
        
        // Show modal and set puzzle active state
        game.puzzleActive = true;
        modal.style.display = 'block';
        
        // Generate the puzzle and store it for feedback
        this.currentPuzzle = this.generatePuzzle();
        
        // Set title and generate HTML
        title.innerHTML = this.currentPuzzle.title;
        question.innerHTML = '';
        options.innerHTML = this.createMultiplicationHTML(this.currentPuzzle);
        
        // Store global reference for onclick handlers
        window.multiplicationPuzzleInstance = this;
        
        // Initialize with one square and no dots
        this.addRedSquare();
        
        console.log(`Multiplication Groups Puzzle rendered: ${this.currentPuzzle.a} x ${this.currentPuzzle.b} = ${this.currentPuzzle.answer}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiplicationGroupsPuzzle;
}