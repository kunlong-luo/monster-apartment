/** V2 REBOOT — deterministic factory/colony game rules.
 * No DOM, SVG, React or rendering dependency. The PixiJS stage will consume
 * this world snapshot and animate bitmap sprite actors independently. */
export type Craft='well'|'garden'|'kiln';
export type Element='water'|'plant'|'fire';
export type Supply='water'|'fiber'|'core';
export type WorkerId='brook'|'fern'|'cinder';
export type MachineLevel=1|2|3;
export type Machine={craft:Craft;worker:WorkerId|null;stored:number;
  /** Optional so pre-upgrade V2 saves and initial machines keep the same shape. */
  level?:2|3;
};
export type WorkshopOrder={due:number;cores:number;reward:number;
  /** Optional. Absent from existing V2 saves and normal contracts. */
  premium?:true;
};
export const PREMIUM_EXTRA_CORES=5;
export const PREMIUM_EXTRA_REWARD=120;
export const STANDARD_ORDER_PENALTY=15;
export const PREMIUM_ORDER_PENALTY=40;
/** Yuesha is an adult witch merchant; her optional request draws from the
 * same real stock as ordinary contracts. Legacy V2 saves omit this field. */
export type PatronStatus='offered'|'active'|'completed'|'missed'|'expired';
export type PatronCommission={
  status:PatronStatus;due:number;cores:number;reward:number;
};
export const PATRON_NAME='月纱';
export const PATRON_ADULT_AGE=28;
export const PATRON_FAILURE_COST=20;
export const PATRON_EXTRA_CORES=7;
/** Short-term wholesale cores compete with permanent equipment upgrades. */
export const PATRON_IMPORT_PRICE=42;
export type DailyProduction={
  water:number;fiber:number;cores:number;blocked:string[];
  fulfilled:boolean;lost:boolean;
  /** Anniversary rewards are earned through shipped orders, not idle clicks. */
  milestone?:3|5;
  /** Persists premium delivery feedback after the order has rolled over. */
  premium?:boolean;
};
export type WorkshopState={
  version:2;day:number;coins:number;
  tiles:(Machine|null)[];
  warehouse:{core:number};
  order:WorkshopOrder;
  last:DailyProduction|null;
  completed:number;failed:number;
  patron?:PatronCommission|null;
  /** Legacy V2 saves omit the daily town market record. */
  market?:{day:number;kind:TownExchange};
  /** Number of fulfilled resident requests; optional for older saves. */
  residentsHelped?:number;
};
export type TownSupply='water'|'fiber'|'core';
export type ResidentSupply='residentWater'|'residentFiber'|'residentCore';
export type TownExchange=TownSupply|ResidentSupply;
export const TOWN_MARKET={
  water:{cost:12,amount:3,zh:'水汽补给',hint:'注入一台水汽泵'},
  fiber:{cost:24,amount:3,zh:'孢子货箱',hint:'存入一座温室'},
  core:{cost:37,amount:1,zh:'晶核采购',hint:'直接入共享仓库'},
} as const;
/** The visitor never consumes anonymous player rewards: the quoted units
 * leave the actual machine tank / shared warehouse on acceptance. */
export const TOWN_RESIDENTS={
  residentWater:{
    name:'阿洛',age:31,job:'蒸汽钟楼守护人',resource:'water',
    amount:2,reward:26,story:'钟楼的老蒸汽阀开裂了。能让给我两份水汽吗？我愿意付修理费。',
    after:'钟楼重新敲响；下一次温室生产少了这两份备用水汽。'
  },
  residentFiber:{
    name:'菲娅',age:27,job:'月光花艺师',resource:'fiber',
    amount:2,reward:39,story:'舞会还缺一束会发光的孢子花。能从温室匀两份给我吗？',
    after:'花艺师带走了孢子；熔炉需要重新积攒足够纤维。'
  },
  residentCore:{
    name:'伊索',age:36,job:'街区照明匠',resource:'core',
    amount:1,reward:51,story:'东街的月灯快熄灭了。能卖我一枚晶核吗？委托的库存也会少一枚。',
    after:'东街重新亮起月灯；普通和特别委托的共享库存减少了一枚。'
  }
} as const;
export function residentForDay(day:number):ResidentSupply{
  return (['residentWater','residentFiber','residentCore'] as const)[(day-1)%3];
}
export const WIDTH=5;
export const HEIGHT=3;
export const BOARD_SIZE=WIDTH*HEIGHT;
export const MACHINES:Record<Craft,{cost:number;skill:Element;zh:string;en:string}>={
  well:{cost:22,skill:'water',zh:'水汽泵',en:'Mist pump'},
  garden:{cost:25,skill:'plant',zh:'孢子温室',en:'Spore greenhouse'},
  kiln:{cost:38,skill:'fire',zh:'晶核熔炉',en:'Core kiln'},
};
export const WORKERS:Record<WorkerId,{skill:Element;zh:string;en:string}>={
  brook:{skill:'water',zh:'泉泡',en:'Brook'},
  fern:{skill:'plant',zh:'青枝',en:'Fern'},
  cinder:{skill:'fire',zh:'炽角',en:'Cinder'},
};

export function machineLevel(machine:Machine|null):MachineLevel {
  return machine?.level??1;
}

/** Shared board topology. Imported by the guidance and simulation modules. */
export const validIndex=(n:number)=>Number.isInteger(n)&&n>=0&&n<BOARD_SIZE;
export const linked=(from:number,to:number):boolean=>
  validIndex(from)&&validIndex(to)&&
  (Math.abs(from-to)===WIDTH||Math.floor(from/WIDTH)===Math.floor(to/WIDTH)
    &&Math.abs(from-to)===1);
