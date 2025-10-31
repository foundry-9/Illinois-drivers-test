# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Illinois Driver's License Practice Test web application designed for mobile-first, offline-capable learning. The project creates an interactive, encouraging practice environment that helps students master the Illinois permit test through spaced repetition and immediate feedback.

**Key Characteristics:**
- Pure static site (HTML/CSS/vanilla JavaScript) for GitHub Pages deployment
- No backend/API - all data persistence via Browser Local Storage
- Mobile-first design with touch-optimized interactions
- Warm, friendly, encouraging UX with celebration animations

## Project Status

**Current Phase:** Planning complete, implementation not yet started
- Detailed project plan exists in PROJECT_PLAN.md
- Question bank (100 questions) exists in data/qna.json
- No implementation files yet created

## Data Structure

### Question Bank Format (data/qna.json)

Questions follow this structure:
```json
{
  "id": number,
  "category": string,
  "question": string,
  "type": "multiple_choice" | "true_false",
  "options": string[] (for multiple_choice only),
  "correct_answer": string ("a", "b", "c", "d" for multiple_choice; "true"/"false" for true_false),
  "explanation": string
}
```

**Important:** The question bank contains exactly 100 questions across multiple categories. The actual Illinois permit test uses 35 questions.

### Local Storage Schema

The application uses Local Storage with the following structure:

**user:** User profile (name, createdAt, lastVisit)

**questionHistory:** Per-question tracking
```javascript
{
  [questionId]: {
    attempts: number,
    correctCount: number,
    incorrectCount: number,
    lastAttempt: timestamp,
    consecutiveCorrect: number,  // Reset to 0 on incorrect answer
    mastered: boolean,            // Set to true after 2-3 consecutive correct
    firstAttemptCorrect: boolean
  }
}
```

**currentSession:** In-progress test state (questions, currentIndex, responses)

**stats:** Overall statistics (totalAttempts, totalCorrect, currentStreak, categoryBreakdown, etc.)

## Key Implementation Details

### Mastery System

The mastery system is central to the learning approach:
- Questions must be answered correctly **2-3 times consecutively** to be marked as mastered
- Counter resets to 0 on any incorrect answer
- Once mastered, questions can optionally be excluded from future tests (user preference)
- Visual celebration when a question is mastered

### Question Selection Logic

**Practice Mode (35-question tests):**
- Prioritize questions with fewer attempts
- Include mix of categories
- Randomize order
- Optional: exclude already-mastered questions

**Review Mode:**
- Show only questions where `incorrectCount > 0` AND `mastered = false`
- Order by most recent failures or randomize
- Continue until queue is empty

### Mobile Optimizations

- Large tap targets (minimum 44x44px)
- Visual tap feedback
- Fixed bottom navigation for primary actions
- Single-column layout on mobile
- Font sizes 16px minimum for readability

## File Structure

The planned file structure (from PROJECT_PLAN.md) is:
```
/
├── index.html              # Entry point
├── css/
│   ├── style.css          # Main styles
│   ├── animations.css     # Animation effects
│   └── mobile.css         # Mobile-specific overrides
├── js/
│   ├── app.js             # Main application logic
│   ├── storage.js         # Local Storage management
│   ├── questions.js       # Question bank manager
│   ├── quiz.js            # Quiz logic and state
│   ├── ui.js              # UI updates and rendering
│   └── animations.js      # Animation controllers
├── data/
│   └── qna.json           # Question database (existing)
└── images/                # Graphics and icons
```

## Development Workflow

### Testing the Application

Since this is a static site:
1. **Local Development:** Open `index.html` directly in a browser, or use a local server:
   ```bash
   python3 -m http.server 8000
   ```
   Then navigate to `http://localhost:8000`

2. **Test Local Storage:** Use browser DevTools > Application > Local Storage to inspect data

3. **Mobile Testing:** Use browser DevTools device emulation or test on actual devices

### GitHub Pages Deployment

Once implementation is complete:
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings (main branch, root directory)
3. Site will be available at: `https://[username].github.io/[repo-name]/`

No build process is required for this pure static site.

## UX Guidelines

### Tone and Messaging

**Correct Answers:** "Excellent!", "You got it!", "Perfect!", "Great job, [Name]!"
**Incorrect Answers:** "Not quite, but you're learning!", "Close! Let's review this.", "You'll get it next time!"
**Milestones:** "10 in a row - you're crushing it!", "50 questions mastered!"

### Color System

- **Green:** Correct answers, mastery, progress
- **Red (soft):** Incorrect answers (not harsh)
- **Blue:** Navigation, trust, information
- **Yellow/Orange:** Highlights, energy, encouragement
- **Purple:** Achievements, special milestones

### Animation Principles

- Use `transform` and `opacity` for performance (avoid layout thrashing)
- Smooth transitions between questions
- Celebration effects for correct answers (confetti, stars)
- Enhanced celebrations for streaks and mastery achievements

## Important Constraints

1. **No Backend:** All functionality must work client-side only
2. **No Framework:** Use vanilla JavaScript (ES6+) - no React, Vue, etc.
3. **No Build Tools:** No webpack, vite, etc. - pure static files
4. **Accessibility:** Must meet WCAG 2.1 AA standards
5. **Browser Support:** Minimum ES6 support, Local Storage API required

## Development Priorities

When implementing features, follow this priority order:
1. **Phase 1 (MVP):** Core quiz functionality with score tracking
2. **Phase 2:** Missed questions and mastery system
3. **Phase 3:** Polish, animations, and personality
4. **Phase 4:** Statistics, settings, and achievements
5. **Phase 5:** Testing and optimization

## Code Style Preferences

- Use ES6+ features (modules, arrow functions, const/let, template literals)
- Semantic HTML5 throughout
- CSS Custom Properties for theming
- CSS Grid and Flexbox for layout
- Modular JavaScript (one module per concern)

## Testing Considerations

- Test on iOS Safari (primary mobile browser)
- Test with empty Local Storage (first-time user experience)
- Test mastery logic edge cases (consecutive correct counter)
- Test with disabled JavaScript (graceful degradation message)
- Test keyboard navigation and screen reader compatibility
