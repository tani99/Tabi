# Bug Tracker

This file tracks bugs that have been identified but not yet fixed.

## Status Legend
- 🔴 **Critical** - Breaks core functionality
- 🟡 **High** - Significant user experience impact
- 🟢 **Medium** - Minor user experience impact
- 🔵 **Low** - Cosmetic or edge case issues

---

## Open Bugs

### 🟡 Activity Modal Field Flash Issue
**Status:** In Progress  
**Component:** `AddActivityModal.js`  
**Description:** When editing an activity and pressing save, the modal briefly shows values from the last opened activity (not necessarily the current one) before closing.

**Steps to Reproduce:**
1. Click edit icon on an activity
2. Change field values 
3. Press save
4. Observe brief flash of incorrect values before modal closes

**Expected Behavior:** Changed field values should persist until modal is fully disappeared

**Current Status:** Not fixed

---

## AI Planning

### 🟡 Activities Generated for Limited Days Only
**Status:** Not Fixed  
**Component:** AI Trip Planning System  
**Description:** Activities are generated for only 2 days instead of being generated for all days in the trip duration.

**Steps to Reproduce:**
1. Create a trip with more than 2 days duration
2. Use AI trip planning to generate activities
3. Observe that activities are only generated for the first 2 days

**Expected Behavior:** Activities should be generated for all days of the trip duration
**Current Status:** Not fixed

### 🔴 Poor Handling of Invalid AI Responses
**Status:** Not Fixed  
**Component:** AI Response Processing  
**Description:** When the AI service returns invalid or malformed responses, the system fails without graceful error handling instead of providing user-friendly feedback or retry options.

**Steps to Reproduce:**
1. Trigger AI trip planning with conditions that may cause invalid responses
2. Wait for AI to return malformed/invalid data
3. Observe system failure without proper error handling

**Expected Behavior:** Invalid AI responses should be handled gracefully with appropriate user feedback and recovery options
**Current Status:** Not fixed

---

## Fixed Bugs

_(Bugs that have been resolved will be moved here for reference)_

---

## Notes

- When adding new bugs, include steps to reproduce, expected vs actual behavior
- Reference specific components and files involved
- Update status as work progresses
- Move resolved bugs to the "Fixed Bugs" section with resolution details
