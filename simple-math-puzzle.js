// PT's Maze Adventure - Simple Math Puzzle (Levels 1-3)
// Creates an EXACT replica of the original simple arithmetic puzzle mechanics

class SimpleMathPuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'math');
        
        // Use configurable limits or fall back to original values
        this.limits = config.limits || {
            maxA: 11,
            maxB: 11, 
            maxResult: 12
        };
        
        console.log(`Level ${level} math limits:`, this.limits);
    }

    /**
     * Generate a simple arithmetic problem (addition or subtraction)
     * Now uses configurable limits for A, B, and C in A+B=C
     */
    generateProblem() {
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
                operation: 'addition'
            };
        } else {
            // For subtraction A-B=C, ensure positive result within limits
            num1 = Math.floor(Math.random() * this.limits.maxA) + 1; // 1 to maxA
            num2 = Math.floor(Math.random() * Math.min(num1, this.limits.maxB)) + 1; // 1 to min(num1, maxB)
            
            answer = num1 - num2;
            return {
                question: `${num1} - ${num2} = ?`,
                answer: answer,
                operation: 'subtraction'
            };
        }
    }

    /**
     * Generate wrong answers within the result range
     * Now uses configurable maxResult limit
     */
    generateWrongAnswers(correctAnswer) {
        const wrongAnswers = [];
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