import type {WorkshopState,PatronStatus} from './workshop-model';
import type {MachineCycle} from './workshop-production';

type Point={x:number;y:number};
type Feedback=(message:string,x:number,y:number,color:number)=>void;
type Options={
  W:number;H:number;CELL:number;MOBILE:boolean;
  plotXY:(index:number)=>Point;
  cycles:MachineCycle[];
  previousOrderReward:number;previousPatronStatus:PatronStatus|undefined;
};
const names={
  well:{symbol:'◉',unit:'水汽',color:0x9be6ff},
  garden:{symbol:'❀',unit:'孢子',color:0xcbf3ae},
  kiln:{symbol:'✦',unit:'晶核',color:0xffdfaa},
} as const;

/** Match each visible output to the EXACT producing machine in the previous
 * immutable state, including its consumed input source. Order settlement
 * remains a separate notification; floating text never awards currency. */
export function paintShiftFeedback(
  current:WorkshopState,element:HTMLElement,showFeedback:Feedback,
  {W,H,CELL,MOBILE,plotXY,cycles,previousOrderReward,previousPatronStatus}:Options
){
  const report=current.last;
  if(!report)return;
  element.dataset.lastShiftFlow=
    'water:'+report.water+';fiber:'+report.fiber+';cores:'+report.cores;
  element.dataset.lastShiftDelivery=report.fulfilled
    ?current.completed===1?'first':'complete':report.lost?'missed':'none';
  element.dataset.lastShiftEffect='cores:'+report.cores;
  element.dataset.lastShiftOutput=cycles.filter(c=>c.amount>0)
    .map(c=>c.index+':'+c.craft+':'+c.amount).join(';');
  element.dataset.lastShiftInputs=cycles.filter(c=>c.amount>0&&c.sourceIndex!==null)
    .map(c=>c.sourceIndex+'>'+c.index+':'+c.sourceCost).join(';');

  for(const cycle of cycles.filter(c=>c.amount>0)){
    const point=plotXY(cycle.index);
    const name=names[cycle.craft];
    showFeedback(name.symbol+' +'+cycle.amount+' '+name.unit,
      point.x+CELL/2,point.y+CELL*.42,name.color);
  }
  for(const cycle of cycles.filter(c=>c.blocked).slice(0,2)){
    const point=plotXY(cycle.index);
    showFeedback(cycle.blocked==='water'?'缺水汽 · 检查水泵':'缺孢子 · 检查温室',
      point.x+CELL/2,point.y+CELL/2,0xffb5a7);
  }
  if(cycles.every(c=>c.amount===0&&!c.blocked))
    showFeedback('还没有产出 · 先派工',W/2,MOBILE?215:82,0xffc6a9);

  if(report.fulfilled)showFeedback(
    (current.completed===1?'首单交付成功':'订单交付成功')+
      ' · ✦ +'+previousOrderReward,
    W/2,MOBILE?215:82,0xc6f2b2);
  else if(report.lost)showFeedback('订单逾期',W/2,
    MOBILE?215:82,0xffb7ac);

  if(current.patron?.status==='completed'
    &&previousPatronStatus!=='completed'){
    showFeedback('月纱契约 +'+current.patron.reward,
      MOBILE?165:860,MOBILE?197:190,0xf6dfb4);
  }
}
