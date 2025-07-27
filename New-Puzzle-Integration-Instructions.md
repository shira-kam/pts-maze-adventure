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

## Step 5: Add Parent Settings Configuration

**IMPORTANT**: For puzzles to be fully accessible to parents/educators, they must be configurable through the parent settings interface (`game-settings.html`).

### 5A: Add to Puzzle Types List

**Location**: Around line 275-283 in `game-settings.html`

**Add your puzzle type to the array**:
```javascript
const puzzleTypes = [
    { value: 'word_emoji_matching', label: 'Word Emoji Matching' },
    { value: 'simple_arithmetic', label: 'Simple Math (A+B=?)' },
    // ... existing puzzle types ...
    { value: 'your_puzzle_type', label: 'Your Puzzle Display Name' }
];
```

### 5B: Add to Embedded Game Config

**Location**: Around line 393-403 in `game-settings.html`

**Add your puzzle configuration to the embedded config**:
```javascript
"your_puzzle_type": {
  "your_config_options": {
    "option1": "default_value",
    "option2": ["default", "array"]
  },
  "tracking": {
    "preventRepetition": true,
    "maxAttempts": 3,
    "trackingScope": "level"
  }
}
```

### 5C: Add Configuration Case

**Location**: Around line 982-983 in `game-settings.html`

**Add your case to the generatePuzzleConfig function**:
```javascript
case 'your_puzzle_type':
    return generateYourPuzzleConfig(levelNum, puzzleNum, puzzleData);
```

### 5D: Create Configuration Generator Function

**Location**: After other generate functions (around line 1273)

**Add your configuration form generator**:
```javascript
function generateYourPuzzleConfig(levelNum, puzzleNum, puzzleData) {
    const option1 = puzzleData.option1 || 'default_value';
    const selectedOptions = puzzleData.option2 || ['default'];
    const availableOptions = ['option_a', 'option_b', 'option_c'];
    
    return `
        <div class="form-group">
            <label>Option 1:</label>
            <select id="option1-${levelNum}-${puzzleNum}" onchange="updatePuzzleConfig(${levelNum}, ${puzzleNum})">
                <option value="value1" ${option1 === 'value1' ? 'selected' : ''}>Value 1</option>
                <option value="value2" ${option1 === 'value2' ? 'selected' : ''}>Value 2</option>
            </select>
        </div>
        <div class="form-group">
            <label>Multiple Options:</label>
            <div class="checkbox-group">
                ${availableOptions.map(option => `
                    <label>
                        <input type="checkbox" value="${option}" 
                               ${selectedOptions.includes(option) ? 'checked' : ''}
                               onchange="updatePuzzleConfig(${levelNum}, ${puzzleNum})">
                        ${option.charAt(0).toUpperCase() + option.slice(1)}
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}
```

### 5E: Add Update Configuration Case

**Location**: Around line 1507 in `game-settings.html` (in the updatePuzzleConfig switch statement)

**Add your case before the closing bracket**:
```javascript
case 'your_puzzle_type':
    const selectedOption1 = document.getElementById(`option1-${levelNum}-${puzzleNum}`)?.value || 'default_value';
    const selectedOptions = Array.from(document.querySelectorAll(`#config-${levelNum}-${puzzleNum} input[type="checkbox"]:checked`))
        .map(cb => cb.value).filter(v => ['option_a', 'option_b', 'option_c'].includes(v));
    
    puzzleConfig.option1 = selectedOption1;
    puzzleConfig.option2 = selectedOptions.length > 0 ? selectedOptions : ['default'];
    puzzleConfig.tracking = {
        preventRepetition: true,
        maxAttempts: 3,
        trackingScope: "level"
    };
    break;
```

### Parent Settings Benefits

Adding proper parent settings integration provides:

**For Parents/Educators:**
- **No technical knowledge required**: User-friendly form interface instead of JSON editing
- **Real-time feedback**: Changes immediately reflected in level summaries
- **Comprehensive control**: All puzzle parameters accessible through intuitive controls
- **Educational targeting**: Easy customization for specific learning objectives

**Common Configuration Patterns:**

**Single Select Dropdown:**
```javascript
<select id="mode-${levelNum}-${puzzleNum}" onchange="updatePuzzleConfig(${levelNum}, ${puzzleNum})">
    <option value="mode1" ${mode === 'mode1' ? 'selected' : ''}>Mode 1</option>
    <option value="mode2" ${mode === 'mode2' ? 'selected' : ''}>Mode 2</option>
</select>
```

**Radio Button Group:**
```javascript
<div class="radio-group">
    <label>
        <input type="radio" name="option-${levelNum}-${puzzleNum}" value="value1" 
               ${option === 'value1' ? 'checked' : ''} 
               onchange="updatePuzzleConfig(${levelNum}, ${puzzleNum})">
        Option 1
    </label>
</div>
```

**Multi-Select Checkboxes:**
```javascript
<div class="checkbox-group">
    ${availableOptions.map(option => `
        <label>
            <input type="checkbox" value="${option}" 
                   ${selectedOptions.includes(option) ? 'checked' : ''}
                   onchange="updatePuzzleConfig(${levelNum}, ${puzzleNum})">
            ${option}
        </label>
    `).join('')}
</div>
```

**Number Input with Validation:**
```javascript
<input type="number" id="maxValue-${levelNum}-${puzzleNum}" value="${maxValue || 10}" 
       min="1" max="20" onchange="updatePuzzleConfig(${levelNum}, ${puzzleNum})">
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
- [ ] **Added to puzzle types list** in `game-settings.html`
- [ ] **Added to embedded config** in `game-settings.html`
- [ ] **Added configuration case** in `generatePuzzleConfig` function
- [ ] **Created configuration generator function** in `game-settings.html`
- [ ] **Added update configuration case** in `updatePuzzleConfig` function
- [ ] **Tested puzzle** in browser
- [ ] **Tested parent settings configuration** interface

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