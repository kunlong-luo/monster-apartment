import {BOARD_SIZE} from './workshop-model';
import type {Craft,WorkshopState,PatronStatus} from './workshop-model';

type Point={x:number;y:number};
type Feedback=(message:string,x:number,y:number,color:number)=>void;
type Options={
  W:number;H:number;CELL:number;MOBILE:boolean;
  plotXY:(index:number)=>Point;
  previousOrderReward:number;previousPatronStatus:PatronStatus|undefined;
};
/** Shift effects follow real engine reports. No state writes, no extra
 * rewards, and no animation replay on save hydration. */
export function paintShiftFeedback(
  current:WorkshopState,element:HTMLElement,showFeedback:Feedback,
  {W,H,CELL,MOBILE,plotXY,previousOrderReward,previousPatronStatus}:Options
){
  if(!current.last)return;
      const report=current.last;
      const productionSpot=(craft:Craft)=>{
        const index=current.tiles.findIndex(tile=>tile?.craft===craft&&tile.worker);
        if(index<0)return {x:W/2,y:H/2};
        const pos=plotXY(index);
        return {x:pos.x+CELL/2,y:pos.y+CELL/2};
      };
      element.dataset.lastShiftFlow=
        'water:'+report.water+';fiber:'+report.fiber+';cores:'+report.cores;
      element.dataset.lastShiftDelivery=report.fulfilled
        ?current.completed===1?'first':'complete':report.lost?'missed':'none';
      if(report.water>0){
        const pos=productionSpot('well');
        showFeedback('◉ +'+report.water+' 水汽',pos.x,pos.y,0x9be6ff);
      }
      if(report.fiber>0){
        const pos=productionSpot('garden');
        showFeedback('❀ +'+report.fiber+' 孢子',pos.x,pos.y,0xcbf3ae);
      }
      for(const blocked of report.blocked.slice(0,2)){
        const [craft,rawIndex,reason]=blocked.split(':');
        const index=Number(rawIndex);
        if(!Number.isInteger(index)||index<0||index>=BOARD_SIZE)continue;
        const pos=plotXY(index);
        showFeedback(craft==='garden'&&reason==='water'
          ?'缺水 · 检查水泵':'缺孢子 · 检查温室',
          pos.x+CELL/2,pos.y+CELL/2,0xffb5a7);
      }
      if(report.cores===0&&report.water===0&&report.fiber===0
        &&report.blocked.length===0)
        showFeedback('还没有产出 · 先派工',W/2,MOBILE?215:82,0xffc6a9);
      if(current.last.cores>0){
        const firstKiln=current.tiles.findIndex(tile=>tile?.craft==='kiln'
          &&tile.worker);
        const pos=firstKiln<0?{x:W/2,y:H/2}:plotXY(firstKiln);
        showFeedback('✦ +'+current.last.cores+' 晶核',
          firstKiln<0?pos.x:pos.x+CELL/2,
          firstKiln<0?pos.y:pos.y+CELL/2,0xffdfaa);
        element.dataset.lastShiftEffect='cores:'+current.last.cores;
      }else{
        element.dataset.lastShiftEffect='cores:0';
      }
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
