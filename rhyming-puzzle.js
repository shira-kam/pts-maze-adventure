// Maze of Marvels - Rhyming Puzzle
// Teaches phonetic awareness through rhyme identification

class RhymingPuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getSpecificPuzzleConfig(level, 'rhyming', this.door.obstacleCode);
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Get or create level-specific tracking
        if (this.preventRepetition) {
            const trackingKey = `rhyming_problems_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = [];
            }
            this.usedRhymeGroups = game[trackingKey];
        }
        
        // Initialize rhyming data
        this.rhymeData = {};
        this.rhymeGroups = [];
        
        // Store initialization promise
        this.initPromise = this.loadRhymingWords().then(() => {
            console.log(`Level ${level} rhyming puzzle initialized with ${this.rhymeGroups.length} rhyme groups`);
        }).catch(error => {
            console.error('Error during rhyming word list loading:', error);
            // Use fallback if loading fails
            this.loadFallbackWords();
        });
    }

    /**
     * Load rhyming words from file
     */
    async loadRhymingWords() {
        try {
            const url = 'word-lists/rhyming-puzzle.txt';
            console.log(`Attempting to fetch: ${url}`);
            const response = await fetch(url);
            console.log(`Response status for rhyming words:`, response.status);
            if (response.ok) {
                const text = await response.text();
                console.log(`Loaded text length for rhyming words:`, text.length);
                this.parseRhymingList(text);
            } else {
                console.warn(`Could not load rhyming word list, status: ${response.status}`);
                throw new Error('Failed to load rhyming words');
            }
        } catch (error) {
            console.error(`Error loading rhyming word list:`, error);
            throw error;
        }
        
        // If no words loaded, throw error to trigger fallback
        if (this.rhymeGroups.length === 0) {
            throw new Error('No rhyming words could be loaded');
        }
    }

    /**
     * Parse rhyming list from text format: "rhyme1, rhyme2, ...; nonrhyme1, nonrhyme2, ..."
     */
    parseRhymingList(text) {
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            const [rhymesStr, nonRhymesStr] = line.split(';');
            if (rhymesStr && nonRhymesStr) {
                const rhymes = rhymesStr.split(',').map(w => w.trim()).filter(w => w);
                const nonRhymes = nonRhymesStr.split(',').map(w => w.trim()).filter(w => w);
                
                if (rhymes.length >= 2 && nonRhymes.length >= 2) {
                    this.rhymeGroups.push({
                        rhymes: rhymes,
                        nonRhymes: nonRhymes
                    });
                }
            }
        }
        
        console.log(`Parsed ${this.rhymeGroups.length} rhyme groups`);
    }

    /**
     * Load fallback words if file loading fails
     */
    loadFallbackWords() {
        this.rhymeGroups = [
            { rhymes: ['cat', 'bat', 'hat'], nonRhymes: ['dog', 'tree', 'blue'] },
            { rhymes: ['big', 'dig', 'pig'], nonRhymes: ['sun', 'coat', 'clay'] },
            { rhymes: ['run', 'sun', 'fun'], nonRhymes: ['deep', 'boat', 'lime'] }
        ];
        console.log('Loaded fallback rhyming words');
    }

    /**
     * Generate a rhyming puzzle problem
     */
    generateProblem() {
        // Filter out already used rhyme groups if tracking is enabled
        let availableGroups = [...this.rhymeGroups];
        if (this.preventRepetition) {
            availableGroups = this.rhymeGroups.filter((group, index) => 
                !this.usedRhymeGroups.includes(index)
            );
            
            // If all groups used, reset tracking
            if (availableGroups.length === 0) {
                console.log('All rhyme groups used - resetting tracking for this level');
                this.usedRhymeGroups.length = 0;
                availableGroups = [...this.rhymeGroups];
            }
        }

        // Select random rhyme group
        const selectedGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];
        console.log('Selected rhyme group:', selectedGroup);
        
        // Add to used groups if tracking enabled
        if (this.preventRepetition) {
            const groupIndex = this.rhymeGroups.indexOf(selectedGroup);
            if (!this.usedRhymeGroups.includes(groupIndex)) {
                this.usedRhymeGroups.push(groupIndex);
            }
        }

        // Select target word (random rhyme from the group)
        const targetWord = selectedGroup.rhymes[Math.floor(Math.random() * selectedGroup.rhymes.length)];
        
        // Select one correct rhyme (different from target)
        const availableRhymes = selectedGroup.rhymes.filter(w => w !== targetWord);
        const correctRhyme = availableRhymes[Math.floor(Math.random() * availableRhymes.length)];
        
        // Select 2 non-rhymes
        const shuffledNonRhymes = [...selectedGroup.nonRhymes].sort(() => Math.random() - 0.5);
        const selectedNonRhymes = shuffledNonRhymes.slice(0, 2);
        
        // Create shuffled choices
        const allChoices = [correctRhyme, ...selectedNonRhymes].sort(() => Math.random() - 0.5);
        
        return {
            targetWord: targetWord,
            correctRhyme: correctRhyme,
            choices: allChoices,
            correctIndex: allChoices.indexOf(correctRhyme)
        };
    }

    /**
     * Play audio for a word using the pronunciation files
     */
    async playWordAudio(word) {
        try {
            const audio = new Audio(`Pronounciations/${word}.mp3`);
            await audio.play();
        } catch (error) {
            console.warn(`Could not play audio for word: ${word}`, error);
        }
    }

    /**
     * Handle wrong answer scoring (standardized across all puzzles)
     */
    handleWrongAnswer() {
        // Initialize attempt counters if they don't exist
        if (!this.door.currentProblemAttempts) this.door.currentProblemAttempts = 0;
        this.door.currentProblemAttempts++;
        
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
    }

    /**
     * Check answer (standardized completion logic)
     */
    checkAnswer(isCorrect, buttonElement, selectedAnswer) {
        const result = document.getElementById('puzzleResult');
        
        if (isCorrect) {
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
            }, 1500);
        } else {
            // Wrong answer
            result.innerHTML = '👎';
            result.style.color = 'red';
            result.style.fontSize = '48px';
            
            // Handle wrong answer scoring
            this.handleWrongAnswer();
            
            // Clear result after delay
            setTimeout(() => {
                result.innerHTML = '';
                result.style.fontSize = '';
            }, 1500);
        }
    }

    /**
     * Render the rhyming puzzle in the existing modal structure
     */
    async render() {
        // Wait for initialization to complete
        await this.initPromise;
        
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
        
        // Store problem for submit function
        this.currentProblem = problem;
        this.selectedChoice = null;
        
        // Hide title (no title for rhyming puzzle)
        title.textContent = '';
        title.classList.add('audio-puzzle-hidden-title');
        
        // Create green speaker button to replay target word
        question.innerHTML = '';
        const speakerButton = document.createElement('button');
        speakerButton.className = 'puzzle-button speaker-button';
        speakerButton.innerHTML = '🔊';
        speakerButton.style.fontSize = '48px';
        speakerButton.style.background = '#4CAF50';
        speakerButton.style.color = 'white';
        speakerButton.style.border = '3px solid #45a049';
        speakerButton.style.marginBottom = '20px';
        speakerButton.style.padding = '20px 30px';
        speakerButton.style.borderRadius = '10px';
        speakerButton.style.cursor = 'pointer';
        
        speakerButton.onclick = () => {
            this.playWordAudio(problem.targetWord);
        };
        
        question.appendChild(speakerButton);
        
        // Clear options and create choice buttons (numbered with speakers)
        options.innerHTML = '';
        
        // Create container for speaker buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '20px';
        buttonContainer.style.justifyContent = 'center';
        buttonContainer.style.marginBottom = '30px';
        
        problem.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'sound-button';
            button.innerHTML = `${index + 1}🔊`;
            button.style.fontSize = '32px';
            button.style.background = 'white';
            button.style.color = 'black';
            button.style.border = '3px solid #2196F3';
            button.style.minWidth = '120px';
            button.style.minHeight = '80px';
            button.style.borderRadius = '10px';
            button.style.cursor = 'pointer';
            button.style.transition = 'all 0.3s ease';
            button.style.fontFamily = "'Arial', sans-serif";
            button.style.fontWeight = 'bold';
            
            button.onclick = () => {
                // Reset all buttons to unselected state
                buttonContainer.querySelectorAll('.sound-button').forEach(btn => {
                    btn.style.background = 'white';
                    btn.style.color = 'black';
                });
                
                // Select this button
                button.style.background = '#2196F3';
                button.style.color = 'white';
                
                // Store selection
                this.selectedChoice = choice;
                
                // Enable submit button
                const submitBtn = document.getElementById('rhymingSubmitButton');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.background = '#4CAF50';
                    submitBtn.style.opacity = '1';
                }
                
                // Play the word
                this.playWordAudio(choice);
            };
            
            buttonContainer.appendChild(button);
        });
        
        options.appendChild(buttonContainer);
        
        // Create submit button (identical to audio reading puzzle)
        const submitButton = document.createElement('button');
        submitButton.id = 'rhymingSubmitButton';
        submitButton.textContent = 'Submit';
        submitButton.disabled = true;
        submitButton.style.fontSize = '24px';
        submitButton.style.background = '#CCCCCC';
        submitButton.style.opacity = '0.5';
        submitButton.style.color = 'white';
        submitButton.style.border = 'none';
        submitButton.style.padding = '15px 30px';
        submitButton.style.borderRadius = '8px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.marginTop = '20px';
        
        submitButton.onclick = () => {
            if (this.selectedChoice) {
                this.checkAnswer(
                    this.selectedChoice === problem.correctRhyme,
                    submitButton,
                    this.selectedChoice
                );
            }
        };
        
        options.appendChild(submitButton);
        
        // Auto-play the target word once
        setTimeout(() => {
            this.playWordAudio(problem.targetWord);
        }, 500);
        
        console.log(`Rhyming puzzle rendered - target: ${problem.targetWord}, correct: ${problem.correctRhyme}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RhymingPuzzle;
}