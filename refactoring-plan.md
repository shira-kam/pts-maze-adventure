# PT's Maze Adventure - Refactoring Plan

## Executive Summary
This document outlines a comprehensive refactoring plan to transform the current monolithic 4800+ line index.html file into a modular, maintainable, and extensible codebase. The primary goal is to eliminate repetitive patterns and make adding new levels a configuration-driven process rather than requiring code changes in multiple scattered locations.

## Current Issues Identified

### 1. Level Configuration Hardcoding
- **Problem**: Level-specific logic scattered throughout code with hardcoded conditionals
- **Examples**: 
  - `if (level === 9 || level === 10)` appears 12+ times
  - Texture loading has hardcoded level ranges
  - Animation timing varies by level with hardcoded checks
- **Impact**: Adding a new level requires touching 8-12 different code locations

### 2. Puzzle System Fragmentation
- **Problem**: Each puzzle type implemented as separate case statements with duplicated logic
- **Examples**:
  - Math puzzles: addition, subtraction, number line, division, multiplication
  - Reading puzzles: word-emoji, digraphs, letter matching
- **Impact**: Adding new puzzle types requires extensive code duplication

### 3. Asset Management Inconsistency
- **Problem**: Asset loading logic scattered across multiple functions with inconsistent patterns
- **Examples**:
  - Texture loading has different conditional branches
  - Sprite management handled in multiple places
  - Cache busting implemented inconsistently
- **Impact**: Asset-related bugs are hard to track and fix

### 4. Animation System Duplication
- **Problem**: Similar animation logic repeated for different sprite types
- **Examples**:
  - Celebration animations
  - Game over animations  
  - Movement animations
  - Debug animations
- **Impact**: Animation bugs need to be fixed in multiple places

### 5. Scoring System Complexity
- **Problem**: Scoring logic intertwined with game state management
- **Examples**:
  - Level score vs cumulative score logic
  - Heart collection mixed with scoring
  - Display updates scattered throughout
- **Impact**: Scoring changes affect multiple unrelated functions

## Refactoring Strategy

### Phase 1: Configuration System (Priority: High)
**Goal**: Create a centralized level configuration system that eliminates hardcoded level logic.

#### Step 1.1: Create Level Configuration Schema
- **File**: `game-config.js` (new)
- **Content**: JSON-like configuration objects for each level
- **Structure**:
  ```javascript
  const LEVEL_CONFIG = {
    1: {
      difficulty: 'beginner',
      features: ['basic_movement'],
      puzzles: {
        math: {
          type: 'simple_arithmetic',
          tracking: {
            preventRepetition: true,
            maxAttempts: 3,
            trackingScope: 'level' // or 'session', 'global'
          }
        },
        reading: {
          type: 'word_emoji_matching',
          tracking: {
            preventRepetition: true,
            usedWords: [], // managed by puzzle class
            trackingScope: 'level'
          }
        }
      },
      assets: {
        textures: ['wall', 'open', 'math', 'reading', 'endpoint'],
        sprites: {
          celebrate: { frames: 20, frameWidth: 200, frameHeight: 200 },
          movement: { frames: 6, frameWidth: 160, frameHeight: 160 }
        },
        bonus: false,
        hearts: false
      },
      animation: {
        celebrationFrames: 20, // EXPLICIT - never 'auto'
        frameDelay: 25
      }
    },
    // ... config for levels 2-10
  }
  ```

#### Step 1.2: Create Configuration Manager
- **File**: `config-manager.js` (new)
- **Functions**: 
  - `getLevelConfig(level)`: Returns config for specific level
  - `hasFeature(level, feature)`: Boolean check for level features
  - `getAssetList(level)`: Returns assets needed for level
  - `getPuzzleConfig(level, type)`: Returns puzzle configuration

#### Step 1.3: Replace Hardcoded Conditionals
- **Target**: Replace all `if (level === X)` with configuration lookups
- **Functions to update**:
  - `loadTextures()`
  - `loadPTBonusSprite()`
  - `initializeGame()`
  - `calculateFrameProperties()`

### Phase 2: Puzzle System Modularization (Priority: High)

#### Step 2.1: Create Base Puzzle Class
- **File**: `puzzle-base.js` (new)
- **Structure**:
  ```javascript
  class BasePuzzle {
    constructor(config, door) { 
      this.config = config;
      this.door = door;
      this.tracking = config.tracking || {};
      this.usedProblems = this.tracking.trackingScope === 'level' ? [] : 
                         this.tracking.trackingScope === 'session' ? sessionStorage : 
                         localStorage;
    }
    generateProblem() { } // Abstract - must implement tracking
    validateAnswer(answer) { } // Abstract  
    render() { } // Abstract
    handleInput(input) { }
    destroy() { }
    
    // Shared tracking methods
    markProblemUsed(problem) { }
    isProblemUsed(problem) { }
    resetTracking() { }
  }
  ```

#### Step 2.2: Create Puzzle Type Classes
- **Files**: 
  - `puzzle-math-simple.js` (addition/subtraction)
  - `puzzle-math-numberline.js` (visual number line)
  - `puzzle-math-division.js` (drag and drop)
  - `puzzle-math-multiplication.js` (grouping)
  - `puzzle-reading-wordmatch.js` (word-emoji)
  - `puzzle-reading-digraph.js` (phonics)

#### Step 2.3: Create Puzzle Factory
- **File**: `puzzle-factory.js` (new)
- **Function**: `createPuzzle(type, config, door)`
- **Maps**: Configuration puzzle types to class constructors

#### Step 2.4: Refactor showPuzzle() Function
- **Goal**: Replace massive switch statement with factory pattern
- **New logic**: 
  ```javascript
  function showPuzzle(door) {
    const config = getLevelConfig(game.selectedDifficulty);
    const puzzleType = config.puzzles[door.type];
    const puzzle = PuzzleFactory.create(puzzleType, config, door);
    puzzle.render();
  }
  ```

### Phase 3: Asset Management System (Priority: Medium)

#### Step 3.1: Create Asset Manager
- **File**: `asset-manager.js` (new)
- **Features**:
  - Centralized loading queue
  - Promise-based loading
  - Automatic cache busting
  - Error handling and fallbacks
  - Loading progress tracking

#### Step 3.2: Create Asset Registry
- **Structure**:
  ```javascript
  const ASSET_REGISTRY = {
    textures: {
      wall: { path: 'level-{level}/wall.png', levels: [1,2,3...] },
      bonus: { path: 'level-{level}/bonus.png', levels: [9,10] }
    },
    sprites: {
      celebrate: { 
        path: 'level-{level}/celebrate.png', 
        levels: [1,2,3...],
        // EXPLICIT frame counts to prevent drift - NEVER calculate automatically
        metadata: {
          1: { frames: 20, frameWidth: 200, frameHeight: 200 },
          3: { frames: 20, frameWidth: 200, frameHeight: 200 },
          8: { frames: 20, frameWidth: 200, frameHeight: 200 },
          10: { frames: 53, frameWidth: 200, frameHeight: 200 }
          // Must be manually specified for each level
        }
      },
      movement: { 
        path: '{character}-sprite.svg', 
        global: true,
        metadata: { frames: 6, frameWidth: 160, frameHeight: 160 }
      },
      bonus: {
        path: '{character}-Bonus-Sprite.svg',
        levels: [9,10],
        metadata: { frames: 6, frameWidth: 160, frameHeight: 160 }
      }
    },
    characters: {
      PT: {
        movement: 'PT-sprite.svg',
        bonus: 'PT-Bonus-Sprite.svg',
        name: 'PT the Elephant'
      },
      // Future characters easily added here
      nephew: {
        movement: 'nephew-sprite.svg',
        bonus: 'nephew-bonus-sprite.svg',
        name: 'Character Name'
      }
    }
  }
  ```

#### Step 3.3: Refactor Loading Functions
- **Replace**: `loadTextures()`, `loadCelebrationSprite()`, `loadPTBonusSprite()`
- **With**: `AssetManager.loadLevel(level)` 

### Phase 4: Animation System Unification (Priority: Medium)

#### Step 4.1: Create Animation Controller
- **File**: `animation-controller.js` (new)
- **Features**:
  - Generic frame-based animation
  - Configurable frame delays
  - **EXPLICIT sprite sheet handling - NO automatic frame calculation**
  - Callback support for completion
  - **CRITICAL**: Uses metadata-specified frame counts and dimensions only

#### Step 4.2: Create Animation Registry
- **Maps**: Animation types to frame configurations
- **Supports**: Variable frame counts, custom delays, looping

#### Step 4.3: Refactor Animation Functions
- **Replace**: `animateCelebration()`, `animateGameOver()`, `animateDebugCelebration()`
- **With**: `AnimationController.play(type, config, canvas)`

### Phase 5: Game State Management (Priority: Low)

#### Step 5.1: Create Game State Manager
- **File**: `game-state.js` (new)
- **Responsibilities**: 
  - Level transitions
  - Score management
  - Save/load game progress
  - Session tracking

#### Step 5.2: Create Event System
- **File**: `event-system.js` (new)
- **Features**:
  - Level completion events
  - Score change events
  - Asset loading events
  - Puzzle completion events

### Phase 6: UI Component System (Priority: Low)

#### Step 6.1: Create UI Components
- **Files**:
  - `modal-component.js` (puzzle modals, transitions)
  - `score-display.js` (dual score system)
  - `level-selector.js` (level grid)

#### Step 6.2: Create UI Manager
- **File**: `ui-manager.js` (new)
- **Coordinates**: All UI component interactions

## Implementation Tracking

### Phase 1: Configuration System
- [x] **Step 1.1**: Create Level Configuration Schema
  - **Files**: `game-config.js`
  - **Status**: Complete
  - **Notes**: Full 10-level configuration with puzzles, assets, animation settings
- [x] **Step 1.2**: Create Configuration Manager  
  - **Files**: `config-manager.js`
  - **Status**: Complete
  - **Notes**: Helper functions for accessing config data, integrated into index.html
- [x] **Step 1.3**: Replace Hardcoded Conditionals
  - **Files**: `index.html` (multiple functions)
  - **Status**: Complete
  - **Notes**: Updated resetGame(), loadTextures(), loadPTBonusSprite(), initializeGame(), debug animations. Fixed heart texture bug.
- [x] **Phase 1 Testing**: Complete all Phase 1 test checklists
  - **Status**: Complete
  - **Last Test Results**: ✅ All levels working, heart textures fixed, rocket boost working 

### Phase 2: Puzzle System Modularization
- [ ] **Step 2.1**: Create Base Puzzle Class
  - **Files**: `puzzle-base.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Step 2.2**: Create Puzzle Type Classes
  - **Files**: `puzzle-math-*.js`, `puzzle-reading-*.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Step 2.3**: Create Puzzle Factory
  - **Files**: `puzzle-factory.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Step 2.4**: Refactor showPuzzle() Function
  - **Files**: `index.html` (showPuzzle function)
  - **Status**: Not started
  - **Notes**: 
- [ ] **Phase 2 Testing**: Complete all Phase 2 test checklists
  - **Status**: Not started
  - **Last Test Results**: 

### Phase 3: Asset Management System
- [ ] **Step 3.1**: Create Asset Manager
  - **Files**: `asset-manager.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Step 3.2**: Create Asset Registry
  - **Files**: Updated `game-config.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Step 3.3**: Refactor Loading Functions
  - **Files**: `index.html` (loading functions)
  - **Status**: Not started
  - **Notes**: 
- [ ] **Phase 3 Testing**: Complete all Phase 3 test checklists
  - **Status**: Not started
  - **Last Test Results**: 

### Phase 4: Animation System Unification
- [ ] **Step 4.1**: Create Animation Controller
  - **Files**: `animation-controller.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Step 4.2**: Create Animation Registry
  - **Files**: Updated `game-config.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Step 4.3**: Refactor Animation Functions
  - **Files**: `index.html` (animation functions)
  - **Status**: Not started
  - **Notes**: 
- [ ] **Phase 4 Testing**: Complete all Phase 4 test checklists
  - **Status**: Not started
  - **Last Test Results**: 

### Phase 5: Game State Management
- [ ] **Step 5.1**: Create Game State Manager
  - **Files**: `game-state.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Step 5.2**: Create Event System
  - **Files**: `event-system.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Phase 5 Testing**: Complete all Phase 5 test checklists
  - **Status**: Not started
  - **Last Test Results**: 

### Phase 6: UI Component System
- [ ] **Step 6.1**: Create UI Components
  - **Files**: `modal-component.js`, `score-display.js`, `level-selector.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Step 6.2**: Create UI Manager
  - **Files**: `ui-manager.js`
  - **Status**: Not started
  - **Notes**: 
- [ ] **Phase 6 Testing**: Complete all Phase 6 test checklists
  - **Status**: Not started
  - **Last Test Results**: 

## Session Progress Log

### Session [Date] - [Phase.Step]
**Goal**: 
**Completed**: 
**Files Modified**: 
**Current State**: 
**Issues Found**: 
**Next Session**: 
**Testing Status**: 

### Session [Date] - [Phase.Step]
**Goal**: 
**Completed**: 
**Files Modified**: 
**Current State**: 
**Issues Found**: 
**Next Session**: 
**Testing Status**:

## Future-Proofing Considerations

### 1. Character Selection System Support
**Current Challenge**: PT hardcoded throughout 50+ locations  
**Solution**: Character abstraction in asset registry
**Future Implementation**: 
```javascript
// Easy to add character selection
const selectedCharacter = 'PT'; // or 'nephew', etc.
AssetManager.loadCharacter(selectedCharacter);
```

### 2. Online Hosting Preparation
**Benefits of Refactoring**:
- **Modular files**: Easier to optimize/minify for web deployment
- **Asset management**: Better caching and loading strategies
- **Configuration-driven**: Easy environment-specific configs
- **No hardcoded paths**: Easier to adapt for CDN/hosting platforms

### 3. Puzzle State Tracking Flexibility
**Current**: Global tracking mixed with game state  
**New**: Puzzle-specific tracking with configurable scopes
**Benefits**: 
- Level-specific tracking (current behavior maintained)
- Session tracking (cross-level persistence) 
- Global tracking (permanent progress) - ready for online accounts

### 4. Sprite/Animation Extensibility
**Current**: Hardcoded frame counts and dimensions scattered throughout code  
**New**: Metadata-driven sprite handling with EXPLICIT frame specifications
**Benefits**:
- Easy to add sprites with different dimensions
- **MANUAL frame specification prevents drift effects**
- Support for variable frame counts per level/character
- Ready for character-specific animations
- **CRITICAL**: No automatic calculation - all frame counts manually specified to ensure pixel-perfect animations

## Expected Benefits

### Immediate Benefits (After Phases 1-2)
1. **New Level Creation**: Change from 8-12 code locations to 1 configuration entry
2. **Puzzle Addition**: Change from 200+ lines of code to extending a base class
3. **Bug Fixes**: Fix in one place instead of multiple scattered locations
4. **Testing**: Isolated components are easier to test

### Long-term Benefits (After All Phases)
1. **Maintainability**: Clear separation of concerns
2. **Extensibility**: Easy to add new features without touching existing code
3. **Debugging**: Isolated systems are easier to debug
4. **Performance**: Optimized loading and rendering systems
5. **Code Quality**: Smaller, focused functions instead of monolithic blocks
6. **Character System**: Drop-in character replacement capability
7. **Hosting Ready**: Optimized structure for web deployment

## Risk Mitigation

### Testing Strategy

#### **Phase 1: Configuration System Testing**

**User Testing (Gameplay):**
- [ ] **Level 1**: Start game, verify it looks normal (no rocket boost effects)
- [ ] **Level 3**: Play through, confirm celebration animation works
- [ ] **Level 8**: Complete level, verify celebration animation works  
- [ ] **Level 9**: Check that rocket boost effects appear (orange background, speed boost)
- [ ] **Level 10**: Verify rocket boost still works, celebration animation plays
- [ ] **All levels**: Textures load correctly (walls, doors, etc. look normal)
- [ ] **Level transitions**: Moving between levels works smoothly

**Technical Testing (Developer):**
- Configuration lookups work correctly
- No console errors
- Hardcoded conditionals properly replaced
- Feature flags function correctly

#### **Phase 2: Puzzle System Testing**

**User Testing (Gameplay):**
- [ ] **Math doors (red)**: Click and solve math problems in different levels
- [ ] **Reading doors (teal)**: Word-emoji matching works
- [ ] **Letter doors (purple)**: Letter matching puzzles work  
- [ ] **Emoji doors (orange)**: Emoji-to-word puzzles work
- [ ] **Puzzle variety**: Play same level multiple times, confirm you don't get identical puzzles repeatedly
- [ ] **Difficulty scaling**: Easy vs Hard math problems are appropriately different
- [ ] **Scoring**: Hearts gained/lost correctly when solving/failing puzzles

**Technical Testing (Developer):**
- Puzzle generation algorithms
- Word list loading
- Tracking system functionality
- Modal display code

#### **Phase 3: Asset Management Testing**

**User Testing (Visual):**
- [ ] **All sprites load**: PT appears correctly in all levels
- [ ] **Celebration animations**: Play correctly without "jumpiness" or weird movement
- [ ] **Textures**: Walls, doors, paths look correct in all levels
- [ ] **Loading speed**: Game doesn't take noticeably longer to load
- [ ] **Visual glitches**: No missing images or broken graphics

**Technical Testing (Developer):**
- Asset loading performance
- Fallback mechanisms
- Cache busting
- Memory usage

#### **Phase 4: Animation System Testing**

**User Testing (Animation Quality):**
- [ ] **PT movement**: Walking animations look smooth (not jerky)
- [ ] **Celebration animations**: Play smoothly without drift or jumping
- [ ] **Rocket boost animations**: PT moves smoothly during speed boost
- [ ] **Animation timing**: Celebrations don't cut off early or run too long

**Technical Testing (Developer):**
- Frame calculation accuracy
- Animation controller functionality
- Callback systems

#### **Phase 5-6: Game State & UI Testing**

**User Testing (Full Experience):**
- [ ] **Complete playthrough**: Start to finish, all levels
- [ ] **Score tracking**: Hearts display correctly throughout
- [ ] **Level progression**: Can advance through all levels normally
- [ ] **Restart functionality**: Game resets properly
- [ ] **Game over screen**: Appears and functions correctly

### Testing Process
1. **Developer implements changes**
2. **Developer performs technical testing**
3. **User performs gameplay testing** using checklists above
4. **User reports issues** in plain language (e.g., "animation looks jumpy")
5. **Developer fixes issues** and repeats until phase passes
6. **Move to next phase**

### Context Loss Management

#### **Session Documentation Strategy**
Each session must end with updating this document with:
1. **Progress Status**: What was completed, what's in-progress
2. **Implementation Notes**: Key decisions made, files created/modified
3. **Current State**: Working/broken, what to test next
4. **Next Steps**: Specific instructions for resuming

#### **Mid-Phase Context Loss Recovery**
**Documentation Required**:
- **Files Modified**: List of all changed files with brief description
- **Current Goal**: What specific task was being worked on
- **Testing Status**: What tests passed/failed, what needs testing
- **Known Issues**: Any bugs or problems encountered
- **Rollback Point**: Last known working state

#### **Between-Phase Context Loss Recovery**
**Self-Contained Phase Documentation**:
- **Phase Completion Checklist**: All items must be checked off
- **New Files Created**: Complete list with purpose of each
- **Refactored Functions**: Which functions were changed and how
- **Testing Results**: All test checklists completed successfully
- **Integration Points**: How this phase connects to others

#### **Quick Context Recovery Protocol**

**For User: When starting new session after context loss, simply say:**
> "Read the Current Status section to get context and continue the refactoring"

**For Claude: Read ONLY these sections in this order:**
1. **Current Status** (bottom of this document) - 30 seconds
2. **Session Progress Log** (most recent entry) - 15 seconds
3. **Implementation Tracking** (current phase only) - 15 seconds

**Total Reading Time: ~1 minute instead of 10+ minutes**

#### **Current Status Section** (Updated at end of each session)
**Current Phase**: [Phase Number and Name]
**Current Step**: [Specific step being worked on]
**Game State**: [Working/Broken/Needs Testing]
**Files Recently Modified**: [List of 2-3 most recent files]
**Immediate Next Task**: [Exact next action to take]
**Context Summary**: [2-3 sentence summary of where we are]

#### **Recovery Commands** (Full recovery if needed)
When resuming after context loss:
1. **Read refactoring-plan.md** - Check current status
2. **Read CLAUDE.md** - Understand project structure
3. **Review git status** - See what files have been modified
4. **Check browser** - Test current game state
5. **Locate last working commit** - For potential rollback

### Rollback Plan
1. **Git branching**: Each phase in separate branch
2. **Working backup**: Keep current working version as fallback
3. **Incremental commits**: Small, atomic changes for easy reversal
4. **Emergency rollback**: Quick revert if anything breaks badly

## Estimated Timeline
- **Phase 1**: 2-3 sessions (high complexity, touches many files)
- **Phase 2**: 3-4 sessions (most complex, many puzzle types)
- **Phase 3**: 2 sessions (moderate complexity)
- **Phase 4**: 1-2 sessions (straightforward refactoring)
- **Phase 5**: 1-2 sessions (new functionality)
- **Phase 6**: 1-2 sessions (UI improvements)

**Total**: 10-15 sessions over multiple days/weeks

---

## CRITICAL CONSTRAINT: Manual Frame Specification

**NEVER use automatic frame calculation** - this causes sprite drift and breaks animations. All frame counts and dimensions must be manually specified in metadata.

**Current Practice**: You manually specify frame counts when asking me to add celebration sprites
**Refactored Practice**: Frame counts stored in configuration metadata, but still manually specified

**Example**:
```javascript
// CORRECT - explicit specification
metadata: { frames: 53, frameWidth: 200, frameHeight: 200 }

// WRONG - automatic calculation (causes drift)
metadata: { frames: 'auto', dimensions: 'auto' }
```

---

## CURRENT STATUS (Updated Each Session)

**Current Phase**: Phase 1 - Configuration System COMPLETE ✅
**Current Step**: Ready to begin Phase 2 - Puzzle System Modularization
**Game State**: Working - All Phase 1 tests passed
**Files Recently Modified**: game-config.js (complete), config-manager.js (complete), index.html (updated with config integration)
**Immediate Next Task**: Begin Phase 2, Step 2.1 - Create Base Puzzle Class
**Context Summary**: Phase 1 complete! Successfully created comprehensive configuration system, replaced hardcoded level logic with config-driven approach, fixed heart texture bug, and passed all testing. Game is working perfectly with new modular configuration system.

**Last Updated**: 2025-01-15
**Session Notes**: Completed Phase 1 by replacing hardcoded conditionals with configuration manager calls. Updated 6 key functions to use configuration system. All levels working correctly.