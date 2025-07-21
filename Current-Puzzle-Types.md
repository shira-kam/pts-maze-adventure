
### Current Puzzle Types

**Important**: Puzzle types are **dynamically assigned to levels** via `game-config.json`. There are no hardcoded level-to-puzzle mappings. Each level's `grid.csv` file contains puzzle type codes that determine which puzzles appear in that level.

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
- **Logic**: Avoids similar-sounding wrong answers (SK/SC pairs, PH vs FL/FR sounds)

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

#### 7. Letter Identification Puzzle
- **Grid Code**: "li"
- **Texture**: `li.png`
- **Configuration**: Main config file
- **Mechanics**: Given a capital letter, select the matching lower case letter and select the matching phonic sound
- **Part 1**: select correct lower case letter out of 3 options
- **Answer Part**: Select correct pronounciation of the letter's sound out of 3 options
- **Audio**: Speaker button play [letter].mp3 for each of the 3 options
- **Feedback**: Independent thumbs up/down for each part
- **Constraints**: Similar sounds filtered out (e.g. j.mp3 is not played as an option for G)
