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
        
        // Define letter data - uppercase letters with their sounds, lowercase equivalents, and vowel/consonant classification
        this.letterData = {
            'A': { sound: 'ay', lowercase: 'a', type: 'vowel' },
            'B': { sound: 'buh', lowercase: 'b', type: 'consonant' },
            'C': { sound: 'cuh', lowercase: 'c', type: 'consonant' },
            'D': { sound: 'duh', lowercase: 'd', type: 'consonant' },
            'E': { sound: 'eh', lowercase: 'e', type: 'vowel' },
            'F': { sound: 'fuh', lowercase: 'f', type: 'consonant' },
            'G': { sound: 'guh', lowercase: 'g', type: 'consonant' },
            'H': { sound: 'huh', lowercase: 'h', type: 'consonant' },
            'I': { sound: 'ih', lowercase: 'i', type: 'vowel' },
            'J': { sound: 'juh', lowercase: 'j', type: 'consonant' },
            'K': { sound: 'kuh', lowercase: 'k', type: 'consonant' },
            'L': { sound: 'luh', lowercase: 'l', type: 'consonant' },
            'M': { sound: 'muh', lowercase: 'm', type: 'consonant' },
            'N': { sound: 'nuh', lowercase: 'n', type: 'consonant' },
            'O': { sound: 'oh', lowercase: 'o', type: 'vowel' },
            'P': { sound: 'puh', lowercase: 'p', type: 'consonant' },
            'Q': { sound: 'kwuh', lowercase: 'q', type: 'consonant' },
            'R': { sound: 'ruh', lowercase: 'r', type: 'consonant' },
            'S': { sound: 'suh', lowercase: 's', type: 'consonant' },
            'T': { sound: 'tuh', lowercase: 't', type: 'consonant' },
            'U': { sound: 'uh', lowercase: 'u', type: 'vowel' },
            'V': { sound: 'vuh', lowercase: 'v', type: 'consonant' },
            'W': { sound: 'wuh', lowercase: 'w', type: 'consonant' },
            'X': { sound: 'ks', lowercase: 'x', type: 'consonant' },
            'Y': { sound: 'yuh', lowercase: 'y', type: 'consonant' },
            'Z': { sound: 'zuh', lowercase: 'z', type: 'consonant' }
        };
        
        // Get letters to use for this level - start with all 26 letters by default
        const allLetters = Object.keys(this.letterData);
        
        if (config.excludeLetters && Array.isArray(config.excludeLetters)) {
            // Remove excluded letters
            this.availableLetters = allLetters.filter(letter => 
                !config.excludeLetters.includes(letter)
            );
            console.log(`Excluding letters: ${config.excludeLetters.join(', ')}`);
        } else if (config.letters && Array.isArray(config.letters)) {
            // Legacy support: if specific letters are configured, use those
            this.availableLetters = config.letters;
            console.log(`Using legacy letter list: ${config.letters.join(', ')}`);
        } else {
            // Default: use all 26 letters
            this.availableLetters = allLetters;
            console.log('Using all 26 letters by default');
        }
        
        // Initialize selection state
        this.selectedLowercase = null;
        this.selectedSound = null;
        this.selectedType = null;
        
        // Audio cache for better performance
        this.audioCache = {};
        this.preloadAudio();
        
        console.log(`Level ${level} letter identification puzzle initialized`);
        console.log(`Letter tracking enabled: ${this.preventRepetition}`);
        console.log(`Available letters: ${this.availableLetters.length}`);
    }

    /**
     * Preload audio files for better performance
     * Load all 26 letters since wrong answers can come from full alphabet
     */
    preloadAudio() {
        // Always preload all 26 letters, not just the level's available letters
        const allLetters = Object.keys(this.letterData);
        
        allLetters.forEach(letter => {
            const audio = new Audio(`Phonics/${letter.toLowerCase()}.mp3`);
            audio.preload = 'auto';
            
            // Add error handling to detect loading issues
            audio.addEventListener('canplaythrough', () => {
                console.log(`Audio loaded successfully: ${letter}.mp3`);
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`Failed to load audio: ${letter}.mp3`, e);
            });
            
            this.audioCache[letter] = audio;
        });
        
        console.log('Preloading audio for all 26 letters');
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
            
            // If all letters have been used, reset tracking only after covering all 26 letters
            if (lettersToUse.length === 0) {
                if (this.usedLetters.length >= 26) {
                    console.log('All 26 letters covered - resetting letter tracking for this level');
                    this.usedLetters.length = 0; // Clear array
                    lettersToUse = this.availableLetters;
                } else {
                    // If we haven't covered all 26 letters, expand to full alphabet
                    console.log('Expanding to full alphabet to ensure complete coverage');
                    const allLetters = Object.keys(this.letterData);
                    lettersToUse = allLetters.filter(letter => !this.usedLetters.includes(letter));
                    if (lettersToUse.length === 0) {
                        this.usedLetters.length = 0;
                        lettersToUse = allLetters;
                    }
                }
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
            correctType: letterInfo.type,
            lowercaseChoices: lowercaseChoices,
            soundChoices: soundChoices,
            correctLowercaseIndex: lowercaseChoices.indexOf(letterInfo.lowercase),
            correctSoundIndex: soundChoices.indexOf(letterInfo.sound)
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
     * Generate wrong sound options with similar sound filtering
     */
    generateWrongSoundOptions(correctSound, correctLetter) {
        // Define letters with similar sounds that should be avoided
        const similarSounds = {
            'G': ['J'],
            'C': ['S', 'K', 'Q'], 
            'K': ['C', 'Q'],
            'I': ['Y'],
            'Y': ['I'],
            'Q': ['C', 'K'],
        };
        
        // Get letters to avoid for this correct letter
        const avoidLetters = similarSounds[correctLetter] || [];
        
        // Get all available sounds, excluding the correct one and similar-sounding ones
        const allSounds = [];
        Object.keys(this.letterData).forEach(letter => {
            const sound = this.letterData[letter].sound;
            if (sound !== correctSound && !avoidLetters.includes(letter)) {
                allSounds.push(sound);
            }
        });
        
        // Shuffle and pick 2 random wrong sounds
        const shuffled = allSounds.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2);
    }

    /**
     * Play letter sound from audio file
     */
    speakSound(soundText) {
        console.log('speakSound called with:', soundText);
        
        // Find the letter that corresponds to this sound
        let letterForSound = null;
        Object.keys(this.letterData).forEach(letter => {
            if (this.letterData[letter].sound === soundText) {
                letterForSound = letter;
            }
        });
        
        console.log('Letter for sound:', letterForSound);
        console.log('Audio cache has letter:', letterForSound ? !!this.audioCache[letterForSound] : 'N/A');
        
        if (letterForSound && this.audioCache[letterForSound]) {
            const audio = this.audioCache[letterForSound];
            console.log('Audio readyState:', audio.readyState);
            console.log('Audio networkState:', audio.networkState);
            
            // Stop any currently playing audio
            Object.values(this.audioCache).forEach(a => {
                a.pause();
                a.currentTime = 0;
            });
            
            // Play the requested sound
            audio.currentTime = 0;
            audio.play().then(() => {
                console.log('Audio playback started successfully for:', letterForSound);
            }).catch(error => {
                console.error('Audio playback failed for:', letterForSound, error);
                // Fallback to speech synthesis
                this.fallbackToSpeech(soundText);
            });
        } else {
            console.log('Using fallback speech synthesis - letterForSound:', letterForSound, 'audioCache entry exists:', !!this.audioCache[letterForSound]);
            // Fallback to speech synthesis if audio file not found
            this.fallbackToSpeech(soundText);
        }
    }

    /**
     * Fallback to speech synthesis if audio fails
     */
    fallbackToSpeech(soundText) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(soundText);
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
            console.log('Fallback speech synthesis for:', soundText);
        } else {
            console.warn('Audio and speech synthesis not available');
        }
    }

    /**
     * Handle lowercase letter selection (radio button behavior)
     */
    selectLowercase(selectedLetter, buttonElement) {
        // Clear previous selection
        document.querySelectorAll('.lowercase-button').forEach(btn => {
            btn.style.background = 'white';
            btn.style.color = 'black';
        });
        
        // Select the clicked button
        buttonElement.style.background = '#4CAF50';
        buttonElement.style.color = 'white';
        
        // Store selection
        this.selectedLowercase = selectedLetter;
        
        // Update submit button state
        this.updateSubmitButton();
        
        console.log(`Selected lowercase: ${selectedLetter}`);
    }

    /**
     * Handle sound selection (radio button behavior)
     */
    selectSound(soundIndex, buttonElement) {
        // Play the sound
        const sound = this.currentProblem.soundChoices[soundIndex];
        this.speakSound(sound);
        
        // Clear previous selection
        document.querySelectorAll('.sound-button').forEach(btn => {
            btn.style.background = 'white';
            btn.style.color = 'black';
        });
        
        // Select the clicked button
        buttonElement.style.background = '#4CAF50';
        buttonElement.style.color = 'white';
        
        // Store selection
        this.selectedSound = sound;
        
        // Update submit button state
        this.updateSubmitButton();
        
        console.log(`Selected sound: ${sound}`);
    }

    /**
     * Handle type selection (radio button behavior)
     */
    selectType(selectedType, buttonElement) {
        // Play the type name using speech synthesis
        this.speakType(selectedType);
        
        // Clear previous selection - return to unselected state
        document.querySelectorAll('.type-button').forEach(btn => {
            if (btn.classList.contains('vowel-button')) {
                btn.style.background = 'white';
                btn.style.color = '#FF5252';
            } else {
                btn.style.background = 'white';
                btn.style.color = '#2196F3';
            }
        });
        
        // Select the clicked button
        buttonElement.style.background = '#4CAF50';
        buttonElement.style.color = 'white';
        
        // Store selection
        this.selectedType = selectedType;
        
        // Update submit button state
        this.updateSubmitButton();
        
        console.log(`Selected type: ${selectedType}`);
    }

    /**
     * Speak vowel or consonant using speech synthesis
     */
    speakType(type) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(type);
            utterance.rate = 0.8;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
            console.log('Speaking type:', type);
        } else {
            console.warn('Speech synthesis not available');
        }
    }

    /**
     * Update submit button enabled/disabled state
     */
    updateSubmitButton() {
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            const allSelected = this.selectedLowercase && this.selectedSound && this.selectedType;
            if (allSelected) {
                // Enable submit button
                submitButton.style.background = '#FF9800';
                submitButton.style.opacity = '1';
                submitButton.style.cursor = 'pointer';
                submitButton.disabled = false;
            } else {
                // Disable submit button
                submitButton.style.background = '#CCCCCC';
                submitButton.style.opacity = '0.5';
                submitButton.style.cursor = 'not-allowed';
                submitButton.disabled = true;
            }
        }
    }

    /**
     * Submit answers and check results
     */
    submitAnswers() {
        if (!this.selectedLowercase || !this.selectedSound || !this.selectedType) {
            // Show message if not all selections made
            const result = document.getElementById('puzzleResult');
            result.innerHTML = '❓';
            result.style.color = 'orange';
            result.style.fontSize = '48px';
            
            setTimeout(() => {
                result.innerHTML = '';
                result.style.fontSize = '';
            }, 2000);
            return;
        }

        const lowercaseCorrect = this.selectedLowercase === this.currentProblem.correctLowercase;
        const soundCorrect = this.selectedSound === this.currentProblem.correctSound;
        const typeCorrect = this.selectedType === this.currentProblem.correctType;
        
        // Show feedback on lowercase buttons and disable wrong ones
        document.querySelectorAll('.lowercase-button').forEach(btn => {
            const letter = btn.textContent;
            if (letter === this.selectedLowercase) {
                if (lowercaseCorrect) {
                    // Show thumbs up for correct answer
                    btn.innerHTML = `${letter} 👍`;
                    btn.style.background = '#4CAF50';
                } else {
                    // For wrong answer: disable, make gray, remove thumbs down
                    btn.innerHTML = letter; // Just the letter, no thumbs down
                    btn.style.background = '#CCCCCC'; // Gray instead of red
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                    btn.onclick = null;
                }
            }
        });
        
        // Show feedback on sound buttons and disable wrong ones
        document.querySelectorAll('.sound-button').forEach((btn, index) => {
            const sound = this.currentProblem.soundChoices[index];
            if (sound === this.selectedSound) {
                if (soundCorrect) {
                    // Show thumbs up for correct answer
                    btn.innerHTML = `${index + 1}🔊 👍`;
                    btn.style.background = '#4CAF50';
                } else {
                    // For wrong answer: disable, make gray, remove thumbs down
                    btn.innerHTML = `${index + 1}🔊`; // Just the number and speaker, no thumbs down
                    btn.style.background = '#CCCCCC'; // Gray instead of red
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                    btn.onclick = null;
                }
            }
        });

        // Show feedback on type buttons and disable wrong ones
        document.querySelectorAll('.type-button').forEach(btn => {
            const type = btn.dataset.type;
            if (type === this.selectedType) {
                if (typeCorrect) {
                    // Show thumbs up for correct answer
                    const currentText = btn.innerHTML;
                    btn.innerHTML = `${currentText} 👍`;
                    btn.style.background = '#4CAF50';
                } else {
                    // For wrong answer: disable, make gray
                    btn.style.background = '#CCCCCC';
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                    btn.onclick = null;
                }
            }
        });

        // Check if all three are correct
        if (lowercaseCorrect && soundCorrect && typeCorrect) {
            // Both correct! Puzzle complete!
            const result = document.getElementById('puzzleResult');
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
            }, 2000);
        } else {
            // One or more wrong
            const result = document.getElementById('puzzleResult');
            result.innerHTML = '👎';
            result.style.color = 'red';
            result.style.fontSize = '48px';
            
            // Handle wrong answer scoring
            this.handleWrongAnswer();
            
            // Clear feedback and reset after delay
            setTimeout(() => {
                result.innerHTML = '';
                result.style.fontSize = '';
                this.resetSelections();
            }, 3000);
        }
    }

    /**
     * Reset selections and button states
     */
    resetSelections() {
        this.selectedLowercase = null;
        this.selectedSound = null;
        this.selectedType = null;
        
        // Reset lowercase buttons (except disabled ones)
        document.querySelectorAll('.lowercase-button').forEach((btn, index) => {
            if (!btn.disabled) {
                const letter = this.currentProblem.lowercaseChoices[index];
                btn.innerHTML = letter;
                btn.style.background = 'white';
                btn.style.color = 'black';
            }
        });
        
        // Reset sound buttons (except disabled ones)
        document.querySelectorAll('.sound-button').forEach((btn, index) => {
            if (!btn.disabled) {
                btn.innerHTML = `${index + 1}🔊`;
                btn.style.background = 'white';
                btn.style.color = 'black';
            }
        });
        
        // Reset type buttons (except disabled ones)
        document.querySelectorAll('.type-button').forEach(btn => {
            if (!btn.disabled) {
                const type = btn.dataset.type;
                const letter = type === 'vowel' ? 'V' : 'C';
                btn.innerHTML = `${letter} 🔊`;
                if (btn.classList.contains('vowel-button')) {
                    btn.style.background = 'white';
                    btn.style.color = '#FF5252';
                } else {
                    btn.style.background = 'white';
                    btn.style.color = '#2196F3';
                }
            }
        });
        
        // Update submit button state
        this.updateSubmitButton();
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
     * Create the complete puzzle HTML
     */
    createPuzzleHTML(problem) {
        return `
            <div style="text-align: center; margin: 20px 0;">
                <!-- Lowercase letter options -->
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; gap: 20px; justify-content: center;">
                        ${problem.lowercaseChoices.map(letter => `
                            <button class="lowercase-button" style="
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
                            " onclick="letterPuzzleInstance.selectLowercase('${letter}', this)">${letter}</button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Sound options -->
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; gap: 20px; justify-content: center;">
                        ${problem.soundChoices.map((sound, index) => `
                            <button class="sound-button" style="
                                font-size: 32px;
                                background: white;
                                color: black;
                                border: 3px solid #4CAF50;
                                min-width: 120px;
                                min-height: 80px;
                                border-radius: 10px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                font-family: 'Arial', sans-serif;
                                font-weight: bold;
                            " onclick="letterPuzzleInstance.selectSound(${index}, this)">${index + 1}🔊</button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Vowel/Consonant classification -->
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; gap: 20px; justify-content: center;">
                        <button class="type-button vowel-button" data-type="vowel" style="
                            font-size: 28px;
                            background: white;
                            color: #FF5252;
                            border: 3px solid #FF5252;
                            min-width: 120px;
                            min-height: 80px;
                            border-radius: 50%;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-family: 'Arial', sans-serif;
                            font-weight: bold;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        " onclick="letterPuzzleInstance.selectType('vowel', this)">V 🔊</button>
                        
                        <button class="type-button consonant-button" data-type="consonant" style="
                            font-size: 28px;
                            background: white;
                            color: #2196F3;
                            border: 3px solid #2196F3;
                            min-width: 120px;
                            min-height: 80px;
                            border-radius: 10px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            font-family: 'Arial', sans-serif;
                            font-weight: bold;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        " onclick="letterPuzzleInstance.selectType('consonant', this)">C 🔊</button>
                    </div>
                </div>
                
                <!-- Submit button -->
                <div style="margin-top: 30px;">
                    <button class="submit-button" onclick="letterPuzzleInstance.submitAnswers()" disabled style="
                        font-size: 24px;
                        background: #CCCCCC;
                        opacity: 0.5;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        cursor: not-allowed;
                        font-weight: bold;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    ">Submit</button>
                </div>
            </div>
        `;
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
        
        // Reset selections
        this.selectedLowercase = null;
        this.selectedSound = null;
        this.selectedType = null;
        
        // Set title to the uppercase letter
        title.innerHTML = `<div style="font-size: 72px; font-weight: bold; color: #2E8B57; margin-bottom: 15px;">${this.currentProblem.letter}</div>`;
        
        // Clear question area
        question.innerHTML = '';
        
        // Render the complete puzzle
        options.innerHTML = this.createPuzzleHTML(this.currentProblem);
        
        // Store global reference for onclick handlers
        window.letterPuzzleInstance = this;
        
        console.log(`Letter Identification Puzzle rendered: ${this.currentProblem.letter}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LetterIdentificationPuzzle;
}