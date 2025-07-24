# How to Create and Integrate a New Puzzle

This section provides step-by-step instructions for adding new puzzle types to the game using the **Generic Obstacle-Based Asset Loading System**. This new system simplifies puzzle integration and eliminates the need for puzzle-specific asset naming.

## Overview

Adding a new puzzle requires changes to **2 main files** (down from 4 in the old system):

1. **Create puzzle module** (`{puzzle-name}.js`)
2. **Update configuration** (`game-config.json`) 
3. **Update index.html** (1 integration point, down from 4)
4. **Config manager** (no changes needed - fully dynamic)

## Key Benefits of New System

✅ **Simplified asset naming**: Use generic `obstacle1.png`, `obstacle2.png` instead of puzzle-specific names  
✅ **Dynamic puzzle assignment**: Reorder config arrays to change which puzzle appears where  
✅ **No hardcoded mappings**: System works with any puzzle type at any position  
✅ **Future-proof**: Easy to add new puzzle types without code changes  

## Step 1: Create the Puzzle Module

Create a new JavaScript file: `{puzzle-name}-puzzle.js`

**Template Structure** (based on `word-emoji-puzzle.js`):

```javascript
// Maze of Marvels - {Puzzle Name} Puzzle
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

## Step 2: Update Configuration (`game-config.json`)

### 2A: Add Puzzle Defaults

Add your puzzle configuration to the `puzzles` section (**Note**: No `doorType` or `texture` properties needed!):

```json
{
  "puzzles": {
    // ... existing puzzles ...
    "your_puzzle_type": {
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

### 2B: Add Level Configuration

Add your puzzle to a level's `puzzles` array (**Order determines obstacle mapping**):

```json
{
  "levels": {
    "12": {
      "playable": true,
      "puzzles": [
        {
          "type": "existing_puzzle_type",
          "config": "overrides"
        },
        {
          "type": "your_puzzle_type",
          "your_config_options": {
            "option1": "level_specific_value"
          }
        }
      ],
      "assets": {
        "celebration": {
          "frames": 40,
          "frameWidth": 200,
          "frameHeight": 200
        },
        "hearts": true,
        "bonus": false
      }
    }
  }
}
```

**Important**: Array position determines obstacle code:
- First puzzle → `ob1` → `obstacle1.png`
- Second puzzle → `ob2` → `obstacle2.png`

## Step 3: Update `index.html` (1 Integration Point Only!)

### 3A: Add Script Include

**Location**: Around line 936-943

**Add your script**:
```html
<script src="your-puzzle-name.js"></script>
```

### 3B: Add Puzzle Routing Logic

**Location**: Around line 1998-2004

**Find the letter_identification section**:
```javascript
} else if (blockingDoor.type === 'letter_identification') {
    // Use modular system for letter identification puzzles
    const usedModular = showLetterIdentificationPuzzle(blockingDoor);
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

### 3C: Add Show Function

**Location**: After other show functions

**Add your show function**:
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

## Step 4: Create Level Assets

Create a new level directory (e.g., `level-12/`) with **generic assets**:

**Required Files**:
- `grid.csv` - Maze layout with generic obstacle codes (`ob1`, `ob2`, etc.)
- `obstacle1.png` - **Generic texture for first puzzle** (position in config array)
- `obstacle2.png` - **Generic texture for second puzzle** (if level has 2 puzzles)
- Standard level assets: `open.png`, `wall.png`, `endpoint.png`
- Character celebration sprites: `PT-celebrate.png`, `Enderman-celebrate.png`
- If bonus level: Character bonus sprites

**Example grid.csv**:
```csv
,A,B,C,D,E,F,G,H,I,J,K,L
1,o,o,ob1,o,o,o,o,o,o,o,o,w
2,o,,,,,,,,ob2,,o,o
3,o,o,o,o,o,o,o,o,o,o,o,o
```

## What You DON'T Need to Do (vs Old System)

❌ **No puzzle-specific door codes**: Don't create custom door codes like `'li'`, `'mg'`  
❌ **No puzzle-specific textures**: Don't name textures after puzzle types  
❌ **No grid parsing cases**: No need to add switch cases for door parsing  
❌ **No texture assignment cases**: No need to add texture mapping cases  
❌ **No config manager changes**: Dynamic system handles everything automatically  

## Implementation Checklist

Use this streamlined checklist when adding a new puzzle:

- [ ] **Created puzzle module** (`your-puzzle-puzzle.js`)
- [ ] **Added puzzle defaults** to `game-config.json` puzzles section
- [ ] **Added to level puzzles array** in `game-config.json` (order matters!)
- [ ] **Added script include** in `index.html`
- [ ] **Added puzzle routing logic** in `index.html`
- [ ] **Added show function** in `index.html`
- [ ] **Created level directory** with generic assets
- [ ] **Created generic obstacle textures** (`obstacle1.png`, `obstacle2.png`)
- [ ] **Updated grid.csv** with generic obstacle codes (`ob1`, `ob2`)
- [ ] **Tested puzzle** in browser

## Benefits of New System

### For Puzzle Developers:
- **50% fewer integration points** (3 vs 6 in old system)  
- **No hardcoded mappings** to maintain
- **Generic asset naming** - same files work for any puzzle
- **Easy puzzle reordering** - just change config array order

### For Level Creators:
- **Consistent file structure** across all levels
- **Generic texture names** - `obstacle1.png` works for any puzzle type
- **Flexible puzzle assignment** - same level assets work with different puzzle combinations

### For Maintenance:
- **Future-proof architecture** - new puzzles require minimal code changes
- **Dynamic system** - ConfigManager handles all mappings automatically
- **Reduced coupling** - puzzles aren't tied to specific door codes or textures

## Example: Converting Existing Puzzle Integration

**Old System (6 integration points)**:
1. Add `doorType: "xx"` and `texture: "xx.png"` to config
2. Add grid parsing case for `'xx'`
3. Add texture assignment case for `'xx'`
4. Create `xx.png` texture file
5. Add puzzle routing logic
6. Add show function

**New System (3 integration points)**:
1. Add puzzle to level's `puzzles` array (no doorType/texture)
2. Add puzzle routing logic
3. Add show function
4. Create generic `obstacle1.png`, `obstacle2.png` files
5. Use generic `ob1`, `ob2` codes in grid

The same puzzle can now appear as different obstacle codes in different levels based on its position in the configuration array!

## Troubleshooting

**Common Issues**:

1. **Puzzle not appearing**: Check grid.csv uses generic codes (`ob1`, `ob2`) and matches puzzle array length
2. **Wrong texture showing**: Verify obstacle texture number matches puzzle position in config array
3. **Puzzle type not found**: Check puzzle type spelling in config array matches module expectations
4. **Multiple puzzles showing same texture**: Ensure each puzzle position has corresponding `obstacleX.png` file

**Testing Steps**:

1. Open browser console for error messages
2. Use Debug Mode (Shift+Ctrl+D) to jump to puzzle level
3. Verify correct obstacle texture appears for puzzle type
4. Test puzzle renders and functions correctly
5. Check that array reordering changes obstacle assignments as expected

**Debug Commands**:
```javascript
// Check puzzle mapping for a level
configManager.getPuzzleMapping(12)  // Returns: ['existing_puzzle', 'your_puzzle_type']

// Check obstacle code mapping
configManager.getObstacleCode(12, 'your_puzzle_type')  // Returns: 'ob2'

// Check reverse mapping  
configManager.getPuzzleTypeFromObstacle(12, 'ob2')  // Returns: 'your_puzzle_type'
```

This new system makes puzzle integration much simpler and more maintainable!