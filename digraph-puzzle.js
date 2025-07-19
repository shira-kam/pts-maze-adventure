// PT's Maze Adventure - Digraph Puzzle (Levels 3-7)
// Creates an EXACT replica of the original digraph puzzle mechanics

class DigraphPuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'digraph_sounds');
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Initialize level-specific digraph tracking
        if (this.preventRepetition) {
            const trackingKey = `digraph_problems_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = new Set();
            }
            this.usedDigraphs = game[trackingKey];
        } else {
            // Use global tracking for legacy compatibility
            if (!game.usedDigraphs) {
                game.usedDigraphs = [];
            }
            this.usedDigraphs = game.usedDigraphs;
        }
        
        console.log(`Level ${level} digraph puzzle initialized`);
    }

    /**
     * Validate that digraph data is fully loaded and properly structured
     */
    isDigraphDataValid() {
        // Check basic existence
        if (!game.digraphEmojis || !game.digraphSounds || !game.emojiNames) {
            console.log('Missing digraph data objects');
            return false;
        }
        
        // Check that digraph data has content
        const digraphKeys = Object.keys(game.digraphEmojis);
        if (digraphKeys.length === 0) {
            console.log('No digraphs loaded');
            return false;
        }
        
        // Verify critical digraphs for PH filtering are present
        const requiredDigraphs = ['PH', 'FL', 'FR'];
        const hasRequiredDigraphs = requiredDigraphs.every(digraph => 
            game.digraphEmojis[digraph] && Array.isArray(game.digraphEmojis[digraph])
        );
        
        if (!hasRequiredDigraphs) {
            console.log('Missing required digraphs for PH filtering:', 
                requiredDigraphs.filter(d => !game.digraphEmojis[d]));
            return false;
        }
        
        // Verify FL digraph contains flip flop emoji (🩴) - this is our test case
        if (!game.digraphEmojis['FL'].includes('🩴')) {
            console.log('FL digraph missing expected flip flop emoji - data may be incomplete');
            return false;
        }
        
        console.log('Digraph data validation passed');
        return true;
    }

    /**
     * Generate a digraph puzzle with tracking
     */
    generatePuzzle() {
        // Check if digraph data is loaded and valid
        if (!this.isDigraphDataValid()) {
            console.error('Digraph data not loaded or invalid!');
            return null;
        }
        
        // Get configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'digraph_sounds');
        
        // Get digraphs for this level (fallback to all digraphs if not specified)
        const levelDigraphs = config.digraphs || Object.keys(game.digraphEmojis);
        console.log(`Level ${level} using digraphs:`, levelDigraphs);
        
        // Get available digraphs (exclude already used ones)
        let availableDigraphs;
        
        if (this.preventRepetition && this.usedDigraphs instanceof Set) {
            // New tracking system with Set
            availableDigraphs = levelDigraphs.filter(digraph => !this.usedDigraphs.has(digraph));
        } else {
            // Legacy tracking system with Array
            availableDigraphs = levelDigraphs.filter(digraph => !this.usedDigraphs.includes(digraph));
        }
        
        // If all digraphs have been used, reset the used digraphs
        const digraphsToUse = availableDigraphs.length > 0 ? availableDigraphs : levelDigraphs;
        if (availableDigraphs.length === 0) {
            if (this.preventRepetition && this.usedDigraphs instanceof Set) {
                this.usedDigraphs.clear();
            } else {
                this.usedDigraphs.length = 0;
            }
            console.log('All digraphs used - resetting digraph tracking for this level');
        }
        
        // Pick a random digraph from available digraphs
        const selectedDigraph = digraphsToUse[Math.floor(Math.random() * digraphsToUse.length)];
        
        // Mark this digraph as used
        if (this.preventRepetition && this.usedDigraphs instanceof Set) {
            this.usedDigraphs.add(selectedDigraph);
        } else {
            this.usedDigraphs.push(selectedDigraph);
        }
        
        // Get emojis for this digraph
        const digraphEmojis = game.digraphEmojis[selectedDigraph];
        if (!digraphEmojis || digraphEmojis.length === 0) {
            console.error(`No emojis found for digraph: ${selectedDigraph}`);
            return null;
        }
        
        // Pick a random correct emoji
        const correctEmoji = digraphEmojis[Math.floor(Math.random() * digraphEmojis.length)];
        
        // Generate wrong answers
        const wrongEmojis = this.generateWrongAnswers(selectedDigraph, correctEmoji);
        
        // Get the sound to speak
        const soundToSpeak = game.digraphSounds[selectedDigraph] || selectedDigraph.toLowerCase();
        
        // Create all answer options and shuffle
        const allAnswers = [correctEmoji, ...wrongEmojis].sort(() => Math.random() - 0.5);
        
        console.log(`Digraph Puzzle: ${selectedDigraph} (sound: ${soundToSpeak}), correct: ${correctEmoji}`);
        
        return {
            digraph: selectedDigraph,
            soundToSpeak,
            correctEmoji,
            wrongEmojis,
            allAnswers,
            title: `<div style="font-size: 48px; font-weight: bold; color: #2E8B57; margin-bottom: 15px;">${selectedDigraph}</div>`
        };
    }

    /**
     * Generate wrong answers for digraph puzzle
     */
    generateWrongAnswers(selectedDigraph, correctEmoji) {
        // Double-check data validity before filtering
        if (!this.isDigraphDataValid()) {
            console.error('Cannot generate wrong answers - digraph data invalid');
            return []; // Return empty array as fallback
        }
        
        const wrongEmojis = [];
        
        // Get all available emojis from all digraphs
        const allAvailableEmojis = [];
        for (const digraph in game.digraphEmojis) {
            if (digraph !== selectedDigraph) {
                allAvailableEmojis.push(...game.digraphEmojis[digraph]);
            }
        }
        
        // Avoid confusing SK/SC pairs and PH vs F-starting sounds
        const confusingPairs = ['SK', 'SC'];
        const isConfusingPair = (d1, d2) => {
            return confusingPairs.includes(d1) && confusingPairs.includes(d2);
        };
        
        // Special case: If correct digraph is PH, avoid emojis from F-starting digraphs
        const isPHvsF = (correctDigraph, wrongDigraph) => {
            return correctDigraph === 'PH' && ['FL', 'FR'].includes(wrongDigraph);
        };
        
        // Filter out emojis from digraphs that sound too similar to avoid confusion
        let filteredCount = 0;
        const nonConfusingEmojis = allAvailableEmojis.filter(emoji => {
            if (emoji === correctEmoji) return false;
            
            // Check if this emoji comes from a confusing digraph
            for (const digraph in game.digraphEmojis) {
                if (game.digraphEmojis[digraph].includes(emoji)) {
                    // Avoid SK/SC pairs
                    if (isConfusingPair(selectedDigraph, digraph)) {
                        console.log(`Filtered ${emoji} from ${digraph} (SK/SC confusion with ${selectedDigraph})`);
                        filteredCount++;
                        return false;
                    }
                    // Avoid PH vs F-starting digraphs
                    if (isPHvsF(selectedDigraph, digraph)) {
                        console.log(`Filtered ${emoji} from ${digraph} (PH vs F-sound confusion with ${selectedDigraph})`);
                        filteredCount++;
                        return false;
                    }
                }
            }
            return true;
        });
        
        if (selectedDigraph === 'PH' && filteredCount > 0) {
            console.log(`PH filtering active: removed ${filteredCount} confusing emojis`);
        }
        
        // Pick 2 random wrong emojis
        const emojiPool = nonConfusingEmojis.length >= 2 ? nonConfusingEmojis : allAvailableEmojis;
        const shuffledEmojis = [...emojiPool].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(2, shuffledEmojis.length); i++) {
            if (shuffledEmojis[i] !== correctEmoji) {
                wrongEmojis.push(shuffledEmojis[i]);
            }
        }
        
        // Ensure we have exactly 2 wrong answers
        while (wrongEmojis.length < 2 && allAvailableEmojis.length > 0) {
            const randomEmoji = allAvailableEmojis[Math.floor(Math.random() * allAvailableEmojis.length)];
            if (randomEmoji !== correctEmoji && !wrongEmojis.includes(randomEmoji)) {
                wrongEmojis.push(randomEmoji);
            }
        }
        
        return wrongEmojis.slice(0, 2);
    }

    /**
     * Create the digraph HTML interface
     */
    createDigraphHTML(puzzle) {
        const { soundToSpeak, allAnswers, correctEmoji } = puzzle;
        
        return `
            <div style="text-align: center; margin: 20px 0;">
                <button onclick="digraphPuzzleInstance.speakDigraph('${soundToSpeak}')" style="
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 15px 20px;
                    font-size: 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-family: inherit;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px auto;
                ">🔊</button>
                
                <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
                    ${allAnswers.map(emoji => `
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
                            font-family: inherit;
                        " onmouseover="this.style.background='#4CAF50'; this.style.color='white';" 
                           onmouseout="this.style.background='white'; this.style.color='black';"
                           onclick="digraphPuzzleInstance.checkAnswer(${emoji === correctEmoji}, this, '${emoji}')">${emoji}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Speak digraph sound
     * Replicates speakDigraph function exactly
     */
    speakDigraph(soundText) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(soundText);
            utterance.rate = 0.8; // Slightly slower for clarity
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
            console.log('Speaking digraph sound:', soundText);
        } else {
            console.warn('Speech synthesis not supported in this browser');
            alert(`Sound: ${soundText}`);
        }
    }

    /**
     * Speak emoji word name
     * Replicates speakEmojiWord function exactly
     */
    speakEmojiWord(emoji) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            // Get the word name for this emoji
            const wordName = game.emojiNames[emoji] || emoji;
            
            const utterance = new SpeechSynthesisUtterance(wordName);
            utterance.rate = 0.8; // Slightly slower for clarity
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            window.speechSynthesis.speak(utterance);
            console.log('Speaking emoji word:', wordName);
        } else {
            console.warn('Speech synthesis not supported in this browser');
            alert(`Word: ${wordName}`);
        }
    }

    /**
     * Check digraph answer
     */
    checkAnswer(isCorrect, buttonElement, selectedEmoji) {
        const result = document.getElementById('puzzleResult');
        
        // Initialize attempt counters if they don't exist
        if (!this.door.currentProblemAttempts) this.door.currentProblemAttempts = 0;
        this.door.currentProblemAttempts++;
        
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
            
            // Reset attempt counters
            this.door.currentProblemAttempts = 0;
            
            // Change door color to match open path
            this.door.color = '#B8F2B8';
            
            // Speak the emoji word name after a short delay
            setTimeout(() => {
                this.speakEmojiWord(selectedEmoji);
            }, 300);
            
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
            
            // Speak the wrong word that was selected
            setTimeout(() => {
                this.speakEmojiWord(selectedEmoji);
            }, 300);
            
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
     * Render the complete digraph puzzle
     * Replicates the showPuzzle digraph section exactly
     */
    render() {
        // Get existing modal elements
        const modal = document.getElementById('puzzleModal');
        const title = document.getElementById('puzzleTitle');
        const question = document.getElementById('puzzleQuestion');
        const options = document.getElementById('puzzleOptions');
        
        // Generate the puzzle FIRST - before showing modal
        const puzzle = this.generatePuzzle();
        if (!puzzle) {
            console.error('Failed to generate digraph puzzle - data may not be loaded yet');
            // Don't show modal or set puzzle active if generation failed
            return;
        }
        
        // Only show modal and set puzzle active state if puzzle generation succeeded
        game.puzzleActive = true;
        modal.style.display = 'block';
        
        // Set title and generate HTML
        title.innerHTML = puzzle.title;
        question.innerHTML = '';
        options.innerHTML = this.createDigraphHTML(puzzle);
        
        // Store global reference for onclick handlers
        window.digraphPuzzleInstance = this;
        
        console.log(`Digraph Puzzle rendered: ${puzzle.digraph} (${puzzle.soundToSpeak})`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DigraphPuzzle;
}