# AI Integration Testing Instructions

## Overview
This document provides instructions for testing the OpenAI API integration in Phase 1.

## Setup Required

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Generate a new API key
4. Copy the key (starts with `sk-`)

### 2. Configure API Key
1. Open `src/config/openai.js`
2. Replace `'your_openai_api_key_here'` with your actual API key
3. Save the file

**IMPORTANT**: Never commit the file with your real API key!

### 3. Testing the Integration

#### Using the Test Component
1. Start the app (`npm start` or `expo start`)
2. Navigate to the Home screen
3. Scroll down to find the "🤖 AI Integration Test" section
4. Use the test buttons:
   - **"Test OpenAI Connection"**: Tests actual API connectivity
   - **"Show AI Status"**: Shows current configuration status

#### Expected Results

**If configured correctly:**
- Connection test should show success alert with response time
- Status should show all ✅ checkmarks
- Console will log detailed test results

**If not configured:**
- Will show configuration error messages
- Status will show specific issues (missing key, wrong format, etc.)

**If API key is invalid:**
- Will show authentication error
- Connection test will fail with API key error

### 4. Console Logging
All tests log detailed information to the console:
- Open React Native debugger or browser console
- Look for messages starting with "OpenAI:" or "AI Test:"

### 5. Troubleshooting

| Issue | Solution |
|-------|----------|
| "Configuration invalid" | Check that API key is set in `src/config/openai.js` |
| "Invalid API key format" | Ensure key starts with `sk-` |
| "Authentication failed" | Verify API key is correct and active |
| "Rate limit exceeded" | Wait a few minutes and try again |
| "Network error" | Check internet connection |

### 6. Security Notes
- The `src/config/openai.js` file is gitignored to prevent key exposure
- Only use development/test API keys for this testing
- Never commit real API keys to version control

### 7. Next Steps
After successful testing:
1. Verify the test component works correctly
2. Check console logs for any errors
3. Test both success and failure scenarios
4. Ready to proceed to Phase 2 (prompt templates and response parsing)

## Cleanup
The test component will be removed in later phases. It's currently added to:
- `src/components/AITestComponent.js` (component file)
- `src/screens/HomeScreen.js` (temporary integration)

Both will be cleaned up once basic functionality is confirmed.
