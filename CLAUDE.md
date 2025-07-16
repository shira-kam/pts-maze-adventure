# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
"PT's Maze Adventure" is a sophisticated educational HTML5 Canvas maze game featuring PT the elephant. The game spans 10 levels with progressive difficulty, incorporating multiple educational puzzle types, advanced movement mechanics, comprehensive scoring systems, and extensive debug capabilities. Built as a single-page application with no external dependencies.

## Running the Game
**IMPORTANT**: This game requires a local HTTP server to function properly due to browser security restrictions on loading local files (CSV, text files, images). The game dynamically loads level data from CSV files and educational content from text files, which browsers block when opening HTML files directly from the file system.

### Setup Options:
1. **Python**: `python -m http.server 8000` or `python3 -m http.server 8000`
2. **Node.js**: `npx http-server` or `npx serve`
3. **VS Code**: Use "Live Server" extension
4. **Any local web server** that can serve static files

Then navigate to `http://localhost:8000` (or appropriate port) to play the game.

## Architecture Overview

### Core Files Structure
- **`index.html`**: Complete game implementation (4000+ lines) containing all HTML, CSS, JavaScript, and game logic
- **`maze-generator.js`**: Development utility for CSV-to-JavaScript maze conversion
- **Level directories** (`level-1/` through `level-10/`): Each contains complete asset sets
- **Educational data files**: `digraph-sounds.txt`, `digraph-emojis.txt`, `distractors.txt`, `emoji-names.txt`

### Game States and Flow
1. **Difficulty Selection**: Easy/Medium (5 hearts) vs Hard (3 hearts)
2. **Level Selection**: Interactive grid showing all levels with texture previews
3. **Level Progression**: Player-driven level selection after each completion
4. **Puzzle Interactions**: Modal-based educational challenges
5. **Special Mechanics**: Rocket boost, heart collection, bonus systems
6. **Completion Screens**: Level celebrations, level selection, final scoring when all complete
7. **Debug Mode**: Comprehensive testing interface (Shift+Ctrl+D activation)

## Level Structure and Progression

### Current Levels (1-10)
- **Levels 1-3**: Foundation - Basic math (addition/subtraction) and word-emoji matching
- **Levels 4-7**: Intermediate - Number line puzzles and digraph sound recognition  
- **Levels 8-9**: Advanced - Triple addition math and division with basket manipulation
- **Level 10**: Debug/Multiplication - Interactive groups puzzle with dual validation

### Level Assets and Texture Mapping

#### **Standard Assets (all levels 1-10)**
- **`grid.csv`**: Maze layout with encoded door types and special items
- **`Word-List.txt`**: Educational content (word-emoji pairs, format: `WORD EMOJI,`)
- **Core textures**: `wall.png`, `open.png`, `math.png`, `reading.png`, `endpoint.png`
- **`celebrate.png`**: Level-specific celebration animation sprite

#### **Progressive Asset Introduction**
- **Levels 1-5**: Standard assets only (basic gameplay)
- **Levels 6-8**: Standard assets + `heart.png` (heart collectibles)
- **Levels 9-10**: Standard assets + `heart.png` + `bonus.png` + `PT-Bonus-Sprite.svg` (full bonus system)

#### **Global Assets (root directory)**
- **`PT-sprite.svg`**: Main movement sprite (960x160, 6 frames)
- **`game-over.png`**: Game over animation sprite
- **`celebrate.png`**: Fallback celebration sprite

## Educational Puzzle System

Each level features two distinct educational challenges accessed through door types in the maze grid:
- **Math Doors (`m`)**: Red doors triggering mathematical puzzles
- **Reading Doors (`r`)**: Teal doors triggering language/reading puzzles

### Level-by-Level Puzzle Breakdown

#### **Level 1: Foundation Building**
**Math Doors (`m`)**:
- **Mechanics**: Simple addition and subtraction with answers 1-12
- **UI**: Multiple choice with 3 answer buttons
- **Examples**: "3 + 4 = ?", "8 - 2 = ?", "5 + 6 = ?"
- **Validation**: Immediate visual feedback with green/red button styling
- **Educational Goal**: Basic arithmetic fluency and number recognition

**Reading Doors (`r`)**:
- **Mechanics**: Word-to-emoji matching for sight word recognition
- **UI**: Word displayed in title, 3 emoji choice buttons below
- **Vocabulary**: Basic 3-letter words (BAG 💼, CAT 🐈, DOG 🐕, HAT 🎩, etc.)
- **Strategy**: Wrong answers prioritize words with same first letter for challenge
- **Educational Goal**: Sight word vocabulary and visual word recognition

#### **Level 2: Skill Reinforcement**
**Math Doors (`m`)**:
- **Mechanics**: Identical to Level 1 - addition/subtraction with answers 1-12
- **UI**: Same multiple choice interface with 3 buttons
- **Educational Goal**: Continued arithmetic practice and fluency building

**Reading Doors (`r`)**:
- **Mechanics**: Same word-to-emoji matching system as Level 1
- **Vocabulary**: Same basic word set with consistent emoji pairings
- **Educational Goal**: Reinforcement of sight word recognition skills

#### **Level 3: Word Recognition Reinforcement** 
**Math Doors (`ma`)**:
- **Mechanics**: Simple arithmetic (answers 0-20)
- **UI**: Multiple choice button interface
- **Educational Goal**: Expanding arithmetic range and maintaining fluency

**Reading Doors (`we`)**:
- **Mechanics**: **WORD-EMOJI MATCHING** - continued sight word practice
- **UI**: Word displayed in title, 3 emoji choice buttons below
- **Vocabulary**: Extended word set including 4-letter words and more complex vocabulary
- **Strategy**: Same-letter distractor system to prevent guessing
- **Educational Goal**: Advanced sight word recognition and vocabulary expansion

#### **Level 4: Visual Math Introduction**
**Math Doors (`m`)**:
- **Mechanics**: **NUMBER LINE PUZZLES** - interactive visual mathematics
- **UI**: 13-cell grid (positions 0-12) with animated PT elephant
- **Features**: PT starts at black zero cell, players click or use arrow keys to move
- **Problems**: Simple addition/subtraction visualized on the number line
- **Keyboard Support**: Arrow keys for movement, Enter key for answer submission
- **Educational Goal**: Visual number sense and spatial understanding of arithmetic

**Reading Doors (`r`)**:
- **Mechanics**: Same digraph phonics game as Level 3
- **UI**: Digraph display with audio pronunciation support
- **Educational Goal**: Continued phonics mastery and sound recognition

#### **Level 5: Number Line Reinforcement**
**Math Doors (`m`)**:
- **Mechanics**: Continued number line puzzles identical to Level 4
- **UI**: Same interactive 13-cell grid with PT movement
- **Educational Goal**: Reinforcement of visual arithmetic concepts

**Reading Doors (`r`)**:
- **Mechanics**: Same digraph phonics game as Levels 3-4
- **Educational Goal**: Phonics skill reinforcement and sound pattern recognition

#### **Level 6: Heart Collection Introduction**
**Math Doors (`m`)**:
- **Mechanics**: Same number line puzzles (A+B, A-B operations)
- **UI**: Interactive 13-cell grid with PT movement
- **Educational Goal**: Continued visual arithmetic practice

**Reading Doors (`r`)**:
- **Mechanics**: Same digraph phonics game with audio support
- **Educational Goal**: Phonics mastery and automatic sound recognition

**Special Feature**: **Heart items (`h`)** appear in maze for health/score bonuses

#### **Level 7: Skill Consolidation**
**Math Doors (`m`)**:
- **Mechanics**: Same number line puzzles as previous levels
- **Educational Goal**: Arithmetic fluency with visual support systems

**Reading Doors (`r`)**:
- **Mechanics**: Same digraph phonics game with text-to-speech
- **Educational Goal**: Phonics reinforcement and sound-symbol correspondence

**Special Feature**: Heart collection continues for bonus scoring

#### **Level 8: Advanced Mathematics**
**Math Doors (`m`)**:
- **Mechanics**: **TRIPLE ADDITION** number line puzzles (A+B+C format)
- **UI**: Same 13-cell grid, but with 3-term colored equations
- **Examples**: "3 + 4 + 2 = ?" with distinct color coding for each term
- **Constraints**: Total sum ≤ 12, algorithms reduce zero values in problems
- **Educational Goal**: Multi-term addition with visual scaffolding

**Reading Doors (`r`)**:
- **Mechanics**: **DIVISION PUZZLES** - major shift to advanced mathematical concepts
- **UI**: Drag-and-drop interface with dots and basket containers
- **Interaction**: Player drags individual dots into equal groups/baskets
- **Examples**: "12 ÷ 3 = ?" solved by distributing 12 dots into 3 equal baskets
- **Features**: Touch and mouse support, submit button activation when complete
- **Constraints**: Avoids duplicate problems, limits A÷1 and answer=1 cases
- **Educational Goal**: Visual division understanding through equal grouping

#### **Level 9: Advanced Operations**
**Math Doors (`m`)**:
- **Mechanics**: Same triple addition (A+B+C) as Level 8
- **Educational Goal**: Multi-term arithmetic mastery and mental math skills

**Reading Doors (`r`)**:
- **Mechanics**: Same division puzzles as Level 8 with drag-and-drop interface
- **UI**: Dots and baskets with visual distribution validation
- **Educational Goal**: Division fluency through hands-on grouping activities

**Special Features**: Hearts + **Bonus items (`b`)** for rocket boost activation

#### **Level 10: Multiplication Mastery**
**Math Doors (`m`)**:
- **Mechanics**: **MULTIPLICATION GROUPS PUZZLE** - most sophisticated math interface
- **UI**: Interactive red squares with +/- control buttons and multiple choice answers
- **Interaction**: Player creates visual groups by adding squares and dots to represent multiplication
- **Examples**: "3 × 4 = ?" solved by creating 3 squares with 4 dots each
- **Validation**: Dual verification - correct visual arrangement AND correct numerical answer
- **Constraints**: A×B where A and B are 1-10, A×B ≤ 20 (46 total unique ordered pairs)
- **Problem Generation**: No repetition within a level using `game.usedMultiplicationProblems` tracking array
- **Unique Pair System**: Pre-generates all valid (A,B) combinations, shuffles for random selection
- **Wrong Answers**: Generated within |W-R| < 4 constraint for appropriate challenge
- **Educational Goal**: Multiplication as repeated addition and visual grouping

**Reading Doors (`r`)**:
- **Mechanics**: Same division puzzles as Levels 8-9
- **Educational Goal**: Division mastery and mathematical problem-solving

**Special Features**: Hearts + Bonus items, most complex maze layouts

### Educational Progression Framework

#### **Mathematical Learning Path**:
1. **Foundation (Levels 1-3)**: Basic arithmetic operations (answers 0-10, 0-15, 0-20)
2. **Visualization (Levels 4-7)**: Number line spatial reasoning (A+B, A-B)
3. **Complex Operations (Levels 8-9)**: Multi-term addition (A+B+C)
4. **Advanced Concepts (Level 10)**: Multiplication through grouping models

#### **Reading/Language Learning Path**:
1. **Sight Words (Levels 1-3)**: Visual word recognition and vocabulary building
2. **Phonics (Levels 4-7)**: Digraph sound recognition with audio support
3. **Mathematical Reading (Levels 8-10)**: Division problem comprehension and solving

#### **Cognitive Skill Development**:
- **Visual Processing**: Number lines, grouping models, spatial reasoning
- **Auditory Processing**: Text-to-speech integration for phonics
- **Motor Skills**: Drag-and-drop interactions, precise clicking
- **Problem Solving**: Multi-step puzzle completion and validation

### Puzzle Mechanics and Technical Features
- **Modal-based UI**: Centralized puzzle display system with consistent interactions
- **Adaptive Difficulty**: Scoring penalties based on difficulty mode and attempt counts
- **Usage Tracking**: Prevents problem repetition within individual levels
- **Audio Integration**: Text-to-speech synthesis for pronunciation modeling
- **Visual Feedback**: Thumbs up/down indicators with position-specific placement
- **Input Validation**: Keyboard and mouse support with accessibility considerations

## Advanced Game Features

### Level Selection System
- **Access**: Shown after difficulty selection and after each level completion
- **Interface**: 5x2 grid displaying all 10 levels with texture previews
- **Visual Format**: "Level X [wall][endpoint][wall]" with actual texture images
- **Completion Tracking**: Completed levels show large checkmark overlay and are unclickable
- **Navigation**: Back button to return to difficulty selection
- **Progressive Unlocking**: Only incomplete levels remain selectable
- **Final Score**: Only shown when all 10 levels are completed

### Rocket Boost System (Levels 9-10)
#### **Activation Process**
- **Trigger**: Collecting bonus items (`b` in maze grid) activates boost modal
- **Modal Interface**: Interactive transition screen with animated 200x200px PT sprite
- **User Control**: Player clicks "START BOOST!" button to begin (no automatic activation)

#### **Boost Mechanics**
- **Wall Removal**: Randomly removes half of maze walls for easier navigation
- **Duration**: 30-second timer with countdown display
- **Movement**: Normal speed (not triple-speed) with enhanced maze traversal
- **Visual State**: Orange gradient background (`#FF4500` to `#FFD700`) with rocket styling

#### **Enhanced Features**
- **Sprite System**: Switches to PT-Bonus-Sprite.svg during boost mode
- **UI Adaptations**: Black text overlay for visibility during orange background
- **Final Warning**: Blinking animation in final 5 seconds of countdown
- **Safe Return**: Modal-based transition back to normal with "RETURN TO NORMAL" button
- **Teleportation**: Returns PT to original starting position when boost ends
- **Wall Restoration**: All walls restored to original maze state after boost

### Heart Collection System (Levels 6-10)
- **Placement**: Hearts (`h`) embedded in maze paths for collection
- **Scoring**: Integrated with main scoring system for bonus points
- **Display**: Single heart emoji with count (prevents UI expansion)

### Dual Score Display System
The game features a comprehensive scoring system with both level-specific and cumulative tracking:

#### **Level Score (Red Heart ❤️)**
- **Reset Behavior**: Resets to starting hearts (3 for hard, 5 for easy/medium) at each level start
- **Real-time Updates**: Changes immediately as player gains/loses hearts during gameplay
- **Purpose**: Shows current health/progress within the active level

#### **Cumulative Score (Black Heart 🖤)**
- **Session Tracking**: Accumulates all hearts gained/lost across entire browser session
- **Continuous Updates**: Updates in real-time alongside level score changes
- **Reset Behavior**: Resets to 0 only on browser refresh/restart (no localStorage persistence)
- **Starting Hearts**: Includes initial hearts when starting each new level (once per level attempt)
- **Purpose**: Shows total progress across all levels played in current session

#### **Display Format**
- **Location**: Top-left of game area in blue text (`#4169E1`) matching level indicator
- **Format**: `❤️ 5 | 🖤 23` (level score | cumulative score)
- **Updates**: Both scores update simultaneously when hearts are gained/lost

### Scoring and Progression
- **Base System**: Lives-based (hearts) with difficulty-dependent starting amounts
- **Level Completion**: Tracks final score for each completed level
- **Session Tracking**: Completed levels stored in Set, prevents re-selection
- **Comprehensive Data**: Session data, completion times, death levels
- **Final Scoring**: Visual summary with level-by-level breakdown shown only when all levels complete

## Technical Architecture

### Sprite and Animation System
- **Movement sprites**: SVG-based (PT-sprite.svg) with 6 frames (160x160 each)
- **Direction mapping**: Right (1-2), Left (3-4), Up/Down (5-6)
- **Celebration animations**: Per-level PNG sheets with variable frame counts
  - **Level 10**: 53 frames for extended celebration sequence
  - **Other levels**: Variable frame counts based on sprite sheet dimensions
- **Game over**: 13-frame horizontal sequence (436x436 frames)
- **Scaling**: Dynamic sizing with aspect ratio preservation

### Content Loading System
- **Dynamic CSV parsing**: Maze layouts loaded via `loadMazeFromCSV()`
- **Asynchronous loading**: Promise.all() coordination in `initializeGame()`
- **Cache busting**: Timestamp-based parameter injection
- **Fallback system**: Embedded data when file loading fails
- **Educational content**: Dynamic word list and digraph data loading

### Collision and Movement
- **Grid-based**: 40x40 pixel tile system with path validation
- **Character size**: 45x45 pixels (larger than tiles for visual overlap)
- **Collision detection**: `isOnPath()` validation against maze data
- **Special movement**: Rocket boost with triple-speed mechanics

## Debug and Testing Features

### Debug Mode (Shift+Ctrl+D)
- **Level jumping**: Direct access to any level 1-10
- **Test variants**: Alternative starting positions (e.g., level 4 test mode)
- **Animation preview**: Individual celebration sprite testing with controls
- **Visual indicators**: Real-time level display and debugging information

### Testing Capabilities
- **Manual testing workflow**: Level progression, puzzle validation, sprite loading
- **Performance testing**: Animation frame rates, texture loading times
- **Educational testing**: Puzzle generation, content validation, speech synthesis

## CSV Maze Format

### Cell Type Encoding
- **`o`**: Open path (traversable)
- **`m`**: Math door - triggers math puzzles
- **`r`**: Reading door - triggers reading puzzles
- **`s`**: Sorting door - not implemented
- **`w`**: Watering hole (goal) - level completion trigger
- **`h`**: Heart collectible (levels 6-10) - bonus scoring
- **`b`**: Bonus collectible (levels 9-10) - rocket boost activation
- **Empty cell**: Wall (non-traversable)

## Development Workflows

### Adding New Levels
1. **Create directory**: `level-X/` with all required assets
2. **Design maze**: Create `grid.csv` using encoding system above
3. **Educational content**: Add `Word-List.txt` with format: `WORD EMOJI,`
4. **Assets**: Include all texture files and celebration sprites
5. **Code updates**: Modify difficulty selection logic and level bounds
6. **Testing**: Use debug mode for rapid iteration and validation

### Modifying Puzzle Types
- **Math puzzles**: Update `showPuzzle()` case handling and generation logic
- **Reading puzzles**: Modify content loading and validation systems
- **New types**: Extend CSV encoding and add corresponding puzzle logic

### Performance Considerations
- **Texture loading**: Coordinate with game initialization flow
- **Animation performance**: Use requestAnimationFrame for smooth rendering
- **Memory management**: Proper cleanup of event listeners and timers
- **Mobile compatibility**: Touch event handling and responsive design

## Educational Framework

### Learning Objectives
- **Mathematical thinking**: Number sense, arithmetic operations, visual math
- **Reading comprehension**: Word recognition, phonics, emoji association
- **Problem solving**: Multi-step puzzles, constraint satisfaction
- **Motor skills**: Drag-and-drop interactions, precise navigation

### Adaptive Features
- **Difficulty scaling**: Progressive complexity across levels
- **Mistake handling**: Constructive feedback with visual cues
- **Usage tracking**: Prevents over-repetition of problems
- **Multi-modal learning**: Visual, auditory, and kinesthetic elements

## Common Development Patterns

### File Loading Pattern
```javascript
// Standard pattern for loading level assets
const promises = [
    loadMazeFromCSV(level),
    loadWordListFromFile(level),
    loadTextures(level)
];
Promise.all(promises).then(() => initializeLevel());
```

### Puzzle Validation Pattern
```javascript
// Standard validation with difficulty-based scoring
if (isCorrect) {
    updateScore(1);
    door.open = true;
    completeRocketBoostMovement(); // If rocket boost active
} else {
    handleIncorrectAnswer(door, attempts);
}
```

### Debug Feature Pattern
```javascript
// Consistent debug mode activation and testing
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.ctrlKey && e.key === 'D') {
        toggleDebugMode();
    }
});
```

This documentation reflects the current sophisticated state of PT's Maze Adventure as a comprehensive educational gaming platform with advanced features and extensive customization capabilities.