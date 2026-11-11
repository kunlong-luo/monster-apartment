import {MACHINES,WORKERS,projectMachineProduction} from '../../../v2/src/workshop-engine';
import type {WorkshopState} from '../../../v2/src/workshop-engine';

/** Month-end production reports and supply links are authored by the same
 * deterministic engine as the save. Moonveil's dialogue is a *read-only*
 * reaction, not a separate economy, scripted reward or unlocked quest.
 *
 * Each entry has a stable ID to make story callbacks testable without
 * depending on copy. Its content may change after a real shift.
 */
export type WorkshopDialogueLine=Readonly<{
  id:string;text:string;
}>;

export function workshopDialogue(world:WorkshopState):readonly WorkshopDialogueLine[]{
  const lines:WorkshopDialogueLine[]=[];
  const append=(id:string,text:string)=>lines.push({id,text});
  const tiles=world.tiles;
  const assigned=tiles.flatMap((machine,index)=>
    machine?.worker?[{machine,index}]:[]);

  if(world.last?.milestone===5||world.completed>=5){
    append('milestone-master',
      '五份委托都已交付。月纱把一枚旧铜钥匙收回袖口：“月井深处的钟声，似乎知道你的名字。”');
  }else if(world.last?.milestone===3||world.completed>=3){
    append('milestone-third',
      '第三份委托的封蜡上，有一道倒悬的新月。月纱说那只是旧街区的传闻，暂时没有委托人认领。');
  }else if(world.last?.fulfilled){
    append('delivered',
      '这份委托确实交付了。账本里的星币已到账，下一张契约也已经开始计时。');
  }else if(world.last?.lost){
    append('missed',
      '上一份委托没能如期交付。月纱合上账簿：“这次损失已结算，下次先检查晶核储备。”');
  }else{
    append('welcome',
      '月纱拂去工坊账册上的灰尘：“每一道工序都算数；我会告诉你真正正在发生的事。”');
  }

  const {report,cycles}=projectMachineProduction(world);
  const blocked=cycles.find(cycle=>cycle.blocked);
  if(blocked){
    const machine=tiles[blocked.index]!;
    const missing=blocked.blocked==='water'?'水汽':'孢子纤维';
    append('supply-blocked',
      String(blocked.index+1).padStart(2,'0')+' 号'+MACHINES[machine.craft].zh+
      '缺少相邻设备提供的'+missing+'，本班不能产出。月纱指了指隔壁的空位。');
  }else if(report.cores>0){
    append('connected-production',
      '水汽、孢子、晶核已经接成一条真实产线。保持当前布局，本班预计入仓晶核 '+
      report.cores+' 枚。');
  }else if(!tiles.some(machine=>machine?.craft==='kiln')){
    append('missing-kiln',
      '还没有熔炉，水汽和孢子暂时不能变成晶核。先在空地建造晶核熔炉，再给它安排工匠。');
  }else if(!assigned.length){
    append('no-assignments',
      '设备还在安静地等待。没有派驻工匠，单靠月光不会自动产出任何材料。');
  }else{
    append('check-line',
      '设备已经有人值守，但本班还没有晶核产出。检查工位是否相邻，以及熔炉是否派工。');
  }

  // Automatic production stores real cumulative receipts and does not
  // advance the manual contract calendar. Only react to persisted facts.
  const auto=world.auto;
  if(auto){
    const totals=auto.produced;
    const produced=totals.water+totals.fiber+totals.cores;
    if(auto.enabled&&produced===0)
      append('auto-waiting',
        '自动生产已开启，设备尚在等待各自的生产周期。没有到账记录，委托日期也不会自动推进。');
    else if(auto.enabled)
      append('auto-running',
        '月纱翻开真实账页：“自动累计水汽 '+totals.water+
        '、孢子 '+totals.fiber+'、晶核 '+totals.cores+
        '；现有晶核 '+world.warehouse.core+
        '。自动节拍不推进委托日，交付前须暂停后手动轮班。”');
    else if(produced>0)
      append('auto-paused',
        '自动生产已暂停；此前累计水汽 '+totals.water+
        '、孢子 '+totals.fiber+'、晶核 '+totals.cores+
        ' 是历史产量，不是当前库存。');
  }

  const inexperienced=assigned.find(({machine})=>
    WORKERS[machine.worker!].skill!==MACHINES[machine.craft].skill);
  if(inexperienced){
    append('worker-specialty',
      WORKERS[inexperienced.machine.worker!].zh+'现在负责'+
      MACHINES[inexperienced.machine.craft].zh+
      '，不是她最擅长的设备。重新派往对应专长可以提升每班产量。');
  }else if(assigned.length){
    const {machine}=assigned[0];
    append('worker-observation',
      WORKERS[machine.worker!].zh+'正看守'+MACHINES[machine.craft].zh+
      '。月纱记下她的名字：“每个人的工序，都值得被记住。”');
  }else{
    append('worker-invitation',
      '泉泡熟悉水汽、青枝照料孢子、炽角懂得炉火。把她们安排到各自擅长的设备，会更顺畅。');
  }

  const remaining=world.order.due-world.day;
  if(remaining<=0){
    append('contract-due',
      '第 '+world.order.due+' 日的委托就在本班结算，需要晶核 '+
      world.order.cores+' 枚；仓库现有 '+world.warehouse.core+
      ' 枚。月纱没有替你许诺一定交付。');
  }else{
    append('contract-countdown',
      '下一份委托在第 '+world.order.due+' 日结算，还可安排 '+
      (remaining+1)+' 班生产。所需晶核 '+world.order.cores+
      ' 枚，仓库现有 '+world.warehouse.core+' 枚。');
  }

  if(world.patron?.status==='offered')
    append('patron-offer',
      '月纱在门口留下一封带火漆的私人委托。是否接受，仍要先衡量真实库存和交期。');
  else if(world.patron?.status==='active')
    append('patron-active',
      '那份私人委托已经接受。需要 '+world.patron.cores+
      ' 枚晶核，第 '+world.patron.due+
      ' 日到期；它和普通委托使用同一个仓库。');

  return lines;
}
