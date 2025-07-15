// PT's Maze Adventure - Word-Emoji Matching Puzzle (Levels 1-2)
// Creates an EXACT replica of the original word-emoji matching puzzle mechanics

class WordEmojiPuzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'reading');
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Get or create level-specific word tracking
        if (this.preventRepetition) {
            const trackingKey = `reading_words_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = [];
            }
            this.usedWords = game[trackingKey];
        }
        
        // Data sources
        this.wordEmojiPairs = game.wordEmojiPairs || [];
        this.distractors = game.distractors || {};
        
        console.log(`Level ${level} word-emoji puzzle initialized`);
        console.log(`Word tracking enabled: ${this.preventRepetition}`);
        console.log(`Available words: ${this.wordEmojiPairs.length}`);
    }

    /**
     * Generate a word-emoji matching problem with same-letter distractors
     * Replicates the exact logic from the original Level 1-2 reading puzzle
     */
    generateProblem() {
        if (this.wordEmojiPairs.length === 0) {
            console.error('No word-emoji pairs loaded!');
            return this.generateFallbackProblem();
        }

        // Filter out already used words if tracking is enabled
        let availableWords = this.wordEmojiPairs;
        if (this.preventRepetition) {
            availableWords = this.wordEmojiPairs.filter(pair => 
                !this.usedWords.includes(pair.word)
            );
            
            // If all words have been used, reset tracking
            if (availableWords.length === 0) {
                console.log('All words used - resetting word tracking for this level');
                this.usedWords.length = 0; // Clear array
                availableWords = this.wordEmojiPairs;
            }
        }

        // Pick a random word-emoji pair from available words
        const correctPair = availableWords[Math.floor(Math.random() * availableWords.length)];
        
        // Add this word to used words list if tracking is enabled
        if (this.preventRepetition && !this.usedWords.includes(correctPair.word)) {
            this.usedWords.push(correctPair.word);
        }

        // Generate wrong answers using same-letter strategy
        const wrongEmojis = this.generateSameLetterWrongAnswers(correctPair.word, correctPair.emoji);
        
        // Create all answer choices (1 correct + 3 wrong)
        const allChoices = [correctPair.emoji, ...wrongEmojis];
        
        // Shuffle the choices
        const shuffledChoices = allChoices.sort(() => Math.random() - 0.5);
        
        console.log(`Generated problem: ${correctPair.word} → ${correctPair.emoji}`);
        console.log(`Wrong answers: ${wrongEmojis.join(', ')}`);
        
        return {
            word: correctPair.word,
            correctEmoji: correctPair.emoji,
            choices: shuffledChoices,
            correctIndex: shuffledChoices.indexOf(correctPair.emoji)
        };
    }

    /**
     * Generate wrong answers that start with the same letter as the correct word
     * Uses the same strategy as the original: word list first, then distractors, then fallback
     */
    generateSameLetterWrongAnswers(correctWord, correctEmoji) {
        const wrongEmojis = [];
        const firstLetter = correctWord.charAt(0).toUpperCase();
        
        // Strategy 1: Find other words from word list starting with same letter
        const sameLetterWords = this.wordEmojiPairs.filter(pair => 
            pair.word.charAt(0).toUpperCase() === firstLetter && 
            pair.emoji !== correctEmoji
        );
        
        // Add emojis from same-letter words
        sameLetterWords.forEach(pair => {
            if (wrongEmojis.length < 3) {
                wrongEmojis.push(pair.emoji);
            }
        });
        
        // Strategy 2: If not enough same-letter words, use distractors
        if (wrongEmojis.length < 3 && this.distractors[firstLetter]) {
            const distractorEmojis = [...this.distractors[firstLetter]];
            while (wrongEmojis.length < 3 && distractorEmojis.length > 0) {
                const randomIndex = Math.floor(Math.random() * distractorEmojis.length);
                const distractor = distractorEmojis.splice(randomIndex, 1)[0];
                if (!wrongEmojis.includes(distractor) && distractor !== correctEmoji) {
                    wrongEmojis.push(distractor);
                }
            }
        }
        
        // Strategy 3: Fallback - use any random emojis if still not enough
        if (wrongEmojis.length < 3) {
            const allEmojis = this.wordEmojiPairs.map(pair => pair.emoji);
            while (wrongEmojis.length < 3) {
                const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
                if (!wrongEmojis.includes(randomEmoji) && randomEmoji !== correctEmoji) {
                    wrongEmojis.push(randomEmoji);
                }
            }
        }
        
        // Return exactly 3 wrong answers
        return wrongEmojis.slice(0, 3);
    }

    /**
     * Generate a fallback problem if word list is not loaded
     */
    generateFallbackProblem() {
        const fallbackPairs = [
            { word: 'CAT', emoji: '🐈' },
            { word: 'DOG', emoji: '🐕' },
            { word: 'CAR', emoji: '🚗' },
            { word: 'SUN', emoji: '☀️' }
        ];
        
        const correctPair = fallbackPairs[Math.floor(Math.random() * fallbackPairs.length)];
        const wrongEmojis = fallbackPairs
            .filter(pair => pair.emoji !== correctPair.emoji)
            .map(pair => pair.emoji)
            .slice(0, 3);
        
        const allChoices = [correctPair.emoji, ...wrongEmojis].sort(() => Math.random() - 0.5);
        
        return {
            word: correctPair.word,
            correctEmoji: correctPair.emoji,
            choices: allChoices,
            correctIndex: allChoices.indexOf(correctPair.emoji)
        };
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
        
        // Set title to the word (not generic "Word Matching")
        title.textContent = problem.word;
        
        // Clear question area (not used in word-emoji puzzle)
        question.textContent = '';
        
        // Clear options and create emoji buttons
        options.innerHTML = '';
        
        // Create emoji choice buttons
        problem.choices.forEach(emoji => {
            const button = document.createElement('button');
            button.className = 'puzzle-button';
            button.textContent = emoji;
            button.style.fontSize = '24px'; // Make emojis bigger
            button.style.padding = '15px 20px'; // More padding for emoji buttons
            
            // Use the existing checkAnswer function - this is critical!
            button.onclick = () => checkAnswer(
                emoji === problem.correctEmoji, 
                'reading', 
                this.door, 
                button
            );
            
            options.appendChild(button);
        });
        
        console.log(`Word-emoji puzzle rendered: ${problem.word} with ${problem.choices.length} choices`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordEmojiPuzzle;
}