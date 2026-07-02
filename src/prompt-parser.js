const fs = require('fs');
const path = require('path');

/**
 * Parses a markdown prompt file into structured data.
 * 
 * Supports two formats:
 * 
 * Format 1 (Template - with frontmatter and headings):
 * ---
 * title: Scenario Title
 * app: reminders
 * version: 1
 * ---
 * 
 * # Title
 * 
 * ## Steps:
 * 1. Step description
 * 2. Another step
 * 
 * ## MCP Tools to use:
 * - tool1
 * - tool2
 * 
 * Format 2 (Simple - flat numbered list):
 * Use Appium MCP tools to automate the following steps on an iOS simulator:
 * 
 * 1. Open the Reminders app
 * 2. Tap "New Reminder" button
 * 
 * Important: Use Appium MCP tools:
 * - Use `appium_session_management` to create sessions
 * - Use `appium_find_element` to locate elements
 */

function parseYamlFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, body: content };
  }

  const yamlContent = match[1];
  const body = content.slice(match[0].length).trim();
  const metadata = {};

  yamlContent.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > -1) {
      const key = line.slice(0, colonIndex).trim().toLowerCase();
      const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      metadata[key] = value;
    }
  });

  return { metadata, body };
}

function parseStepsFromBody(body) {
  const steps = [];
  const lines = body.split('\n');
  let inSteps = false;
  let inTools = false;
  let inBodySteps = false;
  let bodyStepCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for ## Steps: heading (template format)
    if (/^##+\s*Steps/i.test(line)) {
      inSteps = true;
      inTools = false;
      inBodySteps = false;
      continue;
    }

    // Check for ## MCP Tools to use: heading (template format)
    if (/^##+\s*MCP\s+Tools/i.test(line) || /^##+\s+Tools/i.test(line)) {
      inSteps = false;
      inTools = true;
      inBodySteps = false;
      continue;
    }

    // Check for any other ## heading
    if (/^##+\s+\w/.test(line) && !/^##+\s*(Steps|MCP\s+Tools|Tools)/i.test(line)) {
      inSteps = false;
      inTools = false;
    }

    // Parse numbered steps in Steps section (template format)
    if (inSteps) {
      const stepMatch = line.match(/^\d+\.\s+(.+)/);
      if (stepMatch) {
        steps.push(stepMatch[1].trim());
      }
      continue;
    }

    // Parse MCP tools list (template format)
    if (inTools) {
      const toolMatch = line.match(/^-+\s+(.+)/);
      if (toolMatch) {
        steps.push(`[MCP Tool]: ${toolMatch[1].trim()}`);
      }
      continue;
    }

    // Parse numbered steps in body (simple format)
    // Look for the first numbered list in the body
    const bodyStepMatch = line.match(/^\d+\.\s+(.+)/);
    if (bodyStepMatch) {
      if (!inBodySteps) {
        inBodySteps = true;
        bodyStepCount = 0;
      }
      if (inBodySteps) {
        const num = parseInt(bodyStepMatch[0].split('.')[0]);
        if (num === bodyStepCount + 1) {
          steps.push(bodyStepMatch[1].trim());
          bodyStepCount++;
        } else {
          inBodySteps = false;
        }
      }
      continue;
    }

    // Stop body step parsing when we hit a non-numbered, non-tool line
    if (inBodySteps && !bodyStepMatch) {
      // Check if it's a tool list item
      if (/^-+\s+/.test(line)) {
        const toolMatch = line.match(/^-+\s+(.+)/);
        if (toolMatch) {
          steps.push(`[MCP Tool]: ${toolMatch[1].trim()}`);
        }
      } else if (/^Important:/.test(line) || /^Note:/.test(line) || /^##/.test(line)) {
        inBodySteps = false;
      }
    }
  }

  return steps;
}

function parseMcpTools(body) {
  const tools = [];
  const lines = body.split('\n');
  let inTools = false;

  for (const line of lines) {
    // Template format: ## MCP Tools to use:
    if (/^##+\s*MCP\s+Tools/i.test(line) || /^##+\s+Tools/i.test(line)) {
      inTools = true;
      continue;
    }

    if (/^##+\s+\w/.test(line)) {
      inTools = false;
    }

    if (inTools) {
      const toolMatch = line.match(/^-+\s+(.+)/);
      if (toolMatch) {
        tools.push(toolMatch[1].trim());
      }
    }
  }

  // Simple format: extract tool references from "Use `tool_name`" patterns
  if (tools.length === 0) {
    const toolPattern = /`appium_(\w+)`/g;
    let match;
    while ((match = toolPattern.exec(body)) !== null) {
      const toolName = 'appium_' + match[1];
      if (!tools.includes(toolName)) {
        tools.push(toolName);
      }
    }
  }

  return tools;
}

function parsePrompt(filePath) {
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Prompt file not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const { metadata, body } = parseYamlFrontmatter(content);
  const steps = parseStepsFromBody(body);
  const mcpTools = parseMcpTools(body);

  // Extract title from frontmatter or derive from filename
  const title = metadata.title || 
                path.basename(filePath, '.md')
                  .replace(/[-_]/g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase());

  return {
    title,
    app: metadata.app || 'reminders',
    version: metadata.version || '1',
    steps,
    mcpTools,
    sourcePath: absolutePath
  };
}

module.exports = {
  parsePrompt,
  parseYamlFrontmatter,
  parseStepsFromBody,
  parseMcpTools
};
