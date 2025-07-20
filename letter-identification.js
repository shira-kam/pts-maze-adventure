// PT's Maze Adventure - Letter Identification Puzzle
// Helps users learn letters (capital and lowercase) and their sounds

class LetterIdentificationPuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'letter_identification');
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Get or create level-specific letter tracking
        if (this.preventRepetition) {
            const trackingKey = `letter_problems_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = [];
            }
            this.usedLetters = game[trackingKey];
        }
        
        // Define letter data - uppercase letters with their sounds and lowercase equivalents
        this.letterData = {
            'A': { sound: 'ay', lowercase: 'a' },
            'B': { sound: 'buh', lowercase: 'b' },
            'C': { sound: 'cuh', lowercase: 'c' },
            'D': { sound: 'duh', lowercase: 'd' },
            'E': { sound: 'eh', lowercase: 'e' },
            'F': { sound: 'fuh', lowercase: 'f' },
            'G': { sound: 'guh', lowercase: 'g' },
            'H': { sound: 'huh', lowercase: 'h' },
            'I': { sound: 'ih', lowercase: 'i' },
            'J': { sound: 'juh', lowercase: 'j' },
            'K': { sound: 'kuh', lowercase: 'k' },
            'L': { sound: 'luh', lowercase: 'l' },
            'M': { sound: 'muh', lowercase: 'm' },
            'N': { sound: 'nuh', lowercase: 'n' },
            'O': { sound: 'oh', lowercase: 'o' },
            'P': { sound: 'puh', lowercase: 'p' },
            'Q': { sound: 'kwuh', lowercase: 'q' },
            'R': { sound: 'ruh', lowercase: 'r' },
            'S': { sound: 'suh', lowercase: 's' },
            'T': { sound: 'tuh', lowercase: 't' },
            'U': { sound: 'uh', lowercase: 'u' },
            'V': { sound: 'vuh', lowercase: 'v' },
            'W': { sound: 'wuh', lowercase: 'w' },
            'X': { sound: 'ks', lowercase: 'x' },
            'Y': { sound: 'yuh', lowercase: 'y' },
            'Z': { sound: 'zuh', lowercase: 'z' }
        };
        
        // Get letters to use for this level (fallback to all letters if not specified)
        this.availableLetters = config.letters || Object.keys(this.letterData);
        
        console.log(`Level ${level} letter identification puzzle initialized`);
        console.log(`Letter tracking enabled: ${this.preventRepetition}`);
        console.log(`Available letters: ${this.availableLetters.length}`);
    }

    /**
     * Generate a letter identification problem
     */
    generateProblem() {
        // Filter out already used letters if tracking is enabled
        let lettersToUse = this.availableLetters;
        if (this.preventRepetition) {
            lettersToUse = this.availableLetters.filter(letter => 
                !this.usedLetters.includes(letter)
            );
            
            // If all letters have been used, reset tracking
            if (lettersToUse.length === 0) {
                console.log('All letters used - resetting letter tracking for this level');
                this.usedLetters.length = 0; // Clear array
                lettersToUse = this.availableLetters;
            }
        }

        // Pick a random letter from available letters
        const selectedLetter = lettersToUse[Math.floor(Math.random() * lettersToUse.length)];
        
        // Add this letter to used letters list if tracking is enabled
        if (this.preventRepetition && !this.usedLetters.includes(selectedLetter)) {
            this.usedLetters.push(selectedLetter);
        }

        const letterInfo = this.letterData[selectedLetter];
        
        // Generate wrong lowercase options
        const wrongLowercase = this.generateWrongLowercaseOptions(letterInfo.lowercase);
        
        // Generate wrong sound options
        const wrongSounds = this.generateWrongSoundOptions(letterInfo.sound, selectedLetter);
        
        // Create shuffled choices
        const lowercaseChoices = [letterInfo.lowercase, ...wrongLowercase].sort(() => Math.random() - 0.5);
        const soundChoices = [letterInfo.sound, ...wrongSounds].sort(() => Math.random() - 0.5);
        
        console.log(`Generated letter problem: ${selectedLetter} → lowercase: ${letterInfo.lowercase}, sound: ${letterInfo.sound}`);
        
        return {
            letter: selectedLetter,
            correctLowercase: letterInfo.lowercase,
            correctSound: letterInfo.sound,
            lowercaseChoices: lowercaseChoices,
            soundChoices: soundChoices,
            correctLowercaseIndex: lowercaseChoices.indexOf(letterInfo.lowercase),
            correctSoundIndex: soundChoices.indexOf(letterInfo.sound),
            step: 1 // Start with step 1 (lowercase selection)
        };
    }

    /**
     * Generate wrong lowercase letter options
     */
    generateWrongLowercaseOptions(correctLowercase) {
        const allLowercase = Object.values(this.letterData).map(data => data.lowercase);
        const wrongOptions = allLowercase.filter(letter => letter !== correctLowercase);
        
        // Shuffle and pick 2 random wrong options
        const shuffled = wrongOptions.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2);
    }

    /**
     * Generate wrong sound options
     */
    generateWrongSoundOptions(correctSound, correctLetter) {
        const allSounds = Object.values(this.letterData).map(data => data.sound);
        const wrongSounds = allSounds.filter(sound => sound !== correctSound);
        
        // Shuffle and pick 2 random wrong sounds
        const shuffled = wrongSounds.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2);
    }

    /**
     * Speak the letter sound
     */
    speakSound(soundText) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(soundText);
            utterance.rate = 0.8; // Slightly slower for clarity
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
            console.log('Speaking letter sound:', soundText);
        } else {
            console.warn('Speech synthesis not supported in this browser');
            alert(`Sound: ${soundText}`);
        }
    }

    /**
     * Create the letter identification HTML for step 1 (lowercase selection)
     */
    createStep1HTML(problem) {
        return `
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 24px; margin-bottom: 20px; color: #2E8B57;">
                    Select the lowercase letter:
                </div>
                
                <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
                    ${problem.lowercaseChoices.map(letter => `
                        <button style="
                            font-size: 48px;
                            background: white;
                            color: black;
                            border: 3px solid #4CAF50;
                            min-width: 120px;
                            min-height: 100px;
                            border-radius: 10px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-family: 'Arial', sans-serif;
                            font-weight: bold;
                        " onmouseover="this.style.background='#4CAF50'; this.style.color='white';" 
                           onmouseout="this.style.background='white'; this.style.color='black';"
                           onclick="letterPuzzleInstance.checkStep1Answer('${letter}', this)">${letter}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Create the letter identification HTML for step 2 (sound selection)
     */
    createStep2HTML(problem) {
        return `
            <div style="text-align: center; margin: 20px 0;">
                <div style="font-size: 24px; margin-bottom: 20px; color: #2E8B57;">
                    Now select the sound this letter makes:
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
                    ${problem.soundChoices.map(sound => `
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <button onclick="letterPuzzleInstance.speakSound('${sound}')" style="
                                background: #2196F3;
                                color: white;
                                border: none;
                                padding: 10px 15px;
                                font-size: 16px;
                                border-radius: 20px;
                                cursor: pointer;
                                margin-bottom: 10px;
                            ">🔊 ${sound}</button>
                            <button style="
                                font-size: 24px;
                                background: white;
                                color: black;
                                border: 3px solid #4CAF50;
                                min-width: 100px;
                                min-height: 60px;
                                border-radius: 10px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                font-family: 'Arial', sans-serif;
                            " onmouseover="this.style.background='#4CAF50'; this.style.color='white';" 
                               onmouseout="this.style.background='white'; this.style.color='black';"
                               onclick="letterPuzzleInstance.checkStep2Answer('${sound}', this)">${sound}</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Check step 1 answer (lowercase letter selection)
     */
    checkStep1Answer(selectedLetter, buttonElement) {
        const result = document.getElementById('puzzleResult');
        const isCorrect = selectedLetter === this.currentProblem.correctLowercase;
        
        if (isCorrect) {
            // Correct lowercase letter selected!
            result.innerHTML = '👍';
            result.style.color = 'green';
            result.style.fontSize = '48px';
            
            // Mark step 1 as complete
            this.step1Complete = true;
            
            // Move to step 2 after a short delay
            setTimeout(() => {
                result.innerHTML = '';
                this.showStep2();
            }, 1000);
        } else {
            // Wrong lowercase letter
            result.innerHTML = '👎';
            result.style.color = 'red';
            result.style.fontSize = '48px';
            
            // Deduct points based on difficulty mode
            this.handleWrongAnswer();
            
            // Clear result after delay
            setTimeout(() => {
                result.innerHTML = '';
                result.style.fontSize = '';
            }, 1500);
        }
    }

    /**
     * Check step 2 answer (sound selection)
     */
    checkStep2Answer(selectedSound, buttonElement) {
        const result = document.getElementById('puzzleResult');
        const isCorrect = selectedSound === this.currentProblem.correctSound;
        
        if (isCorrect) {
            // Correct sound selected! Puzzle complete!
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
            
            setTimeout(() => {
                document.getElementById('puzzleModal').style.display = 'none';
                result.innerHTML = '';
                result.style.fontSize = '';
                game.puzzleActive = false;
            }, 1500);
        } else {
            // Wrong sound
            result.innerHTML = '👎';
            result.style.color = 'red';
            result.style.fontSize = '48px';
            
            // Deduct points based on difficulty mode
            this.handleWrongAnswer();
            
            // Clear result after delay
            setTimeout(() => {
                result.innerHTML = '';
                result.style.fontSize = '';
            }, 1500);
        }
    }

    /**
     * Handle wrong answer scoring
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
     * Show step 2 (sound selection)
     */
    showStep2() {
        const options = document.getElementById('puzzleOptions');
        options.innerHTML = this.createStep2HTML(this.currentProblem);
    }

    /**
     * Render the complete letter identification puzzle
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
        
        // Generate the problem
        this.currentProblem = this.generateProblem();
        this.step1Complete = false;
        
        // Set title to the uppercase letter
        title.innerHTML = `<div style="font-size: 72px; font-weight: bold; color: #2E8B57; margin-bottom: 15px;">${this.currentProblem.letter}</div>`;
        
        // Clear question area
        question.innerHTML = '';
        
        // Start with step 1 (lowercase selection)
        options.innerHTML = this.createStep1HTML(this.currentProblem);
        
        // Store global reference for onclick handlers
        window.letterPuzzleInstance = this;
        
        console.log(`Letter Identification Puzzle rendered: ${this.currentProblem.letter}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LetterIdentificationPuzzle;
}