# Connecting Appium MCP to your agent

[Appium MCP](https://github.com/appium/appium-mcp) is an MCP server that gives an AI agent tools to work with a running mobile app: list devices, start a session, read the screen's element tree, suggest locators, tap, type and take screenshots.

## What it does in this project

| | Appium MCP | `npm test` |
| --- | --- | --- |
| **When** | While the agent is writing or fixing a test | Whenever a test runs, by you, the agent or CI |
| **Who uses it** | The AI agent | WebdriverIO |
| **What drives the app** | By default, Appium MCP's own bundled XCUITest/UiAutomator2 drivers | The Appium server you start with `npm run appium` |
| **Output** | Information for the agent: element trees, locators, screenshots | Pass or fail, failure artifacts, Allure results |

Appium MCP never runs your tests and is not a dependency of this repo. The tests only need the Appium server. The agent uses MCP to find out what the app looks like, then writes code that WebdriverIO runs without it.

## 1. Install

Appium MCP runs with `npx`, so there is nothing to install in this repo. Its own prerequisites are Node.js 22 or newer, Xcode for iOS, and the Android SDK (with `ANDROID_HOME` set) for Android. See its [README](https://github.com/appium/appium-mcp) for the full list.

## 2. Add it to your agent

Every MCP-capable agent needs the same three things: a server name (`appium-mcp`), the command `npx -y appium-mcp@latest`, and, for Android, the `ANDROID_HOME` environment variable. Only the config format differs.

### Configurations tested with this repo

Tested with appium-mcp 1.97.1, Appium 3.8.0 and appium-xcuitest-driver 12.18.1. These run Appium MCP from a local install; replace `<path-to>` with your own paths.

**Antigravity**

```json
{
  "mcpServers": {
    "appium-mcp": {
      "command": "node",
      "args": [
        "-e",
        "console.log = console.error; console.info = console.error; console.debug = console.error; import('<path-to>/node_modules/appium-mcp/dist/index.js')"
      ],
      "env": {
        "ANDROID_HOME": "<path-to>/Android/sdk",
        "APPIUM_MCP_DOCS_ENABLED": "true"
      }
    }
  }
}
```

The `console.*` redirect keeps log output off stdout, which MCP uses for its protocol.

**OpenCode**

```json
{
  "mcp": {
    "appium-mcp": {
      "type": "local",
      "command": ["node", "<path-to>/node_modules/appium-mcp/dist/index.js"],
      "enabled": true,
      "timeout": 60000,
      "environment": {
        "ANDROID_HOME": "<path-to>/Android/sdk",
        "APPIUM_MCP_DOCS_ENABLED": "true"
      }
    }
  }
}
```

### Other agents

These commands come from the Appium MCP README and have not been tested with this repo:

```bash
claude mcp add appium-mcp -- npx -y appium-mcp@latest      # Claude Code
gemini mcp add appium-mcp npx -y appium-mcp@latest         # Gemini CLI
```

In Cursor, go to **Settings → MCP → Add new MCP Server** and use the command `npx -y appium-mcp@latest`. Other agents take the same command in their own config format.

## 3. Check that it works

1. Boot the simulator or emulator.
2. Start your agent in this folder and ask: *"Use Appium MCP to list the available devices."*
3. The agent should call the `select_device` tool and list your simulator. If it says it has no Appium tools, the server isn't connected: check the config, restart the agent, and look at its MCP log.

## Tips

- **Same device, two clients.** Appium MCP and `npm test` can both drive the same simulator, one after the other. If `npm test` can't start a session while the agent still has an MCP session open, ask the agent to end its session (`appium_session_management`) and run the test again.
- **Using this project's Appium server instead.** Appium MCP can attach to an existing server when its session is created with `remoteServerUrl` (for example `http://127.0.0.1:4723`). Then both MCP and the tests use the drivers pinned in this repo. See "Remote WebDriver/Appium server" in the Appium MCP README.
- **Tool names** in [AGENTS.md](../AGENTS.md) (`select_device`, `appium_session_management`, `generate_locators`, `appium_get_page_source`, …) match Appium MCP 1.97. If a newer version renames a tool, update AGENTS.md.
