# First-Time User Experience (FTUE) Testing Guide

## Overview

The first-time user experience is critical to user retention and satisfaction. This guide provides comprehensive testing procedures for onboarding new users.

---

## 1. Clean Slate Testing

### 1.1 Brand New User (No LocalStorage)

**Setup:**
1. Open app in incognito/private mode (no cookies or storage)
2. Or manually delete all localStorage: `localStorage.clear()`
3. Reload page

**Expected Flow:**

```
1. Loading screen appears
   ✓ Message: "Loading your practice test..."
   ✓ Spinner animates
   ✓ Disappears after 1-2 seconds

2. Welcome screen appears
   ✓ Title: "🚗 Illinois Driver Test Prep"
   ✓ Subtitle: "Master the Illinois permit test..."
   ✓ Large car emoji illustration
   ✓ "What's your first name?" input field
   ✓ "Let's Get Started! →" button
   ✓ Features list shows 4 items

3. No automatic navigation
   ✓ Stays on welcome until user enters name
```

**Test Procedure:**

```javascript
// Clear all data
localStorage.clear();
sessionStorage.clear();

// Reload
location.reload();

// Should see welcome screen
```

**Checklist:**
- [ ] Welcome screen appears
- [ ] No errors in console
- [ ] Loading screen shows briefly
- [ ] No dashboard visible
- [ ] Input field is focused (cursor visible)

### 1.2 Name Input Validation

**Test Case: User doesn't enter name**

**Steps:**
1. On welcome screen
2. Leave name input empty
3. Click "Let's Get Started!"

**Expected Result:**
```
✓ Alert appears: "Please enter your name"
✓ Stays on welcome screen
✓ Name input still visible and focused
✓ Can try again
```

**Test Case: User enters name**

**Steps:**
1. On welcome screen
2. Type name: "Sarah"
3. Click "Let's Get Started!"
4. OR Press Enter key

**Expected Result:**
```
✓ Dashboard appears
✓ Greeting: "Welcome back, Sarah!"
✓ Stats show 0 attempts, 0% accuracy, 0 mastered
✓ "Start Practice Test" button ready
```

**Test Case: Various name inputs**

- [ ] Short name: "Jo" → ✓ Accepted
- [ ] Long name: "Alexander Robert Christopher" → ✓ Accepted
- [ ] Name with numbers: "User123" → ✓ Accepted
- [ ] Name with special chars: "José" → ✓ Accepted (UTF-8)
- [ ] Max length (50 chars): Works but caps input
- [ ] Unicode emoji: "👤Test" → ✓ Works

**Test Case: Name with spaces**

- [ ] Leading spaces: "  Sarah" → Trimmed
- [ ] Trailing spaces: "Sarah  " → Trimmed
- [ ] Middle spaces: "Sarah Jane" → ✓ Accepted

---

## 2. First Data Creation

### 2.1 Initial Data Structure

**After name entry, verify localStorage contains:**

```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('il_driver_test_user')));

// Expected output:
{
  "name": "Sarah",
  "createdAt": 1698765432123,  // Current timestamp
  "lastVisit": 1698765432123
}

// Verify timestamps are reasonable
```

**Checklist:**
- [ ] User object created
- [ ] Name is correct
- [ ] createdAt is current date/time
- [ ] lastVisit matches createdAt

### 2.2 Empty Statistics

**After name entry, verify stats:**

```javascript
console.log(JSON.parse(localStorage.getItem('il_driver_test_stats')));

// Expected output:
{
  "totalAttempts": 0,
  "totalCorrect": 0,
  "totalIncorrect": 0,
  "testsTaken": 0,
  "longestStreak": 0,
  "currentStreak": 0,
  "questionsMastered": 0,
  "categoryBreakdown": {}
}
```

**Checklist:**
- [ ] All stats are 0
- [ ] No category data yet
- [ ] Stats saved successfully

### 2.3 Question History Empty

**After name entry, verify question history:**

```javascript
console.log(JSON.parse(localStorage.getItem('il_driver_test_questionHistory')));

// Expected output:
{}  // Empty object
```

**Checklist:**
- [ ] Question history exists but is empty
- [ ] No questions answered yet

---

## 3. Dashboard for New User

### 3.1 Welcome Message

**Expected:**
```
"Welcome back, Sarah!" ← Personalized
```

**Checklist:**
- [ ] Shows user's name
- [ ] Message is friendly
- [ ] Name matches what they entered

### 3.2 Stats Display

**Expected on new user dashboard:**

| Stat | Expected | Status |
|------|----------|--------|
| Questions Attempted | 0 | ✓ |
| Accuracy | 0% | ✓ |
| Mastered | 0/100 | ✓ |
| Current Streak | 0 | ✓ |

**Checklist:**
- [ ] All stats show 0
- [ ] Progress bar shows 0%
- [ ] Progress text: "0/100 questions mastered"

### 3.3 Available Actions

**Expected buttons:**

| Button | Expected | Status |
|--------|----------|--------|
| Start Practice Test | ✓ Visible, clickable | ✓ |
| Review Missed Questions | ✗ Hidden | ✓ |
| Theme Toggle | ✓ Visible | ✓ |
| Statistics | ✓ Visible | ✓ |
| Settings | ✓ Visible | ✓ |

**Rationale for "Review" being hidden:**
- No missed questions yet (no questions answered)
- Button should only show when there's something to review

**Checklist:**
- [ ] Practice button visible and clickable
- [ ] Review button hidden (not visible)
- [ ] Other navigation buttons present

### 3.4 Category Stats

**Expected:**
- Empty or not displayed
- No categories with data yet

**Checklist:**
- [ ] Category section empty or not shown
- [ ] No errors

---

## 4. First Practice Test

### 4.1 Starting Practice Test

**Steps:**
1. New user on dashboard
2. Click "Start Practice Test"
3. Observe transitions

**Expected:**
```
✓ Dashboard fades out
✓ Practice test screen loads
✓ First question appears
✓ Question 1 of 35 shown
✓ No network errors
```

**Checklist:**
- [ ] Practice test loads
- [ ] No console errors
- [ ] Smooth transition
- [ ] All 35 questions available

### 4.2 Questions Load Successfully

**Expected:**
```
✓ Question text visible
✓ Category badge displayed
✓ 4 answer options (or 2 for true/false)
✓ All options selectable
✓ Progress bar shows 0%
```

**Test:**
1. Verify question text is readable
2. Verify options are clear
3. Verify tap targets are large enough (44px+)
4. Verify category is relevant

### 4.3 First Answer Submission

**Steps:**
1. Select an answer option
2. Verify feedback appears
3. Check data storage

**Expected Feedback (if correct):**
```
✓ Green background
✓ Celebratory message (e.g., "Excellent!")
✓ Confetti animation (if supported)
✓ Explanation text appears
✓ "Next Question" button enabled
```

**Expected Feedback (if incorrect):**
```
✓ Red/pink background
✓ Supportive message (e.g., "Not quite...")
✓ Correct answer highlighted
✓ Explanation of why
✓ "Next Question" button enabled
```

**Data Verification:**

```javascript
// After first answer, check storage
const history = JSON.parse(localStorage.getItem('il_driver_test_questionHistory'));
console.log(history[1]); // Question 1

// Expected (if answered correctly):
{
  "attempts": 1,
  "correctCount": 1,
  "incorrectCount": 0,
  "consecutiveCorrect": 1,
  "mastered": false,
  "firstAttemptCorrect": true,
  "lastAttempt": 1698765432123
}

// Expected (if answered incorrectly):
{
  "attempts": 1,
  "correctCount": 0,
  "incorrectCount": 1,
  "consecutiveCorrect": 0,
  "mastered": false,
  "firstAttemptCorrect": false,
  "lastAttempt": 1698765432123
}
```

**Checklist:**
- [ ] Feedback appears immediately
- [ ] Message is appropriate
- [ ] Data saved correctly
- [ ] Correct answer visible if wrong

### 4.4 Progressing Through Test

**Steps:**
1. Answer several questions
2. Move through test
3. Monitor progress

**Expected:**
```
✓ Progress bar advances
✓ Question number updates (1/35, 2/35, etc.)
✓ Different questions appear
✓ Categories vary
✓ Data persists for each question
```

**Checklist:**
- [ ] Progress bar increases
- [ ] Question counter accurate
- [ ] No duplicate questions
- [ ] Stats update live

---

## 5. Graceful Error Handling

### 5.1 Network Error (Missing qna.json)

**Setup:**
1. Temporarily rename `data/qna.json` to `data/qna.json.bak`
2. Start fresh (clear localStorage)
3. Load page

**Expected:**
```
✓ Loading screen shows
✓ After timeout, error message appears
✓ Message: "Failed to load questions. Please refresh the page."
✓ Refresh button or suggestion present
✓ No crash or hang
```

**Cleanup:**
```bash
mv data/qna.json.bak data/qna.json
```

### 5.2 Corrupted LocalStorage

**Setup:**
```javascript
// Corrupt user data
localStorage.setItem('il_driver_test_user', 'corrupted data');

// Refresh page
```

**Expected:**
```
✓ App handles gracefully
✓ Either shows welcome screen or displays error
✓ Allows recovery (reset option)
✓ No console errors (or caught)
```

### 5.3 Disabled JavaScript

**Setup:**
1. Open DevTools Settings
2. Enable "Disable JavaScript"
3. Reload page

**Expected:**
```
✓ <noscript> message appears
✓ Message: "JavaScript Required"
✓ Clear instructions shown
✓ Professional styling
✓ No broken layout
```

**Checklist:**
- [ ] Graceful no-JS fallback
- [ ] User understands what to do
- [ ] No error messages

---

## 6. Data Persistence Across Sessions

### 6.1 Session Reload Test

**Steps:**
1. New user enters name: "Alex"
2. Complete first question
3. Refresh page (F5)

**Expected:**
```
✓ Page reloads
✓ Dashboard appears (NOT welcome screen)
✓ Name is "Alex"
✓ Stats still show data from first question
```

**Verification:**
```javascript
// After reload
const user = JSON.parse(localStorage.getItem('il_driver_test_user'));
console.log(user.name); // Should be "Alex"
```

### 6.2 Browser Close and Reopen

**Steps:**
1. New user enters name
2. Takes partial test
3. Close browser completely
4. Reopen app

**Expected:**
```
✓ User data persists
✓ Dashboard shows saved stats
✓ History intact
✓ Can continue or start new test
```

### 6.3 Tab Switch

**Steps:**
1. New user in browser tab
2. Switch to different tab
3. Return to app tab

**Expected:**
```
✓ App state maintained
✓ In-progress test preserved
✓ Can continue where left off
```

---

## 7. First Time Settings Access

### 7.1 Settings Screen

**Steps:**
1. New user on dashboard
2. Click settings gear icon

**Expected:**
```
✓ Settings screen appears
✓ Profile section shows name
✓ Export/Import buttons visible
✓ Reset button present
✓ About section shows info
```

### 7.2 Change Name

**Steps:**
1. On settings
2. Change name from "Sarah" to "Sarah Jane"
3. Click "Save Name"

**Expected:**
```
✓ Alert: "Name updated successfully!"
✓ Return to dashboard
✓ Dashboard now shows "Sarah Jane"
✓ Data saved correctly
```

### 7.3 Export First Data

**Steps:**
1. New user who answered some questions
2. Click "Export Progress"

**Expected:**
```
✓ JSON file downloads
✓ Filename: contains date/name
✓ File contains user and question history
✓ Valid JSON format
✓ All data present
```

**Verify file contents:**
```json
{
  "user": { "name": "Sarah", "createdAt": ..., "lastVisit": ... },
  "stats": { "totalAttempts": 1, ... },
  "questionHistory": { "1": { ... } }
}
```

---

## 8. First Mastery Achievement

### 8.1 Achieving Mastery

**Scenario:**
1. New user answers question #5 correctly (1st time)
2. In next test, encounters question #5 again
3. Answers correctly (2nd time)

**Expected:**
```
✓ Mastery celebration triggers
✓ Special message appears
✓ Animation/effects play
✓ Updated stats show mastery
✓ Dashboard shows 1/100 mastered
```

**Data Verification:**
```javascript
const history = JSON.parse(localStorage.getItem('il_driver_test_questionHistory'));
console.log(history[5].mastered); // true
console.log(history[5].consecutiveCorrect); // 2

const stats = JSON.parse(localStorage.getItem('il_driver_test_stats'));
console.log(stats.questionsMastered); // 1
```

### 8.2 Streak Milestone

**Scenario:**
1. User answers 3 questions correctly in a row

**Expected:**
```
✓ "3 in a row!" message appears
✓ Different emoji/styling
✓ Special celebration
✓ Stats updated
```

---

## 9. First Test Completion

### 9.1 Completing Full 35-Question Test

**Steps:**
1. New user answers all 35 questions
2. Last answer submitted

**Expected:**
```
✓ Test complete screen appears
✓ Results summary shown
✓ Score calculated correctly
✓ Category breakdown displayed
✓ Achievement message shown
```

### 9.2 Results Screen

**Expected elements:**
```
✓ "Test Complete! 🎉" header
✓ Score: "X out of 35" (e.g., "28 out of 35")
✓ Percentage: "XX%" (e.g., "80%")
✓ Category breakdown with accuracy per category
✓ Performance message (e.g., "Great job!")
✓ Next action buttons
```

### 9.3 After Test Actions

**Expected options:**
```
✓ "Take Another Test" button
✓ "Review Missed Questions" button (if any missed)
✓ "Back to Dashboard" button
```

**Checklist:**
- [ ] Can start new test
- [ ] Can review if questions missed
- [ ] Can return home

---

## 10. FTUE Checklist

### Phase 1: Onboarding
- [ ] Welcome screen appears for new user
- [ ] Name input accepts valid names
- [ ] Name validation works
- [ ] Name stored correctly

### Phase 2: First Dashboard
- [ ] Shows personalized greeting
- [ ] Stats all show 0
- [ ] Practice button available
- [ ] Review button hidden (no data)

### Phase 3: First Test
- [ ] Questions load correctly
- [ ] Feedback appears on answer
- [ ] Progress tracked
- [ ] Data saved
- [ ] Can navigate through test

### Phase 4: First Mastery
- [ ] Mastery celebration triggers
- [ ] Stats update correctly
- [ ] Can see progress

### Phase 5: Test Completion
- [ ] Results screen displays
- [ ] Score calculated
- [ ] Category breakdown shown
- [ ] Next actions available

### Phase 6: Data Persistence
- [ ] Refresh maintains data
- [ ] Close/reopen works
- [ ] Export works
- [ ] Import works

### Phase 7: Settings
- [ ] Can change name
- [ ] Can export data
- [ ] Can reset (with confirmation)
- [ ] Can view about info

### Phase 8: Error Handling
- [ ] Missing questions handled
- [ ] Corrupted data handled
- [ ] No-JS fallback works
- [ ] Network errors caught

---

## 11. Test Report Template

**Date:** _______________
**Tester:** _______________
**Device:** _______________
**Browser:** _______________

| Test | Expected | Result | Status | Notes |
|------|----------|--------|--------|-------|
| Welcome screen appears | ✓ | | | |
| Name validation | ✓ | | | |
| Dashboard shows 0 stats | ✓ | | | |
| First practice test | ✓ | | | |
| Feedback on answer | ✓ | | | |
| Data persistence | ✓ | | | |
| Mastery celebration | ✓ | | | |
| Test completion | ✓ | | | |
| Settings access | ✓ | | | |
| Error handling | ✓ | | | |

**Issues Found:**
1. _______________
2. _______________

**Overall FTUE Rating:** _____ / 10

---

## 12. Conclusion

The first-time user experience should be smooth, encouraging, and clear. This checklist ensures new users can:

1. ✅ Understand what the app does
2. ✅ Get started with minimal friction
3. ✅ See progress immediately
4. ✅ Understand how to achieve mastery
5. ✅ Access help and settings

**Recommendation:** Test FTUE with actual new users (not just developer testing) for the best feedback.
