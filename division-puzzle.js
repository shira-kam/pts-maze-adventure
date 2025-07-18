// PT's Maze Adventure - Division Puzzle (Levels 8-10)
// Creates an EXACT replica of the original division puzzle mechanics

class DivisionPuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'division_visual');
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Initialize level-specific division tracking
        if (this.preventRepetition) {
            const trackingKey = `division_problems_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = new Set();
            }
            this.usedProblems = game[trackingKey];
        }
        
        // Initialize global division tracking if it doesn't exist (for legacy compatibility)
        if (game.hasUsedAnswerOne === undefined) {
            game.hasUsedAnswerOne = false;
        }
        if (game.hasUsedDivideByOne === undefined) {
            game.hasUsedDivideByOne = false;
        }
        if (!game.usedDivisionProblems) {
            game.usedDivisionProblems = new Set();
        }
        
        console.log(`Level ${level} division puzzle initialized`);
    }

    /**
     * Generate a division puzzle with configurable limits and tracking
     */
    generatePuzzle() {
        let puzzle;
        let attempts = 0;
        const maxAttempts = 100;
        
        // Get division configuration
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'division_visual');
        const divisionConfig = config.division || {};
        
        const maxA = divisionConfig.maxA || 15;
        const maxB = divisionConfig.maxB || 10;
        const maxAnswer = divisionConfig.maxAnswer || 10;
        const excludeIdentity = divisionConfig.excludeIdentity || false;
        
        do {
            puzzle = this.createDivisionPuzzle(maxA, maxB, maxAnswer, excludeIdentity);
            attempts++;
            
            // If tracking is disabled, return immediately
            if (!this.preventRepetition) {
                break;
            }
            
            // Create problem key for tracking
            const problemKey = `${puzzle.dividend}÷${puzzle.divisor}`;
            
            // If problem hasn't been used, mark it as used and return
            if (!this.usedProblems.has(problemKey)) {
                this.usedProblems.add(problemKey);
                console.log(`New division problem: ${problemKey}, total used: ${this.usedProblems.size}`);
                break;
            }
            
        } while (attempts < maxAttempts);
        
        // Fallback: if all problems exhausted, reset tracking and use current problem
        if (attempts >= maxAttempts && this.preventRepetition) {
            console.log('All division problems used, resetting tracking for this level');
            this.usedProblems.clear();
            const problemKey = `${puzzle.dividend}÷${puzzle.divisor}`;
            this.usedProblems.add(problemKey);
        }
        
        // Store the problem details on the door (same format as original)
        this.door.divisionData = {
            dividend: puzzle.dividend,
            divisor: puzzle.divisor,
            answer: puzzle.answer,
            dotsInBaskets: new Array(puzzle.divisor).fill(0), // Track dots in each basket
            isComplete: false
        };
        
        console.log(`Division Puzzle: ${puzzle.dividend} ÷ ${puzzle.divisor} = ${puzzle.answer}`);
        
        return puzzle;
    }

    /**
     * Create a single division puzzle with constraints
     */
    createDivisionPuzzle(maxA, maxB, maxAnswer, excludeIdentity) {
        let dividend, divisor, answer;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            // Generate random division problem
            dividend = Math.floor(Math.random() * maxA) + 1; // 1 to maxA
            divisor = Math.floor(Math.random() * Math.min(dividend, maxB)) + 1; // 1 to min(dividend, maxB)
            answer = Math.floor(dividend / divisor);

            // Ensure clean division
            if (dividend % divisor !== 0) {
                dividend = divisor * answer;
            }

            attempts++;
            if (attempts >= maxAttempts) {
                // Fallback to simple problem
                dividend = 12;
                divisor = 3;
                answer = 4;
                break;
            }
        } while (
                dividend % divisor !== 0 || // Must be evenly divisible
                answer === 0 || // No zero answers
                answer > maxAnswer || // Keep answers within configured limit
                dividend === divisor || // Exclude A:A
                divisor === 1 // Exclude A:1
        );
        
        // Generate wrong answers within |R-W| < 4
        const wrongAnswers = [];
        const maxDistance = 4;
        let wrongAttempts = 0;
        const maxWrongAttempts = 50;
        
        while (wrongAnswers.length < 2 && wrongAttempts < maxWrongAttempts) {
            let offset;
            do {
                offset = Math.floor(Math.random() * (maxDistance * 2 + 1)) - maxDistance;
            } while (offset === 0);
            
            const wrong = answer + offset;
            
            // Ensure answer is valid (1 to maxAnswer range) and unique
            if (wrong >= 1 && wrong <= maxAnswer && 
                wrong !== answer && !wrongAnswers.includes(wrong)) {
                wrongAnswers.push(wrong);
            }
            
            wrongAttempts++;
        }
        
        // Fallback: if we can't generate enough close answers, use broader range
        while (wrongAnswers.length < 2) {
            const wrong = Math.floor(Math.random() * maxAnswer) + 1; // 1 to maxAnswer
            if (wrong !== answer && !wrongAnswers.includes(wrong)) {
                wrongAnswers.push(wrong);
            }
        }
        
        const allAnswers = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        
        return {
            dividend,
            divisor,
            answer,
            allAnswers,
            title: `${dividend} ÷ ${divisor} = ?`
        };
    }

    /**
     * Get baskets per row layout
     * Replicates getBasketsPerRow function exactly
     */
    getBasketsPerRow(divisor) {
        if (divisor >= 1 && divisor <= 5) {
            return divisor; // 1 row: all baskets on one line
        } else if (divisor >= 6 && divisor <= 10) {
            return Math.ceil(divisor / 2); // 2 rows: divide evenly between 2 rows
        } else if (divisor >= 11 && divisor <= 15) {
            return Math.ceil(divisor / 3); // 3 rows: divide evenly between 3 rows
        } else {
            return Math.ceil(divisor / 4); // 4+ rows for larger divisors
        }
    }

    /**
     * Create the division HTML interface
     * Replicates createDivisionPuzzle HTML generation exactly
     */
    createDivisionHTML(puzzle) {
        const { dividend, divisor } = puzzle;
        
        return `
            <div class="division-container" style="margin: 10px auto; width: 900px; text-align: center; min-height: 400px; max-height: 700px; overflow-y: auto; padding: 20px; box-sizing: border-box;">
                <div style="margin: 20px 0; display: flex; justify-content: center; align-items: center; gap: 10px;">
                    <button id="speakProblem" style="
                        background: #2196F3;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        font-size: 16px;
                        border-radius: 20px;
                        cursor: pointer;
                        font-family: inherit;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    " onclick="divisionPuzzleInstance.speakDivisionProblem(${dividend}, ${divisor})">
                        🔊
                    </button>
                </div>
                
                <div class="dots-area" id="dotsArea" style="
                    margin: 20px auto;
                    min-height: 120px;
                    height: 120px;
                    max-width: 800px;
                    border: 2px dashed #ccc;
                    border-radius: 10px;
                    padding: 15px;
                    background: #f9f9f9;
                    overflow-y: auto;
                    box-sizing: border-box;
                ">
                    <div id="dotsContainer" style="display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; min-height: 80px; cursor: pointer;" onclick="divisionPuzzleInstance.selectDotsArea()">
                        ${Array(dividend).fill().map((_, i) => 
                            `<div class="dot" data-dot-id="${i}" style="
                                width: 30px;
                                height: 30px;
                                background: #8A2BE2;
                                border-radius: 50%;
                                cursor: pointer;
                                user-select: none;
                                border: 2px solid transparent;
                                transition: all 0.2s ease;
                                box-shadow: none;
                                transform: scale(1);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 22px;
                            " draggable="true" onclick="event.stopPropagation(); divisionPuzzleInstance.selectDot(${i})">🟣</div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="baskets-area" style="margin: 20px auto; min-height: 250px; max-height: 400px; overflow-y: auto; padding: 10px; max-width: 800px;">
                    <div id="basketsContainer" style="display: grid; grid-template-columns: repeat(${this.getBasketsPerRow(divisor)}, 140px); gap: 20px; justify-content: center; align-items: start;">
                        ${Array(divisor).fill().map((_, i) => 
                            `<div class="basket" data-basket-id="${i}" style="
                                width: 140px;
                                height: 140px;
                                border: 4px solid #DC143C;
                                border-radius: 15px;
                                background: #FFB6C1;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                position: relative;
                                min-height: 140px;
                                cursor: pointer;
                                transition: all 0.2s ease;
                            " onclick="divisionPuzzleInstance.selectBasket(${i})">
                                <div class="basket-count" style="
                                    position: absolute;
                                    top: -12px;
                                    right: -12px;
                                    background: #228B22;
                                    color: white;
                                    border-radius: 50%;
                                    width: 24px;
                                    height: 24px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 14px;
                                    font-weight: bold;
                                ">0</div>
                                <div class="basket-dots" style="
                                    display: flex;
                                    flex-wrap: wrap;
                                    gap: 4px;
                                    justify-content: center;
                                    align-items: center;
                                    width: 100%;
                                    height: 100%;
                                    padding: 10px;
                                    box-sizing: border-box;
                                "></div>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <div id="answerButtons" style="display: flex; gap: 15px; justify-content: center;">
                        ${puzzle.allAnswers.map(ans => 
                            `<button style="
                                padding: 15px 25px;
                                font-size: 18px;
                                font-weight: bold;
                                border: 2px solid #4CAF50;
                                border-radius: 8px;
                                background: white;
                                color: #4CAF50;
                                cursor: pointer;
                                transition: all 0.3s ease;
                            " onmouseover="this.style.background='#4CAF50'; this.style.color='white';" 
                               onmouseout="this.style.background='white'; this.style.color='#4CAF50';"
                               onclick="divisionPuzzleInstance.checkAnswer(${ans === puzzle.answer}, this)">${ans}</button>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup drag and drop functionality
     * Replicates setupDivisionDragDrop function exactly
     */
    setupDivisionDragDrop() {
        const dots = document.querySelectorAll('.dot');
        const baskets = document.querySelectorAll('.basket');
        
        // Initialize selection state
        this.door.selectedDot = null;
        
        // Setup drag events for dots
        dots.forEach(dot => {
            dot.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.dotId);
                e.target.style.opacity = '0.5';
            });
            
            dot.addEventListener('dragend', (e) => {
                e.target.style.opacity = '1';
            });
        });
        
        // Setup drop events for baskets
        baskets.forEach(basket => {
            basket.addEventListener('dragover', (e) => {
                e.preventDefault();
                basket.style.backgroundColor = '#FF69B4';
            });
            
            basket.addEventListener('dragleave', (e) => {
                basket.style.backgroundColor = '#FFB6C1';
            });
            
            basket.addEventListener('drop', (e) => {
                e.preventDefault();
                basket.style.backgroundColor = '#FFB6C1';
                
                const dotId = e.dataTransfer.getData('text/plain');
                const dot = document.querySelector(`[data-dot-id="${dotId}"]`);
                const basketId = basket.dataset.basketId;
                
                if (dot && basketId !== undefined) {
                    this.moveDotToBasket(dot, basketId);
                }
            });
        });
        
        // Setup drop zone for dots area (to remove from baskets)
        const dotsArea = document.getElementById('dotsContainer');
        dotsArea.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        dotsArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const dotId = e.dataTransfer.getData('text/plain');
            const dot = document.querySelector(`[data-dot-id="${dotId}"]`);
            
            if (dot) {
                this.moveDotToArea(dot);
            }
        });
        
        // Check if answer buttons should be enabled
        this.updateAnswerButtons();
    }

    /**
     * Move dot to basket
     * Replicates moveDotToBasket function exactly
     */
    moveDotToBasket(dot, basketId) {
        // Find which basket this dot came from (if any)
        const currentBasket = dot.closest('.basket');
        if (currentBasket) {
            const currentBasketId = currentBasket.dataset.basketId;
            this.door.divisionData.dotsInBaskets[currentBasketId]--;
            const currentCountElement = currentBasket.querySelector('.basket-count');
            currentCountElement.textContent = this.door.divisionData.dotsInBaskets[currentBasketId];
        }
        
        // Move dot to new basket
        const basket = document.querySelector(`[data-basket-id="${basketId}"]`);
        const basketDots = basket.querySelector('.basket-dots');
        basketDots.appendChild(dot);
        
        // Update basket count
        this.door.divisionData.dotsInBaskets[basketId]++;
        const countElement = basket.querySelector('.basket-count');
        countElement.textContent = this.door.divisionData.dotsInBaskets[basketId];
        
        // Keep dot same size when in basket and remove focus state
        dot.style.width = '30px';
        dot.style.height = '30px';
        dot.style.fontSize = '22px';
        dot.style.border = '2px solid transparent';
        dot.style.boxShadow = 'none';
        dot.style.transform = 'scale(1)';
        
        // Clear selected dot state
        this.door.selectedDot = null;
        
        // Update answer buttons
        this.updateAnswerButtons();
    }

    /**
     * Move dot back to area
     * Replicates moveDotToArea function exactly
     */
    moveDotToArea(dot) {
        // Find which basket this dot came from
        const basket = dot.closest('.basket');
        if (basket) {
            const basketId = basket.dataset.basketId;
            this.door.divisionData.dotsInBaskets[basketId]--;
            const countElement = basket.querySelector('.basket-count');
            countElement.textContent = this.door.divisionData.dotsInBaskets[basketId];
        }
        
        // Move dot back to dots area
        const dotsArea = document.getElementById('dotsContainer');
        dotsArea.appendChild(dot);
        
        // Restore original size
        dot.style.width = '30px';
        dot.style.height = '30px';
        dot.style.fontSize = '22px';
        dot.style.border = '2px solid transparent';
        
        // Update answer buttons
        this.updateAnswerButtons();
    }

    /**
     * Select dot
     * Replicates selectDot function exactly
     */
    selectDot(dotId) {
        const dot = document.querySelector(`[data-dot-id="${dotId}"]`);
        if (!dot) return;
        
        // Check if there's already a selected dot and this clicked dot is in a basket
        if (this.door.selectedDot !== null && this.door.selectedDot !== dotId) {
            const clickedDotBasket = dot.closest('.basket');
            if (clickedDotBasket) {
                // Move the selected dot to this basket instead of changing selection
                const basketId = clickedDotBasket.dataset.basketId;
                const selectedDot = document.querySelector(`[data-dot-id="${this.door.selectedDot}"]`);
                if (selectedDot) {
                    this.moveDotToBasket(selectedDot, basketId);
                    return; // Exit early, don't change selection
                }
            }
        }
        
        // Clear previous selection
        document.querySelectorAll('.dot').forEach(d => {
            d.style.border = '2px solid transparent';
            d.style.boxShadow = 'none';
            d.style.transform = 'scale(1)';
        });
        
        // Select this dot (whether in basket or main area) with enhanced focus state
        dot.style.border = '3px solid #0066FF';
        dot.style.boxShadow = '0 0 8px #0066FF';
        dot.style.transform = 'scale(1.1)';
        this.door.selectedDot = dotId;
    }

    /**
     * Select basket
     * Replicates selectBasket function exactly
     */
    selectBasket(basketId) {
        // If no dot is selected, auto-select the first available dot in the main area
        if (this.door.selectedDot === null) {
            const dotsInMainArea = document.querySelectorAll('#dotsContainer .dot');
            if (dotsInMainArea.length > 0) {
                const firstDot = dotsInMainArea[0];
                const dotId = firstDot.getAttribute('data-dot-id');
                this.selectDot(parseInt(dotId));
                console.log(`Auto-selected dot ${dotId} for basket click`);
            }
        }
        
        // Move selected dot to basket
        const dot = document.querySelector(`[data-dot-id="${this.door.selectedDot}"]`);
        if (dot) {
            this.moveDotToBasket(dot, basketId);
        }
    }

    /**
     * Select dots area
     * Replicates selectDotsArea function exactly
     */
    selectDotsArea() {
        if (this.door.selectedDot === null) return;
        
        // Move selected dot back to main area
        const dot = document.querySelector(`[data-dot-id="${this.door.selectedDot}"]`);
        if (dot) {
            this.moveDotToArea(dot);
        }
    }

    /**
     * Update answer buttons state based on dots placement
     */
    updateAnswerButtons() {
        const answerButtons = document.querySelectorAll('#answerButtons button');
        if (!answerButtons.length) return;
        
        // Check if all dots are in baskets
        const totalDotsInBaskets = this.door.divisionData.dotsInBaskets.reduce((sum, count) => sum + count, 0);
        const allDotsPlaced = totalDotsInBaskets === this.door.divisionData.dividend;
        
        answerButtons.forEach(button => {
            if (allDotsPlaced) {
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';
            } else {
                button.style.opacity = '0.5';
                button.style.pointerEvents = 'none';
            }
        });
    }

    /**
     * Speak division problem
     * Replicates speakDivisionProblem function exactly
     */
    speakDivisionProblem(dividend, divisor) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            // Create speech utterance
            const utterance = new SpeechSynthesisUtterance(`${dividend} divided by ${divisor}`);
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Speak the problem
            window.speechSynthesis.speak(utterance);
        }
    }

    /**
     * Check division answer - new multiple choice system
     */
    checkAnswer(isCorrect, buttonElement) {
        const data = this.door.divisionData;
        const result = document.getElementById('puzzleResult');
        
        // Check if all dots are in baskets first
        const totalDotsInBaskets = data.dotsInBaskets.reduce((sum, count) => sum + count, 0);
        const allDotsPlaced = totalDotsInBaskets === data.dividend;
        
        if (!allDotsPlaced) {
            // Don't allow answers until all dots are placed
            return;
        }
        
        // Check if all baskets have equal number of dots
        const dotsPerBasket = data.dotsInBaskets[0];
        const allEqual = data.dotsInBaskets.every(count => count === dotsPerBasket);
        
        // Initialize attempt counters if they don't exist
        if (!this.door.currentProblemAttempts) this.door.currentProblemAttempts = 0;
        this.door.currentProblemAttempts++;
        
        if (isCorrect && allEqual && dotsPerBasket === data.answer) {
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
            
            // Reset attempt counters
            this.door.currentProblemAttempts = 0;
            
            // Change door color to match open path
            this.door.color = '#B8F2B8';
            
            // Mark as complete and close after a delay
            data.isComplete = true;
            
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
            
            // Deduct points based on difficulty mode
            let pointsToDeduct = 0;
            
            if (game.difficultyMode === 'easy') {
                pointsToDeduct = -1; // Always lose 1 point in easy mode
            } else if (game.difficultyMode === 'medium') {
                // In medium mode: first wrong answer = -1, second wrong answer = -2
                pointsToDeduct = this.door.currentProblemAttempts === 1 ? -1 : -2;
            } else {
                pointsToDeduct = -2; // Hard mode: always lose 2 points
            }
            
            updateScore(pointsToDeduct);
            
            // Track failed attempts (for potential game over)
            if (!this.door.failedAttempts) this.door.failedAttempts = 0;
            this.door.failedAttempts++;
            
            // Clear result after delay
            setTimeout(() => {
                result.innerHTML = '';
                result.style.fontSize = '';
            }, 1500);
        }
    }

    /**
     * Render the complete division puzzle
     * Replicates the showPuzzle division section exactly
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
        
        // Clean up any existing keyboard handlers before starting division puzzle
        if (game.currentKeyHandler) {
            document.removeEventListener('keydown', game.currentKeyHandler);
            game.currentKeyHandler = null;
        }
        
        // Generate the puzzle
        const puzzle = this.generatePuzzle();
        
        // Set title and generate HTML
        title.innerHTML = puzzle.title;
        question.innerHTML = '';
        options.innerHTML = this.createDivisionHTML(puzzle);
        
        // Store global reference for onclick handlers
        window.divisionPuzzleInstance = this;
        
        // Setup drag and drop functionality
        this.setupDivisionDragDrop();
        
        // Auto-select the first dot for easier interaction
        setTimeout(() => {
            const firstDot = document.querySelector('#dotsContainer .dot');
            if (firstDot) {
                const dotId = firstDot.getAttribute('data-dot-id');
                this.selectDot(parseInt(dotId));
                console.log(`Auto-selected first dot ${dotId} on puzzle load`);
            }
        }, 100);
        
        console.log(`Division Puzzle rendered: ${puzzle.dividend} ÷ ${puzzle.divisor} = ${puzzle.answer}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DivisionPuzzle;
}