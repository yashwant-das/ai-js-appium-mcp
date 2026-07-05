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
  let inBodySteps = false;
  let bodyStepCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for ## Steps: heading (template format)
    if (/^##+\s*Steps/i.test(line)) {
      inSteps = true;
      inBodySteps = false;
      continue;
    }

    // Check for ## MCP Tools to use: heading (template format)
    if (/^##+\s*MCP\s+Tools/i.test(line) || /^##+\s+Tools/i.test(line)) {
      inSteps = false;
      inBodySteps = false;
      continue;
    }

    // Check for any other ## heading
    if (/^##+\s+\w/.test(line) && !/^##+\s*(Steps|MCP\s+Tools|Tools)/i.test(line)) {
      inSteps = false;
    }

    const bodyStepMatch = line.match(/^\d+\.\s+(.+)/);

    // Parse numbered steps in Steps section (template format)
    if (inSteps) {
      if (bodyStepMatch) {
        steps.push(bodyStepMatch[1].trim());
      }
      continue;
    }

    // Parse numbered steps in body (simple format). Look for the first
    // contiguous numbered list and stop when prose or a heading resumes.
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
      if (/^Important:/.test(line) || /^Note:/.test(line) || /^##/.test(line)) {
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

  function addToolFromText(text) {
    const toolPattern = /`?(appium_[a-zA-Z0-9_]+)`?/g;
    let match;
    while ((match = toolPattern.exec(text)) !== null) {
      const toolName = match[1];
      if (!tools.includes(toolName)) {
        tools.push(toolName);
      }
    }
  }

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
        addToolFromText(toolMatch[1]);
      }
    }
  }

  // Simple format: extract tool references from "Use `tool_name`" patterns
  if (tools.length === 0) {
    addToolFromText(body);
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
  const hasEntryPoint = /^##+\s*Entry\s+Point\b/im.test(body);
  const hasExitPoint = /^##+\s*Exit\s+Point\b/im.test(body);

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
    hasEntryPoint,
    hasExitPoint,
    sourcePath: absolutePath
  };
}

function validatePrompt(prompt) {
  const errors = [];

  if (!prompt.title || !String(prompt.title).trim()) {
    errors.push('Missing required frontmatter field: title');
  }

  if (!prompt.app || !String(prompt.app).trim()) {
    errors.push('Missing required frontmatter field: app');
  }

  if (!Array.isArray(prompt.steps) || prompt.steps.length === 0) {
    errors.push('Prompt must include at least one numbered step');
  }

  if (!Array.isArray(prompt.mcpTools) || prompt.mcpTools.length === 0) {
    errors.push('Prompt must list at least one Appium MCP tool');
  }

  if (!prompt.hasEntryPoint) {
    errors.push('Prompt must include an Entry Point section');
  }

  if (!prompt.hasExitPoint) {
    errors.push('Prompt must include an Exit Point section');
  }

  return errors;
}

module.exports = {
  parsePrompt,
  parseYamlFrontmatter,
  parseStepsFromBody,
  parseMcpTools,
  validatePrompt
};
