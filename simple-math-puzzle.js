// PT's Maze Adventure - Simple Math Puzzle (Levels 1-3)
// Creates an EXACT replica of the original simple arithmetic puzzle mechanics

class SimpleMathPuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'simple_arithmetic');
        
        // Use configurable limits or fall back to original values
        this.limits = config.limits || {
            maxA: 11,
            maxB: 11, 
            maxResult: 12
        };
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Get or create level-specific problem tracking
        if (this.preventRepetition) {
            const trackingKey = `math_problems_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = new Set();
            }
            this.usedProblems = game[trackingKey];
        }
        
        console.log(`Level ${level} math limits:`, this.limits);
        console.log(`Problem tracking enabled: ${this.preventRepetition}`);
    }

    /**
     * Generate a simple arithmetic problem (addition or subtraction)
     * Now uses configurable limits and tracking to prevent repetition
     */
    generateProblem() {
        let problem;
        let attempts = 0;
        const maxAttempts = 50;
        
        do {
            problem = this.createArithmeticProblem();
            attempts++;
            
            // If tracking is disabled, return immediately
            if (!this.preventRepetition) {
                break;
            }
            
            // Create problem key for tracking
            const problemKey = `${problem.num1}${problem.operation}${problem.num2}`;
            
            // If problem hasn't been used, mark it as used and return
            if (!this.usedProblems.has(problemKey)) {
                this.usedProblems.add(problemKey);
                console.log(`New problem: ${problemKey}, total used: ${this.usedProblems.size}`);
                break;
            }
            
        } while (attempts < maxAttempts);
        
        // Fallback: if all problems exhausted, reset tracking and use current problem
        if (attempts >= maxAttempts && this.preventRepetition) {
            console.log('All problems used, resetting tracking for this level');
            this.usedProblems.clear();
            const problemKey = `${problem.num1}${problem.operation}${problem.num2}`;
            this.usedProblems.add(problemKey);
        }
        
        return problem;
    }
    
    /**
     * Create a single arithmetic problem without tracking
     * Separated from generateProblem for cleaner code
     */
    createArithmeticProblem() {
        const isAddition = Math.random() < 0.5;
        let num1, num2, answer;
        
        if (isAddition) {
            // For addition A+B=C, respect maxA, maxB, and maxResult limits
            num1 = Math.floor(Math.random() * this.limits.maxA) + 1; // 1 to maxA
            
            // Ensure num2 doesn't make result exceed maxResult
            const maxNum2 = Math.min(this.limits.maxB, this.limits.maxResult - num1);
            num2 = Math.floor(Math.random() * maxNum2) + 1; // 1 to maxNum2
            
            answer = num1 + num2;
            return {
                question: `${num1} + ${num2} = ?`,
                answer: answer,
                operation: '+',
                num1: num1,
                num2: num2
            };
        } else {
            // For subtraction A-B=C, ensure positive result within limits
            num1 = Math.floor(Math.random() * this.limits.maxA) + 1; // 1 to maxA
            num2 = Math.floor(Math.random() * Math.min(num1, this.limits.maxB)) + 1; // 1 to min(num1, maxB)
            
            answer = num1 - num2;
            return {
                question: `${num1} - ${num2} = ?`,
                answer: answer,
                operation: '-',
                num1: num1,
                num2: num2
            };
        }
    }

    /**
     * Generate wrong answers close to the correct answer
     * Uses |R-W| < 4 to prevent guessing/estimation and force calculation
     */
    generateWrongAnswers(correctAnswer) {
        const wrongAnswers = [];
        const maxDistance = 4; // Maximum distance from correct answer
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loops
        
        while (wrongAnswers.length < 2 && attempts < maxAttempts) {
            // Generate offset between -maxDistance and +maxDistance (excluding 0)
            let offset;
            do {
                offset = Math.floor(Math.random() * (maxDistance * 2 + 1)) - maxDistance;
            } while (offset === 0); // Ensure offset is not 0
            
            const wrong = correctAnswer + offset;
            
            // Ensure answer is valid (within range) and unique
            if (wrong >= 1 && wrong <= this.limits.maxResult && 
                wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
                wrongAnswers.push(wrong);
            }
            
            attempts++;
        }
        
        // Fallback: if we can't generate enough close answers, use broader range
        while (wrongAnswers.length < 2) {
            const wrong = Math.floor(Math.random() * this.limits.maxResult) + 1;
            if (wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
                wrongAnswers.push(wrong);
            }
        }
        
        return wrongAnswers;
    }

    /**
     * Render the puzzle in the existing modal structure
     * Must replicate the exact DOM structure and behavior from original
     */
    render() {
        // Get existing modal elements (don't create new ones)
        const modal = document.getElementById('puzzleModal');
        const title = document.getElementById('puzzleTitle');
        const question = document.getElementById('puzzleQuestion');
        const options = document.getElementById('puzzleOptions');
        
        // Show modal and set puzzle active state
        game.puzzleActive = true;
        modal.style.display = 'block';
        
        // Generate the problem
        const problem = this.generateProblem();
        
        // Set title to the actual problem (not generic "Math Problem")
        title.textContent = problem.question;
        
        // Clear question area (not used in simple math)
        question.textContent = '';
        
        // Generate answer choices
        const wrongAnswers = this.generateWrongAnswers(problem.answer);
        const allAnswers = [problem.answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
        
        // Clear options and create buttons
        options.innerHTML = '';
        allAnswers.forEach(ans => {
            const button = document.createElement('button');
            button.className = 'puzzle-button';
            button.textContent = ans;
            // Use the existing checkAnswer function - this is critical!
            button.onclick = () => checkAnswer(ans === problem.answer, 'math', this.door, button);
            options.appendChild(button);
        });
        
        console.log(`Simple Math Puzzle: ${problem.question} (Answer: ${problem.answer})`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleMathPuzzle;
}