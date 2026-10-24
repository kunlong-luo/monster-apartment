import { WORKERS, MACHINES, newWorkshop, validWorkshop,
  placeMachine, moveMachine, assignWorker, runShift } from './workshop-engine';
import type { WorkshopState, WorkerId, Craft } from './workshop-engine';
import { mountWorkshopLab } from './workshop-lab-stage';

const STORAGE='monster-apartment:workshop-v2-lab';
const $=(id:string)=>document.getElementById(id)!;
let world:WorkshopState=newWorkshop();
try {
  const parsed:unknown=JSON.parse(localStorage.getItem(STORAGE)??'null');
  if(validWorkshop(parsed))world=parsed;
}catch {/* private browsing and invalid saves both start clean */}
let selectedPlot:number|null=null;
let chosenWorker:WorkerId|null=null;
let chosenMachine:Craft|null=null;
let movingFrom:number|null=null;
let message='从温室开始：把 08 号机器移到水泵旁，再建一座熔炉。';
let effect:'good'|'bad'|'normal'='normal';

function apply(next:WorkshopState,feedback:string,tone:typeof effect='normal'){
  if(next===world){message='无法这样操作：请检查格子、机器或星币。';effect='bad';return;}
  world=next;message=feedback;effect=tone;
  try{localStorage.setItem(STORAGE,JSON.stringify(world));}catch{/* local save optional */}
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
const stage=await mountWorkshopLab($('stage'),world,{plot});
function render(){
  stage.sync(world,selectedPlot);
  $('day').textContent=String(world.day);
  $('coins').textContent=String(world.coins);
  $('core').textContent=String(world.warehouse.core);
  $('target').textContent=String(world.order.cores);
  $('deadline').textContent=String(Math.max(0,world.order.due-world.day+1));
  $('completed').textContent=String(world.completed);
  $('failed').textContent=String(world.failed);
  $('progress').style.width=Math.min(100,100*world.warehouse.core/world.order.cores)+'%';
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
    button.innerHTML='<span class="worker-orb '+id+'">'+
      (id==='brook'?'◈':id==='fern'?'✿':'✷')+'</span><strong>'+profile.zh+
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
  $('move').toggleAttribute('disabled',!chosen);
  $('move').classList.toggle('active',movingFrom!==null);
  const stall=report?.blocked??[];
  if(report?.fulfilled) $('diagnosis').textContent='订单完成！交付晶核，获得星币。下一批需求提高了。';
  else if(report?.lost) $('diagnosis').textContent='交付失败：晶核不足，损失 15 星币。新订单已开始。';
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
$('root').addEventListener('click',event=>{
  const origin=event.target;
  if(!(origin instanceof Element))return;
  const worker=origin.closest<HTMLButtonElement>('[data-worker]');
  const build=origin.closest<HTMLButtonElement>('[data-build]');
  if(worker){
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
    apply(next,report.fulfilled?'订单交付成功！获得 '+(next.coins-world.coins)+' 星币。':
      report.lost?'订单过期，扣除了 15 星币。':
      '本日生产：'+report.water+' 水、'+report.fiber+' 孢子、'+report.cores+' 晶核。',
    report.fulfilled?'good':report.lost?'bad':'normal');
    selectedPlot=null;render();
  }else if(origin.closest('#reset')){
    if(!window.confirm('重新开工？当前 V2 实验存档会被覆盖。'))return;
    world=newWorkshop();clearChoice();selectedPlot=null;
    message='新工坊已开始。先连接温室和水泵。';effect='normal';
    try{localStorage.setItem(STORAGE,JSON.stringify(world));}catch{/* optional */}
    render();
  }
});
render();
