// Maze of Marvels - Audio Reading Puzzle
// Teaches reading skills through audio-to-text and text-to-audio matching

class AudioReadingPuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level and specific door instance
        const level = game.selectedDifficulty;
        const config = configManager.getSpecificPuzzleConfig(level, 'audio_reading', this.door.obstacleCode);
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Get or create level-specific tracking
        if (this.preventRepetition) {
            const trackingKey = `audio_reading_problems_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = [];
            }
            this.usedWords = game[trackingKey];
        }
        
        // Puzzle configuration
        this.mode = config.mode || 'match_speech_to_text'; // 'match_speech_to_text' or 'match_text_to_speech'
        this.wordLists = config.wordLists || ['silent-e']; // Array of word list names
        
        // Word data storage
        this.wordData = {};
        this.allWords = [];
        
        // TTS configuration
        this.ttsConfig = {
            rate: 0.6,  // Slower for clarity
            pitch: 1.0,
            volume: 0.9
        };
        
        // Try to find the best available voice
        this.selectedVoice = this.findBestVoice();
        
        // Store initialization promise
        this.initPromise = this.loadWordLists().then(() => {
            console.log(`Level ${level} audio reading puzzle initialized with ${this.allWords.length} words`);
        }).catch(error => {
            console.error('Error during word list loading:', error);
            // Use fallback if loading fails
            this.loadFallbackWords();
        });
    }

    /**
     * Load word lists from files
     */
    async loadWordLists() {
        console.log('Loading word lists:', this.wordLists);
        
        for (const listName of this.wordLists) {
            try {
                const url = `word-lists/audio-reading/${listName}.txt`;
                console.log(`Attempting to fetch: ${url}`);
                const response = await fetch(url);
                console.log(`Response status for ${listName}:`, response.status);
                if (response.ok) {
                    const text = await response.text();
                    console.log(`Loaded text length for ${listName}:`, text.length);
                    this.parseWordList(text, listName);
                } else {
                    console.warn(`Could not load word list: ${listName}, status: ${response.status}`);
                }
            } catch (error) {
                console.error(`Error loading word list ${listName}:`, error);
            }
        }
        
        // If no words loaded, throw error to trigger fallback
        if (this.allWords.length === 0) {
            throw new Error('No word lists could be loaded');
        }
    }

    /**
     * Parse word list from text format: "word: distractor1, distractor2, ..."
     */
    parseWordList(text, listName) {
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            const [word, distractorsStr] = line.split(':');
            if (word && distractorsStr) {
                const distractors = distractorsStr.split(',').map(d => d.trim());
                this.wordData[word.trim()] = {
                    word: word.trim(),
                    distractors: distractors,
                    listName: listName
                };
                this.allWords.push(word.trim());
            }
        }
    }

    /**
     * Fallback words if file loading fails
     */
    loadFallbackWords() {
        const fallbackData = [
            { word: 'cape', distractors: ['cap', 'tape', 'cake'] },
            { word: 'bike', distractors: ['bite', 'like', 'kite'] },
            { word: 'cute', distractors: ['cut', 'cube', 'mute'] },
            { word: 'hope', distractors: ['hop', 'rope', 'cope'] },
            { word: 'made', distractors: ['mad', 'fade', 'gate'] }
        ];
        
        for (const item of fallbackData) {
            this.wordData[item.word] = item;
            this.allWords.push(item.word);
        }
    }

    /**
     * Find the best available TTS voice
     */
    findBestVoice() {
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Prefer English voices, especially higher quality ones
        const englishVoices = voices.filter(voice => 
            voice.lang.startsWith('en') && !voice.name.includes('Compact')
        );
        
        // Look for specific high-quality voices
        const preferredVoices = [
            'Alex', 'Samantha', 'Victoria', 'Karen', 'Moira',
            'Google US English', 'Microsoft Zira', 'Microsoft David'
        ];
        
        for (const preferred of preferredVoices) {
            const voice = englishVoices.find(v => v.name.includes(preferred));
            if (voice) {
                console.log('Selected voice:', voice.name);
                return voice;
            }
        }
        
        // Fallback to first English voice or default
        const fallback = englishVoices[0] || voices[0];
        console.log('Fallback voice:', fallback ? fallback.name : 'default');
        return fallback;
    }

    /**
     * Play word audio (recorded file with TTS fallback)
     */
    speakWord(word) {
        return new Promise((resolve) => {
            // Try to load recorded audio file first
            const audioPath = `Pronounciations/${word}.mp3`;
            const audio = new Audio(audioPath);
            
            console.log(`Attempting to play audio: ${audioPath}`);
            
            audio.onloadeddata = () => {
                console.log(`Successfully loaded audio for: ${word}`);
                audio.play().then(() => {
                    // Wait for audio to finish playing
                    audio.onended = () => {
                        console.log(`Finished playing audio for: ${word}`);
                        resolve();
                    };
                }).catch((error) => {
                    console.warn(`Failed to play audio for ${word}:`, error);
                    this.fallbackToTTS(word, resolve);
                });
            };
            
            audio.onerror = () => {
                console.log(`Audio file not found for ${word}, falling back to TTS`);
                this.fallbackToTTS(word, resolve);
            };
            
            // Set a timeout in case the audio doesn't load
            setTimeout(() => {
                if (audio.readyState === 0) {
                    console.log(`Audio loading timeout for ${word}, falling back to TTS`);
                    this.fallbackToTTS(word, resolve);
                }
            }, 2000);
        });
    }

    /**
     * Fallback text-to-speech function
     */
    fallbackToTTS(word, resolve) {
        console.log(`Using TTS fallback for: ${word}`);
        
        if ('speechSynthesis' in window) {
            // Add a small pause after the word to prevent syllable cutting
            const wordWithPause = word + '.';
            
            const utterance = new SpeechSynthesisUtterance(wordWithPause);
            utterance.rate = this.ttsConfig.rate;
            utterance.pitch = this.ttsConfig.pitch;
            utterance.volume = this.ttsConfig.volume;
            
            // Use selected voice if available
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            
            utterance.onend = () => {
                // Add additional delay to ensure complete pronunciation
                setTimeout(() => resolve(), 300);
            };
            utterance.onerror = () => resolve();
            
            speechSynthesis.speak(utterance);
        } else {
            console.warn('Text-to-speech not supported');
            resolve();
        }
    }

    /**
     * Generate a puzzle problem
     */
    generateProblem() {
        console.log('generateProblem called - allWords length:', this.allWords.length);
        console.log('wordData keys:', Object.keys(this.wordData));
        
        // Filter out already used words if tracking is enabled
        let availableWords = [...this.allWords];
        if (this.preventRepetition) {
            availableWords = this.allWords.filter(word => 
                !this.usedWords.includes(word)
            );
            
            // If all words used, reset tracking
            if (availableWords.length === 0) {
                console.log('All words used - resetting tracking for this level');
                this.usedWords.length = 0;
                availableWords = [...this.allWords];
            }
        }

        console.log('Available words:', availableWords);
        
        // Select random word
        const selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        console.log('Selected word:', selectedWord);
        const wordInfo = this.wordData[selectedWord];
        console.log('Word info:', wordInfo);
        
        // Add to used words if tracking enabled
        if (this.preventRepetition && !this.usedWords.includes(selectedWord)) {
            this.usedWords.push(selectedWord);
        }

        // Select 2 distractors from the word's distractor list
        const shuffledDistractors = [...wordInfo.distractors].sort(() => Math.random() - 0.5);
        const selectedDistractors = shuffledDistractors.slice(0, 2);
        
        // Create shuffled choices
        const allChoices = [selectedWord, ...selectedDistractors].sort(() => Math.random() - 0.5);
        
        return {
            targetWord: selectedWord,
            choices: allChoices,
            correctIndex: allChoices.indexOf(selectedWord),
            mode: this.mode
        };
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
                
                // Clean up audio puzzle title hiding
                const title = document.getElementById('puzzleTitle');
                if (title) {
                    title.classList.remove('audio-puzzle-hidden-title');
                }
                
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
     * Render the puzzle in the existing modal structure
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
        
        if (problem.mode === 'match_speech_to_text') {
            this.renderSpeechToText(problem, title, question, options);
        } else if (problem.mode === 'match_text_to_speech') {
            this.renderTextToSpeech(problem, title, question, options);
        }
        
        console.log(`Audio reading puzzle rendered: ${problem.mode}`);
    }

    /**
     * Render match speech to text mode
     */
    renderSpeechToText(problem, title, question, options) {
        // Hide title for this puzzle only
        title.textContent = '';
        title.classList.add('audio-puzzle-hidden-title');
        question.innerHTML = '';
        
        // Create speaker button
        const speakerButton = document.createElement('button');
        speakerButton.className = 'puzzle-button speaker-button';
        speakerButton.innerHTML = '🔊';
        speakerButton.style.fontSize = '48px';
        speakerButton.style.background = '#4CAF50';
        speakerButton.style.color = 'white';
        speakerButton.style.border = '3px solid #45a049';
        speakerButton.style.marginBottom = '20px';
        speakerButton.style.padding = '20px 30px';
        
        speakerButton.onclick = () => {
            this.speakWord(problem.targetWord);
        };
        
        question.appendChild(speakerButton);
        
        // Clear options and create word buttons
        options.innerHTML = '';
        
        problem.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'puzzle-button';
            button.textContent = choice;
            button.style.fontSize = '36px';
            button.style.background = 'white';
            button.style.color = 'black';
            button.style.border = '3px solid #4CAF50';
            button.style.margin = '5px';
            button.style.padding = '15px 25px';
            
            button.onclick = () => this.checkAnswer(
                choice === problem.targetWord, 
                button,
                choice
            );
            
            options.appendChild(button);
        });
        
        // Auto-play the word once
        setTimeout(() => {
            this.speakWord(problem.targetWord);
        }, 500);
    }

    /**
     * Render match text to speech mode
     */
    renderTextToSpeech(problem, title, question, options) {
        // Hide title for this puzzle only
        title.textContent = '';
        title.classList.add('audio-puzzle-hidden-title');
        
        // Store problem for submit function
        this.currentProblem = problem;
        this.selectedSound = null;
        
        // Show the target word
        question.innerHTML = '';
        const wordDisplay = document.createElement('div');
        wordDisplay.textContent = problem.targetWord;
        wordDisplay.style.fontSize = '48px';
        wordDisplay.style.fontWeight = 'bold';
        wordDisplay.style.marginBottom = '20px';
        question.appendChild(wordDisplay);
        
        // Clear options and create audio buttons (styled like letter identification)
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
                this.selectedSound = choice;
                
                // Enable submit button
                const submitBtn = document.getElementById('audioSubmitButton');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.background = '#4CAF50';
                    submitBtn.style.opacity = '1';
                }
                
                // Play the word
                this.speakWord(choice);
            };
            
            buttonContainer.appendChild(button);
        });
        
        options.appendChild(buttonContainer);
        
        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.id = 'audioSubmitButton';
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
            if (this.selectedSound) {
                this.checkAnswer(
                    this.selectedSound === problem.targetWord,
                    submitButton,
                    this.selectedSound
                );
            }
        };
        
        options.appendChild(submitButton);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioReadingPuzzle;
}