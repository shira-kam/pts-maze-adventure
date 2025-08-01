# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Project Overview & Setup

"Maze of Marvels" is a sophisticated educational HTML5 Canvas maze game featuring multiple playable characters and an optional intelligent ghost opponent. The game spans 13 levels with progressive difficulty, incorporating multiple educational puzzle types, advanced movement mechanics, comprehensive scoring systems, ghost AI with pathfinding, and extensive debug capabilities. Built as a single-page application with no external dependencies and fully dynamic character support.

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
- **`index.html`**: Core game implementation (~2450 lines) containing HTML, CSS, and main game logic
- **`ghost.js`**: Complete ghost AI system (~1000 lines) with pathfinding, collision detection, and modal interactions
- **`debug-manager.js`**: Extracted debug system (~400 lines) for comprehensive testing and development
- **`styles.css`**: Design system and component styling with CSS custom properties
- **`game-config.json`**: Comprehensive configuration file controlling levels, characters, puzzles, and ghost behavior
- **`config-manager.js`**: Configuration management utility for dynamic loading
- **`game-settings.html`**: Parent settings interface with dynamic configuration loading
- **Level directories** (`level-1/` through `level-13/`): Each contains complete asset sets
- **Educational data files**: `digraph-sounds.txt`, `digraph-emojis.txt`, `distractors.txt`, `emoji-names.txt`
- **Character assets**: Movement sprites, celebration animations, bonus sprites, game over sprites (1.5x scaled)
- **Ghost assets**: `ghost-strong.png`, `ghost-medium.png`, `ghost-weak.png`, modal animation sprites
- **Documentation files**: `Current-Puzzle-Types.md`, `New-Puzzle-Integration-Instructions.md`

### Game States and Flow
1. **Character Selection**: Choose from dynamically loaded characters (PT, Enderman)
2. **Ghost Selection**: Optional ghost opponent with intelligent AI pathfinding
3. **Difficulty Selection**: Easy Peasy/Neutral (5 hearts) vs Hard Mode (3 hearts)
4. **Level Selection**: Interactive grid showing all 13 levels with texture previews
5. **Level Progression**: Player-driven level selection after each completion
6. **Puzzle Interactions**: Modal-based educational challenges
7. **Ghost Mechanics**: AI pathfinding, strength-based skull UI, modal interactions
8. **Special Mechanics**: Rocket boost, heart collection, bonus systems
9. **Completion Screens**: Level celebrations, level selection, final scoring when all complete
10. **Debug Mode**: Comprehensive testing interface (Shift+Ctrl+D activation)

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

### Ghost System
The game features an optional intelligent ghost opponent that adds strategic challenge to educational gameplay:

**Ghost Mechanics:**
- **Optional Gameplay**: Players choose "Ghost" or "No Ghost" after character selection
- **Intelligent AI**: Uses flood-fill pathfinding to optimally chase the player through maze
- **Strength System**: Starts with 5 skulls (☠️☠️☠️☠️☠️), loses 1 per puzzle solved correctly
- **Dynamic Difficulty**: Ghost speed and heart-stealing varies by selected difficulty level
- **Modal Interactions**: Animated sprite sequences when ghost catches player or is defeated

**Ghost Configuration (`game-config.json`):**
```json
"ghost": {
  "enabled": true,
  "globalSettings": {
    "baseSpeed": 1.5,
    "speedByDifficulty": {"easy": 1.1, "neutral": 1.5, "hard": 2.3},
    "heartsStolen": {"easy": 1, "neutral": 2, "hard": 3},
    "puzzlesToWeaken": 1,
    "strengthLevels": 5
  },
  "sprites": {
    "strong": "ghost-strong.png",
    "medium": "ghost-medium.png", 
    "weak": "ghost-weak.png"
  }
}
```

**Ghost Behavior:**
- **Pathfinding**: Flood-fill algorithm finds optimal path to player, avoiding walls and obstacles
- **Pausing**: Movement pauses during puzzle modals and bonus sequences
- **Collision**: When ghost catches player, steals hearts based on difficulty and teleports player to start
- **Weakening**: Each correctly solved puzzle removes one skull and may change ghost sprite
- **Victory Conditions**: Ghost disappears when all 5 skulls removed; player wins that encounter

**Ghost Assets Required:**
- **Sprite files**: `ghost-strong.png`, `ghost-medium.png`, `ghost-weak.png` (40x40 base, scaled 1.5x in-game)
- **Animation sprites**: `character-caught-by-ghost-sprite.png` (16 frames), `ghost-defeated-sprite.png` (10 frames)
- **UI Integration**: Skull display system in game info bar

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

### Generic Obstacle-Based Asset Loading Architecture

**Configuration Structure:**
```json
"levels": {
  "1": {
    "puzzles": [
      {"type": "number_line", "operations": ["addition"]},
      {"type": "word_emoji_matching"}
    ]
  }
}
```

**Key Benefits:**
- **Simplified Level Creation**: Drop in `obstacle1.png`, `obstacle2.png` - no puzzle-specific naming required
- **Dynamic Puzzle Assignment**: Reorder config array to change which puzzle appears where
- **No Hardcoded Mappings**: System works with any puzzle type at any position
- **Future-Proof**: Easy to add new puzzle types or levels without code changes

**Asset Mapping Functions:**
- `getPuzzleMapping(level)` - Returns ordered array of puzzle types for a level
- `getObstacleCode(level, puzzleType)` - Maps puzzle type to grid code (ob1, ob2, etc.)
- `getPuzzleTypeFromObstacle(level, obstacleCode)` - Maps grid code to puzzle type
- `getRequiredTextures(level)` - Returns generic texture names needed for level

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
- **`grid.csv`**: Maze layout with generic obstacle codes
- **`Word-List.txt`**: Educational content for word-emoji puzzles
- **Core textures**: `open.png`, `wall.png`, `endpoint.png`
- **Generic obstacle textures**: `obstacle1.png`, `obstacle2.png`, etc.
- **`celebrate.png`**: Level-specific celebration animation
- **Special textures**: `heart.png`, `bonus.png` (when applicable)

**Generic Obstacle-Based Texture System:**
- **Path**: `open.png` (denoted by "o" in grid)
- **Wall**: `wall.png` (denoted by empty space in grid)
- **Endpoint**: `endpoint.png` (denoted by "w" in grid)
- **Hearts**: `heart.png` (denoted by "h" in grid) - Adds 1 point to score, texture changes to open path
- **Bonus**: `bonus.png` (denoted by "b" in grid) - Activates rocket boost mode
- **Generic Obstacles**: `obstacle1.png`, `obstacle2.png`, etc. (denoted by "ob1", "ob2", etc. in grid)
  - **Dynamic Mapping**: Grid codes map to puzzle types based on level configuration array order
  - **Example**: In level 1, "ob1" → number_line puzzle, "ob2" → word_emoji puzzle
  - **Example**: In level 7, "ob1" → digraph_sounds puzzle, "ob2" → number_line puzzle

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
**Status**: ✅ **EXTRACTED TO SEPARATE MODULE** - All debug functionality moved to `debug-manager.js`

**Debug Features:**
- **Character Selection**: Choose any character from config for testing (PT, Enderman, etc.)
- **Difficulty Settings**: Test with Easy Peasy 🫛, Neutral 😐, or Hard Mode 🙀 with proper heart counts
- **Level Jumping**: Direct access to ALL levels (playable + debug-only), with "(Debug Only)" labels
- **Celebration Animation Testing**: Preview and control celebration sprites using the same animation logic as main game
- **Score Screen Testing**: Direct access to Final Score and Game Over screens for testing
- **Reload Sprites**: Manual sprite reloading for testing character changes

**Technical Architecture:**
- **Modular System**: All debug code extracted to `debug-manager.js` for better organization
- **Dynamic Content**: Automatically discovers levels and characters from `game-config.json`
- **Fallback Support**: Works with hardcoded fallbacks if config loading fails
- **Animation Integration**: Uses existing `calculateFrameProperties()` and `getCelebrationConfig()` functions
- **Debug-Only Levels**: Shows levels with `playable: false` only in debug mode with clear labeling

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

**Adding New Levels (Generic Obstacle System):**
1. **Create level directory**: `level-X/` with required assets
2. **Create grid file**: `grid.csv` using generic codes (`ob1`, `ob2`, etc.)
3. **Add obstacle textures**: `obstacle1.png`, `obstacle2.png`, etc. (generic names)
4. **Update configuration**: Add level entry to `game-config.json`
   ```json
   "X": {
     "playable": true,
     "puzzles": [
       {"type": "puzzle_type_1", ...config...},
       {"type": "puzzle_type_2", ...config...}
     ]
   }
   ```
5. **Array order determines mapping**: First puzzle → ob1, second → ob2, etc.

**Removing Levels:**
1. Remove level entry from `game-config.json`
2. Level automatically removed from all game screens

**Benefits of Generic System:**
- **Same texture files work for any puzzle type**: No need for puzzle-specific naming
- **Easy puzzle reordering**: Change array order in config to change obstacle mapping
- **Consistent asset structure**: All levels use same generic texture naming convention

### Development Patterns
**Adding Characters:**
1. Add config entry to `game-config.json`
2. Provide required asset files
3. No code changes needed - fully automatic

**Error Handling:**
- Missing sprites fall back to placeholder graphics
- Missing character configs default to PT
- Console logging for debugging asset loading issues

## 6.5. Parent Settings Control System

### Overview
The game includes a comprehensive parent settings interface (`game-settings.html`) that allows parents/educators to customize level configurations without editing JSON files directly. This system provides a user-friendly way to tailor the game experience to individual child needs.

### Access Methods
**From Character Selection Screen:**
- **Customize Levels Button**: Opens settings page with selected character pre-configured
- **URL Integration**: Settings page receives character selection via URL parameters
- **Session Storage**: Selected character persists across settings configuration

**Standalone Access:**
- Direct access via `game-settings.html` for configuration testing

### Interface Architecture
**Level Drawer System:**
- **Collapsible drawers**: Each level has its own expandable section
- **Visual indicators**: Level texture previews and current puzzle summaries
- **Playable toggle**: Enable/disable levels with radio buttons
- **Dual puzzle support**: Each level supports up to 2 configurable puzzles

**Puzzle Configuration:**
- **Dynamic dropdown**: Select puzzle type from comprehensive list
- **Puzzle-specific forms**: Each puzzle type generates appropriate configuration controls
- **Real-time updates**: Configuration changes immediately reflected in level summaries
- **Validation**: Input validation with appropriate constraints (e.g., number ranges)

### Technical Implementation
**Dynamic Configuration Loading:**
- **Live Config Fetching**: Settings page loads current `game-config.json` at runtime via `fetch()`
- **Perfect Sync**: Always displays actual current game defaults, never outdated embedded config
- **Automatic Updates**: New levels (like level 13) and puzzle types appear automatically
- **Fallback System**: Graceful degradation to minimal config if loading fails
- **Single Source of Truth**: No more manual sync between game config and settings page

**Configuration Management:**
- **Deep copying**: Preserves original config while allowing modifications
- **Merge strategy**: Only modified levels overwrite default configuration  
- **Session persistence**: Settings maintained during configuration session
- **Validation**: Client-side validation with appropriate constraints

**Parent Communication:**
- **Apply to Game**: Passes customized configuration back to main game
- **Cancel option**: Returns to character selection without applying changes

**Dynamic Form Generation:**
- **Puzzle-specific forms**: Generated based on selected puzzle type
- **Conditional controls**: Show/hide relevant options (e.g., triple equation inputs)
- **Auto-validation**: Real-time constraint enforcement and user feedback
- **Future-proof**: Supports all current and future puzzle types automatically

### Usage Workflow
1. **Parent selects character** in main game
2. **Clicks "Customize Levels"** button
3. **Settings page opens** with character pre-configured
4. **Parent configures levels**:
   - Enable/disable levels as needed
   - Select appropriate puzzle types
   - Adjust difficulty parameters
   - Configure puzzle-specific settings
5. **Parent applies settings** which starts customized game
6. **Child plays** with personalized configuration

### Integration Points
**Character Selection Integration:**
- Settings accessible directly from character selection screen
- Character choice preserved throughout configuration process
- Seamless return to game with both character and configuration applied

**Game Configuration Integration:**
- Settings override default `game-config.json` values
- Maintains all existing configuration structure and validation
- Compatible with all puzzle types and level configurations

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

**Phase 3: Generic Obstacle-Based Asset Loading** ✅ **COMPLETED**
- **Configuration restructure**: Converted puzzle configs from objects to ordered arrays
- **Generic grid codes**: All levels use `ob1`, `ob2`, etc. instead of puzzle-specific codes
- **Generic texture naming**: `obstacle1.png`, `obstacle2.png` instead of `ma.png`, `we.png`, etc.
- **Dynamic puzzle mapping**: Same puzzle type can appear as different obstacles based on config order
- **Asset mapping functions**: New ConfigManager functions for obstacle-to-puzzle translation
- **Simplified level creation**: Level creators use consistent generic asset naming
- **Future-proof architecture**: Easy to reorder puzzles or add new types without code changes

**Phase 4: Ghost System & AI** ✅ **COMPLETED**
- **Intelligent Ghost AI**: Flood-fill pathfinding algorithm for optimal player pursuit
- **Optional Gameplay**: Ghost selection screen allows players to choose with/without ghost
- **Strength-Based Progression**: 5-skull system with visual feedback and weakening mechanics
- **Modal Interactions**: Animated sequences for ghost encounters and victories
- **Difficulty Integration**: Ghost speed and heart-stealing scales with selected difficulty
- **Navigation Flow**: Updated game flow to Character → Ghost → Difficulty → Level → Game
- **Character Scaling**: Both players and ghost scaled to 1.5x size for better visibility
- **Configuration Integration**: Full ghost behavior control via `game-config.json`

**Phase 5: Dynamic Configuration System** ✅ **COMPLETED**
- **Dynamic Config Loading**: Parent settings load live `game-config.json` instead of embedded config
- **Perfect Sync Resolution**: Settings always match current game defaults automatically
- **Level 13 Integration**: All 13 levels now visible and configurable in parent settings
- **Future-Proof Settings**: New levels and puzzle types automatically appear in settings interface
- **Single Source of Truth**: Eliminated manual sync requirements between files
- **Fallback System**: Graceful degradation when config loading fails

### Current Status: Major Features Complete
**Status**: ✅ **STABLE RELEASE** - All major systems implemented and functional

**Current Capabilities:**
- **13 levels** with full educational puzzle integration
- **Multi-character support** (PT, Enderman) with dynamic loading
- **Optional ghost opponent** with intelligent AI pathfinding
- **Parent settings interface** with dynamic configuration
- **Comprehensive scoring** and progress tracking systems
- **Desktop-focused design** optimized for keyboard and mouse interaction
- **Debug mode** for testing and development

### Potential Future Enhancements
**Medium Priority Improvements:**
1. **Mobile responsiveness**: Add responsive design for tablets and phones
2. **Touch controls**: Implement touch-based movement for mobile devices
3. **Design system implementation**: Apply unified styles across remaining components
4. **Performance optimization**: Asset loading and rendering improvements

**Low Priority Additions:**
1. **Additional characters**: Expand character roster with new sprite sets  
2. **Advanced puzzle types**: Add new educational content types
3. **Analytics integration**: Track educational progress and performance

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

**Index.html Modularization** (✅ **PARTIALLY COMPLETE**)
**Status**: Successfully reduced index.html from ~4000 to ~2450 lines (-38% reduction)

**Completed Extractions:**
- ✅ **CSS Extraction**: Moved ~400 lines to `styles.css` with design system integration
- ✅ **Debug System**: Extracted ~400 lines to `debug-manager.js` as complete modular system

**Remaining Modularization Opportunities:**
- **UI Management**: Character/level selection, modal management (~500-800 lines)
- **Game Rendering**: `drawGame()` function and helpers (~300-500 lines)  
- **Score & Progress**: Score calculation and display (~200-300 lines)

**Current Architecture Benefits:**
- **Cleaner main file**: Core game logic easier to navigate and maintain
- **Modular debug system**: Testing functionality in organized separate file
- **Design system**: Consistent styling with CSS custom properties

## 8. Related Documentation

- **[Current Puzzle Types](Current-Puzzle-Types.md)** - Complete list of implemented puzzle types with details
- **[New Puzzle Integration Instructions](New-Puzzle-Integration-Instructions.md)** - Step-by-step guide for adding new puzzles

---

This documentation reflects the current state and future development roadmap for Maze of Marvels as a comprehensive, configuration-driven educational gaming platform.