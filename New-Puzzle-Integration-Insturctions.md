
## How to Create and Integrate a New Puzzle

This section provides step-by-step instructions for adding new puzzle types to the game. Follow this process to efficiently integrate new educational puzzles without extensive file searching or token usage.

### Overview

Adding a new puzzle requires changes to **4 files** in a specific order:

1. **Create puzzle module** (`{puzzle-name}.js`)
2. **Update configuration** (`game-config.json`)
3. **Update index.html** (3 integration points)
4. **Config manager** (usually no changes needed - fully dynamic)

### Step 1: Create the Puzzle Module

Create a new JavaScript file: `{puzzle-name}-puzzle.js`

**Template Structure** (based on `word-emoji-puzzle.js`):

```javascript
// PT's Maze Adventure - {Puzzle Name} Puzzle
// Description of what this puzzle teaches

class {PuzzleName}Puzzle {
    constructor(door) {
        this.door = door;
        
        // Get puzzle configuration for this level
        const level = game.selectedDifficulty;
        const config = configManager.getPuzzleConfig(level, '{puzzle_config_key}');
        
        // Initialize tracking system if enabled
        this.tracking = config.tracking || {};
        this.preventRepetition = this.tracking.preventRepetition || false;
        
        // Get or create level-specific tracking
        if (this.preventRepetition) {
            const trackingKey = `{puzzle_type}_problems_level_${level}`;
            if (!game[trackingKey]) {
                game[trackingKey] = [];
            }
            this.usedItems = game[trackingKey];
        }
        
        // Initialize puzzle-specific data
        // (word lists, math ranges, etc.)
        
        console.log(`Level ${level} {puzzle name} puzzle initialized`);
    }

    /**
     * Generate a puzzle problem
     */
    generateProblem() {
        // Filter out already used items if tracking is enabled
        let availableItems = this.getAllItems();
        if (this.preventRepetition) {
            availableItems = this.getAllItems().filter(item => 
                !this.usedItems.includes(item)
            );
            
            // If all items used, reset tracking
            if (availableItems.length === 0) {
                console.log('All items used - resetting tracking for this level');
                this.usedItems.length = 0;
                availableItems = this.getAllItems();
            }
        }

        // Generate problem logic here
        const selectedItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        
        // Add to used items if tracking enabled
        if (this.preventRepetition && !this.usedItems.includes(selectedItem)) {
            this.usedItems.push(selectedItem);
        }

        // Generate wrong answers
        const wrongAnswers = this.generateWrongAnswers(selectedItem);
        
        // Create shuffled choices
        const allChoices = [/* correct answer */, ...wrongAnswers].sort(() => Math.random() - 0.5);
        
        return {
            // Problem data structure
            correctAnswer: /* correct answer */,
            choices: allChoices,
            correctIndex: allChoices.indexOf(/* correct answer */)
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
     * Render the puzzle in the existing modal structure
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
        
        // Set title
        title.textContent = 'Puzzle Title';
        
        // Set question (if needed)
        question.textContent = 'Question text';
        
        // Clear options and create buttons
        options.innerHTML = '';
        
        // Create choice buttons
        problem.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'puzzle-button';
            button.textContent = choice;
            button.style.fontSize = '40px';
            button.style.background = 'white';
            button.style.color = 'black';
            button.style.border = '3px solid #4CAF50';
            
            // Use standardized answer checking
            button.onclick = () => this.checkAnswer(
                choice === problem.correctAnswer, 
                button,
                choice
            );
            
            options.appendChild(button);
        });
        
        console.log(`{Puzzle name} puzzle rendered`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {PuzzleName}Puzzle;
}
```

### Step 2: Update Configuration (`game-config.json`)

Add your puzzle configuration to the `puzzles` section:

**Example** (based on `letter_identification`):

```json
{
  "puzzles": {
    // ... existing puzzles ...
    "your_puzzle_type": {
      "doorType": "xx",
      "texture": "xx.png",
      "your_config_options": {
        "option1": "value1",
        "option2": ["array", "values"]
      },
      "tracking": {
        "preventRepetition": true,
        "maxAttempts": 3,
        "trackingScope": "level"
      }
    }
  }
}
```

**Add level configuration** in the `levels` section:

```json
{
  "levels": {
    "11": {
      "playable": true,
      "puzzles": {
        "your_puzzle_type": {
          "your_config_options": {
            "option1": "level_specific_value"
          }
        }
      },
      "assets": {
        "celebration": {
          "frames": 40,
          "frameWidth": 200,
          "frameHeight": 200
        },
        "hearts": true,
        "bonus": true
      }
    }
  }
}
```

**Update character bonus sprites** (if level has bonus feature):

```json
{
  "characters": {
    "PT": {
      "bonus": {
        "9": "level-9/PT-Bonus-Sprite.svg",
        "10": "level-10/PT-Bonus-Sprite.svg",
        "11": "level-11/PT-Bonus-Sprite.svg"
      }
    },
    "Enderman": {
      "bonus": {
        "9": "level-9/Enderman-Bonus-Sprite.svg",
        "10": "level-10/Enderman-Bonus-Sprite.svg",
        "11": "level-11/Enderman-Bonus-Sprite.svg"
      }
    }
  }
}
```

### Step 3: Update `index.html` (3 Integration Points)

#### 3A: Add Script Include

**Location**: Around line 936-943

**Find this section**:
```html
<!-- Configuration System -->
<script src="config-manager.js"></script>
<script src="simple-math-puzzle.js"></script>
<script src="word-emoji-puzzle.js"></script>
<script src="number-line-puzzle.js"></script>
<script src="division-puzzle.js"></script>
<script src="digraph-puzzle.js"></script>
<script src="multiplication-groups-puzzle.js"></script>
```

**Add your script**:
```html
<script src="your-puzzle-name.js"></script>
```

#### 3B: Add Grid Cell Parsing

**Location**: Around line 1036-1045 (in switch statement)

**Find the `case 'mg':` section**:
```javascript
case 'mg':
    doors.push({ x, y, type: 'multiplication_groups', open: false, color: '#FF6B6B' });
    // Add path under door for walkability
    paths.push({ x, y, width: 40, height: 40 });
    break;
```

**Add your case after it**:
```javascript
case 'xx':
    doors.push({ x, y, type: 'your_puzzle_type', open: false, color: '#4ECDC4' });
    // Add path under door for walkability
    paths.push({ x, y, width: 40, height: 40 });
    break;
```

#### 3C: Add Texture Assignment

**Location**: Around line 2866-2871 (in switch statement)

**Find the `case 'mg':` section**:
```javascript
case 'mg':
    doorTexture = textures.mg;
    break;
```

**Add your case after it**:
```javascript
case 'xx':
    doorTexture = textures.xx;
    break;
```

#### 3D: Add Puzzle Routing Logic

**Location**: Around line 3072-3084

**Find the multiplication_groups section**:
```javascript
} else if (blockingDoor.type === 'multiplication_groups') {
    // Use modular system for multiplication groups puzzles
    const usedModular = showMultiplicationGroupsPuzzle(blockingDoor);
    if (!usedModular) {
        showPuzzle(blockingDoor.type, blockingDoor);
    }
```

**Add your routing after it**:
```javascript
} else if (blockingDoor.type === 'your_puzzle_type') {
    // Use modular system for your puzzle type
    const usedModular = showYourPuzzle(blockingDoor);
    if (!usedModular) {
        showPuzzle(blockingDoor.type, blockingDoor);
    }
```

#### 3E: Add Show Function

**Location**: Around line 3189-3201 (after other show functions)

**Find the end of `showMultiplicationGroupsPuzzle`**:
```javascript
function showMultiplicationGroupsPuzzle(door) {
    // ... function body ...
    return false; // Fall back to original system
}
```

**Add your show function after it**:
```javascript
function showYourPuzzle(door) {
    // Only handle your_puzzle_type door type
    if (door.type === 'your_puzzle_type') {
        console.log(`Using modular your puzzle for door type: ${door.type}`);
        const puzzle = new YourPuzzlePuzzle(door);
        puzzle.render();
        return true; // Indicates modular system was used
    }
    
    return false; // Fall back to original system
}
```

### Step 4: Config Manager (Usually No Changes)

The `config-manager.js` is designed to be fully dynamic and typically requires **no changes** when adding new puzzle types. It automatically:

- Recognizes new puzzle types from configuration
- Loads their configuration data
- Handles door type mappings
- Includes required textures
- Supports tracking and validation

### Step 5: Create Level Assets

Create a new level directory (e.g., `level-11/`) with required assets:

**Required Files**:
- `grid.csv` - Maze layout with your puzzle's door code
- `xx.png` - Texture for your puzzle doors
- Standard level assets: `open.png`, `wall.png`, `endpoint.png`, etc.
- Character celebration sprites: `PT-celebrate.png`, `Enderman-celebrate.png`
- If bonus level: Character bonus sprites

### Implementation Checklist

Use this checklist when adding a new puzzle:

- [ ] **Created puzzle module** (`your-puzzle-puzzle.js`)
- [ ] **Added puzzle config** to `game-config.json` puzzles section
- [ ] **Added level config** to `game-config.json` levels section
- [ ] **Updated character bonus sprites** (if bonus level)
- [ ] **Added script include** in `index.html`
- [ ] **Added grid parsing case** in `index.html`
- [ ] **Added texture assignment case** in `index.html`
- [ ] **Added puzzle routing logic** in `index.html`
- [ ] **Added show function** in `index.html`
- [ ] **Created level directory** with required assets
- [ ] **Created puzzle texture** (`xx.png`)
- [ ] **Updated grid.csv** with puzzle door codes
- [ ] **Tested puzzle** in browser

### Troubleshooting

**Common Issues**:

1. **Puzzle not appearing**: Check grid.csv has correct door codes
2. **Texture not loading**: Verify texture file name matches config `doorType`
3. **Puzzle not opening**: Check case spelling in grid parsing and texture assignment
4. **Function not found**: Verify show function name matches routing logic
5. **Config not loading**: Check JSON syntax in game-config.json

**Testing Steps**:

1. Open browser console for error messages
2. Use Debug Mode (Shift+Ctrl+D) to jump to puzzle level
3. Verify puzzle renders correctly
4. Test both correct and incorrect answers
5. Check scoring and door opening behavior

### Example: Letter Identification Implementation

The letter identification puzzle serves as a complete implementation example:

**Files Modified**:
- `letter-identification.js` - Two-step puzzle (lowercase + sound selection)
- `game-config.json` - Added `letter_identification` config and level 11
- `index.html` - Added all 5 integration points for `'li'` door type

**Key Features Demonstrated**:
- Two-step puzzle completion
- Audio integration (speech synthesis)
- Level-specific letter subsets
- Repetition prevention tracking
- Standard scoring integration

This implementation demonstrates all the patterns and integration points needed for puzzle development.