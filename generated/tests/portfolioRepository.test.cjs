const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const compile=path=>ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function setup(deny=false){
 const defaults={projects:[],skills:[],experience:[],certificates:[],resumeUrl:'',messages:[]};let record={content:defaults,revision:0};
 const supabase={from(){let patch,revision;const q={select(){return q},eq(k,v){if(k==='revision')revision=v;return q},update(v){patch=v;return q},async single(){return {data:structuredClone(record),error:null}},async maybeSingle(){if(deny)return {data:null,error:{message:'permission denied'}};if(revision!==record.revision)return {data:null,error:null};record=structuredClone(patch);return {data:structuredClone(record),error:null}}};return q}};
 const project={exports:{},URL};vm.runInNewContext(compile('src/lib/projectData.ts'),project);
 const context={exports:{},URL,require:path=>path==='./supabase'?{supabase,supabaseConfigured:true}:path==='./projectData'?project.exports:{defaultData:defaults}};
 vm.runInNewContext(compile('src/lib/portfolioRepository.ts'),context);return {api:context.exports,defaults};
}
test('all editable sections persist through create, edit, delete and fresh reads',async()=>{
 const {api,defaults}=setup();const draft={...defaults,skills:[{id:'s',name:'Python',category:'AI'}],projects:[{id:'p',title:'New',description:'Details',techStack:['Python'],githubLink:'',demoLink:'',features:['Search']}],certificates:[{id:'c',name:'Certificate',issuer:'Issuer',date:'2026',credentialUrl:'https://example.com/cert'}],resumeUrl:'https://example.com/resume.pdf'};
 await api.persistContent(draft,0);const saved=await api.loadContent();assert.equal(saved.content.skills[0].name,'Python');assert.equal(saved.content.projects[0].features[0],'Search');assert.equal(saved.content.certificates.length,1);assert.equal(saved.content.resumeUrl,draft.resumeUrl);
 saved.content.skills[0].name='TypeScript';await api.persistContent(saved.content,1);assert.equal((await api.loadContent()).content.skills[0].name,'TypeScript');
 await api.persistContent(defaults,2);const empty=await api.loadContent();assert.equal(empty.content.skills.length,0);assert.equal(empty.content.projects.length,0);assert.equal(empty.content.certificates.length,0);assert.equal(empty.content.resumeUrl,'');
});
test('denied writes throw without changing saved content',async()=>{const {api,defaults}=setup(true);await assert.rejects(api.persistContent(defaults,0),/permission denied/);assert.equal((await api.loadContent()).revision,0)});
test('stale editor cannot overwrite a newer save',async()=>{const {api,defaults}=setup();await api.persistContent({...defaults,resumeUrl:'https://example.com/new.pdf'},0);await assert.rejects(api.persistContent(defaults,0),/Nothing was saved/);assert.equal((await api.loadContent()).content.resumeUrl,'https://example.com/new.pdf')});
test('public content excludes private messages; invalid URLs are rejected',async()=>{const {api,defaults}=setup();await api.persistContent({...defaults,messages:[{message:'private'}]},0);assert.equal('messages' in (await api.loadContent()).content,false);await assert.rejects(api.persistContent({...defaults,resumeUrl:'javascript:alert(1)'},1),/links/)});

test('certificate descriptions and skills survive saves, edits, clearing and legacy reads', async()=>{
 const {api,defaults}=setup();
 const legacy={id:'cert',name:'Course',issuer:'Issuer',date:'2026'};
 await api.persistContent({...defaults,certificates:[legacy]},0);
 let snapshot=await api.loadContent();
 assert.equal(snapshot.content.certificates[0].description,'');
 assert.equal(snapshot.content.certificates[0].skills.length,0);
 Object.assign(snapshot.content.certificates[0],{description:'Built an app.\nLearned testing.',skills:[' React ','TypeScript','']});
 await api.persistContent(snapshot.content,1);
 snapshot=await api.loadContent();
 assert.equal(snapshot.content.certificates[0].description,'Built an app.\nLearned testing.');
 assert.equal(JSON.stringify(snapshot.content.certificates[0].skills),JSON.stringify(['React','TypeScript']));
 Object.assign(snapshot.content.certificates[0],{description:'',skills:[]});
 await api.persistContent(snapshot.content,2);
 snapshot=await api.loadContent();
 assert.equal(snapshot.content.certificates[0].description,'');
 assert.equal(snapshot.content.certificates[0].skills.length,0);
});
