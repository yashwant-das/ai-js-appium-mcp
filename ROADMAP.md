# Roadmap: appium-mcp-playground

A prompt-driven test framework that generates and validates WebdriverIO tests for mobile apps using Appium MCP tools.

---

## Current State — What Works & What Doesn't

| Component | Status | Observations |
|---|---|---|
| `src/cli.js` | Basic MVP | Three commands (`generate`, `verify`, `clean`). The `generate` command instructs developers to run manually in "opencode" but does not actually execute MCP automation. |
| `src/prompt-parser.js` | Functional but fragile | Custom regex-based YAML parser with no library dependency. Fails silently on malformed frontmatter or missing required fields. |
| `src/test-generator.js` | Pattern-match only | Uses regex patterns (`tap`, `enter`, `verify`, `wait`, `scroll`) to produce WDIO code. Many steps fall through to a bare comment placeholder (line 69). Hardcoded `DEFAULT_TIMEOUT = 60000`. |
| `tests/helpers/base-test.js` | Single-app focus | Locators hardcoded for the Reminders app only (`remindersLocators`). Not reusable; Safari test imports nothing from helpers. |
| `wdio.conf.js` | iOS simulator only | Hardcoded UDID, iOS 26.5, Appium on port 4723 — breaks if device changes or Android needed. |
| Test coverage | Zero | No unit tests for parser/generator logic. No CI pipeline. |

---

## Phase 0 — Stabilise (Weeks 1–2)

**Goal:** Make existing features robust, testable, and well-documented before building new ones.

| # | Task | Files | Effort |
|---|---|---|---|
| 0.1 | Add unit tests for `prompt-parser.js` — YAML parsing edge cases (missing title, malformed frontmatter, non-numbered steps), step extraction, MCP tool detection | `src/__tests__/prompt-parser.test.js` (new) | 8 hrs |
| 0.2 | Add unit tests for `test-generator.js` — test each pattern branch (`tap`, `enter`, `verify`, `wait`, `scroll`, default fallthrough), verify slugification and selector escaping | `src/__tests__/test-generator.test.js` (new) | 6 hrs |
| 0.3 | Replace fragile YAML parser with proper validation; add error messages for missing required fields | `src/prompt-parser.js` | 4 hrs |
| 0.4 | Add `--list` CLI flag to display available prompts in `prompts/`; improve exit codes and error messages | `src/cli.js` | 3 hrs |
| 0.5 | Auto-detect iOS simulator UDID via `xcrun simctl` — replace hardcoded UDID; allow env var override | `wdio.conf.js`, `src/simulator-detect.js` (new) | 6 hrs |
| 0.6 | Draft `CONTRIBUTING.md` with architecture overview and dev workflow | `CONTRIBUTING.md` (new) | 4 hrs |

**Total: ~31 hours**

---

## Phase 1 — Smarter Generation & Multi-App Support (Weeks 3–5)

| # | Task | Files | Effort |
|---|---|---|---|
| 1.1 | Integrate LLM-based WDIO code generation: query a local model (`ollama`) to generate test code from prompt steps instead of printing instructions | `src/llm-generator.js` (new), update `cli.js` | 12 hrs |
| 1.2 | Add Android support: new capabilities config, device-agnostic loader from `.wdiorc.json` / env overrides | `wdio-android.conf.js` (new), `src/device-config.js` (new) | 8 hrs |
| 1.3 | Factor helpers into app-specific plugins — replace hardcoded `remindersLocators` with extensible `locatorSets` keyed by app name | Refactor `tests/helpers/base-test.js` | 6 hrs |
| 1.4 | Add `verify --all` mode: aggregate pass/fail summary table and detect flaky tests across repeated runs | Update CLI `verify` command | 6 hrs |
| 1.5 | Fix Safari test: add Safari locators to helpers; clean up duplicated inline selectors in `safari-search.test.js` | `tests/safari-search.test.js`, `tests/helpers/base-test.js` | 4 hrs |

**Total: ~36 hours**

---

## Phase 2 — Production Readiness (Weeks 6–10)

| # | Task | Files | Effort |
|---|---|---|---|
| 2.1 | CI pipeline: GitHub Actions workflow running `npm run verify` on PRs; optional iOS simulator with dependency caching | `.github/workflows/test.yml` (new) | 8 hrs |
| 2.2 | Report generation: configure WDIO for HTML/jUnit reports to `test-results/`; screenshot-on-failure in base-test hooks | Update `wdio.conf.js`, `src/report-helper.js` (new) | 6 hrs |
| 2.3 | Config file `.promptsrc.json` for project-level defaults (default app, timeouts, primary selector strategy) | `src/config-loader.js` (new), extend parser & CLI | 8 hrs |
| 2.4 | Snapshot testing utility: capture screenshots across runs to catch layout regressions; diff output | `src/snapshot-helper.js` (new) + example test | 6 hrs |
| 2.5 | Add `--debug` CLI flag: on failure, saves screenshot + page source + element hierarchy to `test-results/debug/` | Update CLI generate & verify handlers | 4 hrs |
| 2.6 | Package as npm scaffold — `npx create-appium-project`: boilerplate WDIO config, helpers dir, sample prompts | New `bin/create-appium-project.js`, template scaffolding | 10 hrs |

**Total: ~42 hours**

---

## Phase 3 — Advanced Features (Weeks 11+)

| # | Task | Files | Effort |
|---|---|---|---|
| 3.1 | **Auto-healing selectors**: fallback to fuzzy XPath/label matching when accId fails; learn failed patterns and retry | `src/autoheal.js` (new) + WDIO hooks | 12 hrs |
| 3.2 | **Prompt versioning & migration**: bump `version` in frontmatter triggers migration; track prompts needing updates after generator changes | Extend parser/CLI; add `prompts/.meta.json` manifest | 8 hrs |
| 3.3 | **Test dependency graph**: allow `dependsOn: ["create-reminder"]` in frontmatter; run dependencies before target test | `src/test-dependency-runner.js` (new), extend CLI | 10 hrs |
| 3.4 | **Visual regression dashboard**: local web view comparing current screenshots vs baseline with diff overlays | `server/index.js` (Express + static files) | 14 hrs |
| 3.5 | **CI plugin**: publish test results to TestRail / Jira / Slack webhook on success/failure | `src/ci-reporters/` (new), configure via `.promptsrc.json`) | 8 hrs |

**Total: ~52 hours**

---

## Dependency & Risk Map

| Risk / Blocker | Impact | Mitigation |
|---|---|---|
| Appium server connectivity stalls | **High** | Retry logic + configurable max retries; health-check diagnostic `npm run doctor` |
| Hardcoded iOS UDID breaks locally | **High** | Phase 0.5: auto-detect via `xcrun simctl`; env var override `SIMULATOR_UDID` |
| LLM model unreliability (Phase 1.1) | **Medium** | Add user-review step before save; fallback to template generation |
| Appium driver updates break selectors | **Medium** | Lock driver versions; add smoke test for locator validity |
| Platform fragmentation (iOS + Android) | **Medium** | Separate config files; abstraction layer for app operations |

---

## Quick-Priority Summary

```
PHASE     | TOP 3 PRIORITIES
--------- | ----------------------------------------
P0        | Unit tests for parser & generator
          | Auto-detect simulator UDID
          | --list CLI flag + error polish
P1        | LLM-based code generation
          | Android support (new config)
          | Flaky test detection (--all mode)
P2        | CI pipeline on GitHub Actions
          | Config file (.promptsrc.json)
          | Snapshot testing utility
P3+       | Auto-healing selectors
          | Test dependency graph
          | Visual regression dashboard
```
