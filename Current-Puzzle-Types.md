
### Current Puzzle Types

**Puzzle-to-Level Mapping**: All puzzle assignments are controlled by `game-config.json` only. Each level specifies an ordered array of puzzle types in its configuration. The game uses **generic obstacle codes** (`ob1`, `ob2`, etc.) in `grid.csv` files that map to puzzle types based on the configuration array order. Textures are also generic (`obstacle1.png`, `obstacle2.png`, etc.) allowing the same asset files to work with any puzzle type.

**Example**: If Level 1 config has `["number_line", "word_emoji_matching"]`, then `ob1` in the grid maps to number_line puzzles and `ob2` maps to word_emoji puzzles.

#### 1. Word Emoji Matching
- **Word Lists**: Centralized in `word-lists/` directory with difficulty categories:
  - `beginner.txt` - Simple 3-letter words
  - `intermediate.txt` - Expanded vocabulary including 4-letter words  
  - `advanced.txt` - Complex words, compound words, numbers
- **Configuration**: Each level specifies `wordListLevel` property (e.g., "beginner", "intermediate", "advanced")
- **Distractors**: Shared `word-lists/distractors.txt` for all levels
- **Loading**: On-demand with class-level caching - loads once per word list level per session
- **Mechanics**: Show word, select matching emoji from 3 options
- **Wrong Answers**: Must start with same letter/sound as correct answer
- **Word Tracking**: Prevents repetition within level, resets when all words used
- **Fallback**: Built-in hardcoded word list if file loading fails

#### 2. Simple Math Puzzle
- **Configuration**: Main config file
- **Mechanics**: A+B=? or A-B=? with 3 answer options
- **Constraints**: |R-W|<4 for wrong answers to prevent guessing
- **Ranges**: A, B, and C ranges configurable per level

#### 3. Digraph Puzzle
- **Configuration**: Main config file + root directory data files
- **Mechanics**: Show 2-letter combination, select emoji with that sound
- **Audio**: Speaker button for pronunciation hints
- **Data Sources**: `digraph-sounds.txt`, `digraph-emojis.txt`, `emoji-names.txt`
- **Logic**: Avoids similar-sounding wrong answers (SK/SC pairs, PH vs FL/FR sounds)

#### 4. Number Line Puzzle
- **Configuration**: Main config file
- **Mechanics**: A+B=? or A-B=? with visual number line for calculation
- **Extended Form**: Three-term problems (A+B+C, A-B+C, A+B-C)
- **Interaction**: Move PT along number line to calculate answer
- **Answer Options**: 3 choices with same wrong answer constraints as simple math

#### 5. Division Puzzle
- **Configuration**: Main config file
- **Mechanics**: A÷B=? with two-part completion requirement
- **Visual Part**: Distribute A purple dots into B red squares equally
- **Answer Part**: Select correct numerical answer from 3 options
- **Audio**: Speaker button says "[A] divided by [B]"
- **Feedback**: Independent thumbs up/down for each part
- **Constraints**: A÷A limited to A>6, A÷1 limited to A>5

#### 6. Multiplication Puzzle
- **Configuration**: Main config file
- **Mechanics**: A×B=? with two-part completion requirement
- **Visual Part**: Create A groups of B dots OR B groups of A dots
- **Answer Part**: Select correct numerical answer from 3 options
- **Audio**: Speaker button says "[A] groups of [B]"
- **Feedback**: Independent thumbs up/down for each part
- **Constraints**: A×1 limited to A>6

#### 7. Letter Identification Puzzle
- **Configuration**: Main config file
- **Mechanics**: Given a capital letter, select the matching lower case letter and select the matching phonic sound
- **Part 1**: select correct lower case letter out of 3 options
- **Answer Part**: Select correct pronounciation of the letter's sound out of 3 options
- **Audio**: Speaker button play [letter].mp3 for each of the 3 options
- **Feedback**: Independent thumbs up/down for each part
- **Constraints**: Similar sounds filtered out (e.g. j.mp3 is not played as an option for G)
