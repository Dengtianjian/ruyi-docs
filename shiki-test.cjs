const fs = require('fs');
const { codeToHtml } = require('shiki');

const file = '/development/projects/isdtj/ruyi-docs/docs/php/getting-started.md';
const text = fs.readFileSync(file, 'utf8');

const re = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
let m, idx = 0;
const blocks = [];
while ((m = re.exec(text)) !== null) {
  blocks.push({ idx: ++idx, lang: m[1] || 'text', code: m[2] });
}

(async () => {
  for (const b of blocks) {
    try {
      await codeToHtml(b.code, { lang: b.lang, theme: 'github-dark' });
      console.log(`OK   #${b.idx} lang=${b.lang} len=${b.code.length}`);
    } catch (e) {
      console.log(`FAIL #${b.idx} lang=${b.lang} -> ${e.message}`);
    }
  }
})();
