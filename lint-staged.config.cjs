const path = require('node:path');

const maintained = (file) => {
  const relative = path.relative(process.cwd(), file).split(path.sep).join('/');
  return !relative.startsWith('docs/superpowers/') && !relative.startsWith('prompts/archive/');
};

module.exports = {
  '*.{js,cjs}': 'eslint',
  '*.{js,cjs,json,jsonc,yml,yaml}': 'prettier --check',
  '*.md': (files) => {
    const selected = files.filter(maintained);
    return selected.length
      ? `markdownlint-cli2 ${selected.map((file) => JSON.stringify(file)).join(' ')}`
      : [];
  },
  '*': (files) => {
    const selected = files.filter(maintained);
    return selected.length
      ? `node scripts/check-files.js ${selected.map((file) => JSON.stringify(file)).join(' ')}`
      : [];
  }
};
