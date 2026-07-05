# Appium MCP Test Framework - Agent Guidelines

## Purpose

This framework enables AI agents to generate and verify WebdriverIO tests for iOS apps using Appium MCP tools. The workflow is:

1. **Read prompt** → Parse markdown file with automation steps
2. **Execute MCP tools** → Automate steps on iOS simulator
3. **Generate test** → Create standalone WDIO test file
4. **Verify** → Run test on simulator to confirm it works

## Agent Workflow

When given a prompt file, follow this sequence:

### Step 1: Parse the Prompt
- Read the prompt file from `prompts/` directory
- Extract: title, app, steps, MCP tools, notes
- Validate the prompt structure

### Step 2: Execute Automation Steps
Use Appium MCP tools in this order:
1. `appium_session_management` - Create/manage session
2. `appium_find_element` - Locate elements (prefer accessibility id)
3. `appium_gesture` - Tap, scroll, swipe actions
4. `appium_set_value` - Enter text
5. `appium_get_page_source` - Verify state
6. `appium_generate_tests` - Generate WDIO test code

### Step 3: Generate Test File
- Save to `tests/<scenario>.test.js`
- Include prompt reference header
- Use WDIO v9 syntax (`$`, `browser`)
- Add chai assertions
- Include proper timeouts

### Step 4: Verify Test
- Run: `npm run verify:reminders -- tests/<scenario>.test.js`
- Confirm test passes
- Fix any failing assertions

## Prompt Requirements

Every prompt must have:

### Entry Point
- Clear app launch method (bundleId, deep link, or app already open)
- Specific starting screen/state

### Exit Point
- Clear verification criteria
- How to confirm test success
- Page source checks or element assertions

### Steps
- Numbered, sequential steps
- Each step maps to an MCP tool call
- Include waits where needed (2-3 seconds between major actions)

### MCP Tools
- List all tools the agent should use
- Include purpose for each tool

## Test Generation Rules

1. **Selectors**: Use accessibility id (`~label`) as primary strategy
2. **Waits**: Add `browser.pause()` between major actions (1000-3000ms)
3. **Timeouts**: Set `this.timeout(60000)` for all tests
4. **Assertions**: Use chai `expect()` with page source or element checks
5. **Comments**: Each step should have a descriptive comment
6. **Debug**: Save page source to `test-results/page-source.xml` on failure

## Common Patterns

### Opening an App
```javascript
// App launched via bundleId in wdio-reminders.conf.js capabilities
// No explicit open step needed
```

### Verifying Count Change
```javascript
const pageSource = await browser.getPageSource();
const match = pageSource.match(/label="([^"]*)"/);
expect(match).to.not.be.null;
```

### Navigating Back
```javascript
await browser.back();
await browser.pause(1000);
```

## Error Handling

If a step fails:
1. Take screenshot: `await browser.saveScreenshot('./test-results/debug.png')`
2. Save page source: `require('fs').writeFileSync('./test-results/page-source.xml', await browser.getPageSource())`
3. Check element exists before interaction
4. Increase wait times if element not found

## File Structure

```
prompts/
  ├── <scenario>-app.md          # Prompt file (kebab-case, e.g., reminders-app.md)
  ├── templates/
  │   └── prompt-template.md
  └── archive/
tests/
  ├── <scenario>-app.test.js     # Generated test (kebab-case, e.g., reminders-app.test.js)
  └── helpers/
      └── base-test.js           # Shared utilities
docs/
  ├── roadmap.md                 # Development roadmap
  └── notes.md                   # General notes
src/
  ├── cli.js                     # CLI entry point
  ├── prompt-parser.js           # Prompt file parser
  └── test-generator.js          # WDIO test code generator
test-results/                    # Debug artifacts (screenshots, page source)
wdio-reminders.conf.js           # Reminders app config
wdio-contacts.conf.js            # Contacts app config
wdio-safari.conf.js              # Safari app config
package.json
└── README.md
```

## Commands

```bash
npm run generate prompts/<scenario>-app.md    # Generate test
npm run verify                                 # Run all Reminders tests
npm run verify:all                             # Run all tests across all apps
npm run verify -- tests/<scenario>-app.test.js    # Run specific test
npm run verify:reminders -- tests/<scenario>-app.test.js  # Use reminders config
npm run verify:contacts -- tests/<scenario>-app.test.js   # Use contacts config
npm run verify:safari -- tests/<scenario>-app.test.js     # Use safari config
npm run clean                                  # Remove generated tests
```
