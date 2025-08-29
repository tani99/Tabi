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

## Fixed Bugs

_(Bugs that have been resolved will be moved here for reference)_

---

## Notes

- When adding new bugs, include steps to reproduce, expected vs actual behavior
- Reference specific components and files involved
- Update status as work progresses
- Move resolved bugs to the "Fixed Bugs" section with resolution details
