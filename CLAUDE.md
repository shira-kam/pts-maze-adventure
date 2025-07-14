# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
"PT's Maze Adventure" is a sophisticated educational HTML5 Canvas maze game featuring PT the elephant. The game spans 10 levels with progressive difficulty, incorporating multiple educational puzzle types, advanced movement mechanics, comprehensive scoring systems, and extensive debug capabilities. Built as a single-page application with no external dependencies.

## Architecture Overview

### Core Files Structure
- **`index.html`**: Complete game implementation (4000+ lines) containing all HTML, CSS, JavaScript, and game logic
- **`maze-generator.js`**: Development utility for CSV-to-JavaScript maze conversion
- **Level directories** (`level-1/` through `level-10/`): Each contains complete asset sets
- **Educational data files**: `digraph-sounds.txt`, `digraph-emojis.txt`, `distractors.txt`, `emoji-names.txt`

### Game States and Flow
1. **Difficulty Selection**: Easy/Medium (5 hearts) vs Hard (3 hearts)
2. **Level Progression**: Automatic advancement through levels 1-8, then manual continuation
3. **Puzzle Interactions**: Modal-based educational challenges
4. **Special Mechanics**: Rocket boost, heart collection, bonus systems
5. **Completion Screens**: Level celebrations, final scoring, game over animations
6. **Debug Mode**: Comprehensive testing interface (Shift+Ctrl+D activation)

## Level Structure and Progression

### Current Levels (1-10)
- **Levels 1-3**: Foundation - Basic math (addition/subtraction) and word-emoji matching
- **Levels 4-7**: Intermediate - Number line puzzles and digraph sound recognition
- **Levels 8-9**: Advanced - Triple addition math and division with basket manipulation
- **Level 10**: Debug/Multiplication - Interactive groups puzzle with dual validation

### Level Assets (per level directory)
- **`grid.csv`**: Maze layout with encoded door types and special items
- **`Word-List.txt`**: Educational content (word-emoji pairs, format: `WORD EMOJI,`)
- **Texture files**: `wall.png`, `open.png`, `math.png`, `reading.png`, `endpoint.png`
- **Special textures**: `heart.png` (levels 6-10), `bonus.png` (levels 9-10)
- **Sprites**: `celebrate.png` (level completion), `PT-Bonus-Sprite.svg` (levels 9-10)

## Educational Puzzle System

### Math Puzzles by Level
- **Levels 1-3**: Simple arithmetic (addition/subtraction, answers 1-12)
- **Levels 4-7**: Number line visualization with 13-cell grid system
- **Levels 8-9**: Triple addition (A+B+C format) with problem tracking
- **Level 10**: Interactive multiplication groups with visual arrangement + multiple choice

### Reading and Language Puzzles
- **Levels 1-2**: Word-to-emoji matching with visual feedback
- **Levels 3-7**: Digraph sound recognition with text-to-speech integration
- **Levels 8-9**: Division puzzles with drag-and-drop dot manipulation
- **All levels**: Letter matching (r1) and emoji-to-word (r2) variants available

### Puzzle Mechanics
- **Modal-based UI**: Centralized puzzle display system
- **Adaptive difficulty**: Scoring penalties based on difficulty mode and attempt count
- **Usage tracking**: Prevents problem repetition within levels
- **Text-to-speech**: Browser synthesis for pronunciation support
- **Visual feedback**: Thumbs up/down indicators, color-coded validation

## Advanced Game Features

### Rocket Boost System (Levels 9-10)
- **Activation**: Collecting bonus items (`b` in maze) grants rocket power
- **Mechanics**: Triple movement speed (120px vs 40px), countdown timer, visual effects
- **UI**: Orange gradient background with blinking animation in final 5 seconds
- **Sprite**: Special PT-Bonus-Sprite.svg for rocket mode appearance

### Heart Collection System (Levels 6-10)
- **Placement**: Hearts (`h`) embedded in maze paths for collection
- **Scoring**: Integrated with main scoring system for bonus points
- **Display**: Single heart emoji with count (prevents UI expansion)

### Scoring and Progression
- **Base System**: Lives-based (hearts) with difficulty-dependent starting amounts
- **Level Completion**: Tracks final score for each completed level
- **Comprehensive Tracking**: Session data, completion times, death levels
- **Final Scoring**: Visual summary with level-by-level breakdown

## Technical Architecture

### Sprite and Animation System
- **Movement sprites**: SVG-based (PT-sprite.svg) with 6 frames (160x160 each)
- **Direction mapping**: Right (1-2), Left (3-4), Up/Down (5-6)
- **Celebration animations**: Per-level PNG sheets with variable frame counts
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
- **`m`**: Math door (red) - triggers math puzzles
- **`r`**: Reading door (teal) - triggers reading puzzles
- **`r1`**: Letter matching door (purple) - lowercase to uppercase
- **`r2`**: Emoji-to-word door (orange) - reverse word matching
- **`s`**: Sorting door (yellow) - not implemented
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