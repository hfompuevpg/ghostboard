import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCards,filterCards,markdown} from './model.mjs';
const card={id:'one',title:'Midnight film',note:'幽灵书店',kind:'video',stage:'spark',created:'2026-11-15T00:00:00Z'};
test('backup roundtrip retains supported data and removes unknown properties',()=>assert.deepEqual(validateCards(JSON.parse(JSON.stringify([{...card,extra:'ignored'}]))),[card]));
test('invalid imports and duplicate identifiers are rejected',()=>{for(const value of [null,{},[card,card],[{...card,stage:'invalid'}],[{...card,title:' '}],[{...card,created:'yesterday'}],[{...card,note:'x'.repeat(3001)}]])assert.throws(()=>validateCards(value));});
test('search handles Chinese, case folding and category together',()=>{assert.equal(filterCards([card],'MIDNIGHT','video').length,1);assert.equal(filterCards([card],'幽灵','all').length,1);assert.equal(filterCards([card],'幽灵','writing').length,0);});
test('Markdown export includes full note and status',()=>{assert.match(markdown([card]),/幽灵书店/);assert.match(markdown([card]),/spark/);});
test('empty backup is valid',()=>assert.deepEqual(validateCards([]),[]));
