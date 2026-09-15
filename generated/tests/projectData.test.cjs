const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const context = { exports: {}, URL };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/projectData.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
const {normalizeProjects,safeLink}=context.exports;
test('new, imported and incomplete projects share a safe shape',()=>{
 const rows=normalizeProjects([{id:1,title:'Old',techStack:['Python']},{id:2,title:'New',tech_stack:'React, TypeScript',features:'Search\nStreaming'},{id:3,title:'Incomplete',techStack:null},null]);
 assert.equal(rows.length,3);
 assert.equal(rows[1].techStack.join(','),'React,TypeScript');
 assert.equal(rows[1].features.length,2);
 assert.equal(rows[2].techStack.length,0);
 assert.equal(rows[0].id,'1');
});
test('JSON stacks and snake_case links normalize without changing descriptions',()=>{
 const [p]=normalizeProjects([{title:'Project',description:'Line 1\nLine 2',tech_stack:'["Python","React"]',github_link:'https://github.com/tiekiran2008/portfolio',demo_link:'#'}]);
 assert.equal(p.techStack.length,2);assert.equal(p.demoLink,'');assert.match(p.githubLink,/github.com/);assert.equal(p.description,'Line 1\nLine 2');
});
test('links reject unsafe protocols and placeholders but allow certificate files',()=>{
 for(const input of ['#','javascript:alert(1)','data:text/html,test','//evil.test','not a URL']) assert.equal(safeLink(input),undefined);
 assert.equal(safeLink('/certificates/test.pdf',true),'/certificates/test.pdf');
 assert.equal(safeLink('https://www.linkedin.com/in/kiran-kumar-e-24a27b372/'),'https://www.linkedin.com/in/kiran-kumar-e-24a27b372/');
});
