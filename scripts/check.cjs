const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const root = path.resolve(__dirname,'../public');
const products=JSON.parse(fs.readFileSync(path.join(root,'assets/products.json'),'utf8'));
assert.equal(products.length,4);
assert.equal(new Set(products.map(p=>p.id)).size,4);
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/products.js'),'utf8'),context);
assert.equal(JSON.stringify(context.window.AUREL_PRODUCTS),JSON.stringify(products));
const html=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
assert.equal(html.length,9);
for(const name of html){
  const content=fs.readFileSync(path.join(root,name),'utf8');
  assert.match(content,/<html lang="it">/);
  assert.match(content,/name="viewport"/);
  for(const match of content.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)){
    const target=match[1];if(/^[a-z]+:/i.test(target))continue;
    assert.ok(fs.existsSync(path.join(root,target)),`${name}: missing ${target}`);
  }
  const ids=[...content.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`${name}: duplicate IDs`);
}
for(const p of products){assert.ok(Number.isInteger(p.price)&&p.price>0);assert.ok(fs.existsSync(path.join(root,p.id+'.html')));assert.ok(fs.existsSync(path.join(root,'assets',p.id+'.svg')));}
for(const file of fs.readdirSync(path.join(root,'assets')).filter(f=>f.endsWith('.js'))) new vm.Script(fs.readFileSync(path.join(root,'assets',file),'utf8'),{filename:file});
console.log('OK: 9 pagine, 4 prodotti, link e immagini locali, cataloghi allineati, JavaScript valido.');
