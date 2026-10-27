import { WORKERS, MACHINES, newWorkshop, validWorkshop,
  placeMachine, moveMachine, salvageMachine, machineSalvageRefund, assignWorker, runShift, acceptPatronCommission,
  upgradeMachine, forecastPatronCommission, importPatronCore, PATRON_IMPORT_PRICE,
  PREMIUM_ORDER_PENALTY, STANDARD_ORDER_PENALTY } from './workshop-engine';
import type { WorkshopState, WorkerId, Craft } from './workshop-engine';
import { mountWorkshopLab } from './workshop-lab-stage';

const STORAGE='monster-apartment:workshop-v2-lab';
/** Bind the Pixi stage and game actions to the single Next.js React shell.
 * React owns every visible business control, readout and catalog.
 * This runtime owns only Pixi, transient selection, status and persistence. */
export async function mountWorkshopGame(root:HTMLElement,
  assetBase:string=document.baseURI):Promise<()=>void>{
if(root.dataset.reactControls!=='true')
  throw Error('工坊必须由 Next.js React 界面挂载。');
const $=(id:string)=>root.querySelector<HTMLElement>('#'+id)!;
let world:WorkshopState=newWorkshop();
let raw:string|null=null;
try{raw=localStorage.getItem(STORAGE);}catch{/* Private browsing may deny storage. */}
if(raw!==null){
  // Corrupt saves must never be silently replaced by a new game.
  let parsed:unknown;
  try{parsed=JSON.parse(raw);}catch{throw Error('现有工坊存档无法解析，原始内容已保留。');}
  if(!validWorkshop(parsed))throw Error('现有工坊存档结构异常，原始内容已保留。');
  world=parsed;
}else{
  // Initialize only when no prior save exists.
  try{localStorage.setItem(STORAGE,JSON.stringify(world));}
  catch{/* A temporary unsaved session is still playable. */}
}
let selectedPlot:number|null=null;
let chosenWorker:WorkerId|null=null;
let chosenMachine:Craft|null=null;
let movingFrom:number|null=null;
let message='从温室开始：把 08 号机器移到水泵旁，再建一座熔炉。';
let effect:'good'|'bad'|'normal'='normal';

function apply(next:WorkshopState,feedback:string,tone:typeof effect='normal'){
  if(next===world){message='无法这样操作：请检查格子、机器或星币。';effect='bad';return;}
  world=next;message=feedback;effect=tone;
  try{localStorage.setItem(STORAGE,JSON.stringify(world));
    window.dispatchEvent(new Event('moonwork:v2-update'));}
  catch{message=feedback+'（保存失败，刷新后可能丢失进度）';effect='bad';}
}
function clearChoice(){chosenWorker=null;chosenMachine=null;movingFrom=null;}
function plot(index:number){
  if(chosenWorker){
    const id=chosenWorker;
    if(!world.tiles[index]){message='先在这个格子建机器，才能派人。';effect='bad';}
    else{
      const previous=world;
      const next=assignWorker(world,id,index);
      apply(next,WORKERS[id].zh+'已派往 '+String(index+1).padStart(2,'0')+' 号工位。');
      if(next!==previous)selectedPlot=index;
    }
    clearChoice();
  }else if(chosenMachine){
    const kind=chosenMachine;
    const previous=world;
    const next=placeMachine(world,index,kind);
    apply(next,'已建造 '+MACHINES[kind].zh+'。');
    if(next!==previous)selectedPlot=index;
    clearChoice();
  }else if(movingFrom!==null){
    if(movingFrom===index){message='已取消移动。';effect='normal';}
    else{
      const previous=world;
      const next=moveMachine(world,movingFrom,index);
      apply(next,'机器已搬动。连接路线与下一次产量会随之改变。','good');
      if(next!==previous)selectedPlot=index;
    }
    clearChoice();
  }else{
    selectedPlot=index;
    const machine=world.tiles[index];
    message=machine
      ?MACHINES[machine.craft].zh+' · 可移动、升级，或拆除回收星币。'
      :'空地 '+(index+1)+' 号：选择一种设备建造。';
    effect='normal';
  }
  render();
}
function acceptPatron(){
  const next=acceptPatronCommission(world);
  if(next===world){
    message='月纱的邀请目前不可接取。';effect='bad';render();return;
  }
  const outlook=forecastPatronCommission(next);
  apply(next,outlook?.deficit
    ?'月纱已确认接单。按当前产线还缺 '+outlook.deficit+' 枚晶核，务必升级或重新安排生产。'
    :'月纱已确认接单。保持当前生产节奏，有望如期交付。',
    outlook?.deficit?'bad':'good');
  render();
}
function buyPatronCore(){
  const next=importPatronCore(world);
  if(next===world){
    message='采购失败：检查委托是否仍有效及星币是否充足。';
    effect='bad';render();return;
  }
  apply(next,'向月纱采购一枚晶核：支付 '+PATRON_IMPORT_PRICE+
    ' 星币，货物已入共享仓库。','good');
  render();
}
const stage=await mountWorkshopLab($('stage'),world,{plot,patronTap:acceptPatron},assetBase);
// Contextual navigation from /characters/ selects a genuine worker; the
// player still has to choose an actual compatible machine for the assignment.
const requestedWorker=new URLSearchParams(window.location.search).get('worker');
if(requestedWorker&&Object.hasOwn(WORKERS,requestedWorker)){
  chosenWorker=requestedWorker as WorkerId;
  message='已选中'+WORKERS[chosenWorker].zh+'。点击工坊设备完成派工。';
}
function render(){
  stage.sync(world,selectedPlot);
  // Render only non-React nodes and publish transient selection to the HUD.
  // Status and summary are dedicated runtime-owned elements.
  $('status').textContent=message;
  $('status').setAttribute('data-tone',effect);
  const board=world.tiles.map((machine,index)=>machine
    ?String(index+1)+':'+MACHINES[machine.craft].zh+' '+
      (machine.worker?WORKERS[machine.worker].zh:'')
    :'').filter(Boolean);
  $('summary').textContent=board.join(' · ');
  root.dataset.chosenWorker=chosenWorker??'';
  root.dataset.chosenMachine=chosenMachine??'';
  root.dataset.movingFrom=movingFrom===null?'':String(movingFrom);
  root.dataset.selectedPlot=selectedPlot===null?'':String(selectedPlot);
  root.dispatchEvent(new Event('moonwork:controls-change'));
}
const onRootClick=(event:MouseEvent)=>{
  const origin=event.target;
  if(!(origin instanceof Element))return;
  const worker=origin.closest<HTMLButtonElement>('[data-worker]');
  const build=origin.closest<HTMLButtonElement>('[data-build]');
  if(origin.closest('#salvage')){
    if(selectedPlot===null||!world.tiles[selectedPlot])return;
    const index=selectedPlot;
    const machine=world.tiles[index]!;
    const refund=machineSalvageRefund(machine);
    if(!window.confirm('拆除'+MACHINES[machine.craft].zh+'？已存材料、升级及工匠派工会清除，返还 ✦'+refund+' 星币。'))return;
    const before=world;
    const next=salvageMachine(world,index);
    apply(next,'已回收 '+MACHINES[machine.craft].zh+'，获得 ✦'+refund+' 星币。','good');
    if(next!==before){selectedPlot=null;clearChoice();}
    render();
  }else if(origin.closest('#upgrade')){
    if(selectedPlot!==null){
      const index=selectedPlot;
      const before=world.tiles[index];
      const next=upgradeMachine(world,index);
      apply(next,before?'已改造 '+MACHINES[before.craft].zh+'：每班产量提升，机器也会焕发新光。':
        '无法升级此位置。','good');
      render();
    }
  }else if(origin.closest('#patron-accept')){
    acceptPatron();
  }else if(origin.closest('#patron-import')){
    buyPatronCore();
  }else if(worker){
    const id=worker.dataset.worker as WorkerId;
    const selected=chosenWorker===id;clearChoice();
    chosenWorker=selected?null:id;
    message=selected?'已取消派工。':'选择一台机器，将 '+WORKERS[id].zh+' 派去工作。';
    effect='normal';render();
  }else if(build){
    const id=build.dataset.build as Craft;
    const selected=chosenMachine===id;clearChoice();
    chosenMachine=selected?null:id;
    message=selected?'已取消建造。':'选择空地建造 '+MACHINES[id].zh+'。';
    effect='normal';render();
  }else if(origin.closest('#move')){
    if(movingFrom!==null){
      movingFrom=null;
      message='已取消设备搬动。';effect='normal';render();
    }else if(selectedPlot!==null&&world.tiles[selectedPlot]){
      movingFrom=selectedPlot;chosenMachine=null;chosenWorker=null;
      message='现在点击一个空格，搬动这台机器（不收费）。';effect='normal';
      render();
    }
  }else if(origin.closest('#shift')){
    clearChoice();
    const next=runShift(world);
    const report=next.last!;
    const changed=world.patron?.status!==next.patron?.status;
    const patronEvent=changed&&next.patron
      ?next.patron.status==='offered'?'月纱来访了：一份限时高价委托正在等你。'
      :next.patron.status==='completed'?'月纱的特别订单交付成功！获得 ✦'+next.patron.reward+'。'
      :next.patron.status==='missed'?'月纱的订单逾期，损失修约费。':''
      :'';
    apply(next,patronEvent||(report.fulfilled?'订单交付成功！':
      report.lost?'订单过期，扣除了 '+
        (report.premium?PREMIUM_ORDER_PENALTY:STANDARD_ORDER_PENALTY)+' 星币。':
      '本日生产：'+report.water+' 水、'+report.fiber+' 孢子、'+report.cores+' 晶核。'),
    next.patron?.status==='completed'&&changed||report.fulfilled?'good':
      next.patron?.status==='missed'&&changed||report.lost?'bad':'normal');
    selectedPlot=null;render();
  }else if(origin.closest('#reset')){
    if(!window.confirm('重新开工？当前工坊存档会被覆盖。'))return;
    world=newWorkshop();clearChoice();selectedPlot=null;
    message='新工坊已开始。先连接温室和水泵。';effect='normal';
    try{localStorage.setItem(STORAGE,JSON.stringify(world));
      window.dispatchEvent(new Event('moonwork:v2-update'));}catch{/* optional */}
    render();
  }
};
const onStorage=(event:StorageEvent)=>{
  if(event.key!==STORAGE)return;
  let next:unknown=null;
  try{next=JSON.parse(event.newValue??'null');}catch{/* Invalid external data. */}
  if(!validWorkshop(next)){
    message='另一窗口的工坊存档已被清除或损坏，请勿覆盖原存档。';
    effect='bad';render();return;
  }
  world=next;clearChoice();selectedPlot=null;
  message='已同步另一窗口的工坊进度。';effect='normal';render();
};
root.addEventListener('click',onRootClick);
window.addEventListener('storage',onStorage);
render();
return ()=>{
  root.removeEventListener('click',onRootClick);
  window.removeEventListener('storage',onStorage);
  stage.destroy();
};
}
