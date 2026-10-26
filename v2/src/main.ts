import { WORKERS, MACHINES, newWorkshop, validWorkshop,
  placeMachine, moveMachine, assignWorker, runShift, acceptPatronCommission,
  upgradeMachine, machineUpgradeQuote, machineLevel, workshopRank,
  forecastPatronCommission, importPatronCore, PATRON_IMPORT_PRICE,
  PREMIUM_ORDER_PENALTY, STANDARD_ORDER_PENALTY } from './workshop-engine';
import type { WorkshopState, WorkerId, Craft } from './workshop-engine';
import { mountWorkshopLab } from './workshop-lab-stage';

const STORAGE='monster-apartment:workshop-v2-lab';
/** Mount the real deterministic game inside a Next-owned or standalone DOM root.
 * The returned cleanup owns all listeners and WebGL lifecycle resources. */
export async function mountWorkshopGame(root:HTMLElement,
  assetBase:string=document.baseURI):Promise<()=>void>{
const $=(id:string)=>root.querySelector<HTMLElement>('#'+id)!;
let world:WorkshopState=newWorkshop();
let savedAtMount=false;
try {
  const parsed:unknown=JSON.parse(localStorage.getItem(STORAGE)??'null');
  if(validWorkshop(parsed)){world=parsed;savedAtMount=true;}
}catch {/* private browsing and invalid saves both start clean */}
if(!savedAtMount){
  // A player's untouched first factory must exist for all linked pages.
  // Valid old saves are never silently rewritten on mount.
  try{localStorage.setItem(STORAGE,JSON.stringify(world));}
  catch{/* storage unavailable in private browsing */}
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
    window.dispatchEvent(new Event('moonwork:v2-update'));}catch{/* local save optional */}
}
function clearChoice(){chosenWorker=null;chosenMachine=null;movingFrom=null;}
function plot(index:number){
  if(chosenWorker){
    const id=chosenWorker;
    if(!world.tiles[index]){message='先在这个格子建机器，才能派人。';effect='bad';}
    else apply(assignWorker(world,id,index),WORKERS[id].zh+'已派往 '+String(index+1).padStart(2,'0')+' 号工位。');
    clearChoice();
  }else if(chosenMachine){
    const kind=chosenMachine;
    apply(placeMachine(world,index,kind),'已建造 '+MACHINES[kind].zh+'。');
    clearChoice();
  }else if(movingFrom!==null){
    if(movingFrom===index){message='已取消移动。';effect='normal';}
    else apply(moveMachine(world,movingFrom,index),
      '机器已搬动。连接路线与下一次产量会随之改变。','good');
    clearChoice();
  }else{
    selectedPlot=index;
    const machine=world.tiles[index];
    message=machine
      ?MACHINES[machine.craft].zh+' · 点击「移动机器」后选择一个空格。'
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
  $('day').textContent=String(world.day);
  $('coins').textContent=String(world.coins);
  $('core').textContent=String(world.warehouse.core);
  $('target').textContent=String(world.order.cores);
  $('contract-title').textContent=world.order.premium?'高额大宗订单':'晶核紧急订单';
  $('deadline').textContent=String(Math.max(0,world.order.due-world.day+1));
  $('completed').textContent=String(world.completed);
  $('failed').textContent=String(world.failed);
  const rank=workshopRank(world.completed);
  $('rank').textContent=rank.zh+(rank.nextGoal===null
    ?' · 主线达成，自由经营':' · 下一目标 '+rank.nextGoal+' 单');
  $('progress').style.width=Math.min(100,100*world.warehouse.core/world.order.cores)+'%';
  const patron=world.patron??null;
  const card=$('patron');
  card.hidden=!patron;
  if(patron){
    const status=patron.status;
    const lines={
      offered:'「你的工坊真有本事。月光落下之前，能为我准备这些晶核吗？」',
      active:'「今晚的星光很美。希望我们能如约交货。」',
      completed:'「守约的工匠总让我刮目相看。下次月夜再见。」',
      missed:'「月亮不会等待任何人。可惜，这次我们错过了。」',
      expired:'「你没有接受邀请。那就留待下一次月夜吧。」',
    };
    $('patron-dialogue').textContent=lines[status];
    $('patron-progress').textContent=world.warehouse.core+'/'+patron.cores;
    $('patron-days').textContent=status==='offered'||status==='active'
      ?'剩 '+Math.max(0,patron.due-world.day+1)+' 天':'已结算';
    const button=$('patron-accept') as HTMLButtonElement;
    button.hidden=status!=='offered';
    card.setAttribute('data-status',status);
    const forecast=forecastPatronCommission(world);
    const importButton=$('patron-import') as HTMLButtonElement;
    importButton.hidden=!forecast||!(forecast.deficit>0||
      forecast.nextNormalOrder==='missed');
    importButton.disabled=world.coins<PATRON_IMPORT_PRICE;
    importButton.textContent='临时采购 +1 晶核 · ✦'+PATRON_IMPORT_PRICE;
    const forecastLabel=$('patron-forecast');
    forecastLabel.hidden=!forecast;
    if(forecast){
      forecastLabel.setAttribute('data-risk',forecast.deficit?'high':'low');
      forecastLabel.textContent=forecast.deficit
        ?'当前排班预测 '+forecast.available+'/'+forecast.required+
          ' · 还缺 '+forecast.deficit+' 枚，接单可能损失 ✦20。升级熔炉或调整产线可改变结果。'
        :'当前排班预测 '+forecast.available+'/'+forecast.required+
          ' · 特单有望完成，普通订单'+
          (forecast.nextNormalOrder==='fulfilled'?'也有望完成。':
          forecast.nextNormalOrder==='missed'?'可能逾期。':'仍需关注。');
    }
  }
  const report=world.last;
  $('water').textContent=String(report?.water??0);
  $('fiber').textContent=String(report?.fiber??0);
  $('output').textContent=String(report?.cores??0);
  $('status').textContent=message;
  $('status').setAttribute('data-tone',effect);
  $('selected').textContent=chosenWorker?'待派工：'+WORKERS[chosenWorker].zh
    :chosenMachine?'待建造：'+MACHINES[chosenMachine].zh
      :movingFrom!==null?'移动设备：再选一个空格'
        :selectedPlot!==null?'选中 '+String(selectedPlot+1).padStart(2,'0')+' 号地块'
          :'点地块查看、建造或派工';
  const actions=$('actions');
  actions.innerHTML='';
  for(const [id,profile] of Object.entries(WORKERS) as [WorkerId,typeof WORKERS[WorkerId]][]){
    const occupied=world.tiles.findIndex(tile=>tile?.worker===id);
    const button=document.createElement('button');
    button.type='button';button.className='worker'+(chosenWorker===id?' active':'');
    button.dataset.worker=id;button.dataset.testid='v2-worker-'+id;
    button.innerHTML='<span class="worker-miniature '+id+'" role="img" aria-label="'+profile.zh+'的绘制头像"></span><strong>'+profile.zh+
      '</strong><small>'+(occupied>=0?'工位 '+String(occupied+1).padStart(2,'0'):'待分配')+'</small>';
    actions.appendChild(button);
  }
  const catalog=$('catalog');catalog.innerHTML='';
  for(const [id,info] of Object.entries(MACHINES) as [Craft,typeof MACHINES[Craft]][]){
    const button=document.createElement('button');
    button.type='button';button.dataset.build=id;button.dataset.testid='v2-build-'+id;
    button.className='machine-card'+(chosenMachine===id?' active':'');
    button.disabled=world.coins<info.cost;
    button.innerHTML='<span class="machine-symbol '+id+'">'+
      (id==='well'?'◉':id==='garden'?'❀':'⬡')+
      '</span><strong>'+info.zh+'</strong><small>✦ '+info.cost+'</small>';
    catalog.appendChild(button);
  }
  const chosen=selectedPlot!==null?world.tiles[selectedPlot]:null;
  const quote=selectedPlot!==null?machineUpgradeQuote(world,selectedPlot):null;
  const upgrade=$('upgrade') as HTMLButtonElement;
  upgrade.hidden=!chosen||!quote;
  if(chosen&&quote){
    upgrade.disabled=!quote.canUpgrade;
    upgrade.textContent=world.completed<quote.requiresCompleted
      ?'Lv.'+quote.next+' · 完成 '+quote.requiresCompleted+' 单解锁'
      :'升级 Lv.'+machineLevel(chosen)+' → '+quote.next+' · ✦ '+quote.cost;
    upgrade.title='等级越高，每班水汽、孢子或晶核产量越多';
  }
  $('move').toggleAttribute('disabled',!chosen);
  $('move').classList.toggle('active',movingFrom!==null);
  const stall=report?.blocked??[];
  if(report?.milestone){
    $('diagnosis').textContent=report.milestone===3
      ?'⭐ 3 单达成！升级权限提升至 Lv.3，并获得 70 星币的工坊发展资金。'
      :'🌙 5 单达成！月光大师工坊目标完成，获得 160 星币，可继续自由经营。';
  }else if(report?.fulfilled) $('diagnosis').textContent='订单完成！交付晶核，获得星币。下一批需求提高了。';
  else if(report?.lost) $('diagnosis').textContent='交付失败：晶核不足，损失 '+
    (report.premium?PREMIUM_ORDER_PENALTY:STANDARD_ORDER_PENALTY)+' 星币。新订单已开始。';
  else if(stall.length){
    $('diagnosis').textContent=stall.some(s=>s.includes(':water'))?
      '温室缺水：让它与水汽泵紧挨，并确保水泵有人操作。':
      '熔炉缺孢子：让它靠近温室；两份孢子才能炼出晶核。';
  }else if(report&&report.cores===0){
    $('diagnosis').textContent='今天还没炼出晶核。检查设备连接和工人分配。';
  }else if(report){
    $('diagnosis').textContent='生产链运转了。可以继续调整布局来提升产量。';
  }else $('diagnosis').textContent='水汽泵 → 孢子温室 → 晶核熔炉。设备必须上下左右相邻，专长匹配时产量更高。';
  const board=world.tiles.map((m,i)=>m?(''+(i+1)+':'+MACHINES[m.craft].zh+' '+(m.worker?WORKERS[m.worker].zh:'')):'').filter(Boolean);
  $('summary').textContent=board.join(' · ');
}
const onRootClick=(event:MouseEvent)=>{
  const origin=event.target;
  if(!(origin instanceof Element))return;
  const worker=origin.closest<HTMLButtonElement>('[data-worker]');
  const build=origin.closest<HTMLButtonElement>('[data-build]');
  if(origin.closest('#upgrade')){
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
    if(selectedPlot!==null&&world.tiles[selectedPlot]){
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
    if(!window.confirm('重新开工？当前 V2 实验存档会被覆盖。'))return;
    world=newWorkshop();clearChoice();selectedPlot=null;
    message='新工坊已开始。先连接温室和水泵。';effect='normal';
    try{localStorage.setItem(STORAGE,JSON.stringify(world));
      window.dispatchEvent(new Event('moonwork:v2-update'));}catch{/* optional */}
    render();
  }
};
root.addEventListener('click',onRootClick);
render();
return ()=>{
  root.removeEventListener('click',onRootClick);
  stage.destroy();
};
}
