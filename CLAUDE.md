# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Project Overview & Setup

"PT's Maze Adventure" is a sophisticated educational HTML5 Canvas maze game featuring multiple playable characters. The game spans 11 levels with progressive difficulty, incorporating multiple educational puzzle types, advanced movement mechanics, comprehensive scoring systems, and extensive debug capabilities. Built as a single-page application with no external dependencies and fully dynamic character support.

### Live Game Access
**🎉 PLAY ONLINE**: https://shira-kam.github.io/pts-maze-adventure/
- **No installation required** - Play directly in your browser
- **Automatic updates** - Always the latest version
- **GitHub Repository**: https://github.com/shira-kam/pts-maze-adventure

### Running the Game Locally
**IMPORTANT**: For local development, this game requires a local HTTP server to function properly due to browser security restrictions on loading local files (CSV, text files, images). The game dynamically loads level data from CSV files and educational content from text files, which browsers block when opening HTML files directly from the file system.

**Setup Options:**
1. **Python**: `python -m http.server 8000` or `python3 -m http.server 8000`
2. **Node.js**: `npx http-server` or `npx serve`
3. **VS Code**: Use "Live Server" extension
4. **Any local web server** that can serve static files

Then navigate to `http://localhost:8000` (or appropriate port) to play the game.

## 2. Pre-Literate Design Requirements

**CRITICAL RULE**: This game is designed for pre-literate children. **NEVER use text-based feedback, instructions, or error messages.**

### Required Approach:
- ✅ **Visual symbols only**: 👍 👎 ❓ 🎉 ⭐ etc.
- ✅ **Audio feedback**: Speech synthesis for sounds/words
- ✅ **Color coding**: Green = correct, Red = wrong, Orange = incomplete
- ✅ **Visual animations**: Celebrate with sprites, not text

### Forbidden:
- ❌ **Any text feedback**: "Correct!", "Wrong!", "Try again!", etc.
- ❌ **Written instructions**: "Select the...", "Click here...", etc.  
- ❌ **Error messages**: "Please select...", "Missing...", etc.
- ❌ **Status text**: "Loading...", "Complete!", etc.

### Rationale:
Pre-literate children cannot read instruction text or feedback messages. All communication must be through universally understood symbols, colors, sounds, and visual cues.

### Implementation Guidelines:
- **Success feedback**: Use 👍 with green color
- **Failure feedback**: Use 👎 with red color  
- **Incomplete actions**: Use ❓ with orange color
- **Celebrations**: Use celebration sprites and animations
- **Instructions**: Use visual demonstrations or intuitive UI design
- **Audio cues**: Speak words/sounds that children need to learn

## 3. Architecture & Configuration System

### Core Files Structure
- **`index.html`**: Complete game implementation (4000+ lines) containing all HTML, CSS, JavaScript, and game logic
- **`game-config.json`**: Comprehensive configuration file controlling levels, characters, and puzzles
- **`config-manager.js`**: Configuration management utility for dynamic loading
- **Level directories** (`level-1/` through `level-11/`): Each contains complete asset sets
- **Educational data files**: `digraph-sounds.txt`, `digraph-emojis.txt`, `distractors.txt`, `emoji-names.txt`
- **Character assets**: Movement sprites, celebration animations, bonus sprites, game over sprites
- **Documentation files**: `Current-Puzzle-Types.md`, `New-Puzzle-Integration-Instructions.md`

### Game States and Flow
1. **Character Selection**: Choose from dynamically loaded characters
2. **Difficulty Selection**: Easy Peasy/Neutral (5 hearts) vs Hard Mode (3 hearts)
3. **Level Selection**: Interactive grid showing all levels with texture previews
4. **Level Progression**: Player-driven level selection after each completion
5. **Puzzle Interactions**: Modal-based educational challenges
6. **Special Mechanics**: Rocket boost, heart collection, bonus systems
7. **Completion Screens**: Level celebrations, level selection, final scoring when all complete
8. **Debug Mode**: Comprehensive testing interface (Shift+Ctrl+D activation)

### Dynamic Character System
The game features a fully dynamic character system that supports multiple playable characters:

**Current Characters:**
- **PT the Elephant**: Original character with full asset set
- **Enderman**: Dark mysterious character with complete animation support

**Character Assets Required:**
- **Movement sprite**: 6-frame sprite sheet (960x160 pixels, SVG or PNG)
- **Celebration sprites**: Per-level celebration animations (PNG sprite sheets)
- **Game over sprite**: Character-specific game over animation
- **Bonus sprites**: Rocket boost mode sprites for levels with bonus features

**Adding New Characters:**
1. Add character configuration to `game-config.json`
2. Provide required asset files in appropriate directories
3. No code changes needed - character will automatically appear in all game functionality

### Configuration-Driven System
The game is designed to be fully configurable through a main JSON configuration file:
- Adding new levels by creating level folders and updating config
- Adding new characters by providing assets and config entries
- Removing levels by removing them from config
- Configuring puzzle difficulties and constraints per level
- Setting celebration animation frame counts
- Controlling level availability (game vs debug-only)

**Dynamic Level System:**
- **Level folders**: Each level has its own directory with required assets
- **Asset loading**: Textures and data loaded dynamically from level folders
- **Level discovery**: Game reads configuration to determine available levels
- **Fallback handling**: Graceful degradation when assets are missing

## 4. Game Features

### Difficulty Settings
Chosen at session start and applied to all levels completed during the session:
- **Easy Peasy**: Start with 5 lives, lose 1 point per wrong answer
- **Neutral**: Start with 5 lives, lose 1 point for first wrong answer, 2 points for second
- **Hard Mode**: Start with 3 lives, lose 2 points per wrong answer

### Scoring System
- **Level Score**: Red heart (❤️) - current level progress
- **Cumulative Score**: Black heart (🖤) - session-wide total
- **Display**: Top-left corner during gameplay
- **Game Over**: At 0 level score, shows score breakdown with skull emoji for death level
- **Completion**: After all levels, shows final score breakdown

### Level Structure
**Level Assets:**
- **`grid.csv`**: Maze layout with texture codes
- **`Word-List.txt`**: Educational content for word-emoji puzzles
- **Texture files**: `open.png`, `wall.png`, `endpoint.png`, etc.
- **`celebrate.png`**: Level-specific celebration animation
- **Special textures**: `heart.png`, `bonus.png`, puzzle-specific textures

**Texture System:**
- **Path**: `open.png` (denoted by "o" in grid)
- **Wall**: `wall.png` (denoted by empty space in grid)
- **Endpoint**: `endpoint.png` (denoted by "w" in grid)
- **Hearts**: `heart.png` (denoted by "h" in grid) - Adds 1 point to score, texture changes to open path
- **Bonus**: `bonus.png` (denoted by "b" in grid) - Activates rocket boost mode
- **Puzzles**: Various textures based on puzzle type codes

### Special Features

**Heart Collection:**
- **Grid Code**: "h" | **Texture**: `heart.png`
- **Behavior**: Adds 1 point to score, texture changes to open path

**Bonus/Boost System:**
- **Grid Code**: "b" | **Texture**: `bonus.png`
- **Activation Sequence**:
  1. Modal opens with bonus sprite animation and start button
  2. Background changes to red/yellow/orange gradient
  3. Character sprite changes to bonus version
  4. 30-second countdown begins
  5. Half of maze walls disappear
  6. Timer stops during puzzle modals
  7. Final 5 seconds: background flashes as warning
  8. End modal with return button
  9. Character returns to starting position, walls restore

### Educational Puzzles
All puzzles share common characteristics:
- **Modal-based**: Stay open until correct answer submitted
- **Timer suspension**: Bonus countdown pauses during puzzles
- **Accessibility**: Designed for pre-literate users with limited motor skills
- **Feedback**: Visual thumbs up/down, no text instructions
- **Scoring**: Based on selected difficulty setting

**For current puzzle types**: See `Current-Puzzle-Types.md`
**For adding new puzzles**: See `New-Puzzle-Integration-Instructions.md`

## 5. Technical Implementation & Debug Tools

### Character System Architecture
**Key Components:**
- **ConfigManager**: Handles character configuration loading and validation
- **Character Selection Screen**: Dynamically generates buttons from config
- **Character Sprites**: Supports both SVG and PNG sprite formats
- **Asset Loading**: Asynchronous character sprite loading with fallbacks

**Core Functions:**
- `generateCharacterButtons()`: Creates character selection from config
- `loadCharacterSprites()`: Loads character assets based on selection
- `generateDebugCharacterSelection()`: Creates debug mode character options
- `reloadDebugCelebrationSprites()`: Updates debug sprites when character changes

### Sprite System
**Movement Sprites**: 6-frame horizontal sprite sheets (960x160 pixels)
- Frame 1-2: Right-facing movement | Frame 3-4: Left-facing movement | Frame 5-6: Up/down movement
- **SVG Support**: Uses CSS background positioning for frame extraction
- **PNG Support**: Uses HTML5 Canvas for frame extraction

**Celebration Sprites**: Per-level PNG sprite sheets with configurable frame counts
- **Dynamic Loading**: Based on character and level from config
- **Frame Configuration**: Set via `animation.celebrationFrames` in config
- **Fallback System**: Graceful degradation when sprites unavailable

### Configuration Integration
**Character Config Structure:**
```json
"characterName": {
  "name": "Display Name",
  "movement": "path/to/movement-sprite.svg",
  "celebration": "path/to/celebration.png",
  "gameOver": "path/to/game-over.png",
  "bonus": {
    "9": "path/to/bonus-sprite-level-9.svg",
    "10": "path/to/bonus-sprite-level-10.svg"
  }
}
```

### Debug Mode (Shift+Ctrl+D)
- **Dynamic Character Selection**: Choose any character from config for testing
- **Level jumping**: Direct access to any configured level
- **Celebration Animation Testing**: Preview and control celebration sprites for all levels
- **Difficulty Selection**: Test with Easy, Neutral, or Hard mode settings
- **Real-time Testing**: All debug features respect selected character and difficulty

**Debug Features:**
- **Character-Aware Testing**: Debug mode dynamically loads characters from config
- **Level Testing**: Manual level progression with character-specific assets
- **Animation Preview**: Individual celebration sprite testing with controls
- **Visual Indicators**: Real-time level display and debugging information
- **Performance Testing**: Animation frame rates, texture loading times

## 6. Development Guidelines

### What Not to Change
- **Difficulty UI/Functionality**: Working correctly
- **Scoring UI/Functionality**: Working correctly  
- **Bonus/Boost UI/Mechanics**: Carefully designed, working correctly
- **Puzzle UI/Mechanics**: Designed for accessibility, don't change without permission
- **Visual Feedback**: Thumbs up/down system, timing, colors

### What Can Be Modified
- **Configuration methods**: How puzzles and levels are configured
- **Code organization**: Modularization and cleanup
- **Asset loading**: Dynamic systems and fallbacks
- **Legacy code**: Remove outdated and unused code
- **Hardcoded values**: Replace with configuration-driven values

### Adding/Removing Levels
**Adding New Levels:**
1. Create level folder with required assets
2. Add level entry to main configuration file
3. Level automatically appears in game

**Removing Levels:**
1. Remove level entry from main configuration file
2. Level automatically removed from all game screens

### Development Patterns
**Adding Characters:**
1. Add config entry to `game-config.json`
2. Provide required asset files
3. No code changes needed - fully automatic

**Error Handling:**
- Missing sprites fall back to placeholder graphics
- Missing character configs default to PT
- Console logging for debugging asset loading issues

## 7. Development Roadmap

### Completed Phases

**Phase 1: Web Deployment & Distribution** ✅ **COMPLETED**
- **🎉 LIVE DEPLOYMENT**: https://shira-kam.github.io/pts-maze-adventure/
- **GitHub Repository**: https://github.com/shira-kam/pts-maze-adventure
- **GitHub Pages hosting**: Automatic deployment from main branch
- **No installation required**: All dynamic file loading works seamlessly via HTTPS

**Phase 2: Multi-Character System** ✅ **COMPLETED**
- **Character selection screen**: Added character choice before difficulty selection
- **Sprite system expansion**: Supports multiple character sprite sets (PT, Enderman)
- **Configuration integration**: Fully integrated with `characters` section in game-config.json
- **Dynamic character loading**: Automatic discovery of available characters from config

**Major Refactoring** ✅ **COMPLETED**
- Removed old, unused code and obsolete files (~454 lines removed)
- Updated terminology to reflect config-driven architecture
- Configuration file fully functional and comprehensive
- All systems now use configuration for level determination
- Eliminated legacy hardcoded values and level-specific logic

**Design System Foundation** ✅ **COMPLETED**
- **`styles.css`**: Comprehensive design tokens and component library
- **`design-system.html`**: Interactive showcase and testing page
- **Keyboard shortcut**: `Shift + Ctrl + S` to access design system from game

### Current Phase: Design System Implementation
**Status**: 🔄 **FOUNDATION COMPLETE** - Design system created, ready for implementation

**Implementation Strategy** (Safe, non-breaking approach):
1. **Link styles.css to index.html** - Add stylesheet link without removing existing styles
2. **Gradual component replacement** - Replace existing styles one component type at a time
3. **Remove old styles** - Only after new styles are confirmed working
4. **Extract remaining CSS** - Move all embedded CSS to external file
5. **JS modularization** - Extract functional modules to separate files

### Next Steps & Future Plans

**Immediate Improvements:**
1. **Loading states**: Implement proper loading screens to hide texture fallbacks during asset loading
2. **Design system implementation**: Apply unified design system to replace existing UI styles
3. **Asset optimization**: Optimize images and loading performance
4. **User experience polish**: Address visual inconsistencies and improve transitions

**Phase 3: Configuration Builder Tool** (Planned)
**Objective**: Create a user-friendly configuration builder web application that generates game-config.json files through form-based input, with support for multiple saved configurations for different children and difficulty preferences.

**Features:**
- **Web-based form interface**: HTML/JavaScript configuration builder
- **Non-technical interface**: Simple forms instead of JSON editing
- **Configuration switching**: Easy swapping between child-specific setups
- **Asset validation**: Check for required files and warn about missing assets
- **Export options**: Download JSON, copy to clipboard, or save to browser storage

**Index.html Modularization** (Planned)
**Objective**: Further reduce index.html size by extracting functional modules (~4000 → ~1500-2000 lines)

**Proposed Extraction:**
- **CSS Extraction**: Move all CSS from `<style>` blocks to external file (~300-500 lines)
- **UI Management**: Character/level selection, modal management (~500-800 lines)
- **Game Rendering**: `drawGame()` function and helpers (~300-500 lines)
- **Debug System**: All debug mode functions (~400-600 lines)
- **Score & Progress**: Score calculation and display (~200-300 lines)

## 8. Related Documentation

- **[Current Puzzle Types](Current-Puzzle-Types.md)** - Complete list of implemented puzzle types with details
- **[New Puzzle Integration Instructions](New-Puzzle-Integration-Instructions.md)** - Step-by-step guide for adding new puzzles

---

This documentation reflects the current state and future development roadmap for PT's Maze Adventure as a comprehensive, configuration-driven educational gaming platform.