const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const YAML = require('yaml');
const { parse, printParseErrorCode } = require('jsonc-parser');

function validateText(file, contents) {
  const errors = [];
  const markdown = file.endsWith('.md');
  const lines = contents.split(/\r?\n/);
  if (contents && !contents.endsWith('\n')) errors.push('missing final newline');
  for (const [index, line] of lines.entries()) {
    const trailing = line.match(/[\t ]+$/)?.[0];
    if (trailing && !(markdown && trailing === '  ' && line.trim())) {
      errors.push(`line ${index + 1}: trailing whitespace`);
    }
    if (/^(<<<<<<< |=======$|>>>>>>> )/.test(line)) {
      errors.push(`line ${index + 1}: merge conflict marker`);
    }
  }
  const extension = path.extname(file);
  if (extension === '.json') {
    try {
      JSON.parse(contents);
    } catch (error) {
      errors.push(`invalid JSON: ${error.message}`);
    }
  } else if (extension === '.jsonc') {
    const parseErrors = [];
    parse(contents, parseErrors, { allowTrailingComma: true });
    errors.push(
      ...parseErrors.map((error) => `invalid JSONC: ${printParseErrorCode(error.error)}`)
    );
  } else if (['.yaml', '.yml'].includes(extension)) {
    for (const doc of YAML.parseAllDocuments(contents)) {
      errors.push(...doc.errors.map((error) => `invalid YAML: ${error.message}`));
    }
  }
  return errors;
}

function main(files) {
  const explicitSelection = files.length > 0;
  if (!files.length) {
    files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
      .split('\0')
      .filter(Boolean);
  }
  let count = 0;
  let failed = false;
  for (const file of files) {
    const relative = path.relative(process.cwd(), path.resolve(file)).split(path.sep).join('/');
    if (/^(docs\/superpowers|prompts\/archive)\//.test(relative) || !fs.existsSync(file)) continue;
    const contents = fs.readFileSync(file);
    if (contents.includes(0)) continue;
    count++;
    for (const error of validateText(file, contents.toString('utf8'))) {
      console.error(`${relative}: ${error}`);
      failed = true;
    }
  }
  if (!count) {
    if (!explicitSelection) throw new Error('No maintained text files were checked');
    console.log('No applicable maintained text files in selected paths');
    return;
  }
  console.log(`Checked ${count} maintained text files`);
  process.exitCode = failed ? 1 : 0;
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { validateText };
