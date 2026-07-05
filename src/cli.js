#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { parsePrompt } = require('./prompt-parser');
const { generateTest, getOutputPath } = require('./test-generator');

const PROMPTS_DIR = path.resolve('prompts');
const TESTS_DIR = path.resolve('tests');

const program = new Command();

program
  .name('appium-mcp')
  .description('Appium MCP test framework - generate tests from markdown prompts')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a WDIO test from a prompt file')
  .argument('<prompt>', 'Path to the prompt markdown file (e.g., prompts/reminders-app.md)')
  .option('--no-run', 'Skip automatic test execution after generation', false)
  .option('-c, --config <config>', 'WDIO config file for auto-run (default: wdio-reminders.conf.js)', 'wdio-reminders.conf.js')
  .action(async (promptPath, options) => {
    console.log(chalk.bold('\n') + chalk.blue('  Appium MCP Test Framework'));
    console.log(chalk.dim('  ' + '='.repeat(45)) + '\n');

    // Resolve prompt path
    const resolvedPath = path.resolve(promptPath);
    
    // Check if prompt file exists
    if (!fs.existsSync(resolvedPath)) {
      console.error(chalk.red(`\nError: Prompt file not found: ${resolvedPath}`));
      console.error(chalk.dim('Available prompts:'));
      try {
        const files = fs.readdirSync(PROMPTS_DIR).filter(f => f.endsWith('.md'));
        if (files.length === 0) {
          console.error(chalk.dim('  (none found in prompts/ directory)'));
        } else {
          files.forEach(f => console.error(chalk.dim(`  prompts/${f}`)));
        }
      } catch (e) {
        console.error(chalk.dim(`  (could not read prompts/ directory)`));
      }
      process.exit(1);
    }

    // Parse the prompt
    console.log(chalk.cyan('  Step 1: Reading prompt...'));
    let prompt;
    try {
      prompt = parsePrompt(resolvedPath);
      console.log(chalk.green('  ✓ Prompt parsed successfully'));
      console.log(chalk.dim(`    Title: ${prompt.title}`));
      console.log(chalk.dim(`    App: ${prompt.app}`));
      console.log(chalk.dim(`    Steps: ${prompt.steps.filter(s => !s.startsWith('[MCP Tool]')).length}`));
      console.log(chalk.dim(`    MCP Tools: ${prompt.mcpTools.length}`));
    } catch (e) {
      console.error(chalk.red(`\n  Error parsing prompt: ${e.message}`));
      process.exit(1);
    }

    // Generate test code
    console.log(chalk.cyan('\n  Step 2: Generating test code...'));
    const testCode = generateTest(prompt);
    const outputPath = getOutputPath(prompt);
    const absoluteOutputPath = path.resolve(outputPath);
    
    // Ensure tests directory exists
    if (!fs.existsSync(TESTS_DIR)) {
      fs.mkdirSync(TESTS_DIR, { recursive: true });
    }

    // Write test file
    fs.writeFileSync(absoluteOutputPath, testCode);
    console.log(chalk.green('  ✓ Test file generated'));
    console.log(chalk.dim(`    Saved to: ${outputPath}`));

    // Display the generated test
    console.log(chalk.cyan('\n  Generated Test Preview:'));
    console.log(chalk.dim('  ' + '-'.repeat(45)));
    const lines = testCode.split('\n').slice(0, 20);
    lines.forEach(line => console.log(chalk.gray('  ') + line));
    if (testCode.split('\n').length > 20) {
      console.log(chalk.gray('  ...') + chalk.dim(' (truncated)'));
    }
    console.log(chalk.dim('  ' + '-'.repeat(45)));

    // Display AI agent instructions
    console.log(chalk.cyan('\n  Step 3: AI Agent Instructions'));
    console.log(chalk.dim('  ' + '-'.repeat(45)));
    console.log(chalk.yellow('\n  To execute this prompt with MCP tools, run in opencode:'));
    console.log(chalk.bold(`\n  "Use Appium MCP tools to automate the following steps:\n`));
    prompt.steps.forEach(step => {
      if (step.startsWith('[MCP Tool]')) {
        console.log(chalk.cyan(`  - ${step}`));
      } else {
        console.log(chalk.white(`  ${prompt.steps.indexOf(step) + 1}. ${step}`));
      }
    });
    console.log(chalk.yellow(`\n  Generate a JavaScript WDIO test and save it as ${outputPath}`));
    console.log(chalk.yellow('\n"') + chalk.dim('\n  After the AI agent generates the test, the next step will run it.\n'));
    console.log(chalk.dim('  ' + '-'.repeat(45)));

    // Run tests if --run flag is set
    if (options.run !== false) {
      console.log(chalk.cyan('\n  Step 4: Running generated test on simulator...'));
      console.log(chalk.dim('  ' + '-'.repeat(45)));
      
      try {
        const config = options.config || 'wdio-reminders.conf.js';
        console.log(chalk.dim(`  Config: ${config}`));
        console.log(chalk.dim(`  Running: wdio run ${config} --spec ${outputPath}`));
        execSync(`npx wdio run ${config} --spec ${outputPath}`, {
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log(chalk.green('\n  ✓ Test completed successfully!'));
      } catch (e) {
        console.log(chalk.yellow('\n  ⚠ Test execution skipped (use --run flag to enable)'));
        console.log(chalk.dim('  To run manually: npm run verify -- --spec ' + outputPath));
      }
    } else {
      console.log(chalk.cyan('\n  Step 4: Test generation complete (skipped execution)'));
      console.log(chalk.dim('  To run the test: npm run verify -- --spec ' + outputPath));
    }

    console.log(chalk.green('\n  Done!\n'));
  });

program
  .command('verify')
  .description('Run generated tests on the simulator (default: Reminders app)')
  .argument('[test-file]', 'Path to specific test file (default: all tests in tests/)')
  .option('-c, --config <config>', 'WDIO config file (default: wdio-reminders.conf.js)', 'wdio-reminders.conf.js')
  .action((testFile, options) => {
    console.log(chalk.bold('\n') + chalk.blue('  Appium MCP Test Framework'));
    console.log(chalk.dim('  ' + '='.repeat(45)) + '\n');

    const specs = [];
    const config = options.config || 'wdio-reminders.conf.js';

    if (testFile) {
      // Run specific test
      const resolvedPath = path.resolve(testFile);
      if (!fs.existsSync(resolvedPath)) {
        console.error(chalk.red(`\nError: Test file not found: ${resolvedPath}`));
        process.exit(1);
      }
      specs.push(testFile);
      console.log(chalk.cyan(`  Running specific test: ${testFile}\n`));
    } else {
      // Run all generated tests
      console.log(chalk.cyan('  Finding generated tests...\n'));
      try {
        const files = fs.readdirSync(TESTS_DIR)
          .filter(f => f.endsWith('.test.js'))
          .map(f => `tests/${f}`);
        
        if (files.length === 0) {
          console.error(chalk.red('\nNo generated tests found in tests/ directory.'));
          console.error(chalk.dim('Generate a test first: npm run generate <prompt-file>'));
          process.exit(1);
        }

        specs.push(...files);
        console.log(chalk.green(`  Found ${files.length} test(s):\n`));
        files.forEach(f => console.log(chalk.dim(`    - ${f}`)));
      } catch (e) {
        console.error(chalk.red(`\nError reading tests directory: ${e.message}`));
        process.exit(1);
      }
    }

    console.log(chalk.cyan('\n  Starting test execution on simulator...\n'));
    console.log(chalk.dim('  ' + '-'.repeat(45)));
    console.log(chalk.dim(`  Config: ${config}`));

    try {
      const specArg = specs.map(s => `--spec ${s}`).join(' ');
      execSync(`npx wdio run ${config} ${specArg}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log(chalk.green('\n  ✓ All tests completed!\n'));
    } catch (e) {
      console.log(chalk.yellow('\n  ⚠ Some tests failed (check output above)\n'));
      process.exit(1);
    }
  });

program
  .command('clean')
  .description('Remove all generated test files')
  .option('--keep-config', 'Keep wdio-reminders.conf.js modifications', false)
  .action(() => {
    console.log(chalk.bold('\n') + chalk.blue('  Appium MCP Test Framework'));
    console.log(chalk.dim('  ' + '='.repeat(45)) + '\n');

    if (!fs.existsSync(TESTS_DIR)) {
      console.log(chalk.yellow('  No tests/ directory found.\n'));
      return;
    }

    const testFiles = fs.readdirSync(TESTS_DIR)
      .filter(f => f.endsWith('.test.js'));

    if (testFiles.length === 0) {
      console.log(chalk.yellow('  No generated test files to clean.\n'));
      return;
    }

    testFiles.forEach(f => {
      const filePath = path.join(TESTS_DIR, f);
      fs.unlinkSync(filePath);
      console.log(chalk.dim(`  Removed: tests/${f}`));
    });

    // Clean helpers directory if empty
    const helpersDir = path.join(TESTS_DIR, 'helpers');
    if (fs.existsSync(helpersDir)) {
      const helpersFiles = fs.readdirSync(helpersDir);
      if (helpersFiles.length === 0) {
        fs.rmdirSync(helpersDir);
      }
    }

    console.log(chalk.green(`\n  Cleaned ${testFiles.length} test file(s).\n`));
  });

program.parse(process.argv);
