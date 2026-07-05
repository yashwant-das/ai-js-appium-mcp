const path = require('path');

/**
 * Generates a WebdriverIO test file from parsed prompt data.
 * 
 * Creates a standalone WDIO test with:
 * - Prompt reference header
 * - Proper describe/it blocks
 * - WDIO v9 element selectors
 * - Chai assertions
 * - Appropriate timeouts
 */

const DEFAULT_TIMEOUT = 60000;
const ELEMENT_WAIT_TIMEOUT = 10000;
const STEP_PAUSE = 1000;

function generateStepCode(step, stepIndex) {
  const stepText = step.replace(/^\[MCP Tool\]:\s*/, '');
  const comment = `    // Step ${stepIndex}: ${stepText}`;
  
  // Detect common action patterns
  if (/open\s+(the\s+)?app/i.test(stepText)) {
    return comment;
  }

  if (/tap|click/i.test(stepText)) {
    const elementMatch = getExplicitSelectorText(stepText);
    const element = elementMatch ? elementMatch[1] : 'target element';
    if (!elementMatch) {
      return asAgentTodo(comment);
    }
    return `${comment}
    const ${slugify(elementTextToVar(element))} = await $('~${escapeSelector(element)}');
    await ${slugify(elementTextToVar(element))}.waitForDisplayed({ timeout: ${ELEMENT_WAIT_TIMEOUT} });
    await ${slugify(elementTextToVar(element))}.click();`;
  }

  if (/enter|type|input|fill/i.test(stepText)) {
    const valueMatch = stepText.match(/["']([^"']+)["']/);
    const value = valueMatch ? valueMatch[1] : '';
    const elementMatch = stepText.match(/accessibility\s+id\s+`([^`]+)`/i) ||
      stepText.match(/(?:field|input|box)\s+`([^`]+)`/i);
    if (!valueMatch || !elementMatch) {
      return asAgentTodo(comment);
    }
    const element = elementMatch[1];
    return `${comment}
    const ${slugify(elementTextToVar(element))} = await $('~${escapeSelector(element)}');
    await ${slugify(elementTextToVar(element))}.setValue('${value.replace(/'/g, "\\'")}');`;
  }

  if (/verify|check|assert|confirm|ensure/i.test(stepText)) {
    const elementMatch = getExplicitSelectorText(stepText);
    const element = elementMatch ? elementMatch[1] : 'expected result';
    if (!elementMatch) {
      return asAgentTodo(comment);
    }
    const variableName = slugify(elementTextToVar(element));
    return `${comment}
    const ${slugify(elementTextToVar(element))} = await $('~${escapeSelector(element)}');
    await ${variableName}.waitForDisplayed({ timeout: ${ELEMENT_WAIT_TIMEOUT} });
    const ${variableName}Displayed = await ${variableName}.isDisplayed();
    expect(${variableName}Displayed).to.equal(true);`;
  }

  if (/wait|pause|delay/i.test(stepText)) {
    const duration = parseDurationMs(stepText);
    return `${comment}
    await browser.pause(${duration});`;
  }

  if (/scroll/i.test(stepText)) {
    const directionMatch = stepText.match(/(up|down|left|right)/i);
    const direction = directionMatch ? directionMatch[1].toLowerCase() : 'down';
    return `${comment}
    await browser.scroll({ direction: '${direction}' });`;
  }

  // Default: descriptive comment
  return asAgentTodo(comment);
}

function asAgentTodo(comment) {
  return `${comment}
    // TODO(Appium MCP): Resolve this step with live simulator context before relying on this scaffold.`;
}

function getExplicitSelectorText(stepText) {
  return stepText.match(/accessibility\s+id\s+`([^`]+)`/i) ||
    stepText.match(/["']([^"']+)["']/);
}

function parseDurationMs(stepText) {
  const rangeMatch = stepText.match(/(\d+)\s*-\s*(\d+)\s*(milliseconds?|ms|seconds?|secs?|s)\b/i);
  if (rangeMatch) {
    return durationToMs(parseInt(rangeMatch[2]), rangeMatch[3]);
  }

  const durationMatch = stepText.match(/(\d+)\s*(milliseconds?|ms|seconds?|secs?|s)\b/i);
  if (durationMatch) {
    return durationToMs(parseInt(durationMatch[1]), durationMatch[2]);
  }

  return STEP_PAUSE;
}

function durationToMs(value, unit) {
  if (/^milli|^ms$/i.test(unit)) {
    return value;
  }
  return value * 1000;
}

function elementTextToVar(text) {
  return text
    .replace(/["']/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

function slugify(text) {
  return text
    .replace(/["']/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .toLowerCase();
}

function escapeSelector(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

function generateTest(prompt) {
  const { title, steps, mcpTools, sourcePath } = prompt;
  
  const testTitle = title.replace(/\b\w/g, c => c.toUpperCase());
  const testDescription = `should ${title.toLowerCase()}`;
  
  // Generate step code
  const stepCodes = steps
    .filter(s => !s.startsWith('[MCP Tool]'))
    .map((step, index) => generateStepCode(step, index + 1))
    .join('\n\n');

  // Build MCP tools comment
  const mcpToolsComment = mcpTools.length > 0
    ? mcpTools.join(',\n * ')
    : 'appium_session_management, appium_find_element, appium_gesture, appium_set_value, appium_generate_tests';

  // Get relative path from project root
  const relativePath = path.relative(process.cwd(), sourcePath);

  const testCode = `/**
 * Generated from: ${relativePath}
 * Generated by: appium-mcp-playground CLI
 * MCP Tools: ${mcpToolsComment}
 */
const { expect } = require('chai');
const fs = require('fs');

describe('${testTitle}', function () {
  this.timeout(${DEFAULT_TIMEOUT});

  it('${testDescription}', async function () {
    try {
${stepCodes}
    } catch (error) {
      fs.mkdirSync('./test-results', { recursive: true });
      try {
        fs.writeFileSync('./test-results/page-source.xml', await browser.getPageSource());
      } catch (pageSourceError) {
        fs.writeFileSync('./test-results/page-source-error.txt', String(pageSourceError));
      }
      try {
        await browser.saveScreenshot('./test-results/debug.png');
      } catch (screenshotError) {
        fs.writeFileSync('./test-results/screenshot-error.txt', String(screenshotError));
      }
      throw error;
    }
  });
});
`;

  return testCode;
}

function getOutputPath(prompt) {
  const sourceName = prompt.sourcePath && path.basename(prompt.sourcePath, '.md');
  const filename = (sourceName || prompt.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return path.join('tests', `${filename}.test.js`);
}

module.exports = {
  generateTest,
  getOutputPath,
  generateStepCode
};
