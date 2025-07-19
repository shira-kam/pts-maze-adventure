# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
"PT's Maze Adventure" is a sophisticated educational HTML5 Canvas maze game featuring multiple playable characters. The game spans 10 levels with progressive difficulty, incorporating multiple educational puzzle types, advanced movement mechanics, comprehensive scoring systems, and extensive debug capabilities. Built as a single-page application with no external dependencies and fully dynamic character support.

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
- **`game-config.json`**: Comprehensive configuration file controlling levels, characters, and puzzles
- **`config-manager.js`**: Configuration management utility for dynamic loading
- **Level directories** (`level-1/` through `level-10/`): Each contains complete asset sets
- **Educational data files**: `digraph-sounds.txt`, `digraph-emojis.txt`, `distractors.txt`, `emoji-names.txt`
- **Character assets**: Movement sprites, celebration animations, bonus sprites, game over sprites

### Game States and Flow
1. **Character Selection**: Choose from dynamically loaded characters
2. **Difficulty Selection**: Easy Peasy/Neutral (5 hearts) vs Hard Mode (3 hearts)
3. **Level Selection**: Interactive grid showing all levels with texture previews
4. **Level Progression**: Player-driven level selection after each completion
5. **Puzzle Interactions**: Modal-based educational challenges
6. **Special Mechanics**: Rocket boost, heart collection, bonus systems
7. **Completion Screens**: Level celebrations, level selection, final scoring when all complete
8. **Debug Mode**: Comprehensive testing interface (Shift+Ctrl+D activation)

## Dynamic Character System

### Character Support
The game features a fully dynamic character system that supports multiple playable characters:

**Current Characters:**
- **PT the Elephant**: Original character with full asset set
- **Enderman**: Dark mysterious character with complete animation support

**Character Assets Required:**
- **Movement sprite**: 6-frame sprite sheet (960x160 pixels, SVG or PNG)
- **Celebration sprites**: Per-level celebration animations (PNG sprite sheets)
- **Game over sprite**: Character-specific game over animation
- **Bonus sprites**: Rocket boost mode sprites for levels 9-10

### Adding New Characters
To add a new character, simply:

1. **Add character configuration** to `game-config.json`:
```json
"NewCharacter": {
  "name": "Character Display Name",
  "movement": "NewCharacter-sprite.svg",
  "celebration": "NewCharacter-celebrate.png",
  "gameOver": "NewCharacter-game-over.png",
  "bonus": {
    "9": "level-9/NewCharacter-Bonus-Sprite.svg",
    "10": "level-10/NewCharacter-Bonus-Sprite.svg"
  },
  "description": "Character description for display"
}
```

2. **Provide required assets** in appropriate directories
3. **No code changes needed** - character will automatically appear in:
   - Character selection screen with sprite preview
   - Debug mode character selection
   - All gameplay functionality (movement, celebration, game over, bonus)

### Character Selection Flow
- **Character Selection Screen**: First screen, dynamically loads available characters
- **Sprite Preview**: Shows last frame of movement sprite for character identification
- **Dynamic Loading**: Character sprites loaded asynchronously before gameplay
- **Debug Integration**: Debug mode includes character selection with celebration testing

## Configuration-Driven System

### Main Configuration File
The game is designed to be fully configurable through a main JSON configuration file. This allows:
- Adding new levels by creating level folders and updating config
- Adding new characters by providing assets and config entries
- Removing levels by removing them from config
- Configuring puzzle difficulties and constraints per level
- Setting celebration animation frame counts
- Controlling level availability (game vs debug-only)

### Dynamic Level System
- **Level folders**: Each level has its own directory with required assets
- **Asset loading**: Textures and data loaded dynamically from level folders
- **Level discovery**: Game reads configuration to determine available levels
- **Fallback handling**: Graceful degradation when assets are missing

## Difficulty Settings

### User Selection
Chosen at session start and applied to all levels completed during the session:

- **Easy Peasy**: Start with 5 lives, lose 1 point per wrong answer
- **Neutral**: Start with 5 lives, lose 1 point for first wrong answer, 2 points for second
- **Hard Mode**: Start with 3 lives, lose 2 points per wrong answer

### Implementation Status
✅ **WORKING CORRECTLY** - Only modify if necessary due to refactoring

## Scoring System

### Score Tracking
- **Level Score**: Red heart (❤️) - current level progress
- **Cumulative Score**: Black heart (🖤) - session-wide total
- **Display**: Top-left corner during gameplay
- **Game Over**: At 0 level score, shows score breakdown with skull emoji for death level
- **Completion**: After all levels, shows final score breakdown

### Implementation Status
✅ **WORKING CORRECTLY** - Only modify to make screens dynamic

## Level Structure

### Level Assets
Each level directory contains:
- **`grid.csv`**: Maze layout with texture codes
- **`Word-List.txt`**: Educational content for word-emoji puzzles
- **Texture files**: `open.png`, `wall.png`, `endpoint.png`, etc.
- **`celebrate.png`**: Level-specific celebration animation
- **Special textures**: `heart.png`, `bonus.png`, puzzle-specific textures

### Texture System
Dynamic texture loading based on grid CSV and configuration:
- **Path**: `open.png` (denoted by "o" in grid)
- **Wall**: `wall.png` (denoted by empty space in grid)
- **Endpoint**: `endpoint.png` (denoted by "w" in grid)
- **Hearts**: `heart.png` (denoted by "h" in grid)
- **Bonus**: `bonus.png` (denoted by "b" in grid)
- **Puzzles**: Various textures based on puzzle type codes

### Implementation Status
🔄 **IN PROGRESS** - Creating dynamic texture loading system

### Future Texture System Enhancements
**Note**: Current texture system works well. These improvements are for future consideration:

1. **Better Texture Fallback System**
   - Config-specified fallback levels when textures fail to load
   - Robust error handling for missing assets
   - Asset validation during development

2. **Grid-Based Texture Discovery**
   - Scan grid.csv to determine which puzzle textures are actually needed
   - Eliminate loading unused puzzle textures per level
   - Dynamic texture requirements based on actual maze content

3. **Asset Bundle Validation**
   - Development-time checking for level completeness
   - Missing asset detection and reporting
   - Minimum asset requirements for level playability

4. **Enhanced Error Handling**
   - Graceful degradation when texture files are missing
   - Better logging and debugging for texture loading issues
   - Automatic fallback to color-based rendering when needed

These improvements maintain the current `level-${number}` folder structure and numbered level system that works well for pre-literate users.

## Special Features

### Heart Collection
- **Grid Code**: "h"
- **Texture**: `heart.png`
- **Behavior**: Adds 1 point to score, texture changes to open path
- **Implementation**: ✅ Working correctly

### Bonus/Boost System
- **Grid Code**: "b"
- **Texture**: `bonus.png`
- **Activation Sequence**:
  1. Modal opens with bonus sprite animation and start button
  2. Background changes to red/yellow/orange gradient
  3. PT sprite changes to bonus version
  4. 30-second countdown begins
  5. Half of maze walls disappear
  6. Timer stops during puzzle modals
  7. Final 5 seconds: background flashes as warning
  8. End modal with return button
  9. PT returns to starting position, walls restore

### Implementation Status
✅ **WORKING CORRECTLY** - Do not change UI or functionality

## Educational Puzzles

### Puzzle Framework
All puzzles share common characteristics:
- **Modal-based**: Stay open until correct answer submitted
- **Timer suspension**: Bonus countdown pauses during puzzles
- **Accessibility**: Designed for pre-literate users with limited motor skills
- **Feedback**: Visual thumbs up/down, no text instructions
- **Scoring**: Based on selected difficulty setting

### Current Puzzle Types

#### 1. Word Emoji Matching
- **Grid Code**: "we"
- **Texture**: `we.png`
- **Configuration**: `Word-List.txt` in level folder
- **Mechanics**: Show word, select matching emoji from 3 options
- **Wrong Answers**: Must start with same letter/sound as correct answer
- **Fallback**: Uses `distractors.txt` when insufficient options

#### 2. Simple Math Puzzle
- **Grid Code**: "ma"
- **Texture**: `ma.png`
- **Configuration**: Main config file
- **Mechanics**: A+B=? or A-B=? with 3 answer options
- **Constraints**: |R-W|<4 for wrong answers to prevent guessing
- **Ranges**: A, B, and C ranges configurable per level

#### 3. Digraph Puzzle
- **Grid Code**: "ds"
- **Texture**: `ds.png`
- **Configuration**: Main config file + root directory data files
- **Mechanics**: Show 2-letter combination, select emoji with that sound
- **Audio**: Speaker button for pronunciation hints
- **Data Sources**: `digraph-sounds.txt`, `digraph-emojis.txt`, `emoji-names.txt`
- **Logic**: Avoids similar-sounding wrong answers (e.g., PH vs F sounds)

#### 4. Number Line Puzzle
- **Grid Code**: "nl"
- **Texture**: `nl.png`
- **Configuration**: Main config file
- **Mechanics**: A+B=? or A-B=? with visual number line for calculation
- **Extended Form**: Three-term problems (A+B+C, A-B+C, A+B-C)
- **Interaction**: Move PT along number line to calculate answer
- **Answer Options**: 3 choices with same wrong answer constraints as simple math

#### 5. Division Puzzle
- **Grid Code**: "dv"
- **Texture**: `dv.png`
- **Configuration**: Main config file
- **Mechanics**: A÷B=? with two-part completion requirement
- **Visual Part**: Distribute A purple dots into B red squares equally
- **Answer Part**: Select correct numerical answer from 3 options
- **Audio**: Speaker button says "[A] divided by [B]"
- **Feedback**: Independent thumbs up/down for each part
- **Constraints**: A÷A limited to A>6, A÷1 limited to A>5

#### 6. Multiplication Puzzle
- **Grid Code**: "mg"
- **Texture**: `mg.png`
- **Configuration**: Main config file
- **Mechanics**: A×B=? with two-part completion requirement
- **Visual Part**: Create A groups of B dots OR B groups of A dots
- **Answer Part**: Select correct numerical answer from 3 options
- **Audio**: Speaker button says "[A] groups of [B]"
- **Feedback**: Independent thumbs up/down for each part
- **Constraints**: A×1 limited to A>6

### Implementation Status
🔄 **PARTIALLY MODULARIZED** - Remove legacy unused puzzles, complete configuration system

## Debug and Testing Features

### Debug Mode (Shift+Ctrl+D)
- **Dynamic Character Selection**: Choose any character from config for testing
- **Level jumping**: Direct access to any level 1-10
- **Celebration Animation Testing**: Preview and control celebration sprites for all levels
- **Difficulty Selection**: Test with Easy, Neutral, or Hard mode settings
- **Real-time Testing**: All debug features respect selected character and difficulty

### Debug Features
- **Character-Aware Testing**: Debug mode dynamically loads characters from config
- **Level Testing**: Manual level progression with character-specific assets
- **Animation Preview**: Individual celebration sprite testing with controls
- **Visual Indicators**: Real-time level display and debugging information
- **Performance Testing**: Animation frame rates, texture loading times

### Testing Capabilities
- **Manual Testing Workflow**: Level progression, puzzle validation, sprite loading
- **Educational Testing**: Puzzle generation, content validation, speech synthesis
- **Character Testing**: Movement, celebration, game over, and bonus sprite validation
- **Dynamic Asset Testing**: Texture loading, fallback systems, cache validation

### Implementation Status
✅ **FULLY DYNAMIC** - All debug features now use configuration-driven character and level systems

## Technical Implementation

### Character System Architecture
The character system is built on a fully dynamic foundation:

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
- Frame 1-2: Right-facing movement
- Frame 3-4: Left-facing movement  
- Frame 5-6: Up/down movement
- **SVG Support**: Uses CSS background positioning for frame extraction
- **PNG Support**: Uses HTML5 Canvas for frame extraction

**Celebration Sprites**: Per-level PNG sprite sheets with configurable frame counts
- **Dynamic Loading**: Based on character and level from config
- **Frame Configuration**: Set via `animation.celebrationFrames` in config
- **Fallback System**: Graceful degradation when sprites unavailable

### Configuration Integration
**Character Config Structure**:
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

**Dynamic Discovery**: Game automatically detects available characters from config
**Asset Paths**: Supports both absolute and relative paths for character assets
**Validation**: ConfigManager provides fallback handling for missing character data

### Development Patterns
**Adding Characters**: 
1. Add config entry to `game-config.json`
2. Provide required asset files
3. No code changes needed - fully automatic

**Character Selection Flow**:
1. User selects character → `game.selectedCharacter` updated
2. Difficulty selection → Character sprites loaded via `loadCharacterSprites()`
3. Level gameplay → Character sprites used for movement, celebration, game over
4. Debug mode → Character selection dynamically populated from config

**Error Handling**:
- Missing sprites fall back to placeholder graphics
- Missing character configs default to PT
- Console logging for debugging asset loading issues

## Refactoring Goals

### Refactoring Status: ✅ **COMPLETE**
The major refactoring goals have been achieved:
- ✅ Removed old, unused code and obsolete files
- ✅ Updated terminology to reflect config-driven architecture  
- ✅ Configuration file fully functional and comprehensive
- ✅ All systems now use configuration for level determination
- ✅ Eliminated legacy hardcoded values and level-specific logic

### Target State
- **Dynamic Configuration**: JSON-driven level and puzzle configuration
- **Modular Puzzles**: Each puzzle type in separate, configurable modules
- **Clean Codebase**: Remove all legacy and unused code
- **Flexible Level System**: Add/remove levels by folder + config changes only
- **Consistent Architecture**: All systems refer to main configuration file

### Priority Areas
1. **Main Configuration File**: Create properly structured JSON config
2. **Puzzle Modularization**: Complete transition to configurable puzzle modules
3. **Dynamic Screens**: Level selection, scoring, debug mode all read from config
4. **Asset Management**: Robust dynamic loading with proper fallbacks
5. **Code Cleanup**: Remove hardcoded values, outdated concepts, unused code

## Development Guidelines

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

### Adding New Levels
Target workflow:
1. Create level folder with required assets
2. Add level entry to main configuration file
3. Level automatically appears in game

### Removing Levels
Target workflow:
1. Remove level entry from main configuration file
2. Level automatically removed from all game screens

## Future Development Goals

### Phase 1: Web Deployment & Distribution
**Status**: ✅ **COMPLETED** | **Feasibility**: ⭐⭐⭐⭐⭐ (Excellent)

**Objective**: Deploy PT's Maze Adventure as a web-accessible game with both live URL access and downloadable distribution options for offline use.

**🎉 LIVE DEPLOYMENT**: https://shira-kam.github.io/pts-maze-adventure/

**Implementation Completed**:
- ✅ **GitHub Repository**: https://github.com/shira-kam/pts-maze-adventure
- ✅ **GitHub Pages hosting**: Automatic deployment from main branch
- ✅ **Simple URL sharing**: Direct link access for immediate play
- ✅ **No installation required**: All dynamic file loading works seamlessly via HTTPS

**Technical Benefits Achieved**:
- ✅ Eliminated local server requirement for end users
- ✅ Same-origin policy allows all CSV/image/config loading to work normally
- ✅ Automatic updates when repository is updated
- ✅ Professional hosting with CDN performance

**Deployment Workflow Established**:
- Local development → Git commit → Evaluate push strategy → Push to GitHub → Automatic live update
- **IMPORTANT**: Always commit changes locally, but evaluate push strategy before deploying to live version

**Push Strategy Guidelines**:
- **Push immediately**: Documentation updates, asset files, configuration tweaks (safe, improves repo)
- **Test first, then push**: Bug fixes, small improvements, feature enhancements (verify locally before deployment)
- **Batch for major releases**: New puzzle types, character systems, major refactoring (coordinate larger releases)
- **Pre-backlog consideration**: Evaluate push strategy before implementing backlog items to ensure appropriate deployment timing

**Priority**: ✅ Complete - Game successfully deployed and accessible

### Phase 2: Multi-Character System
**Status**: ✅ **COMPLETED** | **Feasibility**: ⭐⭐⭐⭐ (Very Good)

**Objective**: ✅ Implemented a multi-character system allowing selection of different animal characters, each with unique movement sprites, celebration animations, and bonus sprites, all configurable through the JSON system.

**Implementation Completed**:
- ✅ **Character selection screen**: Added character choice before difficulty selection
- ✅ **Sprite system expansion**: Supports multiple character sprite sets (PT, Enderman)
- ✅ **Configuration integration**: Fully integrated with `characters` section in game-config.json
- ✅ **Dynamic character loading**: Automatic discovery of available characters from config

**Character System Features Implemented**:
- ✅ **Movement sprites**: Character-specific sprite loading (SVG and PNG support)
- ✅ **Celebration animations**: Unique celebrate.png sheets per character per level
- ✅ **Bonus sprites**: Character-specific bonus sprites for levels 9-10
- ✅ **Debug integration**: Character selection in debug mode with celebration testing
- ✅ **Personalization**: Different characters available (PT the Elephant, Enderman)

**Technical Implementation Completed**:
- ✅ Dynamic texture loading system for character-specific assets
- ✅ Sprite animation system uses selected character throughout gameplay
- ✅ Character persistence across game sessions
- ✅ Full backward compatibility with existing PT assets
- ✅ Graceful fallback handling for missing character assets

**Priority**: ✅ Complete - System fully functional and integrated

### Phase 3: Configuration Builder Tool
**Status**: Planned | **Feasibility**: ⭐⭐⭐⭐⭐ (Excellent)

**Objective**: Create a user-friendly configuration builder web application that generates game-config.json files through form-based input, with support for multiple saved configurations for different children and difficulty preferences.

**Implementation Approach**:
- **Web-based form interface**: HTML/JavaScript configuration builder
- **JSON generation**: Real-time preview and export of game-config.json
- **Configuration management**: Load, save, duplicate, and export multiple configs
- **Child-specific presets**: Templates optimized for different ages/abilities

**Builder Features**:
- **Level configuration**: Add/remove levels, set puzzle types and difficulties
- **Character management**: Select characters and associate sprite assets
- **Puzzle customization**: Configure math ranges, word lists, and constraints
- **Asset validation**: Check for required files and warn about missing assets
- **Export options**: Download JSON, copy to clipboard, or save to browser storage

**User Experience**:
- **Non-technical interface**: Simple forms instead of JSON editing
- **Configuration switching**: Easy swapping between child-specific setups
- **Preview system**: Test configurations before deployment
- **Import/export**: Share configurations with other educators

**Technical Architecture**:
- **Standalone web app**: Separate from main game for modularity
- **Browser-based**: No server required, works offline
- **JSON validation**: Ensure generated configs are valid and complete
- **Integration ready**: Generated configs work seamlessly with main game

**Priority**: Medium-High - Dramatically improves accessibility for non-technical users

## Development Roadmap

### Immediate (Current Session)
- ✅ Complete core refactoring to configuration-driven architecture
- ✅ Fix multiplication puzzle scoring and audio features  
- ✅ Enhance debug mode with level navigation and difficulty selection

### Next Steps (Improvements & Polish)
1. **Loading states**: Implement proper loading screens to hide texture fallbacks during asset loading
2. **Boost mode modal fix**: Prevent boost end modal from showing if user reaches level endpoint during/before timer expiry (conflicts with celebration animation)
3. ~~**Config cleanup**: Remove redundant celebration frame data (currently duplicated in assets.celebration.frames and animation.celebrationFrames)~~ ✅ **COMPLETED**
4. **Design system**: Create unified design system for buttons, text styles, colors, and implement throughout UI
5. **Asset optimization**: Optimize images and loading performance
6. **User experience polish**: Address visual inconsistencies and improve transitions
7. **Distribution**: Create downloadable releases for offline use

### Future Enhancements (Phase 3)
1. **Configuration builder**: User-friendly JSON generation tool
2. **Advanced features**: Additional puzzle types, accessibility improvements

This documentation reflects the current state and future development roadmap for PT's Maze Adventure as a comprehensive, configuration-driven educational gaming platform.