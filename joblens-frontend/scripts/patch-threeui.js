const fs = require('fs');
const path = require('path');

const threeuiDir = path.join(__dirname, '..', 'node_modules', '@designcodeio', 'threeui');

if (fs.existsSync(threeuiDir)) {
  // 1. Patch lib-dist/index.js to export ThreeDPaper as alias of WovenCloth
  const indexJs = path.join(threeuiDir, 'lib-dist', 'index.js');
  if (fs.existsSync(indexJs)) {
    let content = fs.readFileSync(indexJs, 'utf8');
    if (!content.includes('as ThreeDPaper')) {
      content = content.replace('ze as WovenCloth', 'ze as WovenCloth,\n  ze as ThreeDPaper');
      fs.writeFileSync(indexJs, content);
      console.log('[ThreeUI Patch] Exported ThreeDPaper in lib-dist/index.js');
    }
  }

  // 2. Patch lib-dist/index.d.ts
  const indexDts = path.join(threeuiDir, 'lib-dist', 'index.d.ts');
  if (fs.existsSync(indexDts)) {
    let content = fs.readFileSync(indexDts, 'utf8');
    if (!content.includes('ThreeDPaper')) {
      content += '\nexport { WovenCloth as ThreeDPaper } from "./package-components/WovenCloth";\n';
      fs.writeFileSync(indexDts, content);
      console.log('[ThreeUI Patch] Exported ThreeDPaper in lib-dist/index.d.ts');
    }
  }

  // 3. Patch lib-dist/style.css to fix outdated gradient syntax that triggers autoprefixer warning
  const styleCss = path.join(threeuiDir, 'lib-dist', 'style.css');
  if (fs.existsSync(styleCss)) {
    let css = fs.readFileSync(styleCss, 'utf8');
    if (css.includes('radial-gradient(closest-side,')) {
      css = css.replaceAll('radial-gradient(closest-side,', 'radial-gradient(closest-side at center,');
      fs.writeFileSync(styleCss, css);
      console.log('[ThreeUI Patch] Fixed autoprefixer gradient syntax in style.css');
    }
  }
}
