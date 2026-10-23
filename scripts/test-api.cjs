const {spawn} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const directory = fs.mkdtempSync(path.join(os.tmpdir(),'aurel-test-'));
const cwd = path.resolve(__dirname,'..');
const port = 18934;
const base = `http://127.0.0.1:${port}/api/index.php?action=`;
let output='';
const server = spawn('php',['-S',`127.0.0.1:${port}`,'-t','public'],{cwd,env:{...process.env,AUREL_DATA_DIR:directory},stdio:['ignore','pipe','pipe']});
server.stdout.on('data',b=>output+=b);server.stderr.on('data',b=>output+=b);
let startupError;server.on('error',e=>startupError=e);
(async()=>{
  let session;
  for(let i=0;i<50;i++){if(startupError)throw startupError;try{session=await fetch(base+'session');if(session.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  assert.ok(session?.ok,'PHP server failed to start: '+output);
  const {csrf}=await session.json();assert.equal(csrf.length,64);
  const cookie=session.headers.get('set-cookie').split(';')[0];
  async function post(action,body,token=csrf){const r=await fetch(base+action,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':token,Cookie:cookie},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};}
  const customer={name:'Cliente Demo',email:'demo@example.com'};
  const order={...customer,items:[{id:'notturno',qty:2,price:1}],total:1};
  assert.equal((await post('order',order,'invalid')).status,403);
  assert.equal((await post('order',{...order,items:[{id:'notturno',qty:-1}]})).status,422);
  assert.equal((await post('order',{...order,items:[{id:'unknown',qty:1}]})).status,422);
  assert.equal((await post('order',{...order,items:[{id:'notturno',qty:1},{id:'notturno',qty:1}]})).status,422);
  assert.equal((await post('order',{...order,email:'invalid'})).status,422);
  const result=await post('order',order);assert.equal(result.status,201);assert.equal(result.body.total,9700);assert.equal(result.body.payment,false);
  const contact={...customer,message:'Messaggio dimostrativo di prova',model:'pelagos',consent:'on'};
  assert.equal((await post('contact',{...contact,consent:''})).status,422);
  const saved=await post('contact',contact);assert.equal(saved.status,201);assert.equal(saved.body.email_sent,false);
  assert.ok(fs.existsSync(path.join(directory,'aurel.sqlite')),'Missing database');
  assert.equal((await fetch(`http://127.0.0.1:${port}/var/aurel.sqlite`)).status,404);
  for(let i=0;i<13;i++)assert.equal((await post('contact',contact)).status,201);
  assert.equal((await post('contact',contact)).status,429);
  console.log('OK: CSRF, validazione, prezzi server, ordini, contatti, persistenza SQLite, dati non pubblici e rate limit.');
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>{
  server.kill();
  server.once('close',()=>{if(path.dirname(directory)===os.tmpdir()&&path.basename(directory).startsWith('aurel-test-'))fs.rmSync(directory,{recursive:true,force:true});});
});
