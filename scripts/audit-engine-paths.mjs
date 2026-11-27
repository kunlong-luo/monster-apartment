import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const oldPath=/(?:\bv2[\\/]|--prefix\s+["']?v2\b|(?:working-directory|cwd):\s*["']?v2\b|["']v2["']|\bcd\s+v2\b)/;
const newPath=/(?:\bengine[\\/]|--prefix\s+["']?engine\b|["']engine["'])/;
const counts={runtime:0,tests:0,tooling:0,docs:0,internal:0};
const violations=[];
// R14.1-U04: retired housing engine names and exact former entry paths.
// Historical references and preservation tests are reported separately.
const retiredHousing=/(?:\b(?:cozy-engine|cozy-save-transaction|gothic-room-drawer|cozyStorage|GothicRoomDrawer|Cozy[A-Z]\w*|COZY_[A-Z_]+|newCozyGame|resumeCozySave|validCozySave|parseCozySnapshot|transactCozySave|tickCozySave|resetCorruptCozySave|advanceCozy|cozyDay|cozyNeighborhood|cozyResidentWish|cozyReputation|cozyCommission|cozyCareKey|cozyCareUsedToday|cozyCareBoost|cozyRescuePreview|cozyRescueBoost|careForCozyResident|resolveCozyIncident|residentHappiness|buildingHappiness|dailyRent|cozyDailyIncome|buildCozyRoom|moveInCozy|relocateCozyResident|previewCozyRelocation|decorateCozy|cozyVisits|cozyGoal)\b|monster-apartment:cozy-save-v1)/;
const retiredHousingKey='monster-apartment:cozy:v1';
// U05: retired housing presentation names and its private animation names.
// These are not the live ga-story, ga-door, research or shared HUD selectors.
const retiredHousingStyle=/\b(?:ga-room-drawer|ga-warning|ga-drawer-top|ga-dismiss|ga-loading|ga-rescue-helpers|ga-feedback|ga-door-icon|ga-door-copy|ga-conversation|ga-picks|ga-dock|v04-panel-in|v04-toast)\b|\.ga-door(?:\.is-occupied|\[data-resident=|\[aria-pressed=)/;
const housingCounts={runtime:0,tests:0,tooling:0,docs:0,internal:0,css:0};
const housingViolations=[];
let housingScanned=0;
for(const file of files){
  if(!/\.(?:[cm]?[jt]sx?|json|ya?ml|md|py|css|txt|sh|csv|html|toml|svg|xml)$/.test(file)||file.endsWith('package-lock.json')||file==='scripts/audit-engine-paths.mjs'||file==='scripts/audit-repository-layout.mjs')continue;
  const source=readFileSync(file,'utf8');
  const group=file.startsWith('engine/')?'internal':/^(?:app|src)\//.test(file)?'runtime':/^(?:tests|e2e)\//.test(file)?'tests':file.endsWith('.md')||file.startsWith('docs/')?'docs':'tooling';
  const hits=[];
  const housingHits=[];
  const cssHits=[];
  housingScanned++;
  if(retiredHousing.test(file))housingViolations.push('Retired housing file: '+file);
  source.split('\n').forEach((line,index)=>{
    if(newPath.test(line))hits.push(index+1);
    if(group!=='docs'&&oldPath.test(line))violations.push(file+':'+(index+1)+' '+line.trim());
    const location=file+':'+(index+1);
    if(retiredHousing.test(line)||line.includes(retiredHousingKey)){
      housingHits.push(index+1);
      const allowedRawKey=file==='src/components/game/gothic-apartment.tsx'&&line.trim()===`const RETIRED_HOUSING_KEY='${retiredHousingKey}';`;
      // Tests may seed/check raw legacy bytes and docs preserve history. Production
      // code may only name the old key at its existing read-only export boundary.
      if(group!=='docs'&&group!=='tests'&&!allowedRawKey)housingViolations.push(location);
    }
    if(retiredHousingStyle.test(line)){
      if(file.endsWith('.css'))cssHits.push(index+1);
      if(group!=='docs')housingViolations.push('Retired housing style '+location);
    }
  });
  if(hits.length){counts[group]++;console.log(group+' '+file+' : '+hits.join(','));}
  if(housingHits.length){housingCounts[group]++;console.log('Retired housing reference '+group+' '+file+' : '+housingHits.join(','));}
  if(cssHits.length){housingCounts.css++;console.log('Retired housing CSS '+file+' : '+cssHits.join(','));}
}
console.log('Engine reference files: '+JSON.stringify(counts));
console.log('Old executable path violations: '+violations.length);
if(violations.length){console.error(violations.join('\n'));process.exitCode=1;}
console.log('R14 housing text files scanned: '+housingScanned+'; reference files: '+JSON.stringify(housingCounts));
console.log('Retired housing executable/path violations: '+housingViolations.length);
if(housingViolations.length){console.error(housingViolations.join('\n'));process.exitCode=1;}
