# PT's Maze Adventure - Puzzle Mechanics Documentation

## Overview
This document provides comprehensive details of how each puzzle type works in the original system. This analysis is essential before attempting any modularization to ensure we preserve exact functionality.

## Core Puzzle Framework

### Universal Puzzle Elements
- **Modal**: Uses `#puzzleModal` with `#puzzleTitle`, `#puzzleQuestion`, `#puzzleOptions`, and `#puzzleResult`
- **Visual Feedback**: Thumbs up (👍) for correct, thumbs down (👎) for wrong answers
- **Font Size**: Result feedback is 48px for visibility
- **Timing**: Modal dismisses after 800ms for correct answers, 1500ms for wrong answer feedback
- **Attempt Tracking**: Each door tracks `currentProblemAttempts` and `failedAttempts`

### Universal Scoring System (via `checkAnswer` function)
- **Correct Answer**: +1 point (all puzzle types)
- **Wrong Answer Penalty** (difficulty-based):
  - **Easy mode**: -1 point per wrong answer
  - **Medium mode**: -1 for first wrong, -2 for second wrong
  - **Hard mode**: -2 points per wrong answer
- **Problem Regeneration**: After 3 failed attempts, generates new problem

### Door Management
- **Opening**: `door.open = true` when solved
- **Visual Change**: Door color changes to `#B8F2B8` (light green)
- **Button Disabling**: Wrong answer buttons become disabled with gray background

---

## MATH PUZZLES

### 1. Simple Arithmetic (Levels 1-3)
**Configuration**: `simple_arithmetic` type
**Location**: Lines 3834-3875 in `showPuzzle()`

#### Mechanics:
- **Operation Selection**: 50% chance addition, 50% chance subtraction
- **Answer Range**: 1-12 (strictly enforced)
- **Title**: Shows actual problem (e.g., "5 + 3 = ?")
- **Problem Generation**:
  - **Addition**: `num1` (1 to 11), `num2` (1 to 12-num1) to ensure sum ≤ 12
  - **Subtraction**: `num1` (1 to 12), `num2` (1 to min(num1, 12)) to ensure positive result
- **Answer Options**: 3 buttons (1 correct + 2 wrong)
- **Wrong Answers**: Random numbers 1-12 that don't match correct answer
- **Button Style**: `puzzle-button` class
- **Click Handler**: `checkAnswer(ans === answer, 'math', door, button)`

#### Level Differences:
- **Level 1**: Max answer 12, simpler problems
- **Level 2**: Max answer 12, same mechanics
- **Level 3**: Max answer 12, same mechanics

### 2. Number Line Puzzles (Levels 4+)
**Configuration**: `number_line` type
**Location**: Lines 3756-3832 in `showPuzzle()`

#### Core Functions:
- **`createNumberLinePuzzle(door, equationType)`**: Generates equations and answer choices
- **`initializeNumberLine(door)`**: Creates visual grid and interaction
- **`movePTToPosition(position, door)`**: Handles PT movement and visual feedback
- **`numberLineKeyHandler(e, door)`**: Keyboard navigation (arrow keys, Enter)
- **`checkNumberLineAnswer(door)`**: Validates answer and unlocks door

#### Mechanics:
- **Answer Range**: 0-12 (fits exactly on number line)
- **Equation Types**:
  - **Levels 4-7**: Simple equations (A+B or A-B)
  - **Levels 8-9**: Triple addition (A+B+C) with HTML coloring
  - **Level 10**: Multiplication (A×B) with HTML coloring
- **Visual Component**: 13-column grid (0-12) with PT sprite
- **Answer Options**: 3 multiple choice buttons below number line
- **PT Movement**: 
  - Starts at position 0 (black background for levels 4+)
  - Click any cell or use arrow keys to move
  - Visual trail shows path from start to current position
- **Color Coding**:
  - **Start (0)**: Green (#32CD32) 
  - **Current Position**: Blue (#4169E1) if left of start, Orange (#FF8C00) if right
  - **Trail**: Colored path between positions
- **Interaction**: Mouse click or keyboard arrows, Enter to submit
- **Data Storage**: `door.mathAnswer`, `door.mathStartPosition`, `door.foxPosition`

### 3. Division Visual (Level 7)
**Configuration**: `division_visual` type
**Location**: Lines 3877+ (reading doors in levels 8-10)

#### Mechanics:
- **Interface**: Drag and drop dots into groups
- **Problem Type**: Division with visual grouping
- **Setup**: `setupDivisionDragDrop(door)` handles interactions
- **Keyboard Support**: Enter key to submit via `submitDivisionAnswer()`
- **Auto-selection**: First dot auto-selected for easier interaction
- **Problem Generation**: `createDivisionPuzzle(door)` creates problem

### 4. Multiplication Groups (Level 8)
**Configuration**: `multiplication_groups` type
**Location**: Lines 3819-3823 in `showPuzzle()`

#### Mechanics:
- **Detection**: `if (game.selectedDifficulty === 10)` 
- **Function**: `showMultiplicationGroupsPuzzle(door)`
- **Interface**: Interactive grouping for multiplication concepts
- **Storage**: `game.currentMultiplicationDoor` tracks active puzzle

---

## READING PUZZLES

### 1. Word-Emoji Matching (Levels 1-2)
**Configuration**: `word_emoji_matching` type
**Location**: Lines 4170+ in `showPuzzle()`

#### Mechanics:
- **Word Source**: `game.wordEmojiPairs` loaded from level files
- **Problem Structure**: Display word, choose matching emoji
- **Answer Options**: 4 emoji buttons (1 correct + 3 wrong)
- **Fallback Data**: Embedded word-emoji pairs if file loading fails
- **Tracking**: `game.usedWords` prevents repetition
- **Button Style**: Emoji buttons with hover effects

### 2. Digraph Sounds (Levels 3-7)
**Configuration**: `digraph_sounds` type
**Location**: Lines 3916-4000+ in `showPuzzle()`

#### Mechanics:
- **Data Source**: `game.digraphEmojis` loaded from `digraph-sounds.txt`
- **Problem Generation**: 
  - Select random digraph (e.g., 'CH', 'TH', 'SH')
  - Choose random emoji from that digraph's emoji list
  - Generate wrong answers from OTHER digraphs
- **Tracking**: `game.usedDigraphs` prevents repetition
- **Special Logic**: SK/SC pairs avoided (too similar)
- **Audio**: `speakEmojiWord(selectedEmoji)` for pronunciation
- **Interface**: 4 emoji buttons, user selects which contains the sound

### 3. Division Puzzles (Levels 8-10, Reading Doors)
**Configuration**: Used for reading doors in levels 8-10
**Location**: Lines 3877-3913 in `showPuzzle()`

#### Mechanics:
- **Reuse**: Same as math division but accessed via reading doors
- **Keyboard Handler**: `divisionKeyHandler` for Enter key
- **Cleanup**: Removes existing keyboard handlers before setup
- **Auto-selection**: First dot selected automatically

---

## SPECIALIZED DOOR TYPES

### 1. Letter Matching (reading1 doors)
**Configuration**: `letter_matching` type
**Location**: Separate case in `showPuzzle()`

#### Mechanics:
- **Problem**: Match uppercase to lowercase letters
- **Interface**: Multiple choice buttons
- **Tracking**: Prevents letter repetition

### 2. Emoji-to-Word (reading2 doors)
**Configuration**: `emoji_to_word` type
**Location**: Separate case in `showPuzzle()`

#### Mechanics:
- **Problem**: Show emoji, select corresponding word
- **Interface**: Multiple choice word buttons
- **Data Source**: Same word-emoji pairs as word matching

### 3. Sorting Puzzles (sorting doors)
**Configuration**: `sorting` type
**Status**: Mentioned in scoring but not implemented

---

## CRITICAL IMPLEMENTATION DETAILS

### Button Generation Pattern
```javascript
const button = document.createElement('button');
button.className = 'puzzle-button';
button.textContent = answerText;
button.onclick = () => checkAnswer(isCorrect, type, door, button);
options.appendChild(button);
```

### Modal Structure
```javascript
const modal = document.getElementById('puzzleModal');
const title = document.getElementById('puzzleTitle');
const question = document.getElementById('puzzleQuestion');
const options = document.getElementById('puzzleOptions');
const result = document.getElementById('puzzleResult');
```

### Puzzle State Management
```javascript
game.puzzleActive = true;  // Set when puzzle opens
modal.style.display = 'block';  // Show modal
// ... puzzle logic ...
// On completion:
game.puzzleActive = false;  // Reset when puzzle closes
modal.style.display = 'none';  // Hide modal
```

### Door State Changes
```javascript
door.open = true;  // Mark as solved
door.color = '#B8F2B8';  // Visual feedback
// Tracking variables:
door.currentProblemAttempts = 0;  // Reset attempts
door.failedAttempts = 0;  // Reset failures
```

---

## REFACTORING IMPLICATIONS

### What Must Be Preserved
1. **Exact Visual Feedback**: Thumbs up/down, not text
2. **Timing**: 800ms for success, 1500ms for failure feedback
3. **Scoring Algorithm**: Difficulty-based point deduction
4. **Button Behavior**: Disable wrong answers, hover effects
5. **Modal Management**: Proper show/hide with state tracking
6. **Problem Regeneration**: After 3 failures
7. **Audio Features**: Speech synthesis for certain levels

### Modularization Strategy
1. **One Puzzle Type at a Time**: Don't break working systems
2. **Exact Interface Match**: New classes must produce identical DOM
3. **Preserve Integration**: Must work with existing `checkAnswer()`
4. **Maintain State**: All door tracking variables must be preserved
5. **CSS Compatibility**: Must work with existing `.puzzle-button` styles

### Testing Requirements
- Visual feedback identical to original
- Timing matches exactly
- Scoring system works correctly
- Modal dismissal functions properly
- Problem regeneration after failures
- Button states (enabled/disabled) correct
- All level-specific features preserved

---

## NEXT STEPS FOR MODULARIZATION

1. **Start with Level 1-3 Math**: Simplest case, well-defined mechanics
2. **Create Exact Replica**: New class must produce identical behavior
3. **Preserve Integration**: Use existing `checkAnswer()` function
4. **Test Thoroughly**: All mechanics must work identically
5. **Document Changes**: Track exactly what was modified
6. **One Level at a Time**: Don't break other puzzle types

This documentation ensures that any modularization attempts preserve the exact functionality that children depend on for learning.