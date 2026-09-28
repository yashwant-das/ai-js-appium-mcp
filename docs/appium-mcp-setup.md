# Appium MCP configuration

These configurations were tested. Replace the paths with your own.

## Antigravity

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

## OpenCode

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

Appium MCP is not a dependency of this repo; install it by following the [Appium MCP README](https://github.com/appium/appium-mcp). Other MCP-capable agents use the same command and environment, in their own config format.
