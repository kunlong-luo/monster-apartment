import type {CharacterId} from '@/core/character-life';
/** Narrative identities only: beast partners are not separately rolled or equipable pets. */
export const COVENANT_BEASTS={
  yuesha:{id:'eclipse-dragon',name:'红月深渊龙',epithet:'黑曜鳞甲 · 盘曲骨角 · 赤红巨翼',
    silhouette:'翼龙四足与盘角',anatomy:'龙鳞与盘角',palette:'crimson',
    bond:'月纱封印的深渊守卫，守护红月王座的古老契约。'},
  brook:{id:'moon-wolf',name:'皎月霜狼',epithet:'银月重甲 · 冰蓝瞳孔 · 巨型狼爪',
    silhouette:'犬吻与霜狼巨爪',anatomy:'灰白长毛与银甲',palette:'frost',
    bond:'陪伴泉泡巡视古代水脉的狼王，能够感知结界中的潮汐变化。'},
  fern:{id:'thorn-chimera',name:'荆棘花木奇美拉',epithet:'古树四足 · 荆棘藤尾 · 玫瑰冠冕',
    silhouette:'树根四足与藤尾',anatomy:'荆棘树根与花冠',palette:'verdant',
    bond:'青枝守护的温室古灵，与荆棘和月光花共享生命脉搏。'},
  cinder:{id:'forge-golem',name:'赤焰熔炉铠兽',epithet:'赤铜四臂 · 石铁重甲 · 炎核胸腔',
    silhouette:'四臂金属与熔炉核心',anatomy:'铠甲、铜管与赤焰核心',palette:'ember',
    bond:'与炽角守护旧熔炉的机械巨兽，危难时化作移动的锻造要塞。'},
} as const satisfies Record<CharacterId,{
  id:string;name:string;epithet:string;silhouette:string;anatomy:string;palette:string;bond:string;
}>;
