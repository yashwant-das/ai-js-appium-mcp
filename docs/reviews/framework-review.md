# Framework Review and Fix Tracker

> Written against commit `5114198`.
>
> Purpose: document framework issues in a form another agent can review, fix, and update. This project is a proof of concept for validating Appium MCP assisted test generation, not a production-ready E2E framework.

## Status Legend

- `TODO`: confirmed issue, not started.
- `IN_PROGRESS`: currently being fixed.
- `DONE`: fixed and verified.
- `DEFERRED`: intentionally left for later with rationale.

## Verification Commands

- `npm run test:unit`
- `node src/cli.js generate --help`
- `node src/cli.js verify --help`
- Simulator verification, when Appium and an iOS simulator are available: `npm run verify:reminders -- tests/<generated-file>.test.js`

## Highest-Leverage Fix Order

| Order | Status | Finding | Scope |
| --- | --- | --- | --- |
| 1 | DONE | Rewrite README to explicitly describe this as a proof of concept and clarify the actual workflow. | `README.md` |
| 2 | DONE | Align prompt filenames, generated test filenames, README examples, and ignored generated examples. | `README.md`, `src/test-generator.js`, prompts |
| 3 | DONE | Decide and implement whether `src/test-generator.js` is a stub/scaffold or a real deterministic generator. For this POC, keep it a scaffold but make its output safe and honest. | `src/test-generator.js`, unit tests |
| 4 | DONE | Add prompt validation so invalid or incomplete prompts fail early with useful messages. | `src/prompt-parser.js`, unit tests |
| 5 | DONE | Reduce WDIO config drift or document intentional duplication and required environment variables. | `README.md`, `wdio-*.conf.js` |

## Findings

### 1. Generated Tests Are Not Reliable for Current Prompts

- **Status:** DONE
- **Category:** Correctness
- **Evidence:** `src/test-generator.js` uses broad regexes that convert prose into selectors. Example: `Enter ... in the title field` can emit `~the title field`; Contacts steps can emit selectors from surrounding prose instead of accessibility ids.
- **Impact:** Generated tests look executable but are likely invalid unless an agent rewrites them.
- **Resolution:** `src/test-generator.js` now treats ambiguous steps as `TODO(Appium MCP)` comments instead of inventing selectors. Unit coverage is in `tests/unit/test-generator.test.js`.

### 2. Wait Durations Are Wrong

- **Status:** DONE
- **Category:** Correctness
- **Evidence:** `src/test-generator.js` only parses `ms`. Prompt text like `Wait 2 seconds` falls back to `STEP_PAUSE * 1000`, producing `browser.pause(1000000)`.
- **Impact:** A generated test can pause for about 16.6 minutes.
- **Resolution:** `src/test-generator.js` now parses milliseconds, seconds, and ranges such as `3-5 seconds`. Unit coverage is in `tests/unit/test-generator.test.js`.

### 3. Framework Contract Is Confused

- **Status:** DONE
- **Category:** Docs / Architecture
- **Evidence:** README says an AI agent uses MCP tools to generate tests, while `src/cli.js` generates a local test file and then prints instructions asking an AI agent to generate one.
- **Impact:** Users and agents cannot tell whether the deterministic CLI or the Appium MCP agent owns final test generation.
- **Resolution:** `README.md` now documents the CLI as a parser, validator, scaffold writer, and Appium MCP instruction generator.

### 4. README Does Not Frame the Project as a POC

- **Status:** DONE
- **Category:** Docs
- **Evidence:** README title and intro describe a generic framework, not a proof of concept.
- **Impact:** Sets expectations for a production E2E framework that the code does not meet and is not trying to meet.
- **Resolution:** `README.md` now includes POC scope and non-goals.

### 5. README Command Examples Are Wrong for `verify --spec`

- **Status:** DONE
- **Category:** DX / Docs
- **Evidence:** README and CLI output suggest `npm run verify -- --spec ...`, but the CLI accepts a positional test file and rejects `--spec`.
- **Impact:** Copy-pasted commands fail.
- **Resolution:** `README.md` now uses positional CLI examples and reserves `--spec` for direct WDIO usage.

### 6. File Naming Is Inconsistent

- **Status:** DONE
- **Category:** DX / Docs
- **Evidence:** README expects `prompts/reminders-app.md` -> `tests/reminders-app.test.js`, but `getOutputPath()` currently derives names from prompt titles, e.g. `tests/create-reminder.test.js`.
- **Impact:** Generated output paths do not match project structure or verification examples.
- **Resolution:** `getOutputPath()` now derives output filenames from prompt filenames. Unit coverage is in `tests/unit/test-generator.test.js`.

### 7. Prompt Parsing Mixes MCP Tools Into Steps

- **Status:** DONE
- **Category:** Architecture
- **Evidence:** `parseStepsFromBody()` appends `[MCP Tool]` entries into the `steps` array, and downstream code filters them out later.
- **Impact:** Step counts are misleading and callers must know an internal sentinel convention.
- **Resolution:** `parseStepsFromBody()` no longer injects MCP tool sentinel entries into `steps`. Unit coverage is in `tests/unit/prompt-parser.test.js`.

### 8. MCP Tool Names Are Not Normalized

- **Status:** DONE
- **Category:** Correctness / DX
- **Evidence:** `parseMcpTools()` stores full bullet text like `appium_find_element (accessibility id strategy)`.
- **Impact:** Tool validation and generated headers cannot reliably reason about tool names.
- **Resolution:** `parseMcpTools()` now extracts unique canonical `appium_*` names. Unit coverage is in `tests/unit/prompt-parser.test.js`.

### 9. Prompt Validation Is Mostly Missing

- **Status:** DONE
- **Category:** Correctness / DX
- **Evidence:** README says `title` is required, but `parsePrompt()` silently derives it. Entry point, exit point, app, steps, and tools are not validated.
- **Impact:** Bad prompts generate weak tests instead of actionable errors.
- **Resolution:** `validatePrompt()` now checks title, app, steps, MCP tools, Entry Point, and Exit Point. The CLI calls it before writing output.

### 10. Generated Assertions Use Plain Chai for WDIO Matchers

- **Status:** DONE
- **Category:** Correctness
- **Evidence:** Generated code imports `chai.expect` and emits `expect(element).to.beDisplayed()`, which is a WDIO matcher pattern, not a Chai assertion.
- **Impact:** Generated tests can fail at assertion time even when elements exist.
- **Resolution:** Generated verify steps and `tests/helpers/base-test.js` now assert boolean displayed state with Chai.

### 11. Generated Tests Do Not Implement Failure Debug Artifacts

- **Status:** DONE
- **Category:** Debuggability
- **Evidence:** Generator does not emit failure handling that saves screenshots or page source.
- **Impact:** Failed simulator runs are harder for agents to diagnose.
- **Resolution:** Generated tests now create `test-results/`, save page source and screenshot when possible, then rethrow the original error.

### 12. Simulator Config Is Environment-Specific

- **Status:** DONE
- **Category:** DX
- **Evidence:** WDIO configs default to one hardcoded UDID and iOS version.
- **Impact:** Commands fail on other machines unless users know which env vars to set.
- **Resolution:** `README.md` now documents `APPIUM_UDID`, `APPIUM_PLATFORM_VERSION`, local Appium assumptions, and simulator setup commands.

### 13. WDIO Config Files Duplicate Almost Everything

- **Status:** DEFERRED
- **Category:** Maintainability
- **Evidence:** The three `wdio-*.conf.js` files differ mainly by bundle id and reset behavior.
- **Impact:** Config behavior can drift.
- **Recommended fix:** For now, keep duplication because this is a POC. Consider a shared base config only if more app configs are added.

### 14. Shell Command Construction Uses Interpolated Strings

- **Status:** DONE
- **Category:** Security / Robustness
- **Evidence:** `src/cli.js` interpolates config and spec paths into `execSync()` shell strings.
- **Impact:** Local paths with spaces or shell characters can break execution. This is a local-tool risk, not a remote vulnerability.
- **Resolution:** `src/cli.js` now uses `execFileSync()` with argv arrays for WDIO execution.

### 15. Generated Examples Are Ignored But Documented as Project Files

- **Status:** DONE
- **Category:** Docs / Repository Hygiene
- **Evidence:** `.gitignore` ignores `tests/*.test.js`, while README lists generated tests in the project tree.
- **Impact:** Agents may expect files that are absent in a clean checkout.
- **Resolution:** `README.md` now documents `tests/*.test.js` as ignored generated artifacts and committed `tests/unit/` as parser/generator tests.
