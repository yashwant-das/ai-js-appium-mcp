const test = require('node:test');
const assert = require('node:assert/strict');
const { validateText } = require('../scripts/check-files');

const cases = [
  ['accepts valid JSON', 'sample.json', '{"enabled": true}\n', []],
  ['accepts Markdown hard breaks', 'sample.md', '# Title  \n\nText\n', []],
  ['rejects trailing whitespace', 'sample.js', 'const x = 1; \n', ['trailing whitespace']],
  ['rejects missing final newline', 'sample.js', 'const x = 1;', ['final newline']],
  [
    'rejects conflict markers',
    'sample.txt',
    '<<<<<<< HEAD\nx\n=======\ny\n>>>>>>> branch\n',
    ['merge conflict']
  ],
  ['rejects invalid JSON', 'sample.json', '{"enabled": }\n', ['invalid JSON']],
  ['rejects duplicate YAML keys', 'sample.yml', 'name: first\nname: second\n', ['invalid YAML']],
  [
    'accepts JSONC comments and trailing commas',
    'sample.jsonc',
    '{\n// comment\n"enabled": true,\n}\n',
    []
  ]
];

for (const [name, file, contents, expected] of cases) {
  test(name, () => {
    const errors = validateText(file, contents);
    if (expected.length === 0) {
      assert.deepEqual(errors, []);
    } else {
      for (const message of expected) {
        assert.ok(
          errors.some((error) => error.includes(message)),
          JSON.stringify(errors)
        );
      }
    }
  });
}

test('a binary-only staged selection passes without treating assets as text', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { spawnSync } = require('node:child_process');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'appium-binary-check-'));
  try {
    const file = path.join(directory, 'screenshot.png');
    fs.writeFileSync(file, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0]));
    const result = spawnSync(
      process.execPath,
      [path.join(__dirname, '../scripts/check-files.js'), file],
      {
        encoding: 'utf8'
      }
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /No applicable maintained text files/);
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});
