# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an educational maze game called "Elephant Maze Adventure" built as a single-page HTML5 Canvas application. The game features two character options (Elephant and Enderman) with three difficulty levels each, incorporating educational puzzles (math, reading, letter matching) that players must solve to unlock doors in dynamically loaded mazes.

## Architecture

### Core Components
- **index.html**: Main game file containing all HTML, CSS, JavaScript, and game logic
- **maze-generator.js**: Utility script for parsing CSV maze data into JavaScript arrays (development tool)
- **Level directories** (`level-1/`, `level-2/`, `level-3/`): Each contains:
  - `grid.csv`: Maze layout with door types and paths
  - `Word-List.txt`: Word-emoji pairs for reading puzzles

### Game Structure
The game uses a state-based architecture with these main states:
1. Level selection (character choice)
2. Difficulty selection  
3. Game play with puzzle modals
4. Celebration screen
5. Game over screen

### Dynamic Content Loading
- Mazes are loaded from CSV files via `loadMazeFromCSV()` 
- Word lists are loaded from text files via `loadWordListFromFile()`
- Both have fallback embedded data if file loading fails
- Celebration sprites are loaded dynamically based on character and difficulty

### CSV Maze Format
Grid cells use single-character codes:
- `o`: Open path
- `m`: Math door (red)
- `r`: Reading door (teal)
- `r1`: Letter matching door (purple)
- `r2`: Emoji-to-word door (orange)  
- `s`: Sorting door (yellow, not implemented)
- `w`: Watering hole (goal)
- Empty: Wall

### Sprite System
- Movement sprites: SVG sprite sheets with 6 frames (160x160 each)
- Celebration sprites: PNG sheets with variable frame counts and layouts
- Character sprites are loaded based on selected level (1=Elephant, 2=Enderman)

## Development Notes

### Running the Game
Open `index.html` directly in a web browser. No build process or server required.

### Testing
Manual testing only - play through different levels and difficulties to verify:
- Maze loading from CSV files
- Word list loading and puzzle generation
- Character animations and sprite loading
- Scoring system and game progression

### Adding New Levels
1. Create new level directory (e.g., `level-4/`)
2. Add `grid.csv` with maze layout using the character codes above
3. Add `Word-List.txt` with format: `WORD EMOJI,` (one per line)
4. Add celebration sprites for both characters if needed
5. Update difficulty selection logic in `selectDifficulty()`

### Modifying Puzzles
Puzzle logic is in `showPuzzle()` function with separate cases for each door type:
- `math`: Addition/subtraction with difficulty-based limits
- `reading`: Word-to-emoji matching
- `reading1`: Lowercase-to-uppercase letter matching  
- `reading2`: Emoji-to-word matching

### File Loading
The game dynamically fetches CSV and text files with cache-busting parameters. Files are loaded asynchronously with Promise.all() in `initializeGame()`.