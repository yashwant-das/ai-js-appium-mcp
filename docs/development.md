# Development

Detailed setup, configuration, maintenance and verification for the [mobile testing harness](../README.md). Commands run from the repository root unless stated otherwise.

## Setup

You need Node.js 24, an MCP-capable AI agent, and the tools for the platform you test:

- **iOS:** macOS with Xcode and an iOS Simulator.
- **Android:** Android Studio with an emulator and Google Contacts (historical checks used Android 17, API 37; full-suite validation remains pending), and `ANDROID_HOME` set to your SDK path (usually `~/Library/Android/sdk` on macOS) in the terminal that runs Appium.

```bash
git clone https://github.com/yashwant-das/ai-js-appium-mcp.git && cd ai-js-appium-mcp
nvm use                   # Node 24, from .nvmrc
npm ci                    # install the locked Appium, drivers and tooling
cp .env.example .env      # set your simulator/emulator names, OS versions and (optionally) UDIDs
```

Then, each time you work with it:

```bash
npm run appium            # in its own terminal, with the simulator or emulator booted
npm test                  # optional: run the example tests on iOS
npm run test:android      # optional: run them on Android
```

Finally, connect Appium MCP to your agent once. [Appium MCP guide](appium-mcp.md) has the install steps, historical configurations and how to check the agent can see it.

## Your first test

1. Copy the template and fill in the steps:

   ```bash
   cp prompts/templates/prompt-template.md prompts/add-favourite.md
   ```

   Set `test: tests/add-favourite.test.js` in its front matter and describe the steps in plain English, the way you'd explain them to a colleague. [prompts/edit-contact.md](../prompts/edit-contact.md) is a complete example.

2. Open your agent in this folder and send it:

   > Read AGENTS.md, then automate prompts/add-favourite.md. Appium is running and the simulator is booted.

3. Let it work. You'll see it open an Appium MCP session, inspect screens, edit files under `screens/` and `tests/`, and run `npm test` until the test passes. It may ask before running commands, depending on your agent's settings.

4. Review the result:
   - `tests/add-favourite.test.js`: the steps and assertions, with no raw locators
   - `screens/*.js`: any new screen methods it added
   - `npm run lint`: should be clean

5. Run it yourself:

   ```bash
   npm test -- --spec tests/add-favourite.test.js
   ```

## Configuration

App identity lives in `app.config.js`; machine-specific settings live in `.env` copied from `.env.example`. Keep `.env` out of Git. Environment overrides are supported by `support/appConfig.js`, but ordinary test generation must use the configured app without changing these files.

| Setting | Default / source | Purpose |
| --- | --- | --- |
| `APP_BUNDLE_ID` | `ios.bundleId` in `app.config.js` | Optional iOS app override |
| `APP_PACKAGE`, `APP_ACTIVITY` | `android` fields in `app.config.js` | Optional Android app overrides |
| `IOS_DEVICE_NAME` | `iPhone Simulator` in config; example env uses `iPhone 18 Pro` | Simulator selection |
| `IOS_PLATFORM_VERSION`, `IOS_UDID` | Unset in config | OS version and optional exact device |
| `ANDROID_DEVICE_NAME` | `Android Emulator` | Emulator/device name |
| `ANDROID_PLATFORM_VERSION`, `ANDROID_UDID` | Unset in config; example env uses `17`, `emulator-5554` | OS version and exact device |
| `APPIUM_HOST`, `APPIUM_PORT`, `APPIUM_PATH` | `127.0.0.1`, `4723`, `/` | Existing Appium server |
| `WDIO_LOG_LEVEL` | `warn` | Runner log verbosity |
| `WDIO_RETRIES` | `1` | Mocha retries; use `0` for stability checks |

Both capabilities keep app data with `appium:noReset: true`. Android sets `appium:hideKeyboard: true`. A reset navigates home before each test; it does not clear persistent data. The Contacts UI assumes English labels and installed Apple Contacts / Google Contacts. Real devices and other Android versions are outside the demonstrated scope.

## Using it for your own app

1. Set your app in [app.config.js](../app.config.js): `ios.bundleId` and/or `android.appPackage` / `android.appActivity`. Leave a platform empty if you don't test it.
2. Set your device in `.env`.
3. Rewrite [support/appState.js](../support/appState.js) for your app: its imports, `dismissLeftovers` (what your app can be left showing after a restart, such as onboarding or an open form) and the home screen `resetToHome` waits for. It imports the Contacts screens, so do this before deleting them.
4. Delete the Contacts screens, the contents of `screens/flows.js` and the files in `tests/`. Replace `uniqueContact` in `support/testData.js` with factories for your own data.
5. Write prompts for your app and give them to the agent, as in [Your first test](#your-first-test).

[architecture](architecture.md) explains each of these pieces.

## Running and extending tests

| Task | Command | Scope |
| --- | --- | --- |
| All iOS scenarios | `npm test` or `npm run test:ios` | Live iOS device; `npm run verify` is also an iOS alias |
| All Android scenarios | `npm run test:android` | Live Android device |
| Focused scenario | `WDIO_RETRIES=0 npm test -- --spec tests/create-contact.test.js` | One live scenario without retries |
| Android stability | `WDIO_RETRIES=0 npm run test:android` | Run twice for roadmap acceptance |
| iOS stability | `WDIO_RETRIES=0 npm test` | Run twice for roadmap acceptance |
| View results | `npm run report` | Generate and open Allure from `allure-results/` |
| Remove results | `npm run clean` | Deletes `test-results/`, `allure-results/`, `allure-report/` |

Follow [screen and test conventions](architecture.md#adding-a-new-screen): selectors/actions belong in screen objects; assertions belong in tests. Reuse flows, generate unique data and register cleanup before creation. Add device-free unit tests for pure helper behavior. Do not use fixed sleeps or guess locators.

## Quality gates

`npm ci` runs `prepare` to install the existing Husky hook. If hooks were not installed, run `npm run prepare`. The pre-commit hook runs lint-staged against staged files only. Checks use check mode; fix files deliberately, review the diff and restage. Never bypass a failed hook to finish a commit.

| Command | What it verifies |
| --- | --- |
| `npm run lint` | ESLint and agent-code rules, including raw-selector restrictions |
| `npm run lint:md` | Maintained root docs, guides and current prompts; default markdownlint rules except line length |
| `npm run format:check` | Prettier for JavaScript/CommonJS and JSON/JSONC/YAML configuration |
| `npm run check:files` | Tracked maintained text: whitespace, final newline, conflict markers; JSON/JSONC/YAML syntax |
| `npm run test:unit` | Device-free helper, lint-rule and text/config validator behavior |
| `npm run check` | All five offline gates, in the same order locally and in CI |

Use `npm run lint:fix` for ESLint fixes and `npm run format` for formatting, then review and restage. To check all tracked files through staged checks without changing the real index, use a disposable Git index; normal commits need only `npx lint-staged` via Husky.

Prompt front matter retains its `title` metadata alongside one visible H1; `prompts/.markdownlint.json` tells MD025 not to treat metadata as an additional heading. No heading rule is disabled.

Historical `docs/superpowers/` records and `prompts/archive/` scenarios are excluded from maintained prose/text checks; generated reports, caches and dependencies are excluded from formatting. `package-lock.json` is generated and excluded from Prettier, but remains covered by JSON/text validation. Markdown hard breaks (two trailing spaces after text) are permitted. Markdown is linted rather than reformatted by Prettier.

CI runs `npm ci` and `npm run check` on pushes and pull requests to `master`, including docs-only changes. It uses Node 24, SHA-pinned actions, a timeout, read-only contents permission and npm caching. Mobile suites and MCP authoring require local services and are separate manual integration checks. No device tests run in hosted CI.

The desired required check is **Offline quality gates** from the **Quality** workflow. On 2026-10-28, the classic branch-protection endpoint reported no protection, while the active `default-branch-protection` ruleset protected the default branch from deletion and non-fast-forward updates. That ruleset has no required-status-check rule; workflow success alone does not enforce merging gates. Owner Yashwant Das must add the required check through branch protection/rulesets; review when this PR is adopted. Repository security features are plan-dependent and are not claimed enabled by these source changes.

## Troubleshooting

- **`ECONNREFUSED 127.0.0.1:4723`**: Appium isn't running. Start it with `npm run appium`.
- **The agent says it has no Appium tools**: Appium MCP isn't connected. See [Appium MCP guide](appium-mcp.md).
- **`No Android app configured`**: set `android.appPackage` and `android.appActivity` in `app.config.js`.
- **Android session fails with `ANDROID_HOME` / SDK errors**: export `ANDROID_HOME` in the terminal that runs `npm run appium`, then restart Appium.
- **`<Screen>.<name> has no android locator`**: that screen object has an iOS locator but no Android one yet. Add it.
- **A test starts on the wrong screen**: add that screen to `dismissLeftovers` in `support/appState.js`.
- **`strict mode violation ... resolved to N elements`**: a locator matches more than one element. Make it unique in the screen object.
- **`npm audit` reports advisories**: inspect the current dependency paths and upstream fixes. Overrides and a passing unit suite do not prove device compatibility or eliminate every advisory. See [adoption evidence and exceptions](#adoption-evidence-and-exceptions).

## Adoption evidence and exceptions

Documentation profile: `complete`. Policy: [repo-standards at a429dd2](https://github.com/yashwant-das/repo-standards/tree/a429dd2f2da55a4c3e1c73c7c0d1111f9cd0b9a9). Review date: 2026-10-28. Owner for pending checks and exceptions: Yashwant Das.

### Preserved documentation and evidence

The original README's role table, agent authoring workflow, first-test walkthrough, four prompt/test pairs, app adaptation steps, configuration, troubleshooting and report commands remain in this guide, the README, architecture or MCP guide. `docs/framework.md` was consolidated into `architecture.md`; maintained incoming links were updated. Historical design/implementation records remain under `docs/superpowers/` as records of their time, not current setup instructions. Active stability checks and execute-command work remain in the [roadmap](roadmap.md).

The existing 17 unit tests are retained. The original baseline passed ESLint and all 17 tests on Node 26.12.0; that baseline alone is not Node 24 or mobile validation.

### Dependency review

Direct dependencies are pinned in `package.json` and resolved in `package-lock.json`. Node remains 24 in `.nvmrc` and CI; `engines.node >=24` is the existing minimum, not proof of compatibility with all future Node releases. Compatible stable updates were resolved from the npm registry within the existing major versions. Appium 3.9.0 and XCUITest 12.22.3 / UiAutomator2 8.7.3 declare Node `^20.19.0 || ^22.12.0 || >=24.0.0`, npm `>=10`, and the drivers declare Appium `^3.0.0-rc.2` as their peer requirement. This establishes package-level compatibility, not Xcode/SDK/device compatibility. See the [Appium requirements](https://appium.io/docs/en/latest/quickstart/requirements/) and each driver's official requirements before device setup.

Existing install-script policy and overrides are retained. Audit review additionally updated `serialize-javascript` to `^7.1.4`, constrained `fast-uri@3` to `^3.1.9`, and pins DOMPurify `3.4.17` only under `@allurereport/web-commons`. These address the observed affected paths without changing direct dependency majors; they do not prove overall safety. Weekly Dependabot updates cover npm and GitHub Actions; major upgrades still require explicit compatibility review. Appium MCP stays external and independent of this lockfile; the MCP guide distinguishes historical configurations from fresh validation.

### Remaining audit constraint

`npm audit` on 2026-10-28 reports four low-severity affected packages in one chain: `markdownlint-cli2` → `markdownlint` → `micromark-extension-math` → `katex` (`0.16.47`). [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7) concerns trust restrictions when prototype pollution already exists. The advisory lists a fix at KaTeX `0.18.2`; the math extension resolves the `0.16` compatibility line. A forced transitive compatibility jump or CLI downgrade is deferred rather than silently overriding that boundary. Mitigation: lint repository-controlled Markdown and do not use this CLI as a service for untrusted documents. Owner: Yashwant Das. Review trigger: an upstream compatible fix or a separately reviewed math-parser upgrade. There are no moderate, high or critical findings in this audit snapshot; this is not an audit-clean claim.

### Integration prerequisites and pending checks

With host access, `adb devices -l` listed no attached devices, `xcrun simctl list devices booted` listed no booted simulators, and `http://127.0.0.1:4723/status` refused connections. The repository instructs agents to reuse user-started Appium and devices, so these were not started for adoption. No Appium MCP tool connection is available in this chat.

Both full mobile suites, two-run stability checks, MCP authoring and a fresh Allure screenshot are **skipped**, not passed. Review trigger: user provides booted devices, installed Contacts apps and a running Appium server; run both suites twice without retries before asserting mobile compatibility for the updated dependency set. Historical Android create/search/delete individual passes are recorded in the roadmap; edit and full-suite validation remain pending.

### Final local verification

Validation used an isolated Node **24.22.1** binary with npm **11.20.0**; the system Node 26 was not used for the acceptance run.

| Verification | Result |
| --- | --- |
| `npm ci` | Clean lockfile install passed under Node 24.22.1 / npm 11.20.0; Husky prepare ran |
| `npm run check` | ESLint, 11 maintained Markdown documents, Prettier, tracked text/config checks and all 26 unit tests passed |
| Staged hooks | A valid JSON commit passed through Husky; malformed JSON, duplicate YAML keys, conflicting headings, unformatted JavaScript, conflict markers and a missing newline each blocked commits in a disposable repository |
| CLI/config smoke | Appium `3.9.0`, WDIO `10.1.0` and Allure `3.22.1` version commands passed; both platform configs loaded with one worker and one default retry |
| Staging isolation | An unrelated untracked file remained untracked after a successful hooked commit; a binary-only asset commit also passed |
| Local links | All 60 local links and anchors resolved across 11 maintained documents |
| Mermaid | README sequence and architecture flowchart both parsed successfully with Mermaid 11 |
| `npm audit` | Four low findings in the documented math-rendering chain; no moderate/high/critical findings |
| Mobile / MCP / report screenshot | Skipped for the prerequisite reasons above |

Representative output from the Node 24 offline run:

```text
markdownlint-cli2 v0.24.0 (markdownlint v0.42.0)
Summary: 0 issues in 0 files
All matched files use Prettier code style!
ℹ tests 26
ℹ pass 26
ℹ fail 0
```

The original 17 helper/lint tests and four mobile scenario implementations are preserved. Added validator tests cover accepted JSON/JSONC/Markdown hard breaks and rejected whitespace, missing newline, conflict markers, malformed JSON, duplicate YAML keys and binary-only staged selections. Formatting changes to existing JavaScript are mechanical; no scenario actions or assertions changed.
