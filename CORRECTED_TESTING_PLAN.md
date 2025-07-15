# 🧪 CORRECTED Testing Plan for Modular Simple Math Puzzle

## **LEVEL 1 TESTING** (Start here)

### 1. **Basic Functionality Test**
- **Action**: Start game, select Level 1, move PT to a red math door
- **Expected**: 
  - Modal opens with math problem as title (e.g., "5 + 3 = ?")
  - 3 buttons with numbers 1-12
  - Console shows: "Using modular simple math puzzle for level 1"

### 2. **Correct Answer Test**
- **Action**: Click the correct answer button
- **Expected**: 
  - Green thumbs up (👍) appears for ~800ms
  - Modal closes automatically
  - Door opens and turns light green
  - Score increases by 1 point
  - Can walk through the door

### 3. **Wrong Answer Test**
- **Action**: Click a wrong answer button
- **Expected**:
  - Red thumbs down (👎) appears for ~1500ms
  - Wrong button becomes disabled and gray
  - Score decreases (amount depends on difficulty)
  - Modal stays open, other buttons still clickable

### 4. **Multiple Wrong Answers Test**
- **Action**: Click 1 wrong answer, then another wrong answer, then the correct one
- **Expected**:
  - Each wrong answer: thumbs down, button disabled, score penalty
  - Correct answer: thumbs up, modal closes, door opens
  - Final score = +1 - (penalty × 2)

### 5. **Button Disabling Test**
- **Action**: Click both wrong answers, leaving only correct answer
- **Expected**:
  - Both wrong buttons disabled and grayed out
  - Only correct button remains clickable
  - Clicking correct button works normally

## **LEVEL 2 & 3 TESTING** (Same tests as Level 1)

### 6. **Level 2 Functionality**
- **Action**: Select Level 2, test math door
- **Expected**: Same behavior as Level 1

### 7. **Level 3 Functionality**
- **Action**: Select Level 3, test math door  
- **Expected**: Same behavior as Level 1

## **INTEGRATION TESTING** (Critical!)

### 8. **Other Puzzle Types Still Work**
- **Action**: Test reading doors (teal), letter doors (purple), emoji doors (orange)
- **Expected**: All use original system, work exactly as before

### 9. **Higher Level Math Doors**
- **Action**: Test Level 4+ math doors
- **Expected**: Use original system (number line puzzles), work exactly as before

---

## ✅ Success Criteria

The test passes if Level 1-3 math puzzles work identically to the original with no visible changes to user experience.

**Start with Level 1 and let me know how it goes!**