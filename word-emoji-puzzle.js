// PT's Maze Adventure - Word-Emoji Matching Puzzle (Levels 1-2)
// Creates an EXACT replica of the original word-emoji matching puzzle mechanics

class WordEmojiPuzzle {
    // Static cache to store word data by wordListLevel to avoid reloading
    static wordDataCache = {};
    
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, 'word_emoji_matching');
        
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
        
        // Get word list level from config
        this.wordListLevel = config.wordListLevel || 'beginner';
        
        // Initialize data sources (will be loaded on-demand)
        this.wordEmojiPairs = [];
        this.distractors = {};
        this.dataLoaded = false;
        
        console.log(`Level ${level} word-emoji puzzle initialized`);
        console.log(`Word tracking enabled: ${this.preventRepetition}`);
        console.log(`Word list level: ${this.wordListLevel}`);
    }

    /**
     * Load word list and distractors on-demand with caching
     */
    async loadWordData() {
        if (this.dataLoaded) {
            return; // Already loaded for this instance
        }
        
        // Check if data is already cached for this word list level
        const cacheKey = this.wordListLevel;
        if (WordEmojiPuzzle.wordDataCache[cacheKey]) {
            console.log(`Using cached word list: ${this.wordListLevel}`);
            const cachedData = WordEmojiPuzzle.wordDataCache[cacheKey];
            this.wordEmojiPairs = cachedData.wordEmojiPairs;
            this.distractors = cachedData.distractors;
            this.dataLoaded = true;
            return;
        }
        
        try {
            console.log(`Loading word list: ${this.wordListLevel}`);
            
            // Load word list and distractors in parallel
            const [wordList, distractors] = await Promise.all([
                this.loadWordListFromFile(),
                this.loadDistractorsFromFile()
            ]);
            
            // Cache the loaded data for future use
            WordEmojiPuzzle.wordDataCache[cacheKey] = {
                wordEmojiPairs: wordList,
                distractors: distractors
            };
            
            this.wordEmojiPairs = wordList;
            this.distractors = distractors;
            this.dataLoaded = true;
            
            console.log(`Loaded ${this.wordEmojiPairs.length} word-emoji pairs`);
            console.log(`Loaded distractors for ${Object.keys(this.distractors).length} letters`);
            
        } catch (error) {
            console.error('Error loading word data:', error);
            // Fall back to hardcoded data
            const fallbackData = {
                wordEmojiPairs: this.getFallbackWordList(),
                distractors: this.getFallbackDistractors()
            };
            
            // Cache the fallback data too
            WordEmojiPuzzle.wordDataCache[cacheKey] = fallbackData;
            
            this.wordEmojiPairs = fallbackData.wordEmojiPairs;
            this.distractors = fallbackData.distractors;
            this.dataLoaded = true;
        }
    }

    /**
     * Clear the static word data cache (useful for testing or memory management)
     */
    static clearCache() {
        WordEmojiPuzzle.wordDataCache = {};
        console.log('WordEmojiPuzzle cache cleared');
    }

    /**
     * Get cache info for debugging
     */
    static getCacheInfo() {
        const cacheKeys = Object.keys(WordEmojiPuzzle.wordDataCache);
        console.log(`WordEmojiPuzzle cache contains: ${cacheKeys.join(', ')}`);
        return cacheKeys;
    }

    /**
     * Load word list from central word-lists directory
     */
    async loadWordListFromFile() {
        const wordListPath = `word-lists/${this.wordListLevel}.txt`;
        console.log(`Attempting to load ${wordListPath}...`);
        
        const response = await fetch(wordListPath + '?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`Failed to load ${wordListPath}: ${response.status}`);
        }
        
        const wordListText = await response.text();
        return this.parseWordList(wordListText);
    }

    /**
     * Load distractors from central word-lists directory
     */
    async loadDistractorsFromFile() {
        const distractorPath = 'word-lists/distractors.txt';
        console.log(`Attempting to load ${distractorPath}...`);
        
        const response = await fetch(distractorPath + '?v=' + Date.now());
        if (!response.ok) {
            throw new Error(`Failed to load ${distractorPath}: ${response.status}`);
        }
        
        const distractorText = await response.text();
        return this.parseDistractors(distractorText);
    }

    /**
     * Parse word list text into word-emoji pairs
     */
    parseWordList(wordListText) {
        const lines = wordListText.trim().split('\n');
        const wordEmojiPairs = [];
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.endsWith(',')) {
                // Remove trailing comma and split by space
                const parts = trimmedLine.slice(0, -1).split(' ');
                if (parts.length >= 2) {
                    const word = parts[0];
                    const emoji = parts.slice(1).join(' '); // Join in case emoji has spaces
                    wordEmojiPairs.push({ word, emoji });
                }
            }
        });
        
        return wordEmojiPairs;
    }

    /**
     * Parse distractor text into letter-emoji mappings
     */
    parseDistractors(distractorText) {
        const lines = distractorText.trim().split('\n');
        const distractors = {};
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.includes(':')) {
                const [letter, emojis] = trimmedLine.split(':');
                const letterKey = letter.trim().toUpperCase();
                const emojiList = emojis.trim().split(/\s+/).filter(emoji => emoji.length > 0);
                distractors[letterKey] = emojiList;
            }
        });
        
        return distractors;
    }

    /**
     * Get fallback word list if loading fails
     */
    getFallbackWordList() {
        return [
            { word: 'CAT', emoji: '🐈' },
            { word: 'DOG', emoji: '🐕' },
            { word: 'CAR', emoji: '🚗' },
            { word: 'SUN', emoji: '☀️' },
            { word: 'BAG', emoji: '💼' },
            { word: 'HAT', emoji: '🧢' }
        ];
    }

    /**
     * Get fallback distractors if loading fails
     */
    getFallbackDistractors() {
        return {
            'C': ['🎂', '☕️', '🥥'],
            'D': ['🦆', '🎲', '💃'],
            'S': ['🐍', '🧂', '😴'],
            'B': ['🦫', '🧠', '🏀'],
            'H': ['💙', '🤝', '🦛']
        };
    }

    /**
     * Generate a word-emoji matching problem with same-letter distractors
     * Replicates the exact logic from the original Level 1-2 reading puzzle
     */
    generateProblem() {
        if (this.wordEmojiPairs.length === 0) {
            console.error('No word-emoji pairs loaded! This should not happen after loadWordData()');
            // This should not happen since loadWordData() provides fallbacks
            throw new Error('No word data available - loadWordData() should be called first');
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
        
        // Create all answer choices (1 correct + 2 wrong = 3 total)
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
            if (wrongEmojis.length < 2) {
                wrongEmojis.push(pair.emoji);
            }
        });
        
        // Strategy 2: If not enough same-letter words, use distractors
        if (wrongEmojis.length < 2 && this.distractors[firstLetter]) {
            const distractorEmojis = [...this.distractors[firstLetter]];
            while (wrongEmojis.length < 2 && distractorEmojis.length > 0) {
                const randomIndex = Math.floor(Math.random() * distractorEmojis.length);
                const distractor = distractorEmojis.splice(randomIndex, 1)[0];
                if (!wrongEmojis.includes(distractor) && distractor !== correctEmoji) {
                    wrongEmojis.push(distractor);
                }
            }
        }
        
        // Strategy 3: Fallback - use any random emojis if still not enough
        if (wrongEmojis.length < 2) {
            const allEmojis = this.wordEmojiPairs.map(pair => pair.emoji);
            while (wrongEmojis.length < 2) {
                const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
                if (!wrongEmojis.includes(randomEmoji) && randomEmoji !== correctEmoji) {
                    wrongEmojis.push(randomEmoji);
                }
            }
        }
        
        // Return exactly 2 wrong answers
        return wrongEmojis.slice(0, 2);
    }

    /**
     * Render the puzzle in the existing modal structure
     * Must replicate the exact DOM structure and behavior from original
     */
    async render() {
        // Load word data if not already loaded
        await this.loadWordData();
        
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
            button.style.fontSize = '40px'; // Make emojis bigger like original
            button.style.background = 'white'; // White background like original
            button.style.color = 'black'; // Black text like original
            button.style.border = '3px solid #4CAF50'; // Green border like original
            
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